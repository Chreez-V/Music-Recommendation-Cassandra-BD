import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configuración
const NUM_USERS = 200;
const NUM_SONGS = 50;
const NUM_LISTENS = 10000;
const OUTPUT_DIR = './data';

// --- Funciones de Ayuda ---
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(daysAgo: number = 365): Date {
  const date = new Date();
  date.setDate(date.getDate() - getRandomInt(0, daysAgo));
  date.setHours(getRandomInt(0, 23), getRandomInt(0, 59), getRandomInt(0, 59));
  return date;
}

// --- Datos de Base ---
const ARTISTS = [
  'Nirvana', 'Queen', 'Madonna', 'The Beatles', 'Michael Jackson',
  'Eagles', 'Guns N\' Roses', 'Bob Dylan', 'Oasis', 'Pink Floyd',
  'Led Zeppelin', 'Radiohead', 'David Bowie', 'The Rolling Stones', 'U2'
];

const GENRES = [
  'Rock', 'Pop', 'Grunge', 'Britpop', 'Folk',
  'Metal', 'Electronic', 'Hip Hop', 'Jazz', 'Blues'
];

const CITIES = [
  'Santiago', 'Barcelona', 'Lima', 'Buenos Aires', 'Caracas',
  'Mexico DF', 'Bogota', 'Quito', 'Madrid', 'Miami'
];

const FIRST_NAMES = [
  'Carlos', 'Pedro', 'Luis', 'Diego', 'Javier',
  'Ana', 'Maria', 'Sofia', 'Laura', 'Elena'
];

const LAST_NAMES = [
  'Torres', 'Martinez', 'Diaz', 'Sanchez', 'Perez',
  'Gomez', 'Garcia', 'Fernandez', 'Lopez', 'Ruiz'
];

// --- Generación de Archivos CSV ---

function generateUsersCSV(): number[] {
  const header = 'user_id,name,city\n';
  const userIDs: number[] = [];
  let content = header;

  for (let i = 1; i <= NUM_USERS; i++) {
    const userId = 100 + i;
    const name = `${FIRST_NAMES[getRandomInt(0, FIRST_NAMES.length - 1)]} ${
      LAST_NAMES[getRandomInt(0, LAST_NAMES.length - 1)]
    }`;
    const city = CITIES[getRandomInt(0, CITIES.length - 1)];

    content += `${userId},"${name}","${city}"\n`;
    userIDs.push(userId);
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'users.csv'), content);
  console.log(`Generated users.csv with ${NUM_USERS} records`);
  return userIDs;
}

