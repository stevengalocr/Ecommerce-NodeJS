const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const userSchema = new Schema({
    nombre: {
        type: String,
        required: true,
    },
    apellido: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        index: { unique: true },
    },
    password: {
        type: String,
        required: true,
    },
    tokenConfirm: {
        type: String,
        default: null,
    },
    cuentaConfirmada: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        default: "USER",
    },
    carrito: [{
        nombreProducto: String,
        precio: String,
        descuento: Number,
        idProducto: String,
        cantidad: Number,
    }],
    reparaciones: [{
        idReparacion: Number,
        nombreCliente: String,
        telefono: String,
        fechaCreacion: String,
        correo: String,
        dispositivo: String,
        descripcion: String,
        imagen: String,
        estado: String
    }],
    compras: [{
        FechaCreacion: String,
        Pago: String,
        MetodoContacto: String,
        Productos: Array,
        Contacto: String,
        TotalPrecio: Number,
        estado: String
    }],
    cotizaciones: [{
        fechaCreacion: String,
        nombreCliente: String,
        correo: String,
        telefono: String,
        productos: String,
        descripcion: String,
        ubicacion: String,
        estado: String
    }]

});

userSchema.pre("save", async function (next) {
    const user = this;
    if (!user.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
        next();
    } catch (error) {
        console.log(error);
        throw new Error("Error al codificar la contraseña");
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Usuario", userSchema, "usuarios");