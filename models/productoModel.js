//Creacion del modelo Producto

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productoSchema = new Schema({
    nombreProducto: String,
    descripcion: String,
    precio: Number,
    descuento: {
        type: Number,
        default: 0
    },
    categoria: String,
    imagen: String
}, { versionKey: false })

module.exports = mongoose.model("Producto", productoSchema, "Producto")


