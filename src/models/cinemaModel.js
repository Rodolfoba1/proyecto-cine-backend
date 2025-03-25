const { pool } = require('../config/database');

// Obtener todas las salas de cine
exports.getAllCinemas = async () => {
  const [rows] = await pool.query(`
    SELECT 
      id, 
      name, 
      movie_title, 
      movie_poster_url, 
      movie_description, 
      \`rows\`, 
      \`columns\`, 
      total_seats, 
      available_seats, 
      created_at, 
      updated_at 
    FROM cinemas
  `);
  
  // Transformar los resultados al formato esperado por el frontend
  return rows.map(cinema => ({
    id: cinema.id.toString(),
    name: cinema.name,
    movie: {
      title: cinema.movie_title,
      posterUrl: cinema.movie_poster_url,
      description: cinema.movie_description
    },
    rows: cinema.rows,
    columns: cinema.columns,
    totalSeats: cinema.total_seats,
    availableSeats: cinema.available_seats
  }));
};

// Obtener sala de cine por ID
exports.getCinemaById = async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      id, 
      name, 
      movie_title, 
      movie_poster_url, 
      movie_description, 
      \`rows\`, 
      \`columns\`, 
      total_seats, 
      available_seats, 
      created_at, 
      updated_at 
    FROM cinemas 
    WHERE id = ?
  `, [id]);
  
  if (rows.length === 0) {
    return null;
  }
  
  const cinema = rows[0];
  
  // Transformar al formato esperado por el frontend
  return {
    id: cinema.id.toString(),
    name: cinema.name,
    movie: {
      title: cinema.movie_title,
      posterUrl: cinema.movie_poster_url,
      description: cinema.movie_description
    },
    rows: cinema.rows,
    columns: cinema.columns,
    totalSeats: cinema.total_seats,
    availableSeats: cinema.available_seats
  };
};

// Crear nueva sala de cine
exports.createCinema = async (cinemaData) => {
  const { 
    name, 
    movie, 
    rows, 
    columns 
  } = cinemaData;
  
  const totalSeats = rows * columns;
  
  const [result] = await pool.query(`
    INSERT INTO cinemas (
      name, 
      movie_title, 
      movie_poster_url, 
      movie_description, 
      \`rows\`, 
      \`columns\`, 
      total_seats, 
      available_seats
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    name, 
    movie.title, 
    movie.posterUrl, 
    movie.description, 
    rows, 
    columns, 
    totalSeats, 
    totalSeats
  ]);
  
  return {
    id: result.insertId.toString(),
    name,
    movie,
    rows,
    columns,
    totalSeats,
    availableSeats: totalSeats
  };
};

// Actualizar sala de cine
exports.updateCinema = async (id, cinemaData) => {
  const { 
    name, 
    movie, 
    rows, 
    columns 
  } = cinemaData;
  
  // Verificar si la sala tiene reservaciones
  const [reservations] = await pool.query(
    'SELECT COUNT(*) as count FROM reservations WHERE cinema_id = ?',
    [id]
  );
  
  const hasReservations = reservations[0].count > 0;
  
  // Obtener datos actuales de la sala
  const currentCinema = await this.getCinemaById(id);
  
  if (!currentCinema) {
    throw new Error('Sala de cine no encontrada');
  }
  
  // Si hay reservaciones, no permitir cambiar las dimensiones
  const finalRows = hasReservations ? currentCinema.rows : rows;
  const finalColumns = hasReservations ? currentCinema.columns : columns;
  const totalSeats = finalRows * finalColumns;
  
  // Calcular asientos disponibles
  let availableSeats = totalSeats;
  
  if (hasReservations) {
    // Si hay reservaciones, mantener la proporción de asientos disponibles
    const occupiedSeats = currentCinema.totalSeats - currentCinema.availableSeats;
    availableSeats = totalSeats - occupiedSeats;
  }
  
  await pool.query(`
    UPDATE cinemas 
    SET 
      name = ?, 
      movie_title = ?, 
      movie_poster_url = ?, 
      movie_description = ?, 
      \`rows\` = ?, 
      \`columns\` = ?, 
      total_seats = ?, 
      available_seats = ?
    WHERE id = ?
  `, [
    name, 
    movie.title, 
    movie.posterUrl, 
    movie.description, 
    finalRows, 
    finalColumns, 
    totalSeats, 
    availableSeats,
    id
  ]);
  
  return {
    id: id.toString(),
    name,
    movie,
    rows: finalRows,
    columns: finalColumns,
    totalSeats,
    availableSeats
  };
};

// Eliminar sala de cine
exports.deleteCinema = async (id) => {
  // Verificar si la sala tiene reservaciones
  const [reservations] = await pool.query(
    'SELECT COUNT(*) as count FROM reservations WHERE cinema_id = ?',
    [id]
  );
  
  if (reservations[0].count > 0) {
    throw new Error('No se puede eliminar una sala con reservaciones');
  }
  
  await pool.query('DELETE FROM cinemas WHERE id = ?', [id]);
  
  return { id };
};