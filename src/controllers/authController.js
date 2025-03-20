const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
require("dotenv").config();

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = await userModel.findByEmail(email);
        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

        const passwordMatch = await userModel.validatePassword(password, usuario.contraseña);
        if (!passwordMatch) return res.status(401).json({ error: "Contraseña incorrecta" });

        const token = jwt.sign({ id: usuario.id, email: usuario.email, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ mensaje: "Inicio de sesión exitoso", token });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error al procesar la solicitud" });
    }
};

const registrarUsuario = async (req, res) => {
    try {
        const { email, password, nombre, rol = 'cliente' } = req.body;

        // Verificar si el usuario que realiza la solicitud es administrador
        if (rol === 'admin') {
            if (!req.usuario || req.usuario.rol !== 'admin') {
                return res.status(403).json({ error: "No autorizado para crear usuarios administradores" });
            }
        }

        // Verificar si el correo ya está registrado
        if (await userModel.emailExists(email)) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        // Crear el usuario
        const resultado = await userModel.create({ email, password, nombre, rol });
        res.status(201).json({ mensaje: "Usuario registrado exitosamente", id: resultado.id });
    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ error: "Error al procesar la solicitud" });
    }
};

module.exports = { login, registrarUsuario };