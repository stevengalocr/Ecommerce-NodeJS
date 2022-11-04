//Creacion del modelo Bitácora

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bitacoraSchema = new Schema({
    nombreEmpresa: String,
    fechaCreacion: String,
    telefono: Number,
    correo: String,
    responsable: String,
    mantenimientos: [{
        fechaMantenimiento: String,
        responsableMantenimiento: String,
        comentarios: String
    }]
}, { versionKey: false })

module.exports = mongoose.model("Bitacora", bitacoraSchema, "Bitacora")