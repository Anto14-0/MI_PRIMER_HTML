require("dotenv").config();

const crypto = require("node:crypto");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const Producto = require("./Productos.js");
const Consulta = require("./Consulta.js");

const app = express();

// ========================================
// 1. CONFIGURACIÓN DEL SERVIDOR Y CORS
// ========================================

const frontendUrl = (process.env.FRONTEND_URL || "").trim().replace(/\/$/, "");
const origenesPermitidos = [
    frontendUrl,
    "http://localhost:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
].filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || !frontendUrl || origenesPermitidos.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Origen no permitido por CORS"));
        }
    })
);

app.use(express.json());

console.log("¿MONGODB_URI está definida?:", Boolean(process.env.MONGODB_URI));
console.log("¿Empieza con mongodb?:", process.env.MONGODB_URI?.startsWith("mongodb"));

// ========================================
// 2. CONEXIÓN A MONGODB Y MODELO DE COLORES
// ========================================

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Conectado a MongoDB");
    })
    .catch((error) => {
        console.error("Error al conectar a MongoDB:", error);
    });

const colorSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    hex: { type: String, required: true },
    disponible: { type: Boolean, default: true }
});

const Color = mongoose.models.Color || mongoose.model("Color", colorSchema);

const COLORES_INICIALES = [
    { id: "rosa-pastel", nombre: "Rosa pastel", hex: "#f7a8c4", disponible: true },
    { id: "crema", nombre: "Crema natural", hex: "#f5ebd6", disponible: true },
    { id: "beige", nombre: "Beige arena", hex: "#d8c2a6", disponible: true },
    { id: "terracota", nombre: "Terracota", hex: "#d07259", disponible: true },
    { id: "girasol", nombre: "Amarillo girasol", hex: "#f4c542", disponible: true },
    { id: "menta", nombre: "Verde menta", hex: "#98d8bf", disponible: true },
    { id: "lila", nombre: "Lila lavanda", hex: "#c6a4e8", disponible: true },
    { id: "azul-cielo", nombre: "Azul cielo", hex: "#9ac8eb", disponible: true }
];

async function obtenerColores() {
    const total = await Color.countDocuments();
    if (total === 0) {
        await Color.insertMany(COLORES_INICIALES);
    }
    return Color.find().lean();
}

// ========================================
// 3. SEGURIDAD DEL PANEL ADMINISTRATIVO
// ========================================

const SESSION_SECRET =
    process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

function safeEqual(a, b) {
    const hashA = crypto.createHash("sha256").update(String(a)).digest();
    const hashB = crypto.createHash("sha256").update(String(b)).digest();
    return crypto.timingSafeEqual(hashA, hashB);
}

function crearToken(usuario) {
    const payload = Buffer.from(
        JSON.stringify({ usuario, exp: Date.now() + 24 * 60 * 60 * 1000 })
    ).toString("base64url");

    const firma = crypto
        .createHmac("sha256", SESSION_SECRET)
        .update(payload)
        .digest("base64url");

    return `${payload}.${firma}`;
}

function verificarAdmin(req, res, next) {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
        return res.status(401).json({ mensaje: "Sesión administrativa requerida." });
    }

    const partes = header.slice(7).split(".");
    if (partes.length !== 2) {
        return res.status(401).json({ mensaje: "Token inválido." });
    }

    const [payload, firma] = partes;
    const firmaEsperada = crypto
        .createHmac("sha256", SESSION_SECRET)
        .update(payload)
        .digest("base64url");

    if (!safeEqual(firma, firmaEsperada)) {
        return res.status(401).json({ mensaje: "Token inválido." });
    }

    try {
        const datos = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
        if (!datos.exp || datos.exp < Date.now()) {
            return res.status(401).json({ mensaje: "Tu sesión expiró." });
        }
        req.adminUser = datos.usuario;
        next();
    } catch {
        return res.status(401).json({ mensaje: "Token inválido." });
    }
}

// ========================================
// 4. RUTA PRINCIPAL
// ========================================

app.get("/", (_req, res) => {
    res.send("Bienvenido a TEJEBONITO");
});

// ========================================
// 5. PRODUCTOS
// ========================================

app.get("/api/productos", async (_req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ mensaje: "Error al obtener los productos" });
    }
});

app.post("/api/productos", verificarAdmin, async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        const productoGuardado = await nuevoProducto.save();
        res.status(201).json(productoGuardado);
    } catch (error) {
        console.error("Error al guardar producto:", error);
        res.status(500).json({ mensaje: "Error al guardar el producto" });
    }
});

// ========================================
// 6. COLORES DE LANA
// ========================================

app.get("/api/colores", async (_req, res) => {
    try {
        const colores = await obtenerColores();
        res.json(colores);
    } catch (error) {
        console.error("Error al obtener colores:", error);
        res.json(COLORES_INICIALES);
    }
});

