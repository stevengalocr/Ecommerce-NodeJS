const BitacoraC = require('./controllers/bitacoraController')
const Permisos = require("./controllers/permisosController")
const notificaciones = require("./controllers/notificacionesController")
const Mantenimiento = require('./controllers/mantenimientoController')
const Pago = require('./controllers/pagoController')
const { UsuarioOnline, UsuarioAdmin, UsuarioOnSetDatos } = require("./middlewares/verificarUsuario")
const { forgotPass, resetPassGet, resetPassPost } = require('./controllers/resetPassController');
const { updateDatosPersonales, updatePassword } = require('./controllers/datosPersonalesController')
const { body } = require("express-validator");
const { loginForm, registerForm, registerUser, confirmarCuenta, loginUser, cerrarSesion } = require('./controllers/authController');
const ProductoC = require('./controllers/productoAdminController')
const reparaciones = require("./controllers/reparacionesController")
const carrito = require("./controllers/carritoController")
const express = require("express");
const router = express.Router();
const Cotizaciones = require("./controllers/cotizacionController")


//BITACORAS
router.get("/Bitacora/:pagina", UsuarioAdmin, UsuarioOnSetDatos, BitacoraC.lista)

router.post('/Bitacora/add', UsuarioAdmin, UsuarioOnSetDatos, BitacoraC.crear)

router.get('/BitacoraEditar/:id/:pagina', UsuarioAdmin, UsuarioOnSetDatos, BitacoraC.listaEditar)

router.post('/Bitacora/edit/:id', UsuarioAdmin, UsuarioOnSetDatos, BitacoraC.editar)

router.get('/EliminarBitacora/:id', UsuarioAdmin, UsuarioOnSetDatos, BitacoraC.eliminar)



//NOTIFICACIONES
router.get("/Notificaciones/:pagina", UsuarioAdmin, UsuarioOnSetDatos, notificaciones.mostrarNotificaciones)

router.get('/NotificacionesLeida/:id', UsuarioAdmin, UsuarioOnSetDatos, notificaciones.marcarLeida)

router.get('/NotificacionesEliminar/:id', UsuarioAdmin, UsuarioOnSetDatos, notificaciones.notificacionesEliminar)



//PERMISO ADMINISTRADOR
router.post("/OtorgarPermisos", UsuarioAdmin, UsuarioOnSetDatos, Permisos.otorgar)

router.get("/Administrador", UsuarioAdmin, UsuarioOnSetDatos, notificaciones.numeroNotificacionesAdmin)



//MANTENIMIENTOS
router.post('/BitacoraEditar/:id/add', UsuarioAdmin, UsuarioOnSetDatos, Mantenimiento.crear)

router.get("/EliminarMantenimiento/:id/:idMantenimiento", UsuarioAdmin, UsuarioOnSetDatos, Mantenimiento.delete)

router.get("/EditarMantenimiento/:id/:idMantenimiento", UsuarioAdmin, UsuarioOnSetDatos, Mantenimiento.updatePage)

router.post("/Mantenimiento/edit/:id/:idMantenimiento", UsuarioAdmin, UsuarioOnSetDatos, Mantenimiento.updateMantenimiento)



//PRODUCTOS
router.get("/Productos/:pagina", UsuarioOnSetDatos, Pago.lista)

router.get("/ProductoAdmin/:pagina", UsuarioAdmin, UsuarioOnSetDatos, ProductoC.lista)

router.post('/Producto/add', UsuarioAdmin, UsuarioOnSetDatos, ProductoC.upload.single("imagen"), ProductoC.crear)

router.get('/EditarProducto/:id', UsuarioAdmin, UsuarioOnSetDatos, ProductoC.listaEditar)

router.post('/Producto/edit/:id', UsuarioAdmin, UsuarioOnSetDatos, ProductoC.upload.single("imagen"), ProductoC.editar)

router.get('/EliminarProducto/:id', UsuarioAdmin, UsuarioOnSetDatos, ProductoC.eliminar)

router.get("/AgregarProducto", UsuarioAdmin, UsuarioOnSetDatos, function (req, res) {
    const activePage = 'Productos'
    res.render("AgregarProducto", { activePage });
});



//SEARCH BAR Y FILTROS
router.get('/Buscar', UsuarioAdmin, UsuarioOnSetDatos, ProductoC.buscarAdmin)

router.get('/Search', UsuarioOnSetDatos, ProductoC.buscarCliente)


//INDEX E INFORMATIVOS
router.get("/", UsuarioOnSetDatos, notificaciones.numeroNotificacionesIndex);

router.get("/Index", UsuarioOnSetDatos, notificaciones.numeroNotificacionesIndex);

router.get("/About-us", UsuarioOnSetDatos, notificaciones.numeroNotificacionesAbout);



