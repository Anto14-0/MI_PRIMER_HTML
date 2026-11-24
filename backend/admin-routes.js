const crypto = require("node:crypto");
const express = require("express");

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

async function asegurarColoresIniciales(Color) {
    const total = await Color.countDocuments();
    if (total === 0) {
        await Color.insertMany(COLORES_INICIALES);
    }
    return Color.find().lean();
}

function crearRutasAdmin({ Consulta, Color }) {
    const router = express.Router();

    // Público: el catálogo lee los colores disponibles
    router.get("/api/colores", async (_req, res) => {
        try {
            const colores = await asegurarColoresIniciales(Color);
            res.json(colores);
        } catch (error) {
            console.error("Error al obtener colores:", error);
            res.json(COLORES_INICIALES);
        }
    });

    // Login: valida usuario y contraseña contra .env
    router.post("/api/admin/login", (req, res) => {
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

    // Privado: dashboard admin (colores + consultas desde MongoDB)
    router.get("/api/admin/dashboard", verificarAdmin, async (_req, res) => {
        try {
            const [colores, consultas] = await Promise.all([
                asegurarColoresIniciales(Color),
                Consulta.find().sort({ _id: -1 }).lean()
            ]);
            res.json({ colores, consultas });
        } catch (error) {
            console.error("Error en dashboard admin:", error);
            res.status(500).json({ mensaje: "Error al cargar el panel." });
        }
    });

    // Privado: activar o pausar un color de lana
    router.patch("/api/admin/colores/:id", verificarAdmin, async (req, res) => {
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

    return router;
}

module.exports = { crearRutasAdmin, verificarAdmin };