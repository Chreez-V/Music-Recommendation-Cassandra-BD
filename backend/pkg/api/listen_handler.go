package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"music-recommendation/pkg/cassandra"
	"music-recommendation/pkg/models"

	"github.com/gorilla/mux"
)

// GetListenHandler obtiene una escucha específica por su ID
func GetListenHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	listenID, err := gocql.ParseUUID(vars["id"])
	if err != nil {
		http.Error(w, "Invalid listen ID", http.StatusBadRequest)
		return
	}

	session := cassandra.GetSession()

	var listen models.Listen
	query := "SELECT listen_id, user_id, song_id, listen_date FROM listens WHERE listen_id = ?"
	if err := session.Query(query, listenID).Scan(&listen.ListenID, &listen.UserID, &listen.SongID, &listen.ListenDate); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(listen)
}

// CreateListenHandler crea una nueva escucha
func CreateListenHandler(w http.ResponseWriter, r *http.Request) {
	var listen models.Listen
	if err := json.NewDecoder(r.Body).Decode(&listen); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Generar un nuevo UUID para la escucha si no viene en la petición
	if listen.ListenID == gocql.UUID{} {
		listen.ListenID = gocql.TimeUUID()
	}

	// Establecer la fecha actual si no viene en la petición
	if listen.ListenDate.IsZero() {
		listen.ListenDate = time.Now()
	}

	session := cassandra.GetSession()
	query := "INSERT INTO listens (listen_id, user_id, song_id, listen_date) VALUES (?, ?, ?, ?)"
	if err := session.Query(query, listen.ListenID, listen.UserID, listen.SongID, listen.ListenDate).Exec(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(listen)
}

// GetListensByUserHandler obtiene todas las escuchas de un usuario específico
func GetListensByUserHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, err := gocql.ParseUUID(vars["user_id"])
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	session := cassandra.GetSession()

	iter := session.Query("SELECT listen_id, user_id, song_id, listen_date FROM listens WHERE user_id = ?", userID).Iter()

	var listens []models.Listen
	var listen models.Listen
	for iter.Scan(&listen.ListenID, &listen.UserID, &listen.SongID, &listen.ListenDate) {
		listens = append(listens, listen)
	}

	if err := iter.Close(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(listens)
}
