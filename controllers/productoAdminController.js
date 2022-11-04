const Producto = require("../models/productoModel")
const multer = require("multer")
const Notificaciones = require('./notificacionesController')
const { crearNotificacion } = require("./notificacionesController")

const fecha = new Date().toLocaleString('en-CA', { day: '2-digit', month: '2-digit', year: 'numeric' })

const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "../safehome/views/images/productos")
    },
    filename: (req, file, callback) => {
        callback(null, fecha + "-" + file.originalname)
    }
})

module.exports.upload = multer({
    storage: fileStorage
})

//Listado de Productos
module.exports.lista = async (req, res) => {
    try {
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
                    res.render('ProductoAdmin', {
                        productos: productos,
                        current: pagina,
                        paginas: Math.ceil(count / porPagina),
                        activePage,
                        numeroNot
                    })
                })
            })
    } catch (error) {
        const productos = await Producto.find().lean()
        res.render("ProductoAdmin", { productos, activePage, numeroNot });
        console.log(error.message);
    }
}

//Creación de Nuevo Producto
module.exports.crear = async (req, res) => {
    try {
        //NOTIFICACIÓN
        const user = `${req.user.nombre} ${req.user.apellido}`
        const correo = req.user.email
        const tipo = 'Ha añadido un nuevo producto'

        const productos = Producto({
            nombreProducto: req.body.nombreProducto,
            descripcion: req.body.descripcion,
            precio: req.body.precio,
            descuento: req.body.descuento,
            categoria: req.body.categoria,
            imagen: req.file?.filename
        })

        crearNotificacion({ user, correo, tipo })
        await productos.save()
        req.flash('successGlobal', 'Se ha añadido un nuevo producto')
        res.redirect('/ProductoAdmin/1')

    } catch (error) {
        req.flash('errorGlobal', 'Hubo un error al agregar el producto, por favor intente de nuevo')
        res.redirect('/ProductoAdmin/1')
        console.log(error.message);
    }
}

//Editar un Producto
module.exports.listaEditar = async (req, res) => {
    try {
        const numeroNot = await Notificaciones.numeroNotificaciones()
        const activePage = 'Productos'
        const productos = await Producto.findById(req.params.id).lean();

        res.render("EditarProducto", { productos, activePage, numeroNot });

    } catch (error) {
        res.render("EditarProducto", { productos, activePage, numeroNot });
        console.log(error.message);
    }
}

module.exports.editar = async (req, res) => {
    try {
        const { id } = req.params

        await Producto.findByIdAndUpdate({ _id: id },
            {
                nombreProducto: req.body.nombreProducto,
                descripcion: req.body.descripcion,
                precio: req.body.precio,
                descuento: req.body.descuento,
                imagen: req.file?.filename
            })

        req.flash('successGlobal', 'Se ha editado el producto')
        res.redirect("/ProductoAdmin/1");
    } catch (error) {
        req.flash('errorGlobal', 'Hubo un error al actualizar el producto. Por favor intente de nuevo')
        res.redirect("/ProductoAdmin/1");
        console.log(error.message);
    }
}

module.exports.eliminar = async (req, res) => {
    try {
        await Producto.findByIdAndDelete(req.params.id)

        req.flash("errorGlobal", "Se ha eliminado el producto")
        res.redirect("/ProductoAdmin/1");

    } catch (error) {
        req.flash('errorGlobal', 'Hubo un error al eliminar el producto. Por favor intente de nuevo')
        res.redirect("/ProductoAdmin/1");
        console.log(error.message);
    }
}

module.exports.buscarAdmin = async (req, res) => {
    try {
        const productos = await Producto.find({
            nombreProducto: { $regex: req.query.buscar, $options: "i" },
            categoria: { $regex: req.query.filtro, $options: "i" }
        })
        const numeroNot = await Notificaciones.numeroNotificaciones()
        const activePage = 'Productos'

        if (req.query.buscar == '' && req.query.filtro == 'Seleccione una categoria...') {
            const productos = await Producto.find().lean()
            res.render("ProductoAdmin", { productos, numeroNot, activePage });
        } else if (req.query.buscar !== '' && req.query.filtro == 'Seleccione una categoria...') {
            const productos = await Producto.find({ nombreProducto: { $regex: req.query.buscar, $options: "i" } })
            res.render("ProductoAdmin", { productos, numeroNot, activePage });
        } else if (productos !== null) {
            res.render("ProductoAdmin", { productos, numeroNot, activePage });
        } else {
            req.flash("errorGlobal", "No existen productos con ese nombre")
            res.render("ProductoAdmin");
        }

    } catch (error) {
        req.flash("errorGlobal", "Hubo un error buscando el producto. Por favor intente de nuevo")
        res.render("ProductoAdmin/1");
        console.log(error.message);
    }
}

module.exports.buscarCliente = async (req, res) => {
    try {
        const productos = await Producto.find({
            nombreProducto: { $regex: req.query.buscar, $options: "i" },
            categoria: { $regex: req.query.filtro, $options: "i" }
        })
        const numeroNot = await Notificaciones.numeroNotificaciones()
        const activePage = 'Productos'

        if (req.query.buscar == '' && req.query.filtro == 'Seleccione una categoria...') {
            const productos = await Producto.find().lean()
            res.render("Productos", { productos, numeroNot, activePage });
        } else if (req.query.buscar !== '' && req.query.filtro == 'Seleccione una categoria...') {
            const productos = await Producto.find({ nombreProducto: { $regex: req.query.buscar, $options: "i" } })
            res.render("Productos", { productos, numeroNot, activePage });
        } else if (productos !== null) {
            res.render("Productos", { productos, numeroNot, activePage });
        } else {
            req.flash("errorGlobal", "No existen productos con ese nombre")
            res.render("Productos");
        }

    } catch (error) {
        req.flash("errorGlobal", "Hubo un error buscando el producto. Por favor intente de nuevo")
        res.render("Productos/1");
        console.log(error.message);
    }
}