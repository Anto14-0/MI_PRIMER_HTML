
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

// ========================================
// 1. CONFIGURACIÓN DE SESIONES
// ========================================

function obtenerSessionSecret() {
    const secret = process.env.SESSION_SECRET;

    if (!secret || secret.length < 32) {
        throw new Error(
            "SESSION_SECRET debe estar configurada y tener al menos 32 caracteres."
        );
    }

    return secret;
}

// ========================================
// 2. COMPARACIÓN SEGURA
// ========================================

function safeEqual(a, b) {
    const hashA = crypto
        .createHash("sha256")
        .update(String(a))
        .digest();

    const hashB = crypto
        .createHash("sha256")
        .update(String(b))
        .digest();

    return crypto.timingSafeEqual(hashA, hashB);
}

// ========================================
// 3. CREAR TOKEN
// ========================================

function crearToken(usuario) {
    const payload = Buffer.from(
        JSON.stringify({
            usuario,
            exp: Date.now() + 24 * 60 * 60 * 1000
        })
    ).toString("base64url");

    const firma = crypto
        .createHmac("sha256", obtenerSessionSecret())
        .update(payload)
        .digest("base64url");

    return `${payload}.${firma}`;
}

// ========================================
// 4. VERIFICAR ADMINISTRADOR
// ========================================

function verificarAdmin(req, res, next) {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
        return res.status(401).json({
            mensaje: "Sesión administrativa requerida."
        });
    }

    const partes = header.slice(7).split(".");

    if (partes.length !== 2) {
        return res.status(401).json({
            mensaje: "Token inválido."
        });
    }

    try {
        const [payload, firma] = partes;

        const firmaEsperada = crypto
            .createHmac("sha256", obtenerSessionSecret())
            .update(payload)
            .digest("base64url");

        if (!safeEqual(firma, firmaEsperada)) {
            return res.status(401).json({
                mensaje: "Token inválido."
            });
        }

        const datos = JSON.parse(
            Buffer.from(payload, "base64url").toString("utf8")
        );

        if (
            !datos.usuario ||
            !datos.exp ||
            datos.exp < Date.now()
        ) {
            return res.status(401).json({
                mensaje: "Tu sesión expiró."
            });
        }

        req.adminUser = datos.usuario;

        next();
    } catch (error) {
        console.error("Error al verificar sesión:", error);

        return res.status(401).json({
            mensaje: "Token inválido o configuración de sesión incorrecta."
        });
    }
}

// ========================================
// 5. ASEGURAR COLORES INICIALES
// ========================================

async function asegurarColoresIniciales(Color) {
    const total = await Color.countDocuments();

    if (total === 0) {
        await Color.insertMany(COLORES_INICIALES);
    }

    return Color.find().sort({ nombre: 1 }).lean();
}

// ========================================
// 6. RUTAS ADMINISTRATIVAS
// ========================================

function crearRutasAdmin({ Consulta, Color }) {
    const router = express.Router();

    // ------------------------------------
    // COLORES DISPONIBLES
    // Ruta pública para el catálogo
    // ------------------------------------

    router.get("/api/colores", async (_req, res) => {
        try {
            const colores = await asegurarColoresIniciales(Color);

            res.json(colores);
        } catch (error) {
            console.error("Error al obtener colores:", error);

            res.status(500).json({
                mensaje: "No fue posible obtener los colores."
            });
        }
    });

    // ------------------------------------
    // INICIO DE SESIÓN ADMINISTRATIVO
    // ------------------------------------

    router.post("/api/admin/login", (req, res) => {
        try {
            const adminUser = (process.env.ADMIN_USER || "").trim();
            const adminPass = process.env.ADMIN_PASSWORD || "";

            if (!adminUser || !adminPass) {
                return res.status(500).json({
                    mensaje: "Falta configurar el usuario o contraseña administrativa."
                });
            }

            const usuario = String(req.body?.usuario || "").trim();
            const password = String(req.body?.password || "");

            if (
                safeEqual(usuario, adminUser) &&
                safeEqual(password, adminPass)
            ) {
                return res.json({
                    token: crearToken(adminUser),
                    usuario: adminUser
                });
            }

            return res.status(401).json({
                mensaje: "Usuario o contraseña incorrectos."
            });
        } catch (error) {
            console.error("Error en inicio de sesión:", error);

            return res.status(500).json({
                mensaje: "No fue posible iniciar sesión."
            });
        }
    });

    // ------------------------------------
    // PANEL ADMINISTRATIVO
    // ------------------------------------

    router.get(
        "/api/admin/dashboard",
        verificarAdmin,
        async (_req, res) => {
            try {
                const [colores, consultas] = await Promise.all([
                    asegurarColoresIniciales(Color),
                    Consulta.find().sort({ _id: -1 }).lean()
                ]);

                res.json({
                    colores,
                    consultas
                });
            } catch (error) {
                console.error("Error en dashboard admin:", error);

                res.status(500).json({
                    mensaje: "Error al cargar el panel administrativo."
                });
            }
        }
    );

    // ------------------------------------
    // ACTIVAR O PAUSAR COLORES
    // ------------------------------------

    router.patch(
        "/api/admin/colores/:id",
        verificarAdmin,
        async (req, res) => {
            try {
                const disponible = req.body?.disponible;

                if (typeof disponible !== "boolean") {
                    return res.status(400).json({
                        mensaje: "El estado del color debe ser verdadero o falso."
                    });
                }

                const color = await Color.findOneAndUpdate(
                    { id: req.params.id },
                    { $set: { disponible } },
                    { new: true, runValidators: true }
                );

                if (!color) {
                    return res.status(404).json({
                        mensaje: "Color no encontrado."
                    });
                }

                res.json(color);
            } catch (error) {
                console.error("Error al actualizar color:", error);

                res.status(500).json({
                    mensaje: "Error al actualizar el color."
                });
            }
        }
    );

    return router;
}

// ========================================
// 7. EXPORTAR FUNCIONES
// ========================================

module.exports = {
    crearRutasAdmin,
    verificarAdmin
};
