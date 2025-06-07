package main

import (
	"music-recommendation/pkg/api/handlers"
	"music-recommendation/pkg/cassandra"
	"music-recommendation/repository"
	"strconv"
	"fmt"
	"time"
	"sort"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
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

	// Configuración CORS
	router.Use(cors.Default())

	// Grupo de rutas para usuarios
userRoutes := router.Group("/users")
{
    userRoutes.POST("/", userHandler.CreateUser)
    userRoutes.GET("/:id", userHandler.GetUser)

    // Subgrupo para escuchas de usuarios
    listenRoutes := userRoutes.Group("/:id")
    {
        listenRoutes.GET("/listens", listenHandler.GetUserListens) // Esta ruta es /users/:id/listens
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

	// Mantener endpoints antiguos (compatibilidad)
	router.GET("/usuario/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(400, gin.H{"error": "ID inválido"})
			return
		}

		var name, city string
		if err := session.Query(`SELECT name, city FROM users WHERE user_id = ? LIMIT 1`, id).
			Scan(&name, &city); err != nil {
			c.JSON(404, gin.H{"error": "Usuario no encontrado"})
			return
		}

		c.JSON(200, gin.H{
			"user_id": id,
			"name":    name,
			"city":    city,
		})
	})

	router.GET("/usuario", func(c *gin.Context) {
		iter := session.Query(`SELECT user_id, name, city FROM users`).Iter()
		
		var users []map[string]interface{}
		var userID int
		var name, city string
		
		for iter.Scan(&userID, &name, &city) {
			users = append(users, map[string]interface{}{
				"user_id": userID,
				"name":    name,
				"city":    city,
			})
		}
		
		if err := iter.Close(); err != nil {
			c.JSON(500, gin.H{"error": "Error al obtener usuarios"})
			return
		}
		
		c.JSON(200, users)
	})

router.GET("/api/recommendations/local", func(c *gin.Context) {
    city := c.Query("city")
    if city == "" {
        c.JSON(400, gin.H{"error": "City parameter is required"})
        return
    }

    // 1. Verificar si hay datos para esta ciudad
    var cityCount int
    if err := session.Query(
        `SELECT COUNT(*) FROM listens_by_city WHERE city = ? LIMIT 1`, 
        city,
    ).Scan(&cityCount); err != nil {
        c.JSON(500, gin.H{
            "error": "Database error",
            "details": fmt.Sprintf("Error checking city data: %v", err),
        })
        return
    }

    if cityCount == 0 {
        c.JSON(200, gin.H{
            "city": city,
            "tracks": []interface{}{},
            "message": "No listening data available for this city",
        })
        return
    }

    // 2. Obtener todas las escuchas recientes para esta ciudad
    iter := session.Query(
        `SELECT song_id FROM listens_by_city 
         WHERE city = ? AND listen_date > ?`,
        city, time.Now().AddDate(0, 0, -30), // Últimos 30 días
    ).Iter()

    // Contar las ocurrencias de cada canción manualmente
    songCounts := make(map[int]int)
    var songID int
    for iter.Scan(&songID) {
        songCounts[songID]++
    }

    if err := iter.Close(); err != nil {
        c.JSON(500, gin.H{
            "error": "Database error",
            "details": fmt.Sprintf("Error processing tracks: %v", err),
        })
        return
    }

    // 3. Ordenar canciones por popularidad (mayor a menor)
    type songStat struct {
        id    int
        count int
    }
    
    var sortedSongs []songStat
    for id, count := range songCounts {
        sortedSongs = append(sortedSongs, songStat{id, count})
    }

    // Ordenar por conteo descendente
    sort.Slice(sortedSongs, func(i, j int) bool {
        return sortedSongs[i].count > sortedSongs[j].count
    })

    // 4. Obtener detalles de las top 10 canciones
    var songs []map[string]interface{}
    maxResults := 10
    if len(sortedSongs) < maxResults {
        maxResults = len(sortedSongs)
    }

    for i := 0; i < maxResults; i++ {
        stat := sortedSongs[i]
        var title, artist, genre string
        if err := session.Query(
            `SELECT title, artist, genre FROM songs WHERE song_id = ? LIMIT 1`,
            stat.id,
        ).Scan(&title, &artist, &genre); err == nil {
            songs = append(songs, map[string]interface{}{
                "id":      stat.id,
                "title":   title,
                "artist":  artist,
                "genre":   genre,
                "listens": stat.count,
            })
        }
    }

    c.JSON(200, gin.H{
        "city":   city,
        "tracks": songs,
    })
})
	router.Run(":8080")

}
