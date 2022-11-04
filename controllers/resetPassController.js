const jwt = require("jsonwebtoken")
const sgMail = require('@sendgrid/mail')
const Usuario = require("../models/User")
require('dotenv').config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

module.exports.forgotPass = async (req, res) => {
    const { email } = req.body
    const cuenta = await Usuario.findOne({ email })
    try {

        if (cuenta != null) {

            if (cuenta.email == email) {

                const secret = process.env.JWT_SECRET + cuenta.password;
                const payload = {
                    email: cuenta.email,
                    id: cuenta._id
                }
                const token = jwt.sign(payload, secret, { expiresIn: '60m' });
                const link = `http://safehomecostarica.com/reset-password/${cuenta._id}/${token}`;

                function getMessage() {
                    return {
                        to: email,
                        from: process.env.FROM_EMAIL,
                        subject: 'Restablecimiento de contraseña',
                        text: 'Restablecimiento de contraseña',
                        html: `<div><h1>Estimado cliente:</h1><p>Se ha recibido una petición para restablecer la contraseña de la cuenta vinculada a este correo. Para continuar por favor ingrese al siguiente enlace:</p><a href=${link}>Restablecer contraseña</a><p>Si usted no realizó la petición de restablecimiento, por favor ignore este mensaje.</p><p>Esta es una dirección de correo electrónico automática, por favor no responda a este correo.</p></div>`
                    };
                }

                async function sendEmail() {
                    try {
                        await sgMail.send(getMessage());
                        req.flash("success", "Se ha enviado a su correo electrónico los pasos para restabler su contraseña");
                        res.redirect('Forgot-password');
                    } catch (error) {
                        req.flash("error", "Ha ocurrido un error al restablecer su contraseña. Por favor, intente de nuevo");
                        res.redirect('Forgot-password');
                        console.error(error);
                        if (error.response) {
                            console.error(error.response.body)
                        }
                    }
                }

                (async () => {
                    await sendEmail();
                })();

            } else {
                req.flash("error", "El correo no coincide con el de ninguna cuenta registrada");
                res.redirect("Forgot-password");
            }

        } else {
            req.flash("error", "El correo no coincide con el de ninguna cuenta registrada");
            res.redirect("Forgot-password");
        }

    } catch (error) {
        req.flash("error", "Hubo un error con solicitud. Por favor intente de nuevo");
        res.redirect("Forgot-password");
        console.log(error)
    }
}

module.exports.resetPassGet = async (req, res) => {
    const { id, token } = req.params
    const cuenta = await Usuario.findOne({ _id: id })

    try {

        if (cuenta != null) {

            if (cuenta._id != id) {
                res.render('Index')
            }

            const secret = process.env.JWT_SECRET + cuenta.password

            try {
                const payload = jwt.verify(token, secret)
                res.render('Reset-password', { email: cuenta.email })

            } catch (error) {
                console.log(error.message)
                res.send("Token inválido")
            }

        } else {
            res.render('Index')
        }
    } catch (error) {
        res.redirect("Index");
        console.log(error)
    }
}

module.exports.resetPassPost = async (req, res) => {
    const { id, token } = req.params
    const { password, passwordConfirm } = req.body
    const cuenta = await Usuario.findOne({ _id: id })

    try {

        if (cuenta != null) {

            if (cuenta._id != id) {
                res.redirect('Index')
                return
            }

            const secret = process.env.JWT_SECRET + cuenta.password

            try {
                const payload = jwt.verify(token, secret)

                if (password.length < 6) {
                    req.flash("error", "La nueva contraseña debe poseer al menos 6 carácteres")
                    res.redirect(`http://safehomecostarica.com/reset-password/${id}/${token}`)
                } else if (password.length > 30) {
                    req.flash("error", "La nueva contraseña es demasiado larga")
                    res.redirect(`http://safehomecostarica.com/reset-password/${id}/${token}`)
                } else if (password.search(/\d/) == -1) {
                    req.flash("error", "La nueva contraseña debe poseer al menos 1 carácter numérico")
                    res.redirect(`http://safehomecostarica.com/reset-password/${id}/${token}`)
                } else if (password.search(/[a-zA-Z]/) == -1) {
                    req.flash("error", "La nueva contraseña debe poseer al menos 2 carácteres alfabéticos")
                    res.redirect(`http://safehomecostarica.com/reset-password/${id}/${token}`)
                } else if (password.search(/[a-z]/) == -1) {
                    req.flash("error", "La nueva contraseña debe poseer al menos 1 letra minúscula")
                    res.redirect(`http://safehomecostarica.com/reset-password/${id}/${token}`)
                } else if (password.search(/[A-Z]/) == -1) {
                    req.flash("error", "La nueva contraseña debe poseer al menos 1 letra mayúscula")
                    res.redirect(`http://safehomecostarica.com/reset-password/${id}/${token}`)
                } else if (password.search(/[\!\@\#\$\%\^\&\*\(\)\_\+\:\-]/) == -1) {
                    req.flash("error", "La nueva contraseña debe poseer al menos 1 carácter especial")
                    res.redirect(`http://safehomecostarica.com/reset-password/${id}/${token}`)
                } else if (password.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+\:\-]/) != -1) {
                    req.flash("error", "La nueva contraseña posee al menos 1 carácter no permitido")
                    res.redirect(`http://safehomecostarica.com/reset-password/${id}/${token}`)
                } else if (password != passwordConfirm) {
                    req.flash("error", "Las contraseñas no coinciden");
                    res.redirect(`http://safehomecostarica.com/reset-password/${id}/${token}`)
                } else {
                    cuenta.password = password
                    cuenta.save()
                    res.render('Reset-done')
                }
            } catch (error) {
                console.log(error.message)
                res.render('Index')
            }

        } else {
            res.render('Index')
        }
    } catch (error) {
        req.flash("error", "Hubo un error al actualizar la contraseña. Por favor intente de nuevo");
        res.redirect(`http://safehomecostarica.com/reset-password/${id}/${token}`)
        console.log(error)
    }
}