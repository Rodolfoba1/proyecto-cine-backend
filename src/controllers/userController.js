const userModel = require('../models/userModel');

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
};

// Obtener usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.getUserById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario'
    });
  }
};

// Activar/desactivar usuario
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que no se esté desactivando a sí mismo
    if (id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes cambiar tu propio estado'
      });
    }
    
    const result = await userModel.toggleUserStatus(id);
    
    res.status(200).json({
      success: true,
      message: result.active ? 'Usuario activado' : 'Usuario desactivado',
      data: result
    });
  } catch (error) {
    console.error('Error al cambiar estado de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado de usuario'
    });
  }
};