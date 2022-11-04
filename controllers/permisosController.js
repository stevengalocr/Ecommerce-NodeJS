const Usuario = require("../models/User")

module.exports.otorgar = async (req, res) => {
    try {
        const persona = await Usuario.findOne({ email: req.body.email })
        const permisosValue = req.body.permisos
        if (req.body.email == req.user.email) {
            req.flash("warning", "No se pueden actualizar los permisos de la cuenta en uso")
            res.redirect("/Administrador");
        } else if (persona != undefined) {
            if (permisosValue == 'Otorgar permisos') {
                if (persona.role == "USER") {
                    persona.role = "ADMIN"
                    persona.save()
                    req.flash("successGlobal", "Se ha otorgado permisos de administrador a " + persona.nombre)
                    res.redirect("/Administrador");
                } else {
                    req.flash("errorGlobal", persona.nombre + ' ya posee permisos de administrador')
                    res.redirect("/Administrador");
                }
            } else {
                if (persona.role == "ADMIN") {
                    persona.role = "USER"
                    persona.save()
                    req.flash("successGlobal", "Se ha revocado permisos de administrador a " + persona.nombre)
                    res.redirect("/Administrador");
                } else {
                    req.flash("errorGlobal", persona.nombre + ' no posee permisos de administrador')
                    res.redirect("/Administrador");
                }
            }

        } else {
            req.flash("errorGlobal", "El usuario asociado al correo no existe")
            res.redirect("/Administrador");
        }
    } catch (error) {
        console.log(error)
        req.flash("errorGlobal", "Ha ocurrido un error, por favor intente de nuevo")
        res.redirect("/Administrador")
    }
}