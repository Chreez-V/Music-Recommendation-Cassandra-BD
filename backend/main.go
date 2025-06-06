package main

import (
	"music-recommendation/pkg/cassandra"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

func main() {
	cassandra.InitSession()

	r := gin.Default()

	// Configuración CORS
	r.Use(cors.Default())

	// Endpoints de usuario (mantenidos como están)
	r.GET("/usuario/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(400, gin.H{"error": "ID inválido"})
			return
		}

		var name, city string
		user_id := id

		if err := cassandra.Session.Query(`
			SELECT name, city FROM users WHERE user_id = ? LIMIT 1`,
			user_id).Scan(&name, &city); err != nil {
			c.JSON(404, gin.H{"error": "Usuario no encontrado"})
			return
		}

		c.JSON(200, gin.H{
			"user_id": id,
			"name":    name,
			"city":    city,
		})
	})

	r.GET("/usuario", func(c *gin.Context) {
		iter := cassandra.Session.Query(`SELECT user_id, name, city FROM users`).Iter()
		
		var users []map[string]interface{}
		var user_id int
		var name, city string
		
		for iter.Scan(&user_id, &name, &city) {
			users = append(users, map[string]interface{}{
				"user_id": user_id,
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

	// Endpoint para recomendaciones por ciudad
	r.GET("/api/recommendations/local", func(c *gin.Context) {
		city := c.Query("city")
		if city == "" {
			c.JSON(400, gin.H{"error": "City parameter is required"})
			return
		}

		var count int
		if err := cassandra.Session.Query(`
			SELECT COUNT(*) FROM listens_by_city WHERE city = ? LIMIT 1`,
			city).Scan(&count); err != nil || count == 0 {
			
			c.JSON(200, gin.H{
				"city":    city,
				"tracks":  []interface{}{},
				"message": "No tracks found for this city",
			})
			return
		}

		iter := cassandra.Session.Query(`
			SELECT song_id, COUNT(*) as listen_count 
			FROM listens_by_city 
			WHERE city = ? AND listen_date > ? 
			GROUP BY song_id 
			ORDER BY listen_count DESC 
			LIMIT 10`,
			city, time.Now().AddDate(0, 0, -30)).Iter()

		var songs []map[string]interface{}
		var songID int
		var listenCount int64

		for iter.Scan(&songID, &listenCount) {
			var title, artist, genre string
			if err := cassandra.Session.Query(`
				SELECT title, artist, genre FROM songs WHERE song_id = ? LIMIT 1`,
				songID).Scan(&title, &artist, &genre); err == nil {
				
				songs = append(songs, map[string]interface{}{
					"id":      songID,
					"title":   title,
					"artist":  artist,
					"genre":   genre,
					"listens": listenCount,
				})
			}
		}

		if err := iter.Close(); err != nil {
			c.JSON(500, gin.H{"error": "Error processing tracks"})
			return
		}

		c.JSON(200, gin.H{
			"city":   city,
			"tracks": songs,
		})
	})

	r.Run(":8080")
}
