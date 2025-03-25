const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Obtener todas las reservaciones
exports.getAllReservations = async () => {
  const [rows] = await pool.query(`
    SELECT 
      r.id, 
      r.cinema_id, 
      r.user_id, 
      r.date, 
      r.created_at,
      u.name as user_name,
      c.name as cinema_name,
      c.movie_title
    FROM reservations r
    JOIN users u ON r.user_id = u.id
    JOIN cinemas c ON r.cinema_id = c.id
  `);
  
  // Obtener los asientos para cada reservación
  const reservations = [];
  
  for (const row of rows) {
    const [seats] = await pool.query(`
      SELECT row_num, column_num
      FROM seats
      WHERE reservation_id = ?
    `, [row.id]);
    
    reservations.push({
      id: row.id,
      cinemaId: row.cinema_id.toString(),
      userId: row.user_id.toString(),
      date: row.date.toISOString().split('T')[0],
      createdAt: row.created_at.toISOString(),
      userName: row.user_name,
      cinemaName: row.cinema_name,
      movieTitle: row.movie_title,
      seats: seats.map(seat => ({
        id: `${seat.row_num}-${seat.column_num}`,
        row: seat.row_num,
        column: seat.column_num,
        status: 'reserved'
      }))
    });
  }
  
  return reservations;
};

// Obtener reservaciones de un usuario
exports.getUserReservations = async (userId) => {
  const [rows] = await pool.query(`
    SELECT 
      r.id, 
      r.cinema_id, 
      r.user_id, 
      r.date, 
      r.created_at,
      c.name as cinema_name,
      c.movie_title
    FROM reservations r
    JOIN cinemas c ON r.cinema_id = c.id
    WHERE r.user_id = ?
  `, [userId]);
  
  // Obtener los asientos para cada reservación
  const reservations = [];
  
  for (const row of rows) {
    const [seats] = await pool.query(`
      SELECT row_num, column_num
      FROM seats
      WHERE reservation_id = ?
    `, [row.id]);
    
    reservations.push({
      id: row.id,
      cinemaId: row.cinema_id.toString(),
      userId: row.user_id.toString(),
      date: row.date.toISOString().split('T')[0],
      createdAt: row.created_at.toISOString(),
      cinemaName: row.cinema_name,
      movieTitle: row.movie_title,
      seats: seats.map(seat => ({
        id: `${seat.row_num}-${seat.column_num}`,
        row: seat.row_num,
        column: seat.column_num,
        status: 'reserved'
      }))
    });
  }
  
  return reservations;
};

// Obtener reservación por ID
exports.getReservationById = async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      r.id, 
      r.cinema_id, 
      r.user_id, 
      r.date, 
      r.created_at,
      u.name as user_name,
      c.name as cinema_name,
      c.movie_title
    FROM reservations r
    JOIN users u ON r.user_id = u.id
    JOIN cinemas c ON r.cinema_id = c.id
    WHERE r.id = ?
  `, [id]);
  
  if (rows.length === 0) {
    return null;
  }
  
  const row = rows[0];
  
  // Obtener los asientos
  const [seats] = await pool.query(`
    SELECT row_num, column_num
    FROM seats
    WHERE reservation_id = ?
  `, [id]);
  
  return {
    id: row.id,
    cinemaId: row.cinema_id.toString(),
    userId: row.user_id.toString(),
    date: row.date.toISOString().split('T')[0],
    createdAt: row.created_at.toISOString(),
    userName: row.user_name,
    cinemaName: row.cinema_name,
    movieTitle: row.movie_title,
    seats: seats.map(seat => ({
      id: `${seat.row_num}-${seat.column_num}`,
      row: seat.row_num,
      column: seat.column_num,
      status: 'reserved'
    }))
  };
};

// Obtener asientos para una sala y fecha específica
// Obtener asientos para una sala y fecha específica
exports.getSeatsForDate = async (cinemaId, date) => {
  // Obtener información de la sala
  const [cinemaRows] = await pool.query(`
    SELECT \`rows\`, \`columns\`
    FROM cinemas
    WHERE id = ?
  `, [cinemaId]);
  
  if (cinemaRows.length === 0) {
    throw new Error('Sala de cine no encontrada');
  }
  
  const cinema = cinemaRows[0];
  
  // Obtener reservaciones para esta sala y fecha
  const [reservationRows] = await pool.query(`
    SELECT id
    FROM reservations
    WHERE cinema_id = ? AND date = ?
  `, [cinemaId, date]);
  
  // Obtener asientos reservados
  let reservedSeats = [];
  
  for (const reservation of reservationRows) {
    const [seatRows] = await pool.query(`
      SELECT row_num, column_num
      FROM seats
      WHERE reservation_id = ?
    `, [reservation.id]);
    
    reservedSeats = [...reservedSeats, ...seatRows];
  }
  
  // Generar todos los asientos
  const seats = [];
  
  for (let row = 0; row < cinema.rows; row++) {
    for (let column = 0; column < cinema.columns; column++) {
      // Verificar si este asiento está reservado
      const isReserved = reservedSeats.some(
        seat => seat.row_num === row && seat.column_num === column
      );
      
      seats.push({
        id: `${row}-${column}`,
        row,
        column,
        status: isReserved ? 'reserved' : 'available'
      });
    }
  }
  
  return seats;
};

// Crear nueva reservación
exports.createReservation = async (reservationData) => {
  const { 
    cinemaId, 
    userId, 
    seats, 
    date 
  } = reservationData;
  
  // Generar ID único para la reservación
  const reservationId = uuidv4();
  
  // Iniciar transacción
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    // Insertar reservación
    await connection.query(`
      INSERT INTO reservations (id, cinema_id, user_id, date)
      VALUES (?, ?, ?, ?)
    `, [reservationId, cinemaId, userId, date]);
    
    // Insertar asientos
    for (const seat of seats) {
      await connection.query(`
        INSERT INTO seats (reservation_id, row_num, column_num)
        VALUES (?, ?, ?)
      `, [reservationId, seat.row, seat.column]);
    }
    
    // Actualizar asientos disponibles en la sala
    await connection.query(`
      UPDATE cinemas
      SET available_seats = available_seats - ?
      WHERE id = ?
    `, [seats.length, cinemaId]);
    
    // Confirmar transacción
    await connection.commit();
    
    return {
      id: reservationId,
      cinemaId,
      userId,
      seats: seats.map(seat => ({
        ...seat,
        status: 'reserved'
      })),
      date,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    // Revertir transacción en caso de error
    await connection.rollback();
    throw error;
  } finally {
    // Liberar conexión
    connection.release();
  }
};