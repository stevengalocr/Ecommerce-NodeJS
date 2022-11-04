const notificacion = require("../models/notificaciones")

module.exports.crearNotificacion = async (req, res) => {
    try {
        const { user, correo, tipo } = req

        const nuevaNoti = new notificacion(
            {
                leida: false,
                nombreUsuario: user,
                correo: correo,
                accion: tipo
            })
        await nuevaNoti.save()
    } catch (error) {
        res.redirect("/Perfil");
        console.log(error.message);
    }
}

module.exports.mostrarNotificaciones = async (req, res) => {
    try {
        const numeroNot = await this.numeroNotificaciones()
        const porPagina = 15
        const pagina = req.params.pagina || 1

        notificacion.find().sort({ leida: 1, _id: -1 }).lean()
            .skip((porPagina * pagina) - porPagina)
            .limit(porPagina)
            .exec(function (err, notifica) {
                notificacion.count().exec(function (err, count) {
                    if (err) return next(err)
                    res.render('Notificaciones', {
                        notifica: notifica,
                        current: pagina,
                        paginas: Math.ceil(count / porPagina),
                        numeroNot
                    })
                })
            })
    } catch (error) {
        req.flash("errorGlobal", "Hubo un error al cargar las notificaciones. Por favor intente de nuevo")
        res.redirect("/Perfil");
        console.log(error.message);
    }
}

module.exports.marcarLeida = async (req, res) => {
    try {
        const id = req.params.id
        await notificacion.findByIdAndUpdate(id, {
            leida: true
        })
        res.redirect('/Notificaciones/1')
    } catch (error) {
        req.flash("errorGlobal", "Hubo un error al marcar como leida la notificación. Por favor intente de nuevo")
        res.redirect("/Notificaciones/1");
        console.log(error.message);
    }
}

module.exports.notificacionesEliminar = async (req, res) => {
    try {
        const id = req.params.id
        await notificacion.findByIdAndDelete(id)
        req.flash("errorGlobal", "Se ha eliminado la notificación")
        res.redirect('/Notificaciones/1')
    } catch (error) {
        req.flash("errorGlobal", "Hubo un error al eliminar notificación. Por favor intente de nuevo")
        res.redirect("/Notificaciones/1");
        console.log(error.message);
    }
}

module.exports.numeroNotificaciones = async (req, res) => {
    const numeroNot = await notificacion.find({ leida: false }).lean()
    const cantidadNot = numeroNot.length
    return cantidadNot
}

module.exports.numeroNotificacionesIndex = async (req, res) => {
    const activePage = 'Index'

    if (req.user?.role == 'ADMIN') {
        const numeroNot = await this.numeroNotificaciones()
        res.render("Index", { activePage, numeroNot });
    } else {
        res.render("Index", { activePage });
    }
}

module.exports.numeroNotificacionesAbout = async (req, res) => {
    const activePage = 'Acerca'
    if (req.user?.role == 'ADMIN') {
        const numeroNot = await this.numeroNotificaciones()
        res.render("About-us", { activePage, numeroNot });
    } else {
        res.render("About-us", { activePage });
    }
}

module.exports.numeroNotificacionesReparaciones = async (req, res) => {
    const activePage = 'Reparaciones'
    if (req.user?.role == 'ADMIN') {
        const numeroNot = await this.numeroNotificaciones()
        res.render("Reparaciones", { activePage, numeroNot });
    } else {
        res.render("Reparaciones", { activePage });
    }
}

module.exports.numeroNotificacionesCotizaciones = async (req, res) => {
    const activePage = 'Cotizaciones'
    if (req.user?.role == 'ADMIN') {
        const numeroNot = await this.numeroNotificaciones()
        res.render("Cotizaciones", { activePage, numeroNot });
    } else {
        res.render("Cotizaciones", { activePage });
    }
}

module.exports.numeroNotificacionesAdmin = async (req, res) => {
    const activePage = 'Administrador'
    if (req.user?.role == 'ADMIN') {
        const numeroNot = await this.numeroNotificaciones()
        res.render("Administrador", { activePage, numeroNot });
    } else {
        res.render("Administrador", { activePage });
    }
}

module.exports.numeroNotificacionesPerfil = async (req, res) => {
    const activePage = 'Perfil'
    const usuarioDatos = req.user
    if (req.user?.role == 'ADMIN') {
        const numeroNot = await this.numeroNotificaciones()
        res.render("Perfil", { activePage, usuarioDatos, numeroNot });
    } else {
        res.render("Perfil", { activePage, usuarioDatos });
    }
}

module.exports.numeroNotificacionesPerfilContra = async (req, res) => {
    const activePage = 'Perfil'
    const usuarioDatos = req.user
    if (req.user?.role == 'ADMIN') {
        const numeroNot = await this.numeroNotificaciones()
        res.render("PerfilContra", { activePage, usuarioDatos, numeroNot });
    } else {
        res.render("PerfilContra", { activePage, usuarioDatos });
    }
}