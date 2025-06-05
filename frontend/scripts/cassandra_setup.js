import cassandra from 'cassandra-driver';
import fs from 'fs';
import { parse } from 'csv-parse';
import { v4 as uuidv4 } from 'uuid';

// Configuración de la conexión a Cassandra
const CASSANDRA_CONTACT_POINTS = ['127.0.0.1']; // Cambia esto si Cassandra no está en localhost
const KEYSPACE = 'music_recommendation';

const client = new cassandra.Client({
  contactPoints: CASSANDRA_CONTACT_POINTS,
  localDataCenter: 'datacenter1', // O tu centro de datos local
  keyspace: KEYSPACE
});

async function connectToCassandra() {
  try {
    await client.connect();
    console.log("Conectado a Cassandra.");
  } catch (err) {
    console.error(`Error al conectar a Cassandra: ${err.message}`);
    process.exit(1);
  }
}

async function createKeyspace() {
  const query = `
    CREATE KEYSPACE IF NOT EXISTS ${KEYSPACE}
    WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
  `;
  try {
    await client.execute(query);
    console.log(`Keyspace '${KEYSPACE}' creado o ya existente.`);
  } catch (err) {
    console.error(`Error al crear keyspace: ${err.message}`);
    throw err;
  }
}

async function createTables() {
  // Tabla de Usuarios
  const queryUsers = `
    CREATE TABLE IF NOT EXISTS ${KEYSPACE}.users (
      user_id INT PRIMARY KEY,
      name TEXT,
      city TEXT
    );
  `;
  await client.execute(queryUsers);
  console.log("Tabla 'users' creada o ya existente.");

  // Tabla de Canciones
  const querySongs = `
    CREATE TABLE IF NOT EXISTS ${KEYSPACE}.songs (
      song_id INT PRIMARY KEY,
      title TEXT,
      artist TEXT,
      genre TEXT
    );
  `;
  await client.execute(querySongs);
  console.log("Tabla 'songs' creada o ya existente.");

  // Tabla de Escuchas
  const queryListens = `
    CREATE TABLE IF NOT EXISTS ${KEYSPACE}.listens (
      listen_id TIMEUUID,
      user_id INT,
      song_id INT,
      listen_date TIMESTAMP,
      PRIMARY KEY ((user_id), listen_date, song_id)
    ) WITH CLUSTERING ORDER BY (listen_date DESC);
  `;
  await client.execute(queryListens);
  console.log("Tabla 'listens' creada o ya existente.");

  // Índice secundario para búsquedas por género
  const queryGenreIndex = `
    CREATE INDEX IF NOT EXISTS songs_genre_idx ON ${KEYSPACE}.songs(genre);
  `;
  await client.execute(queryGenreIndex);
  console.log("Índice 'songs_genre_idx' creado o ya existente.");

  // Tabla denormalizada para consultas por ciudad
  const queryListensByCity = `
    CREATE TABLE IF NOT EXISTS ${KEYSPACE}.listens_by_city (
      city TEXT,
      listen_date TIMESTAMP,
      user_id INT,
      song_id INT,
      PRIMARY KEY ((city), listen_date, user_id, song_id)
    ) WITH CLUSTERING ORDER BY (listen_date DESC);
  `;
  await client.execute(queryListensByCity);
  console.log("Tabla 'listens_by_city' creada o ya existente.");
}

