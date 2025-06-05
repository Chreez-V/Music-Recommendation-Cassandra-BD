-- Keyspace (sin cambios)
CREATE KEYSPACE IF NOT EXISTS music_recommendation 
WITH replication = {
    'class': 'SimpleStrategy',
    'replication_factor': 1
};

-- Tabla de usuarios (sin cambios)
CREATE TABLE IF NOT EXISTS music_recommendation.users (
    user_id INT PRIMARY KEY,
    name TEXT,
    city TEXT
);

-- Tabla de canciones (sin cambios)
CREATE TABLE IF NOT EXISTS music_recommendation.songs (
    song_id INT PRIMARY KEY,
    title TEXT,
    artist TEXT,
    genre TEXT
);

-- Tabla de escuchas (sin cambios)
CREATE TABLE IF NOT EXISTS music_recommendation.listens (
    listen_id UUID,
    user_id INT,
    song_id INT,
    listen_date TIMESTAMP,
    PRIMARY KEY ((user_id), listen_date, song_id)
) WITH CLUSTERING ORDER BY (listen_date DESC);

-- En lugar de vistas materializadas, usa:

-- 1. Índice secundario para búsquedas por género
CREATE INDEX IF NOT EXISTS songs_genre_idx ON music_recommendation.songs(genre);

-- 2. Tabla denormalizada para consultas por ciudad
CREATE TABLE IF NOT EXISTS music_recommendation.listens_by_city (
    city TEXT,
    listen_date TIMESTAMP,
    user_id INT,
    song_id INT,
    PRIMARY KEY ((city), listen_date, user_id, song_id)
) WITH CLUSTERING ORDER BY (listen_date DESC);
