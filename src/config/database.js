const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración unificada para MySQL (Railway y desarrollo)
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'cinema_reservation_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('Intentando conectar a la base de datos con la siguiente configuración:');
console.log({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  // No mostramos la contraseña por seguridad
});

const pool = mysql.createPool(dbConfig);

// Función para inicializar la base de datos
async function initDatabase() {
  try {
    // Crear conexión temporal usando la configuración completa (excepto la base de datos)
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      // No especificamos la base de datos aquí porque la crearemos si no existe
    });

    // Crear base de datos si no existe
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    
    // Seleccionar la base de datos
    await tempConnection.query(`USE ${dbConfig.database}`);
    
    // Crear tablas
    await tempConnection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email varchar(100) NOT NULL UNIQUE,
        password varchar(255) NOT NULL,
        role ENUM('admin', 'client') DEFAULT 'client',
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Nota el uso de backticks (`) alrededor de rows y columns
    await tempConnection.query(`
      CREATE TABLE IF NOT EXISTS cinemas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        movie_title VARCHAR(100) NOT NULL,
        movie_poster_url VARCHAR(255),
        movie_description TEXT,
        \`rows\` INT NOT NULL,
        \`columns\` INT NOT NULL,
        total_seats INT NOT NULL,
        available_seats INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await tempConnection.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id VARCHAR(36) PRIMARY KEY,
        cinema_id INT NOT NULL,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cinema_id) REFERENCES cinemas(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await tempConnection.query(`
      CREATE TABLE IF NOT EXISTS seats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reservation_id VARCHAR(36) NOT NULL,
        row_num INT NOT NULL,
        column_num INT NOT NULL,
        FOREIGN KEY (reservation_id) REFERENCES reservations(id)
      )
    `);

    // Crear usuario admin por defecto si no existe
    const [adminExists] = await tempConnection.query(
      'SELECT * FROM users WHERE email = ?',
      ['admin@correo.com']
    );

    if (adminExists.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await tempConnection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@correo.com', hashedPassword, 'admin']
      );
      
      console.log('Usuario administrador creado con éxito');
    }

    await tempConnection.end();
    console.log('Base de datos inicializada correctamente');
    
    // Verificar la conexión del pool
    const connection = await pool.getConnection();
    console.log('Pool de conexiones establecido correctamente');
    connection.release();
    
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error; // Lanzar el error para que sea capturado por el manejador en app.js
  }
}

// Exportar el pool y la función de inicialización
module.exports = {
  pool,
  initDatabase
};