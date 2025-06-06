package api

import (
	"encoding/json"
	"net/http"

	cassandra "music-recommendation/pkg/cassandra"
	"music-recommendation/pkg/models"

	"github.com/gocql/gocql"
	"github.com/gorilla/mux"
)

// GetSongHandler obtiene una canción específica por su ID
func GetSongHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	songID, err := gocql.ParseUUID(vars["id"])
	if err != nil {
		http.Error(w, "Invalid song ID", http.StatusBadRequest)
		return
	}

	session := cassandra.GetSession()

	var song models.Song
	query := "SELECT song_id, title, artist, genre FROM songs WHERE song_id = ?"
	if err := session.Query(query, songID).Scan(&song.SongID, &song.Title, &song.Artist, &song.Genre); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(song)
}

// CreateSongHandler crea una nueva canción
func CreateSongHandler(w http.ResponseWriter, r *http.Request) {
	var song models.Song
	if err := json.NewDecoder(r.Body).Decode(&song); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if song.SongID.String() == "" {
		song.SongID = gocql.TimeUUID()
	}

	session := cassandra.GetSession()
	query := "INSERT INTO songs (song_id, title, artist, genre) VALUES (?, ?, ?, ?)"
	if err := session.Query(query, song.SongID, song.Title, song.Artist, song.Genre).Exec(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(song)
}

// GetSongsByGenreHandler obtiene todas las canciones de un género específico
func GetSongsByGenreHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	genre := vars["genre"]

	session := cassandra.GetSession()

	iter := session.Query("SELECT song_id, title, artist, genre FROM songs WHERE genre = ?", genre).Iter()

	var songs []models.Song
	var song models.Song
	for iter.Scan(&song.SongID, &song.Title, &song.Artist, &song.Genre) {
		songs = append(songs, song)
	}

	if err := iter.Close(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(songs)
}
