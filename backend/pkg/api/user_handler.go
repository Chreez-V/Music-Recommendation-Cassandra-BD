package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"music-recommendation/pkg/cassandra"
	"music-recommendation/pkg/models"

	"github.com/gorilla/mux"
)

func GetUserHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, _ := strconv.Atoi(vars["id"])

	session := cassandra.GetSession()

	var user models.User
	query := "SELECT user_id, name, city FROM users WHERE user_id = ?"
	if err := session.Query(query, userID).Scan(&user.UserID, &user.Name, &user.City); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	session := cassandra.GetSession()
	query := "INSERT INTO users (user_id, name, city) VALUES (?, ?, ?)"
	if err := session.Query(query, user.UserID, user.Name, user.City).Exec(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}
