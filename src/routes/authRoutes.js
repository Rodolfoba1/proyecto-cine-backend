const express = require("express");
const { login, registrarUsuario } = require("../controllers/authController");
const verificarToken = require("../middlewares/authMiddleware");

const router = express.Router();

// Ruta para login y registro normal
router.post("/login", login);
router.post("/registro", registrarUsuario);

// Ruta para registro de admin (protegida por el middleware)
router.post("/registro-admin", verificarToken, registrarUsuario);

// Ruta de perfil (protegida por el middleware)
router.get("/perfil", verificarToken, (req, res) => {
    res.json({ mensaje: "Acceso autorizado", usuario: req.usuario });
});

module.exports = router;
