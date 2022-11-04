const UsuarioOnline = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/Login");
};

const UsuarioOnSetDatos = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.locals.bienvenidaNombre = `¡Bienvenido, ${req.user?.nombre} ${req.user?.apellido}!`
        res.locals.role = req.user?.role
    }
    return next();
};

const UsuarioAdmin = (req, res, next) => {
    if (req.user?.role === "ADMIN") {
        return next();
    }
    res.redirect("/Index");
}

module.exports = {
    UsuarioOnline,
    UsuarioAdmin,
    UsuarioOnSetDatos
}