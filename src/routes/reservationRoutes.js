const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Rutas para todos los usuarios
router.get('/user', reservationController.getUserReservations);
router.get('/:id', reservationController.getReservationById);
router.get('/seats/:cinemaId/:date', reservationController.getSeatsForDate);
router.post('/', reservationController.createReservation);

// Rutas para administradores
router.get('/', isAdmin, reservationController.getAllReservations);

module.exports = router;