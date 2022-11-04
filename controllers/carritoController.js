const mongoose = require("mongoose")
const user = require("../models/User")
const product = require("../models/productoModel")
const Notificaciones = require('./notificacionesController')

module.exports.añadirCarrito = async (req, res) => {
    try {
        const producto = await product.findById(req.body.id)
        const usuario = await user.findById(req.user.id)
        let done = false

        for (var Usuario of usuario.carrito) {
            if (Usuario.nombreProducto == producto.nombreProducto) {
                await user.updateOne({ _id: req.user.id },
                    {
                        $set: {
                            "carrito.$[m].cantidad": Usuario.cantidad + 1,
                        }
                    },
                    {
                        arrayFilters: [{ "m._id": Usuario._id }]
                    })
                done = true
            }
        }

        if (done != true) {
            await user.findByIdAndUpdate(req.user.id,
                {
                    $addToSet: {
                        carrito: {
                            nombreProducto: producto.nombreProducto,
                            precio: producto.precio,
                            descuento: producto.descuento,
                            idProducto: producto._id,
                            cantidad: 1
                        }
                    }
                })
        }

        req.flash("successGlobal", "El producto se ha añadido al carrito")
        res.redirect('/Productos/1')
    } catch (error) {
        req.flash("errorGlobal", "Hubo un error al añadir al carrito. Por favor intente de nuevo")
        res.redirect('/Productos/1')
        console.log(error.message)
    }
}

module.exports.cambiarCantidad = async (req, res) => {
    try {
        const { cantidad, id } = req.body
        await user.updateOne({ _id: req.user.id },
            {
                $set: {
                    "carrito.$[m].cantidad": cantidad,
                }
            },
            {
                arrayFilters: [{ "m._id": id }]
            })

        req.flash("successGlobal", "Se ha editado la cantidad")
        res.redirect("/Pedidos/1")

    } catch (error) {
        req.flash("errorGlobal", "Hubo un error al cambiar la cantidad. Por favor intente de nuevo")
        res.redirect('/Pedidos/1')
        console.log(error.message)
    }
}

module.exports.eliminarCarrito = async (req, res) => {
    try {
        await user.findByIdAndUpdate(req.user.id,
            {
                $pull:
                {
                    carrito: {
                        _id: req.body.id
                    }
                }
            })
        req.flash("errorGlobal", "Se ha eliminado el producto del carrito")
        res.redirect("/Pedidos/1")
    } catch (error) {
        req.flash("errorGlobal", "Hubo un error al eliminar el producto. Por favor intente de nuevo")
        res.redirect('/Pedidos/1')
        console.log(error)
    }
}

module.exports.mostrarCarrito = async (req, res) => {
    try {
        const numeroNot = await Notificaciones.numeroNotificaciones()
        const id = mongoose.Types.ObjectId(req.user.id);
        const usuario = await user.findById(req.user.id)
        const usuarioDatos = req.user
        const porPagina = 5
        const pagina = req.params.pagina || 1
        let subtotal = 0
        let descuento = 0
        let total = 0

        user.aggregate([
            { $match: { _id: id } },
            { $unwind: "$carrito" },
            { $replaceRoot: { newRoot: "$carrito" } }])
            .sort({ _id: -1 })
            .skip((porPagina * pagina) - porPagina)
            .limit(porPagina)
            .exec(function (err, carrito) {
                const count = usuario.carrito.length

                //Obtener el subtotal
                if (usuario.carrito != null) {
                    for (var Producto of usuario.carrito) {
                        subtotal = subtotal + Producto.precio * Producto.cantidad

                        //Obtener los precios de los descuentos
                        if(Producto.descuento != 0){
                            descuento = descuento + ((Producto.precio * Producto.cantidad) * Producto.descuento / 100)
                        }
                        total = subtotal - descuento
                    }
                }

                res.render('Pedidos', {
                    carrito: carrito,
                    current: pagina,
                    paginas: Math.ceil(count / porPagina),
                    subtotal,
                    total,
                    descuento,
                    usuarioDatos,
                    numeroNot
                })
            })

    } catch (error) {
        req.flash("errorGlobal", "Hubo un error al mostrar los productos. Por favor intente de nuevo")
        res.redirect('/Perfil')
        console.log(error.message)
    }
}