function generateSongsCSV(): number[] {
  const header = 'song_id,title,artist,genre\n';
  const songIDs: number[] = [];
  let content = header;

  // Canciones conocidas con sus géneros reales
  const famousSongs = [
    { title: 'Smells Like Teen Spirit', artist: 'Nirvana', genre: 'Grunge' },
    { title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'Rock' },
    { title: 'Like a Prayer', artist: 'Madonna', genre: 'Pop' },
    { title: 'Hey Jude', artist: 'The Beatles', genre: 'Rock' },
    { title: 'Billie Jean', artist: 'Michael Jackson', genre: 'Pop' },
    { title: 'Hotel California', artist: 'Eagles', genre: 'Rock' },
    { title: 'Sweet Child o\' Mine', artist: 'Guns N\' Roses', genre: 'Rock' },
    { title: 'Like a Rolling Stone', artist: 'Bob Dylan', genre: 'Folk' },
    { title: 'Wonderwall', artist: 'Oasis', genre: 'Britpop' },
    { title: 'Thriller', artist: 'Michael Jackson', genre: 'Pop' }
  ];

  // Títulos realistas por artista
  const artistSongs: Record<string, string[]> = {
    'Nirvana': ['Come As You Are', 'Lithium', 'In Bloom', 'Heart-Shaped Box'],
    'Queen': ['We Will Rock You', 'Another One Bites the Dust', 'Radio Ga Ga', 'Somebody to Love'],
    'Madonna': ['Like a Virgin', 'Material Girl', 'Vogue', 'Hung Up'],
    'The Beatles': ['Let It Be', 'Yesterday', 'Come Together', 'Help!'],
    'Michael Jackson': ['Beat It', 'Smooth Criminal', 'Black or White', 'Man in the Mirror'],
    'Eagles': ['Take It Easy', 'Desperado', 'Life in the Fast Lane', 'New Kid in Town'],
    'Guns N\' Roses': ['Welcome to the Jungle', 'Paradise City', 'November Rain', 'Don\'t Cry'],
    'Bob Dylan': ['Blowin\' in the Wind', 'The Times They Are a-Changin\'', 'Knockin\' on Heaven\'s Door'],
    'Oasis': ['Don\'t Look Back in Anger', 'Champagne Supernova', 'Live Forever', 'Supersonic'],
    'Pink Floyd': ['Wish You Were Here', 'Comfortably Numb', 'Another Brick in the Wall', 'Money'],
    'Led Zeppelin': ['Stairway to Heaven', 'Whole Lotta Love', 'Black Dog', 'Kashmir'],
    'Radiohead': ['Creep', 'Karma Police', 'No Surprises', 'Paranoid Android'],
    'David Bowie': ['Space Oddity', 'Heroes', 'Let\'s Dance', 'Ziggy Stardust'],
    'The Rolling Stones': ['Satisfaction', 'Paint It Black', 'Angie', 'Start Me Up'],
    'U2': ['With or Without You', 'Sunday Bloody Sunday', 'Beautiful Day', 'One']
  };

  // Primero añadir canciones conocidas
  famousSongs.forEach((song, index) => {
    const songId = index + 1;
    content += `${songId},"${song.title}","${song.artist}","${song.genre}"\n`;
    songIDs.push(songId);
  });

  // Generar canciones adicionales con títulos realistas
  for (let i = famousSongs.length + 1; i <= NUM_SONGS; i++) {
    const artist = ARTISTS[getRandomInt(0, ARTISTS.length - 1)];
    const possibleTitles = artistSongs[artist] || ['Unknown Song'];
    const title = possibleTitles[getRandomInt(0, possibleTitles.length - 1)];
    const genre = GENRES[getRandomInt(0, GENRES.length - 1)];

    content += `${i},"${title}","${artist}","${genre}"\n`;
    songIDs.push(i);
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'songs.csv'), content);
  console.log(`Generated songs.csv with ${NUM_SONGS} records`);
  return songIDs;
}

function generateListensCSV(userIds: number[], songIds: number[]) {
  const header = 'listen_id,user_id,song_id,listen_date\n';
  let content = header;

  for (let i = 0; i < NUM_LISTENS; i++) {
    const listenId = uuidv4();
    const userId = userIds[getRandomInt(0, userIds.length - 1)];
    const songId = songIds[getRandomInt(0, songIds.length - 1)];
    const listenDate = getRandomDate();

    content += `${listenId},${userId},${songId},"${listenDate.toISOString()}"\n`;
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'listens.csv'), content);
  console.log(`Generated listens.csv with ${NUM_LISTENS} records`);
}

function generateListensByCityCSV(userIds: number[], songIds: number[]) {
  const header = 'city,listen_date,user_id,song_id\n';
  let content = header;

  // Necesitamos conocer las ciudades de los usuarios
  const usersData = fs.readFileSync(path.join(OUTPUT_DIR, 'users.csv'), 'utf-8')
    .split('\n')
    .slice(1) // Saltar header
    .filter(line => line.trim() !== '')
    .map(line => {
      const [userId, _, city] = line.split(',');
      return { userId: parseInt(userId.replace(/"/g, '')), city: city.replace(/"/g, '') };
    });

  const userCityMap = new Map<number, string>();
  usersData.forEach(user => {
    userCityMap.set(user.userId, user.city);
  });

  for (let i = 0; i < NUM_LISTENS / 10; i++) { // Menos registros para esta tabla
    const userId = userIds[getRandomInt(0, userIds.length - 1)];
    const city = userCityMap.get(userId);
    if (!city) continue;

    const songId = songIds[getRandomInt(0, songIds.length - 1)];
    const listenDate = getRandomDate();

    content += `"${city}","${listenDate.toISOString()}",${userId},${songId}\n`;
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'listens_by_city.csv'), content);
  console.log(`Generated listens_by_city.csv with ${NUM_LISTENS / 10} records`);
}

// --- Ejecución Principal ---
function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const userIds = generateUsersCSV();
  const songIds = generateSongsCSV();
  
  generateListensCSV(userIds, songIds);
  generateListensByCityCSV(userIds, songIds);

  console.log('\nAll data files generated successfully in the "data" directory!');
}

main();
