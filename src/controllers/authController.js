const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { jwtSecret, jwtExpiresIn } = require('../config/config');

// Registrar nuevo usuario
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Verificar si el email ya está registrado
    const existingUser = await userModel.getUserByEmail(email);
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está registrado'
      });
    }
    
    // Crear nuevo usuario
    const newUser = await userModel.createUser({
      name,
      email,
      password
    });
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario'
    });
  }
};

// Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verificar si el usuario existe
    const user = await userModel.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }
    
    // Verificar si el usuario está activo
    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: 'Usuario deshabilitado. Contacte al administrador'
      });
    }
    
    // Verificar contraseña
    // Verificar contraseña
    const isPasswordValid = await userModel.verifyPassword(password, user.password);  
    console.log("¿Contraseña válida?:", isPasswordValid);
    console.log("Contraseña en BD:", user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
      });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );
    
    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión'
    });
  }
};

// Obtener perfil del usuario actual
exports.getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil de usuario'
    });
  }
};