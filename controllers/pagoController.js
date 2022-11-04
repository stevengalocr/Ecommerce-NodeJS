const mongoose = require("mongoose")
const Usuario = require("../models/User")
const Notificaciones = require("./notificacionesController")
const Producto = require("../models/productoModel")
const { crearNotificacion } = require("./notificacionesController")

const fecha = new Date().toLocaleString('en-CA', { day: '2-digit', month: '2-digit', year: 'numeric' })

//Listado de Productos lado del cliente
module.exports.lista = async (req, res) => {

    const numeroNot = await Notificaciones.numeroNotificaciones()
    const activePage = 'Productos'
    const porPagina = 12
    const pagina = req.params.pagina || 1

    Producto.find().sort({ _id: -1 }).lean()
        .skip((porPagina * pagina) - porPagina)
        .limit(porPagina)
        .exec(function (err, productos) {
            Producto.count().exec(function (err, count) {
                if (err) return next(err)
                res.render('Productos', {
                    productos: productos,
                    current: pagina,
                    paginas: Math.ceil(count / porPagina),
                    activePage,
                    numeroNot
                })
            })
        })
}

module.exports.MetodoPago = async (req, res) => {
    try {
        //NOTIFICACIÓN
        const user = `${req.user.nombre} ${req.user.apellido}`
        const correo = req.user.email
        const tipo = 'Ha creado un nuevo pedido de compra'

        const lista = await Usuario.findById(req.user.id).lean()
        let subtotal = 0
        let descuento = 0
        let total = 0

        if (lista.carrito != null) {
            for (var Producto of lista.carrito) {
                subtotal = subtotal + Producto.precio * Producto.cantidad

                //Obtener los precios de los descuentos
                if (Producto.descuento != 0) {
                    descuento = descuento + ((Producto.precio * Producto.cantidad) * Producto.descuento / 100)
                }
                total = subtotal - descuento
            }
        }

        //Guarda los datos del carrito.
        await Usuario.findByIdAndUpdate(req.user.id,
            {
                $addToSet: {
                    compras: {
                        FechaCreacion: fecha,
                        Pago: req.body.Pago,
                        MetodoContacto: req.body.MetodoContacto,
                        Contacto: req.body.Contacto,
                        Productos: lista.carrito,
                        TotalPrecio: total,
                        estado: "En progreso"
                    }
                }
            })

        //Elimina los datos del carrito.
        await Usuario.findByIdAndUpdate(req.user.id,
            {
                $pull:
                {
                    carrito: {
                    }
                }
            })
        crearNotificacion({ user, correo, tipo })
        req.flash("successGlobal", "Se ha enviado su solicitud con éxito, pronto un trabajador se pondrá en contacto.")
        res.redirect('/PerfilCompras/1')

    } catch (error) {
        req.flash('errorGlobal', 'No se ha podido procesar la solicitud. Por favor intente de nuevo')
        res.redirect('/MetodoPago')
        console.log(error.message)
    }
}

module.exports.mostrar = async (req, res) => {
    try {
        const numeroNot = await Notificaciones.numeroNotificaciones()
        const activePage = 'Perfil'
        const usuarioDatos = req.user

        //Paginación
        const porPagina = 5
        let count = 0
        const pagina = req.params.pagina || 1
        const todosUsuarios = await Usuario.find().lean()
        const User = await Usuario.findById(req.user.id).lean()
        const id = mongoose.Types.ObjectId(req.user.id);

        if (req.user.role === 'ADMIN') {
            Usuario.aggregate([
                { $unwind: "$compras" },
                { $replaceRoot: { newRoot: "$compras" } }])
                .sort({ _id: -1 })
                .skip((porPagina * pagina) - porPagina)
                .limit(porPagina)
                .exec(function (err, compras) {
                    //Contar todas las compras de todos los documentos en la colección
                    for (var Compras of todosUsuarios) {
                        count = Compras.compras.length + count
                    }
                    res.render('PerfilCompras', {
                        compras: compras,
                        current: pagina,
                        paginas: Math.ceil(count / porPagina),
                        activePage,
                        numeroNot,
                        usuarioDatos
                    })
                })

        } else {

            Usuario.aggregate([
                { $match: { _id: id } },
                { $unwind: "$compras" },
                { $replaceRoot: { newRoot: "$compras" } }])
                .sort({ _id: -1 })
                .skip((porPagina * pagina) - porPagina)
                .limit(porPagina)
                .exec(function (err, compras) {
                    count = User.compras.length
                    res.render('PerfilCompras', {
                        compras: compras,
                        current: pagina,
                        paginas: Math.ceil(count / porPagina),
                        activePage,
                        numeroNot,
                        usuarioDatos
                    })
                })
        }

    } catch (error) {
        req.flash('errorGlobal', 'Ha ocurrido un error al cargar las compras realizadas. Por favor intente de nuevo')
        res.redirect('/PerfilCompras/1')
        console.log(error.message)
    }
}

