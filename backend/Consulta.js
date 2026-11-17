const mongoose = require("mongoose");

const consultaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true
    },
    producto: {
        type: String,
        default: ""
    },
    mensaje: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Consulta", consultaSchema);