//METODO PAGO y COMPRAS REALIZADAS
router.get("/MetodoPago", UsuarioOnline, UsuarioOnSetDatos, function (req, res) {
    res.render("MetodoPago");
});

router.post("/Pago", UsuarioOnline, UsuarioOnSetDatos,  Pago.validaDatosProductos, Pago.MetodoPago);

router.get("/PerfilCompras/:pagina", UsuarioOnSetDatos, UsuarioOnline, Pago.mostrar)

router.get("/Detalles-Compras/:idPago", UsuarioOnline, UsuarioOnSetDatos, Pago.verCompra);

router.post("/Compras/edit/:idPago", UsuarioOnline, UsuarioOnSetDatos, Pago.updateCompra)



//REPARACIONES
router.get("/PerfilReparaciones/:pagina", UsuarioOnSetDatos, UsuarioOnline, reparaciones.mostrar)

router.post("/Reparaciones/add", UsuarioOnline, UsuarioOnSetDatos, reparaciones.upload.single("Imagen"), reparaciones.crear)

router.get("/Detalles-Reparaciones/:idReparacion", UsuarioOnline, UsuarioOnSetDatos, reparaciones.verReparacion)

router.post("/Reparaciones/edit/:idReparacion", UsuarioOnline, UsuarioOnSetDatos, reparaciones.updateReparacion)

router.get("/Reparaciones", UsuarioOnline, UsuarioOnSetDatos, notificaciones.numeroNotificacionesReparaciones)



//COTIZACIONES
router.get("/Cotizaciones", UsuarioOnSetDatos, UsuarioOnline, notificaciones.numeroNotificacionesCotizaciones)

router.post("/Cotizaciones/Crear", UsuarioOnline, UsuarioOnSetDatos, Cotizaciones.crear)

router.get("/PerfilCotizaciones/:pagina", UsuarioOnSetDatos, UsuarioOnline, Cotizaciones.mostrar)

router.get("/Detalles-Cotizaciones/:idCotizacion", UsuarioOnline, UsuarioOnSetDatos, Cotizaciones.verCotizacion);

router.post("/Cotizaciones/edit/:idCotizacion", UsuarioOnline, UsuarioOnSetDatos, Cotizaciones.updateCotizacion);



//PERFIL
router.get("/Perfil", UsuarioOnSetDatos, UsuarioOnline, notificaciones.numeroNotificacionesPerfil)

router.get("/PerfilContra", UsuarioOnSetDatos, UsuarioOnline, notificaciones.numeroNotificacionesPerfilContra)

router.post("/Perfil/:nombre/:apellidos", UsuarioOnSetDatos, UsuarioOnline, updateDatosPersonales)

router.post("/Perfil/:pass/:nuevaPass/:confirmNuevaPass", UsuarioOnSetDatos, UsuarioOnline, updatePassword)



//CARRITO
router.get("/Pedidos/:pagina", UsuarioOnSetDatos, UsuarioOnline, carrito.mostrarCarrito)

router.post("/Productos/add", UsuarioOnSetDatos, UsuarioOnline, carrito.añadirCarrito)

router.post("/Pedidos/cantidad", UsuarioOnSetDatos, UsuarioOnline, carrito.cambiarCantidad)

router.post("/Pedidos/eliminar", UsuarioOnSetDatos, UsuarioOnline, carrito.eliminarCarrito)



//RESET PASSWORD
router.get("/Forgot-password", (req, res) => {
    res.render("Forgot-password")
});

router.post("/Forgot-password", forgotPass)

router.get("/Reset-password/:id/:token", resetPassGet)

router.post("/Reset-password/:id/:token", resetPassPost)



//AUTENTICACIÓN
router.get("/Register", registerForm);

router.post("/Register",
    [
        body("nombre", "Ingrese un nombre")
            .trim()
            .notEmpty()
            .escape(),
        body("apellido", "Ingrese un apellido")
            .trim()
            .notEmpty()
            .escape(),
        body("email", "Ingrese un correo electrónico")
            .trim()
            .isEmail()
            .normalizeEmail(),
        body("password", "No cumple el formato de seguridad de la contraseña")
            .trim()
            .escape()
            .isLength({ min: 6, max: 30 })
            .custom((value, { req }) => {
                if (value !== req.body.repassword) {
                    throw new Error("Las contraseñas no coinciden")
                } else {
                    return value;
                }
            }),
    ],
    registerUser
);

router.get("/confirmar/:token", confirmarCuenta);

router.get("/Login", loginForm);

router.post("/Login", [
    body("email", "Ingrese un correo electrónico")
        .trim()
        .isEmail()
        .normalizeEmail(),
    body("password", "Ingrese la contraseña")
        .trim()
        .escape()
],
    loginUser
);

router.get("/logout", cerrarSesion);

module.exports = router;