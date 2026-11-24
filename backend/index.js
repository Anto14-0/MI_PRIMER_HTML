
require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const Producto = require("./Productos.js");
const Consulta = require("./Consulta.js");

const app = express();

// ========================================
// CONFIGURACIÓN DEL SERVIDOR
// ========================================

app.use(cors());
app.use(express.json());

console.log(
    "¿MONGODB_URI está definida?:",
    Boolean(process.env.MONGODB_URI)
);

console.log(
    "¿Empieza con mongodb?:",
    process.env.MONGODB_URI?.startsWith("mongodb")
);

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
        console.error("Error al obtener productos:", error);

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
        console.error("Error al guardar producto:", error);

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

// ========================================
// CONSULTAR LAS CONSULTAS GUARDADAS
// ========================================

app.get("/api/consultas", async (req, res) => {
    try {
        const consultas = await Consulta.find();
        res.json(consultas);

    } catch (error) {
        console.error("Error al consultar:", error);

        res.status(500).json({
            mensaje: "Error al consultar las consultas"
        });
    }
});

// ========================================
// ASISTENTE DE INTELIGENCIA ARTIFICIAL
// TEJEBOT 🧶
// ========================================

app.post("/api/tejebot", async (req, res) => {
    try {
        const mensaje = req.body?.mensaje;

        if (typeof mensaje !== "string" || !mensaje.trim()) {
            return res.status(400).json({
                mensaje: "Escribe una pregunta para TejeBot."
            });
        }

        if (mensaje.length > 1000) {
            return res.status(413).json({
                mensaje: "Tu pregunta es demasiado larga. Intenta resumirla."
            });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(503).json({
                mensaje: "TejeBot no está configurado todavía."
            });
        }

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });

        const respuestaIA = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",

            messages: [
                {
                    role: "system",
                    content: `Eres TejeBot, el asistente virtual de TejeBonito.

                    Tu especialidad es el crochet y las manualidades.
                    Ayudas con puntos, materiales, técnicas, ideas,
                    combinaciones de colores y cuidado de tejidos.

                    Responde siempre en español, con amabilidad,
                    claridad y un tono cercano.

                    REGLAS IMPORTANTES:
                    - Responde de forma breve y directa.
                    - Utiliza entre 2 y 5 frases como máximo.
                    - Evita explicaciones demasiado largas.
                    - Utiliza listas únicamente cuando sean necesarias.
                    - Si el usuario pide más detalles, amplía la explicación.
                    - No inventes precios, productos ni disponibilidad.
                    - Mantén tus respuestas relacionadas con TejeBonito,
                    el crochet y las manualidades.`
                },
                {
                    role: "user",
                    content: mensaje.trim()
                }
            ],

            max_completion_tokens: 500
        });

        const respuesta =
            respuestaIA.choices[0]?.message?.content;

        res.json({
            respuesta: respuesta ||
                "No pude generar una respuesta. Inténtalo de nuevo."
        });

    } catch (error) {
        console.error("Error en TejeBot:", error);

        res.status(500).json({
            mensaje: "TejeBot tuvo un problema. Inténtalo de nuevo."
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

import { crearRutasAdmin } from './admin-routes.js';

// Pásale una función que devuelva tu arreglo o consulta de base de datos de consultas
app.use(crearRutasAdmin(() => consultasGuardadas));