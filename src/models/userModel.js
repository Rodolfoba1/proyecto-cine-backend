const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios
exports.getAllUsers = async () => {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, active, created_at FROM users'
  );
  return rows;
};

// Obtener usuario por ID
exports.getUserById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, active, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

// Obtener usuario por email
exports.getUserByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0];
};

// Crear nuevo usuario
exports.createUser = async (userData) => {
  const { name, email, password, role = 'client' } = userData;
  
  // Hash de la contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role]
  );
  
  return {
    id: result.insertId,
    name,
    email,
    role
  };
};

// Actualizar estado de usuario (activar/desactivar)
exports.toggleUserStatus = async (id) => {
  // Primero obtenemos el estado actual
  const [user] = await pool.query(
    'SELECT active FROM users WHERE id = ?',
    [id]
  );
  
  if (!user[0]) {
    throw new Error('Usuario no encontrado');
  }
  
  const newStatus = !user[0].active;
  
  await pool.query(
    'UPDATE users SET active = ? WHERE id = ?',
    [newStatus, id]
  );
  
  return { id, active: newStatus };
};

// Verificar contraseña
exports.verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};