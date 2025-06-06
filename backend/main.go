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

	// Grupo de rutas para usuarios
	userRoutes := router.Group("/users")
	{
		userRoutes.POST("/", userHandler.CreateUser)
		userRoutes.GET("/:id", userHandler.GetUser)

		// Subgrupo para escuchas de usuarios - USANDO EL MISMO PARÁMETRO :id
		listenRoutes := userRoutes.Group("/:id")
		{
			listenRoutes.GET("/listens", listenHandler.GetUserListens)
			listenRoutes.GET("/recommendations", listenHandler.GetRecommendations)
			listenRoutes.GET("/recommendations/genre/:genre", listenHandler.GetRecommendationsByGenre)
		}
	}

	// Rutas de canciones
	songRoutes := router.Group("/songs")
	{
		songRoutes.POST("/", songHandler.CreateSong)
		songRoutes.GET("/:id", songHandler.GetSong)
		songRoutes.GET("/genre/:genre", songHandler.GetSongsByGenre)
	}

	// Ruta independiente para registrar escuchas
	router.POST("/listens", listenHandler.RecordListen)

	// Iniciar servidor
	router.Run(":8080")
}
