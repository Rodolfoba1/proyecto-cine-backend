const pool = require("../config/db");
const bcrypt = require("bcryptjs");

const findByEmail = async (email) => {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    return rows[0];
};

const emailExists = async (email) => {
    const user = await findByEmail(email);
    return !!user;
};

const validatePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

const create = async ({ email, password, nombre, rol = 'cliente', activo = 1 }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
        "INSERT INTO usuarios (email, contraseña, nombre, rol, activo) VALUES (?, ?, ?, ?, ?)",
        [email, hashedPassword, nombre, rol, activo]
    );
    return { id: result.insertId };
};

module.exports = { findByEmail, emailExists, validatePassword, create };