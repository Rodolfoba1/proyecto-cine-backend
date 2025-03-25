const reservationModel = require('../models/reservationModel');
const QRCode = require('qrcode');

// Obtener todas las reservaciones (admin)
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await reservationModel.getAllReservations();
    
    res.status(200).json({
      success: true,
      data: reservations
    });
  } catch (error) {
    console.error('Error al obtener reservaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reservaciones'
    });
  }
};

// Obtener reservaciones del usuario actual
exports.getUserReservations = async (req, res) => {
  try {
    const userId = req.user.id;
    const reservations = await reservationModel.getUserReservations(userId);
    
    res.status(200).json({
      success: true,
      data: reservations
    });
  } catch (error) {
    console.error('Error al obtener reservaciones del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reservaciones'
    });
  }
};

// Obtener reservación por ID
exports.getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await reservationModel.getReservationById(id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservación no encontrada'
      });
    }
    
    // Verificar que la reservación pertenezca al usuario o sea admin
    if (reservation.userId !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta reservación'
      });
    }
    
    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    console.error('Error al obtener reservación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reservación'
    });
  }
};

// Obtener asientos para una sala y fecha
exports.getSeatsForDate = async (req, res) => {
  try {
    const { cinemaId, date } = req.params;
    
    const seats = await reservationModel.getSeatsForDate(cinemaId, date);
    
    res.status(200).json({
      success: true,
      data: seats
    });
  } catch (error) {
    console.error('Error al obtener asientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener asientos'
    });
  }
};

// Crear nueva reservación
exports.createReservation = async (req, res) => {
  try {
    const { cinemaId, seats, date } = req.body;
    const userId = req.user.id;
    
    // Verificar que los asientos estén disponibles
    const availableSeats = await reservationModel.getSeatsForDate(cinemaId, date);
    
    for (const seat of seats) {
      const isAvailable = availableSeats.some(
        s => s.row === seat.row && s.column === seat.column && s.status === 'available'
      );
      
      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: `El asiento ${String.fromCharCode(65 + seat.row)}${seat.column + 1} no está disponible`
        });
      }
    }
    
    // Crear reservación
    const newReservation = await reservationModel.createReservation({
      cinemaId,
      userId,
      seats,
      date
    });
    
    // Generar código QR
    const qrData = JSON.stringify({
      reservationId: newReservation.id,
      cinemaId,
      date,
      seats: seats.map(s => `${String.fromCharCode(65 + s.row)}${s.column + 1}`)
    });
    
    const qrCode = await QRCode.toDataURL(qrData);
    
    res.status(201).json({
      success: true,
      message: 'Reservación creada exitosamente',
      data: {
        ...newReservation,
        qrCode
      }
    });
  } catch (error) {
    console.error('Error al crear reservación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear reservación'
    });
  }
};