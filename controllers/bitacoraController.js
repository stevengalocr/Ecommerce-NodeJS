const Bitacora = require("../models/bitacoraModel")
const mongoose = require("mongoose")
const Notificaciones = require('./notificacionesController')

//Listado de Bitácora
module.exports.lista = async (req, res) => {
    try {
        const activePage = 'Bitacora'
        const numeroNot = await Notificaciones.numeroNotificaciones()
        const porPagina = 5
        const pagina = req.params.pagina || 1

        Bitacora.find().sort({ _id: -1 }).lean()
            .skip((porPagina * pagina) - porPagina)
            .limit(porPagina)
            .exec(function (err, bitacoras) {
                Bitacora.count().exec(function (err, count) {
                    if (err) return next(err)
                    res.render('Bitacora', {
                        bitacoras: bitacoras,
                        current: pagina,
                        paginas: Math.ceil(count / porPagina),
                        activePage,
                        numeroNot
                    })
                })
            })
    } catch (error) {
        req.flash('errorGlobal', 'Hubo un error al mostrar las bitacoras. Por favor intente de nuevo')
        res.redirect('/Perfil')
        console.log(error.message)
    }

}

//Creacion de Nueva Bitácora
module.exports.crear = async (req, res) => {
    try {
        const bitacora = Bitacora(req.body)

        await bitacora.save()

        req.flash('successGlobal', 'Se ha creado una nueva bitácora')
        res.redirect('/Bitacora/1')
    } catch (error) {
        req.flash('errorGlobal', 'Hubo un error al crear la bitacora. Por favor intente de nuevo')
        res.redirect('/Bitacora/1')
        console.log(error.message)
    }
}

//Editar una Bitácora
module.exports.listaEditar = async (req, res) => {
    try {
        const activePage = 'Bitacora'
        const numeroNot = await Notificaciones.numeroNotificaciones()
        const porPagina = 5
        const pagina = req.params.pagina || 1

        const bitacora = await Bitacora.findById(req.params.id).lean()
        const id = mongoose.Types.ObjectId(req.params.id);

        Bitacora.aggregate([
            { $match: { _id: id } },
            { $unwind: "$mantenimientos" },
            { $replaceRoot: { newRoot: "$mantenimientos" } }])
            .sort({ _id: -1 })
            .skip((porPagina * pagina) - porPagina)
            .limit(porPagina)
            .exec(function (err, bitacoras) {
                const count = bitacora.mantenimientos.length
                res.render('BitacoraEditar', {
                    bitacora,
                    bitacoras: bitacoras,
                    current: pagina,
                    paginas: Math.ceil(count / porPagina),
                    activePage,
                    numeroNot
                })
            })
    } catch (error) {
        req.flash('errorGlobal', 'Hubo un error al crear la bitacora. Por favor intente de nuevo')
        res.redirect('/Bitacora/1')
        console.log(error.message);

    }

}

module.exports.editar = async (req, res) => {
    try {
        const { id } = req.params

        req.flash('successGlobal', 'Se ha editado la bitácora')
        await Bitacora.findByIdAndUpdate(id, req.body)

        res.redirect("/Bitacora/1");
    } catch (error) {
        req.flash('errorGlobal', 'Hubo un error al editar la bitacora. Por favor intente de nuevo')
        res.redirect("/Bitacora/1");
        console.log(error.message);
    }
}

//Eliminar una Bitácora
module.exports.eliminar = async (req, res) => {
    try {
        await Bitacora.findByIdAndDelete(req.params.id)

        req.flash('errorGlobal', 'Se ha eliminado la bitácora')
        res.redirect("/Bitacora/1");

    } catch (error) {
        req.flash('errorGlobal', 'Hubo un error al eliminar la bitacora. Por favor intente de nuevo')
        res.redirect("/Bitacora/1");
        console.log(error.message);
    }

}
