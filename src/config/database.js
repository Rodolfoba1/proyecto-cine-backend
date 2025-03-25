const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para inicializar la base de datos
async function initDatabase() {
  try {
    // Crear conexión sin seleccionar base de datos
    const tempConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    // Crear base de datos si no existe
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    
    // Seleccionar la base de datos
    await tempConnection.query(`USE ${process.env.DB_NAME}`);
    
    // Crear tablas
    await tempConnection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
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
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

module.exports = {
  pool,
  initDatabase
};