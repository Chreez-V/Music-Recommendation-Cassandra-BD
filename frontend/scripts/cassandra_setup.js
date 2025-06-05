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
  const usersData = await readCsv('users.csv');
  const insertUserStmt = `INSERT INTO ${KEYSPACE}.users (user_id, name, city) VALUES (?, ?, ?)`;
  for (const row of usersData) {
    await client.execute(insertUserStmt, [
      parseInt(row.user_id),
      row.name,
      row.city
    ], { prepare: true });
  }
  console.log(`Datos de usuarios cargados (${usersData.length} registros).`);

  // Cargar Canciones
  const songsData = await readCsv('songs.csv');
  const insertSongStmt = `INSERT INTO ${KEYSPACE}.songs (song_id, title, artist, genre) VALUES (?, ?, ?, ?)`;
  for (const row of songsData) {
    await client.execute(insertSongStmt, [
      parseInt(row.song_id),
      row.title,
      row.artist,
      row.genre
    ], { prepare: true });
  }
  console.log(`Datos de canciones cargados (${songsData.length} registros).`);

  // Cargar listens_by_city directamente desde el CSV
  const listensByCityData = await readCsv('listens_by_city.csv');
  const insertListensByCityStmt = `
    INSERT INTO ${KEYSPACE}.listens_by_city 
    (city, listen_date, user_id, song_id) 
    VALUES (?, ?, ?, ?)
  `;

  let loadedListensByCity = 0;
  const batchSize = 100; // Tamaño del lote para inserciones masivas
  let batch = [];

  for (const row of listensByCityData) {
    batch.push({
      query: insertListensByCityStmt,
      params: [
        row.city,
        new Date(row.listen_date),
        parseInt(row.user_id),
        parseInt(row.song_id)
      ]
    });

    if (batch.length >= batchSize) {
      await client.batch(batch, { prepare: true });
      loadedListensByCity += batch.length;
      batch = [];
      process.stdout.write(`\rRegistros cargados en listens_by_city: ${loadedListensByCity}`);
    }
  }

  // Insertar cualquier registro restante en el batch
  if (batch.length > 0) {
    await client.batch(batch, { prepare: true });
    loadedListensByCity += batch.length;
  }

  console.log(`\nDatos de listens_by_city cargados (${loadedListensByCity} registros).`);

  // Cargar escuchas normales (opcional, si también las necesitas)
const listensData = await readCsv('listens.csv');
const insertListenStmt = `
  INSERT INTO ${KEYSPACE}.listens 
  (listen_id, user_id, song_id, listen_date) 
  VALUES (?, ?, ?, ?)
`;

let loadedListens = 0;
batch = [];

for (const row of listensData) {
  
  batch.push({
    query: insertListenStmt,
    params: [
      uuidv4(),  // Usamos el TimeUUID convertido
      parseInt(row.user_id),
      parseInt(row.song_id),
      new Date(row.listen_date)
    ]
  });

  if (batch.length >= batchSize) {
    await client.batch(batch, { prepare: true });
    loadedListens += batch.length;
    batch = [];
    process.stdout.write(`\rRegistros cargados en listens: ${loadedListens}`);
  }
}
  if (batch.length > 0) {
    await client.batch(batch, { prepare: true });
    loadedListens += batch.length;
  }

  console.log(`\nDatos de escuchas cargados (${loadedListens} registros).`);
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
    const listensByCityCount = await client.execute(
      `SELECT COUNT(*) FROM ${KEYSPACE}.listens_by_city;`
    );
    console.log(`Total de registros en listens_by_city: ${listensByCityCount.rows[0].count}`);

    // Ejemplo de consulta por ciudad
    console.log("\nEjemplo de consulta por ciudad:");
    const cities = await client.execute(
      `SELECT DISTINCT city FROM ${KEYSPACE}.listens_by_city LIMIT 5;`
    );
    
    for (const row of cities.rows) {
      const count = await client.execute(
        `SELECT COUNT(*) FROM ${KEYSPACE}.listens_by_city WHERE city = ?;`,
        [row.city],
        { prepare: true }
      );
      console.log(`- ${row.city}: ${count.rows[0].count} escuchas`);
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