async function loadData() {
  console.log("\nCargando datos...");

  // Cargar Usuarios
  const usersData = await readCsv('usuarios.csv');
  const insertUserStmt = `INSERT INTO ${KEYSPACE}.users (user_id, name, city) VALUES (?, ?, ?)`;
  for (const row of usersData) {
    await client.execute(insertUserStmt, [
      parseInt(row.usuario_id),
      row.nombre,
      row.ciudad
    ], { prepare: true });
  }
  console.log(`Datos de usuarios cargados (${usersData.length} registros).`);

  // Cargar Canciones
  const songsData = await readCsv('canciones.csv');
  const songGenres = {};
  const insertSongStmt = `INSERT INTO ${KEYSPACE}.songs (song_id, title, artist, genre) VALUES (?, ?, ?, ?)`;
  for (const row of songsData) {
    await client.execute(insertSongStmt, [
      parseInt(row.cancion_id),
      row.titulo,
      row.artista,
      row.genero
    ], { prepare: true });
    songGenres[parseInt(row.cancion_id)] = row.genero;
  }
  console.log(`Datos de canciones cargados (${songsData.length} registros).`);

  // Cargar Escuchas y la tabla denormalizada
  const listensData = await readCsv('escuchas.csv');
  const insertListenStmt = `INSERT INTO ${KEYSPACE}.listens (listen_id, user_id, song_id, listen_date) VALUES (?, ?, ?, ?)`;
  const insertListensByCityStmt = `INSERT INTO ${KEYSPACE}.listens_by_city (city, listen_date, user_id, song_id) VALUES (?, ?, ?, ?)`;

  let loadedListens = 0;
  let loadedListensByCity = 0;

  for (const row of listensData) {
    const userId = parseInt(row.usuario_id);
    const songId = parseInt(row.cancion_id);
    const listenDate = new Date(row.fecha_escucha);
    const listenId = uuidv4();

    // Insertar en la tabla de escuchas principal
    await client.execute(insertListenStmt, [
      listenId,
      userId,
      songId,
      listenDate
    ], { prepare: true });
    loadedListens++;

    // Obtener la ciudad del usuario para la tabla denormalizada
    const userQuery = `SELECT city FROM ${KEYSPACE}.users WHERE user_id = ?`;
    const userResult = await client.execute(userQuery, [userId], { prepare: true });
    
    if (userResult.rows.length > 0) {
      const city = userResult.rows[0].city;
      await client.execute(insertListensByCityStmt, [
        city,
        listenDate,
        userId,
        songId
      ], { prepare: true });
      loadedListensByCity++;
    }
  }

  console.log(`Datos de escuchas cargados (${loadedListens} registros).`);
  console.log(`Datos de listens_by_city cargados (${loadedListensByCity} registros).`);
}

async function readCsv(filePath) {
  return new Promise((resolve, reject) => {
    const records = [];
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    fs.createReadStream(filePath)
      .pipe(parser)
      .on('data', (data) => records.push(data))
      .on('end', () => resolve(records))
      .on('error', (err) => reject(err));
  });
}

async function verifyData() {
  console.log("\nVerificando datos...");
  
  try {
    const usersCount = await client.execute(`SELECT COUNT(*) FROM ${KEYSPACE}.users;`);
    console.log(`Total de usuarios: ${usersCount.rows[0].count}`);

    const songsCount = await client.execute(`SELECT COUNT(*) FROM ${KEYSPACE}.songs;`);
    console.log(`Total de canciones: ${songsCount.rows[0].count}`);

    const listensCount = await client.execute(`SELECT COUNT(*) FROM ${KEYSPACE}.listens;`);
    console.log(`Total de escuchas: ${listensCount.rows[0].count}`);

    const listensByCityCount = await client.execute(`SELECT COUNT(*) FROM ${KEYSPACE}.listens_by_city;`);
    console.log(`Total de registros en listens_by_city: ${listensByCityCount.rows[0].count}`);

    // Ejemplo de consulta OLAP simplificada: Escuchas por ciudad
    console.log("\nEjemplo de consulta por ciudad:");
    const cityResult = await client.execute(
      `SELECT city FROM ${KEYSPACE}.listens_by_city LIMIT 1;`
    );
    
    if (cityResult.rows.length > 0) {
      const sampleCity = cityResult.rows[0].city;
      const query = `
        SELECT COUNT(*) FROM ${KEYSPACE}.listens_by_city
        WHERE city = ?;
      `;
      const result = await client.execute(query, [sampleCity], { prepare: true });
      console.log(`Número de escuchas en ${sampleCity}: ${result.rows[0].count}`);
    }

    // Ejemplo de consulta usando el índice de género
    console.log("\nEjemplo de consulta por género:");
    const genreResult = await client.execute(
      `SELECT genre FROM ${KEYSPACE}.songs WHERE genre = 'Rock' LIMIT 1;`
    );
    
    if (genreResult.rows.length > 0) {
      const query = `
        SELECT COUNT(*) FROM ${KEYSPACE}.songs
        WHERE genre = ?;
      `;
      const result = await client.execute(query, ['Rock'], { prepare: true });
      console.log(`Número de canciones de Rock: ${result.rows[0].count}`);
    }
  } catch (err) {
    console.error(`Error al verificar datos: ${err.message}`);
  }
}

async function main() {
  try {
    await loadData();
    await verifyData();
  } catch (err) {
    console.error(`Error durante la ejecución: ${err.message}`);
  } finally {
    await client.shutdown();
    console.log("Conexión a Cassandra cerrada.");
  }
}

main();
