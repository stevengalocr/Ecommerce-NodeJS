const Usuario = require("../models/User")
const mongoose = require("mongoose")
const Notificaciones = require('./notificacionesController')
const { crearNotificacion } = require("./notificacionesController")

const fecha = new Date().toLocaleString('en-CA', { day: '2-digit', month: '2-digit', year: 'numeric' })

module.exports.crear = async (req, res) => {
    try {
        //NOTIFICACIÓN
        const user = `${req.user.nombre} ${req.user.apellido}`
        const correo = req.user.email
        const tipo = 'Ha creado un nuevo ticket de cotización'

        await Usuario.findByIdAndUpdate(req.user.id,
            {
                $addToSet: {
                    cotizaciones: {
                        fechaCreacion: fecha,
                        nombreCliente: req.body.nombreCliente,
                        correo: req.body.correo,
                        telefono: req.body.telefono,
                        productos: req.body.productos,
                        descripcion: req.body.descripcion,
                        ubicacion: req.body.ubicacion,
                        estado: "En progreso"
                    }
                }
            })

        crearNotificacion({ user, correo, tipo })
        req.flash("successGlobal", "Se ha enviado su solicitud con éxito")
        res.redirect('/PerfilCotizaciones/1')

    } catch (error) {
        req.flash('errorGlobal', 'No se ha podido procesar la solicitud. Por favor intente de nuevo')
        res.redirect('/Cotizaciones')
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
                { $unwind: "$cotizaciones" },
                { $replaceRoot: { newRoot: "$cotizaciones" } }])
                .sort({ _id: -1 })
                .skip((porPagina * pagina) - porPagina)
                .limit(porPagina)
                .exec(function (err, cotizaciones) {
                    //Contar todas las cotizaciones de todos los documentos en la collección
                    for (var Cotizaciones of todosUsuarios) {
                        count = Cotizaciones.cotizaciones.length + count
                    }
                    res.render('PerfilCotizaciones', {
                        cotizaciones: cotizaciones,
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
                { $unwind: "$cotizaciones" },
                { $replaceRoot: { newRoot: "$cotizaciones" } }])
                .sort({ _id: -1 })
                .skip((porPagina * pagina) - porPagina)
                .limit(porPagina)
                .exec(function (err, cotizaciones) {
                    count = User.cotizaciones.length
                    res.render('PerfilCotizaciones', {
                        cotizaciones: cotizaciones,
                        current: pagina,
                        paginas: Math.ceil(count / porPagina),
                        activePage,
                        numeroNot,
                        usuarioDatos
                    })
                })
        }

    } catch (error) {
        req.flash('errorGlobal', 'Ha ocurrido un error al cargar las cotizaciones. Por favor intente de nuevo')
        res.redirect('/PerfilCotizaciones/1')
        console.log(error.message)
    }
}

module.exports.verCotizacion = async (req, res) => {
    try {
        const numeroNot = await Notificaciones.numeroNotificaciones()
        const activePage = 'Perfil'
        const idCotizacion = mongoose.Types.ObjectId(req.params.idCotizacion)
        const usuarioDatos = req.user

        //Busca el usuario al que pertenece la cotizacion con el idCotizacion y obtiene la cotizacion
        const cotizacion = await Usuario.aggregate([
            { $match: { cotizaciones: { $elemMatch: { _id: idCotizacion } } } },
            { $unwind: "$cotizaciones" },
            { $replaceRoot: { newRoot: "$cotizaciones" } },
            { $match: { _id: idCotizacion } }])

        res.render("Detalles-Cotizaciones", { cotizacion, usuarioDatos, activePage, numeroNot })

    } catch (error) {
        req.flash('errorGlobal', 'Ha ocurrido un error al cargar los detalles de la cotizacion. Por favor intente de nuevo')
        res.redirect('/PerfilCotizaciones/1')
        console.log(error.message)
    }
}

module.exports.updateCotizacion = async (req, res) => {
    try {
        const idCotizacion = mongoose.Types.ObjectId(req.params.idCotizacion)

        if (req.user.role === 'ADMIN') {

            const id = await Usuario.aggregate([
                { $match: { cotizaciones: { $elemMatch: { _id: idCotizacion } } } }
            ])

            await Usuario.updateOne({ _id: id },
                {
                    $set: {
                        "cotizaciones.$[c].estado": req.body.estado
                    }
                },
                {
                    arrayFilters: [{ "c._id": idCotizacion }]
                })

            req.flash("warning", "Se modificó el estado del ticket a " + req.body.estado)
            res.redirect("/Detalles-Cotizaciones/" + idCotizacion)
        } else {
            await Usuario.updateOne({ _id: req.user.id },
                {
                    $set: {
                        "cotizaciones.$[c].estado": req.body.estado
                    }
                },
                {
                    arrayFilters: [{ "c._id": idCotizacion }]
                })

            req.flash("warning", "Se modificó el estado del ticket a " + req.body.estado)
            res.redirect("/Detalles-Cotizaciones/" + idCotizacion)
        }


    } catch (error) {
        req.flash('errorGlobal', 'Ha ocurrido un error modificando el estado. Por favor intente de nuevo')
        res.redirect("/Detalles-Cotizaciones/" + idCotizacion)
        console.log(error.message)
    }
}