module.exports.verCompra = async (req, res) => {
    try {
        const numeroNot = await Notificaciones.numeroNotificaciones()
        const activePage = 'Perfil'
        const idPago = mongoose.Types.ObjectId(req.params.idPago)
        const usuarioDatos = req.user

        //Busca el usuario al que pertenece la reparación con el idReparación y obtiene la reparación
        const compra = await Usuario.aggregate([
            { $match: { compras: { $elemMatch: { _id: idPago } } } },
            { $unwind: "$compras" },
            { $replaceRoot: { newRoot: "$compras" } },
            { $match: { _id: idPago } }])

        res.render("Detalles-Compras", { compra, usuarioDatos, activePage, numeroNot });

    } catch (error) {
        req.flash("errorGlobal", "Ha ocurrido un error al cargar la compra. Por favor intente de nuevo")
        res.redirect("/PerfilCompras/1")
        console.log(error.message)
    }
}

module.exports.updateCompra = async (req, res) => {
    try {
        const idPago = mongoose.Types.ObjectId(req.params.idPago)

        if (req.user.role === 'ADMIN') {

            const id = await Usuario.aggregate([
                { $match: { compras: { $elemMatch: { _id: idPago } } } }
            ])

            await Usuario.updateOne({ _id: id },
                {
                    $set: {
                        "compras.$[c].estado": req.body.estado
                    }
                },
                {
                    arrayFilters: [{ "c._id": idPago }]
                })

            req.flash("warning", "Se modificó el estado de la compra a " + req.body.estado)
            res.redirect("/Detalles-Compras/" + idPago)
        } else {
            await Usuario.updateOne({ _id: req.user.id },
                {
                    $set: {
                        "compras.$[c].estado": req.body.estado
                    }
                },
                {
                    arrayFilters: [{ "c._id": idPago }]
                })

            req.flash("warning", "Se modificó el estado de la compra a " + req.body.estado)
            res.redirect("/Detalles-Compras/" + idPago)
        }


    } catch (error) {
        req.flash("errorGlobal", "Ha ocurrido un error al actualizar el estado. Por favor intente de nuevo")
        res.redirect("/Detalles-Compras/" + idPago)
        console.log(error.message)
    }
}

module.exports.validaDatosProductos = async (req, res) => {
    try {
        const carritoUsuario = await Usuario.findById(req.user.id).lean()
        const listaProductos = await Producto.find().lean()
        const productosCarrito = carritoUsuario.carrito
        if (carritoUsuario.carrito != null) {
            console.log(productosCarrito)
            let result = productosCarrito.filter(o1 => !listaProductos.some(o2 => o1.idProducto === o2._id.toString()));
            console.log("-------------------------------------------------------------")
            console.log(result.length)
            if(result.length == 0) {
                this.MetodoPago(req, res)
            } else {
                for(var Productos of result) {
                console.log(Productos._id)
                await Usuario.findByIdAndUpdate(req.user.id,
                    {
                        $pull:
                        {
                            carrito: {
                                _id: Productos._id 
                            }
                        }
                    })}
                req.flash("errorGlobal", "Algunos de los productos en el carrito han sido actualizados. Por favor añádalos de nuevo.")
                res.redirect("/Pedidos/1")
            }
        }
    } catch (error) {
        req.flash("errorGlobal", "Ha ocurrido un error al realizar la compra. Por favor intente de nuevo")
        res.redirect("/Pedidos/1")
        console.log(error.message)
    }
}