// ========================================
// 7. CONSULTAS DE CLIENTES
// ========================================

app.post("/api/consultas", async (req, res) => {
    try {
        const nombre = String(req.body?.nombre || "").trim().slice(0, 100);
        const correo = String(req.body?.correo || "").trim().slice(0, 150);
        const producto = String(req.body?.producto || "").trim().slice(0, 120);
        const mensaje = String(req.body?.mensaje || "").trim().slice(0, 1500);

        if (!nombre || !correo || !mensaje) {
            return res.status(400).json({ mensaje: "Completa los campos obligatorios" });
        }

        const nuevaConsulta = new Consulta({ nombre, correo, producto, mensaje });
        const consultaGuardada = await nuevaConsulta.save();

        res.status(201).json({
            mensaje: "Consulta guardada correctamente",
            consulta: consultaGuardada
        });
    } catch (error) {
        console.error("Error al guardar la consulta:", error);
        res.status(500).json({ mensaje: "Error al guardar la consulta" });
    }
});

app.get("/api/consultas", verificarAdmin, async (_req, res) => {
    try {
        const consultas = await Consulta.find().sort({ _id: -1 });
        res.json(consultas);
    } catch (error) {
        console.error("Error al consultar:", error);
        res.status(500).json({ mensaje: "Error al consultar las consultas" });
    }
});

// ========================================
// 8. RUTAS DEL PANEL ADMINISTRATIVO
// ========================================

app.post("/api/admin/login", (req, res) => {
    const adminUser = (process.env.ADMIN_USER || "").trim();
    const adminPass = (process.env.ADMIN_PASSWORD || "").trim();

    if (!adminUser || !adminPass) {
        return res.status(500).json({
            mensaje: "Falta configurar ADMIN_USER y ADMIN_PASSWORD en .env"
        });
    }

    const usuario = String(req.body?.usuario || "").trim();
    const password = String(req.body?.password || "");

    if (safeEqual(usuario, adminUser) && safeEqual(password, adminPass)) {
        return res.json({
            token: crearToken(adminUser),
            usuario: adminUser
        });
    }

    return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos." });
});

app.get("/api/admin/dashboard", verificarAdmin, async (_req, res) => {
    try {
        const [colores, consultas] = await Promise.all([
            obtenerColores(),
            Consulta.find().sort({ _id: -1 }).lean()
        ]);
        res.json({ colores, consultas });
    } catch (error) {
        console.error("Error en dashboard admin:", error);
        res.status(500).json({ mensaje: "Error al cargar el panel." });
    }
});

app.patch("/api/admin/colores/:id", verificarAdmin, async (req, res) => {
    try {
        const color = await Color.findOneAndUpdate(
            { id: req.params.id },
            { disponible: Boolean(req.body?.disponible) },
            { new: true }
        );
        if (!color) {
            return res.status(404).json({ mensaje: "Color no encontrado." });
        }
        res.json(color);
    } catch (error) {
        console.error("Error al actualizar color:", error);
        res.status(500).json({ mensaje: "Error al actualizar color." });
    }
});

// ========================================
// 9. ASISTENTE TEJEBOT 🧶
// ========================================

app.post("/api/tejebot", async (req, res) => {
    try {
        const mensaje = req.body?.mensaje;

        if (typeof mensaje !== "string" || !mensaje.trim()) {
            return res.status(400).json({ mensaje: "Escribe una pregunta para TejeBot." });
        }

        if (mensaje.length > 1000) {
            return res.status(413).json({
                mensaje: "Tu pregunta es demasiado larga. Intenta resumirla."
            });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(503).json({ mensaje: "TejeBot no está configurado todavía." });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const respuestaIA = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "system",
                    content: `Eres TejeBot, el asistente virtual de TEJEBONITO.
                    TEJEBONITO vende cintillos, posavasos, marcapáginas, scrunchies y combos regalo tejidos a crochet, 100% personalizados y elaborados bajo pedido (5-7 días hábiles) porque la lana se deteriora si se almacena hecha.
                    Ayudas con puntos, cuidados de la lana (lavado a mano con agua fría y secado a la sombra), combinaciones de colores y crochet.
                    Responde siempre en español, de forma breve y directa (2 a 5 frases). No inventes precios ni disponibilidad.`
                },
                { role: "user", content: mensaje.trim() }
            ],
            max_completion_tokens: 500
        });

        const respuesta = respuestaIA.choices[0]?.message?.content;
        res.json({
            respuesta: respuesta || "No pude generar una respuesta. Inténtalo de nuevo."
        });
    } catch (error) {
        console.error("Error en TejeBot:", error);
        res.status(500).json({ mensaje: "TejeBot tuvo un problema. Inténtalo de nuevo." });
    }
});

// ========================================
// 10. INICIAR SERVIDOR
// ========================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});