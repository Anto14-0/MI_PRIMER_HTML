require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const Producto = require("./Productos.js");

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Conectado a MongoDB");
    })
    .catch((error) => {
        console.error("Error al conectar a MongoDB:", error);
    });

app.get("/", (req, res) => {
    res.send("Bienvenido a TEJEBONITO");
});

app.get("/api/productos", async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener los productos" });
    }
});

app.post("/api/productos", async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        const productoGuardado = await nuevoProducto.save();
        res.status(201).json(productoGuardado);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al guardar el producto" });
    }
});

app.listen(3000, () => {
    console.log("Servidor ejecutándose en http://localhost:3000");
});