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

const app = express();

// Middleware
const allowedOrigins = [
  "https://proyecto-cine-frontend-production.up.railway.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'API de Sistema de Reservaciones de Cine',
    status: 'online',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
    }
  });
});

// Inicializar la base de datos antes de configurar las rutas
initDatabase()
  .then(() => {
    // Rutas (configuradas solo después de inicializar la base de datos)
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/cinemas', cinemaRoutes);
    app.use('/api/reservations', reservationRoutes);

    // Middleware de errores
    app.use(notFound);
    app.use(errorHandler);

    // Iniciar servidor
    app.listen(port, () => {
      console.log(`Servidor corriendo en el puerto ${port}`);
    });
  })
  .catch(error => {
    console.error('Error fatal al inicializar la base de datos:', error);
    // En producción,se podría querer reiniciar el contenedor aquí
    // process.exit(1);
    
    // En su lugar, se configura una ruta de error para diagnóstico
    app.get('*', (req, res) => {
      res.status(500).json({
        error: 'Error de conexión a la base de datos',
        message: 'No se pudo inicializar la base de datos. Contacte al administrador.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    });
    
    // Iniciar servidor en modo diagnóstico
    app.listen(port, () => {
      console.log(`Servidor en modo diagnóstico corriendo en el puerto ${port}`);
    });
  });

module.exports = app;