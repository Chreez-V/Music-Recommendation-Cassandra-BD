package main

import (
    "log"
    "net/http"
    
    "music-recommendation/pkg/api"
    "music-recommendation/pkg/cassandra"
    
    "github.com/gorilla/mux"
)

func main() {
    // Inicializar Cassandra
    cassandra.Init()
    defer cassandra.Close()
    
    // Configurar router
    r := mux.NewRouter()
    
    // Rutas de usuarios
    r.HandleFunc("/users/{id}", api.GetUserHandler).Methods("GET")
    r.HandleFunc("/users", api.CreateUserHandler).Methods("POST")
    
    // Iniciar servidor
    log.Println("Servidor iniciado en el puerto 8080")
    log.Fatal(http.ListenAndServe(":8080", r))
}
