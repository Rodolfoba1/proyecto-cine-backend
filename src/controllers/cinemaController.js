const cinemaModel = require('../models/cinemaModel');

// Obtener todas las salas de cine
exports.getAllCinemas = async (req, res) => {
  try {
    const cinemas = await cinemaModel.getAllCinemas();
    
    res.status(200).json({
      success: true,
      data: cinemas
    });
  } catch (error) {
    console.error('Error al obtener salas de cine:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener salas de cine'
    });
  }
};

// Obtener sala de cine por ID
exports.getCinemaById = async (req, res) => {
  try {
    const { id } = req.params;
    const cinema = await cinemaModel.getCinemaById(id);
    
    if (!cinema) {
      return res.status(404).json({
        success: false,
        message: 'Sala de cine no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      data: cinema
    });
  } catch (error) {
    console.error('Error al obtener sala de cine:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sala de cine'
    });
  }
};

// Crear nueva sala de cine
exports.createCinema = async (req, res) => {
  try {
    const { name, movie, rows, columns } = req.body;
    
    const newCinema = await cinemaModel.createCinema({
      name,
      movie,
      rows,
      columns
    });
    
    res.status(201).json({
      success: true,
      message: 'Sala de cine creada exitosamente',
      data: newCinema
    });
  } catch (error) {
    console.error('Error al crear sala de cine:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear sala de cine'
    });
  }
};

// Actualizar sala de cine
exports.updateCinema = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, movie, rows, columns } = req.body;
    
    const updatedCinema = await cinemaModel.updateCinema(id, {
      name,
      movie,
      rows,
      columns
    });
    
    res.status(200).json({
      success: true,
      message: 'Sala de cine actualizada exitosamente',
      data: updatedCinema
    });
  } catch (error) {
    console.error('Error al actualizar sala de cine:', error);
    
    if (error.message === 'Sala de cine no encontrada') {
      return res.status(404).json({
        success: false,
        message: 'Sala de cine no encontrada'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al actualizar sala de cine'
    });
  }
};

// Eliminar sala de cine
exports.deleteCinema = async (req, res) => {
  try {
    const { id } = req.params;
    
    await cinemaModel.deleteCinema(id);
    
    res.status(200).json({
      success: true,
      message: 'Sala de cine eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar sala de cine:', error);
    
    if (error.message === 'No se puede eliminar una sala con reservaciones') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar una sala con reservaciones'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error al eliminar sala de cine'
    });
  }
};