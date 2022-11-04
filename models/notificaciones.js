const mongoose = require('mongoose')
const Schema = mongoose.Schema

const notificacionesSchema = new Schema({
    leida: Boolean,
    nombreUsuario: String,
    correo: String,
    accion: String

}, { versionKey: false })

module.exports = mongoose.model("Notificaciones", notificacionesSchema, "Notificaciones")