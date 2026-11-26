const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    hex: { type: String, required: true },
    disponible: { type: Boolean, default: true }
});

module.exports = mongoose.model("Color", colorSchema);