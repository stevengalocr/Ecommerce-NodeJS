const mongoose = require("mongoose")
const express = require("express");
const path = require("path");
require('dotenv').config();

const session = require("express-session");
const { create } = require("express-handlebars")
const passport = require("passport");
const flash = require("connect-flash");
const flashx = require("express-flash");

//Conexión a la DB
mongoose.connect('mongodb://127.0.0.1:27017/SafeHomeDB',
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a la BD'))
    .catch(err => console.log(err));

const bodyParser = require('body-parser')
const routes = require("./routes");
const User = require("./models/User");


const app = express();

//middlewares
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);
const jsonParser = bodyParser.json()
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.json());
app.set("port", process.env.PORT || 3000);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(flash());
app.use(flashx());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.successGlobal = req.flash('successGlobal');
    res.locals.errorGlobal = req.flash('errorGlobal');
    res.locals.warning = req.flash('warning');
    res.locals.mensajes = req.flash('mensajes');

    //Obtener role y nombre completo del usuario
    res.locals.activePage = ''
    res.locals.bienvenidaNombre = ''
    res.locals.role = ''
    res.locals.numeroNot = '0'
    res.locals.paginas = ''
    next();
});

app.use(passport.initialize());
app.use(passport.session());

//Datos del usuario conectado., dentro de los corchetes, van los datos que se quieren traer.
passport.serializeUser(
    (user, done) => done(null, { id: user._id, email: user.email, nombre: user.nombre, apellido: user.apellido, role: user.role })
);

passport.deserializeUser(async (user, done) => {
    const userDB = await User.findById(user.id).exec();
    return done(null, { id: userDB._id, email: userDB.email, nombre: userDB.nombre, apellido: userDB.apellido, role: userDB.role });
});

app.use(routes);

app.listen(app.get("port"), function () {
    console.log("Server started on port " + app.get("port"));
})