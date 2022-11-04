const Usuario = require("../models/User")
const bcrypt = require("bcryptjs");

module.exports.updateDatosPersonales = async (req, res) => {
    const { nombre, apellidos } = req.body
    const cuenta = await Usuario.findById(req.user.id)
    try {

        if (nombre != "" && nombre != null && apellidos != "" && apellidos != null) {

            if (nombre != cuenta.nombre || apellidos != cuenta.apellido) {
                cuenta.nombre = nombre
                cuenta.apellido = apellidos
                cuenta.save()
                req.flash("successGlobal", "Datos actualizados");
                res.redirect("/Perfil")
            } else {
                req.flash("warning", "El nombre y los apellidos no han cambiado");
                res.redirect("/Perfil")
            }

        } else {
            req.flash("warning", "El nombre o apellidos no pueden estar vacios");
            res.redirect("/Perfil")
        }
    } catch (error) {
        req.flash("errorGlobal", "Hubo un error al actualizar la informacion. Por favor intente de nuevo");
        res.redirect("/Perfil")
        console.log(error)
    }
}

module.exports.updatePassword = async (req, res) => {
    const { pass, nuevaPass, confirmNuevaPass } = req.body

    try {
        const cuenta = await Usuario.findById(req.user.id)
        const validPass = await bcrypt.compare(pass, cuenta.password)

        if (validPass && nuevaPass == confirmNuevaPass) {

            if (nuevaPass.length < 6) {
                req.flash("errorGlobal", "La nueva contraseña debe poseer al menos 6 carácteres");
                res.redirect("/PerfilContra")
            } else if (nuevaPass.length > 30) {
                req.flash("errorGlobal", "La nueva contraseña es demasiado larga");
                res.redirect("/PerfilContra")
            } else if (nuevaPass.search(/\d/) == -1) {
                req.flash("errorGlobal", "La nueva contraseña debe poseer al menos 1 carácter numérico");
                res.redirect("/PerfilContra")
            } else if (nuevaPass.search(/[a-zA-Z]/) == -1) {
                req.flash("errorGlobal", "La nueva contraseña debe poseer al menos 2 carácteres alfabéticos")
                res.redirect("/PerfilContra")
            } else if (nuevaPass.search(/[a-z]/) == -1) {
                req.flash("errorGlobal", "La nueva contraseña debe poseer al menos 1 letra minúscula");
                res.redirect("/PerfilContra")
            } else if (nuevaPass.search(/[A-Z]/) == -1) {
                req.flash("errorGlobal", "La nueva contraseña debe poseer al menos 1 letra mayúscula");
                res.redirect("/PerfilContra")
            } else if (nuevaPass.search(/[\!\@\#\$\%\^\&\*\(\)\_\+\:\-]/) == -1) {
                req.flash("errorGlobal", "La nueva contraseña debe poseer al menos 1 carácter especial");
                res.redirect("/PerfilContra")
            } else if (nuevaPass.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+\:\-]/) != -1) {
                req.flash("errorGlobal", "La nueva contraseña posee al menos 1 carácter no permitido");
                res.redirect("/PerfilContra")
            } else {
                cuenta.password = nuevaPass
                cuenta.save()
                req.flash("successGlobal", "Contraseña actualizada con éxito");
                res.redirect("/PerfilContra")
            }
        } else if (pass == "" || nuevaPass == "" || confirmNuevaPass == "") {
            req.flash("warning", "Alguno de los espacios se encuentra vacío");
            res.redirect("/PerfilContra")
        } else if (!validPass) {
            req.flash("errorGlobal", "Contraseña actual incorrecta");
            res.redirect("/PerfilContra")
        } else if (nuevaPass != confirmNuevaPass) {
            req.flash("errorGlobal", "Las nuevas contraseñas no coinciden");
            res.redirect("/PerfilContra")
        }

    } catch (error) {
        req.flash("errorGlobal", "Hubo un error al actualizar la contraseña. Por favor intente de nuevo");
        res.redirect("/PerfilContra")
        console.log(error)
    }
}