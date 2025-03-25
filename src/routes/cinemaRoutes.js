const express = require('express');
const router = express.Router();
const cinemaController = require('../controllers/cinemaController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Rutas públicas (requieren autenticación pero no admin)
router.get('/', verifyToken, cinemaController.getAllCinemas);
router.get('/:id', verifyToken, cinemaController.getCinemaById);

// Rutas para administradores
router.post('/', verifyToken, isAdmin, cinemaController.createCinema);
router.put('/:id', verifyToken, isAdmin, cinemaController.updateCinema);
router.delete('/:id', verifyToken, isAdmin, cinemaController.deleteCinema);

module.exports = router;