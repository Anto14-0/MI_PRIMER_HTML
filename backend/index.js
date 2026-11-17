
require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

const Producto = require("./Productos.js");
const Consulta = require("./Consulta.js");

const app = express();

app.use(cors());
app.use(express.json());

// ========================================
// CONEXIÓN A MONGODB
// ========================================

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Conectado a MongoDB");
    })
    .catch((error) => {
        console.error("Error al conectar a MongoDB:", error);
    });

// ========================================
// RUTA PRINCIPAL
// ========================================

app.get("/", (req, res) => {
    res.send("Bienvenido a TEJEBONITO");
});

// ========================================
// OBTENER PRODUCTOS
// ========================================

app.get("/api/productos", async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al obtener los productos"
        });
    }
});

// ========================================
// REGISTRAR PRODUCTOS
// ========================================

app.post("/api/productos", async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        const productoGuardado = await nuevoProducto.save();

        res.status(201).json(productoGuardado);

    } catch (error) {
        res.status(500).json({
            mensaje: "Error al guardar el producto"
        });
    }
});

// ========================================
// REGISTRAR CONSULTAS
// ========================================

app.post("/api/consultas", async (req, res) => {
    try {
        const { nombre, correo, producto, mensaje } = req.body;

        if (!nombre || !correo || !mensaje) {
            return res.status(400).json({
                mensaje: "Completa los campos obligatorios"
            });
        }

        const nuevaConsulta = new Consulta({
            nombre,
            correo,
            producto,
            mensaje
        });

        const consultaGuardada = await nuevaConsulta.save();

        res.status(201).json({
            mensaje: "Consulta guardada correctamente",
            consulta: consultaGuardada
        });

    } catch (error) {
        console.error("Error al guardar la consulta:", error);

        res.status(500).json({
            mensaje: "Error al guardar la consulta"
        });
    }
});

// CONSULTAR LAS CONSULTAS GUARDADAS

app.get("/api/consultas", async (req, res) => {
    try {
        const consultas = await Consulta.find();
        res.json(consultas);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al consultar las consultas"
        });
    }
});

// ========================================
// INICIAR SERVIDOR
// ========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
