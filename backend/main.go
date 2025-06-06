package main

import (
	"music-recommendation/pkg/api/handlers"
	"music-recommendation/pkg/cassandra"
	"music-recommendation/repository"

	"github.com/gin-gonic/gin"
)

func main() {
	// Inicializar Cassandra
	session := cassandra.Init()
	defer cassandra.Close()

	// Inicializar repositorios
	userRepo := repository.NewUserRepository(session)
	songRepo := repository.NewSongRepository(session)
	listenRepo := repository.NewListenRepository(session)

	// Inicializar handlers
	userHandler := handlers.NewUserHandler(userRepo)
	songHandler := handlers.NewSongHandler(songRepo)
	listenHandler := handlers.NewListenHandler(listenRepo, userRepo, songRepo)

	// Configurar router
	router := gin.Default()

	// Rutas de usuarios
	router.POST("/users", userHandler.CreateUser)
	router.GET("/users/:id", userHandler.GetUser)

	// Rutas de canciones
	router.POST("/songs", songHandler.CreateSong)
	router.GET("/songs/:id", songHandler.GetSong)
	router.GET("/songs/genre/:genre", songHandler.GetSongsByGenre)

	// Rutas de escuchas
	router.POST("/listens", listenHandler.RecordListen)
	router.GET("/users/:user_id/listens", listenHandler.GetUserListens)
	router.GET("/users/:user_id/recommendations", listenHandler.GetRecommendations)
	router.GET("/users/:user_id/recommendations/genre/:genre", listenHandler.GetRecommendationsByGenre)

	// Iniciar servidor
	router.Run(":8080")
}
