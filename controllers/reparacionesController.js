const Usuario = require("../models/User")
const multer = require("multer")
const mongoose = require("mongoose")
const Notificaciones = require('./notificacionesController')
const { crearNotificacion } = require("./notificacionesController")

const fecha = new Date().toLocaleString('en-CA', { day: '2-digit', month: '2-digit', year: 'numeric' })

const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "../safehome/views/images/reparaciones")
    },
    filename: (req, file, callback) => {
        callback(null, fecha + "-" + file.originalname)
    }
})

module.exports.upload = multer({
    storage: fileStorage
})

module.exports.crear = async (req, res) => {
    try {
        //NOTIFICACIÓN
        const user = `${req.user.nombre} ${req.user.apellido}`
        const correo = req.user.email
        const tipo = 'Ha creado un nuevo ticket de reparación'

        await Usuario.findByIdAndUpdate(req.user.id,
            {
                $addToSet: {
                    reparaciones: {
                        nombreCliente: req.body.nombreCliente,
                        telefono: req.body.telefono,
                        fechaCreacion: fecha,
                        correo: req.body.correo,
                        dispositivo: req.body.dispositivo,
                        descripcion: req.body.descripcion,
                        imagen: req.file?.filename,
                        estado: "En progreso"
                    }
                }
            })
        crearNotificacion({ user, correo, tipo })
        req.flash("successGlobal", "Se ha enviado su solicitud con exito")
        res.redirect('/PerfilReparaciones/1')

    } catch (error) {
        req.flash('errorGlobal', 'No se ha podido procesar la solicitud. Por favor intente de nuevo')
        res.redirect('/Reparaciones')
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
                { $unwind: "$reparaciones" },
                { $replaceRoot: { newRoot: "$reparaciones" } }])
                .sort({ _id: -1 })
                .skip((porPagina * pagina) - porPagina)
                .limit(porPagina)
                .exec(function (err, reparaciones) {
                    //Contar todas las reparaciones de todos los documentos en la collección
                    for (var Reparaciones of todosUsuarios) {
                        count = Reparaciones.reparaciones.length + count
                    }
                    res.render('PerfilReparaciones', {
                        reparaciones: reparaciones,
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
                { $unwind: "$reparaciones" },
                { $replaceRoot: { newRoot: "$reparaciones" } }])
                .sort({ _id: -1 })
                .skip((porPagina * pagina) - porPagina)
                .limit(porPagina)
                .exec(function (err, reparaciones) {
                    count = User.reparaciones.length
                    res.render('PerfilReparaciones', {
                        reparaciones: reparaciones,
                        current: pagina,
                        paginas: Math.ceil(count / porPagina),
                        activePage,
                        numeroNot,
                        usuarioDatos
                    })
                })
        }

    } catch (error) {
        req.flash('errorGlobal', 'Ha ocurrido un error al cargar las reparaciones. Por favor intente de nuevo')
        res.redirect('/PerfilReparaciones/1')
        console.log(error.message)
    }
}

module.exports.verReparacion = async (req, res) => {
    try {
        const numeroNot = await Notificaciones.numeroNotificaciones()
        const activePage = 'Perfil'
        const idReparacion = mongoose.Types.ObjectId(req.params.idReparacion)
        const usuarioDatos = req.user

        //Busca el usuario al que pertenece la reparación con el idReparación y obtiene la reparación
        const reparacion = await Usuario.aggregate([
            { $match: { reparaciones: { $elemMatch: { _id: idReparacion } } } },
            { $unwind: "$reparaciones" },
            { $replaceRoot: { newRoot: "$reparaciones" } },
            { $match: { _id: idReparacion } }])
        console.log(reparacion)

        res.render("Detalles-Reparaciones", { reparacion, usuarioDatos, activePage, numeroNot })

    } catch (error) {
        req.flash('errorGlobal', 'Ha ocurrido un error al cargar la reparación. Por favor intente de nuevo')
        res.redirect('/PerfilReparaciones/1')
        console.log(error.message)
    }
}

module.exports.updateReparacion = async (req, res) => {
    try {
        const idReparacion = mongoose.Types.ObjectId(req.params.idReparacion)

        if (req.user.role === 'ADMIN') {

            const id = await Usuario.aggregate([
                { $match: { reparaciones: { $elemMatch: { _id: idReparacion } } } }
            ])

            await Usuario.updateOne({ _id: id[0]._id },
                {
                    $set:
                        { "reparaciones.$[r].estado": req.body.estado }
                },
                {
                    arrayFilters: [{ "r._id": idReparacion }]
                })

            req.flash("warning", "Se modificó el estado del ticket a " + req.body.estado)
            res.redirect("/Detalles-Reparaciones/" + idReparacion)
        } else {
            await Usuario.updateOne({ _id: req.user.id },
                {
                    $set: {
                        "reparaciones.$[r].estado": req.body.estado
                    }
                },
                {
                    arrayFilters: [{ "r._id": idReparacion }]
                })

            req.flash("warning", "Se modificó el estado del ticket a " + req.body.estado)
            res.redirect("/Detalles-Reparaciones/" + idReparacion)
        }


    } catch (error) {
        req.flash('errorGlobal', 'Ha ocurrido un error al actualizar la reparación. Por favor intente de nuevo')
        res.redirect('/PerfilReparaciones/1')
        console.log(error.message)
    }
}