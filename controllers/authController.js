const { nanoid } = require("nanoid");
const User = require("../models/User");
const { validationResult } = require("express-validator");
require('dotenv').config();

const registerForm = (req, res) => {
    res.render("Register", { aviso: req.flash("aviso") });
};

const registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("aviso", errors.array());
            return res.redirect("/Register");
        }
        const { nombre, apellido, email, password, repassword, role } = req.body;

        let user = await User.findOne({ email: email });
        if (user) throw new Error("Ya existe el usuario.")

        user = new User({ nombre, apellido, email, password, tokenConfirm: nanoid(), role })
        await user.save();

        //Enviar correo.
        const link = `http://safehomecostarica.com/confirmar/${user.tokenConfirm}`;


        const sgMail = require('@sendgrid/mail')
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)

        function getMessage() {
            return {
                to: email,
                from: process.env.FROM_EMAIL,
                subject: 'Confirmar Cuenta',
                text: 'Validación de correo electrónico.',
                html: `<div><h1>Estimado cliente:</h1><p>Se ha recibido una petición de la cuenta vinculada a este correo. Para validar la cuenta por favor ingrese al siguiente enlace:</p><a href=${link}>Validar credenciales</a><p>Si usted no realizó la petición de restablecimiento, por favor ignore este mensaje.</p><p>Esta es una dirección de correo electrónico automática, por favor no responda a este correo.</p></div>`
            };
        }

        async function sendEmail() {
            try {
                await sgMail.send(getMessage());
            } catch (error) {
                console.error(error);
                if (error.response) {
                    console.error(error.response.body)
                }
            }
        }
        (async () => {
            await sendEmail();
        })();
        req.flash("successGlobal", "Revisa tu correo electrónico y valida tu cuenta.")
        res.redirect('/Login')
    } catch (error) {
        req.flash("aviso", [{ msg: error.message }]);
        res.redirect("/Register");
    }
}


const confirmarCuenta = async (req, res) => {
    try {
        const { token } = req.params

        const user = await User.findOne({ tokenConfirm: token })
        if (!user) throw new Error('No existe este usuario');

        user.cuentaConfirmada = true;
        user.tokenConfirm = null;

        await user.save();

        req.flash("successGlobal", "Cuenta verificada con éxito.");

        res.redirect('/Login')
    } catch (error) {
        console.log(error);
        req.flash("errorGlobal", "Hubo un error al iniciar sesión. Por favor intente de nuevo");
        res.redirect("/Login");
    }
}

const loginForm = (req, res) => {
    res.render("Login", { aviso: req.flash("aviso") });
}

const loginUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("aviso", errors.array());
            return res.redirect("/Login");
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) throw new Error("No existe el usuario.");

        if (!user.cuentaConfirmada) throw new Error("Falta confirmar el correo de la cuenta");

        if (!(await user.comparePassword(password))) {
            throw new Error("Contraseña incorrecta.");
        }

        req.login(user, function (err) {
            if (err) {
                throw new Error("Error de passport");
            }
            return res.redirect("/Perfil");
        });

    } catch (error) {
        req.flash("aviso", [{ msg: error.message }]);
        console.log(error);
        res.redirect("/Login");
    }
};

const cerrarSesion = (req, res) => {
    req.logout();
    return res.redirect("/Index");
};

module.exports = {
    loginForm,
    registerForm,
    registerUser,
    confirmarCuenta,
    loginUser,
    cerrarSesion,
}