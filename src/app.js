const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./config/database');
const { port } = require('./config/config');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cinemaRoutes = require('./routes/cinemaRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

// Inicializar la base de datos
initDatabase();

// Crear aplicación Express
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/reservations', reservationRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'API de Sistema de Reservaciones de Cine',
    status: 'online'
  });
});

// Middleware de errores
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

module.exports = app;