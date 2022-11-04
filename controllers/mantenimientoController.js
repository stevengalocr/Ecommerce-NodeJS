const Mantenimiento = require("../models/bitacoraModel")
const Notificaciones = require('./notificacionesController')

module.exports.crear = async (req, res) => {
    try {

        const { id } = req.params

        await Mantenimiento.findByIdAndUpdate(id,
            {
                $addToSet: {
                    mantenimientos: {
                        fechaMantenimiento: req.body.fechaMantenimiento,
                        responsableMantenimiento: req.body.responsableMantenimiento,
                        comentarios: req.body.comentarios
                    }
                }
            })

        req.flash("successGlobal", "Se ha registrado un nuevo mantenimiento")
        res.redirect("/BitacoraEditar/" + id + "/" + 1);

    } catch (error) {
        req.flash("errorGlobal", "Hubo un error al añadir el matenimiento. Por favor intente de nuevo")
        res.redirect("/BitacoraEditar/" + id + "/" + 1);
        console.log(error.message);
    }
}

module.exports.updatePage = async (req, res) => {
    try {

        const numeroNot = await Notificaciones.numeroNotificaciones()
        const activePage = 'Bitacora'
        const { id, idMantenimiento } = req.params
        const bitacora = await Mantenimiento.findOne({ _id: id }, { "mantenimientos": { $elemMatch: { _id: idMantenimiento } } })
        res.render("EditarMantenimiento", { bitacora, activePage, numeroNot })

    } catch (error) {
        req.flash("errorGlobal", "Hubo un error al cargar el matenimiento. Por favor intente de nuevo")
        res.redirect("/BitacoraEditar/" + id + "/" + 1);
        console.log(error.message)
    }
}

module.exports.updateMantenimiento = async (req, res) => {
    try {
        const { id, idMantenimiento } = req.params

        await Mantenimiento.updateOne({ _id: id },
            {
                $set: {
                    "mantenimientos.$[m].fechaMantenimiento": req.body.fechaMantenimiento,
                    "mantenimientos.$[m].responsableMantenimiento": req.body.responsableMantenimiento,
                    "mantenimientos.$[m].comentarios": req.body.comentarios
                }
            },
            {
                arrayFilters: [{ "m._id": idMantenimiento }]
            })

        req.flash("successGlobal", "Se ha editado el mantenimiento")
        res.redirect("/BitacoraEditar/" + id + "/" + 1)

    } catch (error) {
        req.flash("errorGlobal", "Hubo un error al actualizar el matenimiento. Por favor intente de nuevo")
        res.redirect("/BitacoraEditar/" + id + "/" + 1);
        console.log(error.message)
    }
}

module.exports.delete = async (req, res) => {
    try {
        const { id, idMantenimiento } = req.params

        await Mantenimiento.findByIdAndUpdate(id, { $pull: { mantenimientos: { _id: idMantenimiento } } })
        req.flash("errorGlobal", "Se ha eliminado el mantenimiento")
        res.redirect("/BitacoraEditar/" + id + "/" + 1);

    } catch (error) {
        req.flash("errorGlobal", "Hubo un error al eliminar el matenimiento. Por favor intente de nuevo")
        res.redirect("/BitacoraEditar/" + id + "/" + 1);
        console.log(error.message);
    }
}