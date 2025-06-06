package main

import (
    "music-recommendation/pkg/cassandra"
    "strconv"
    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
)
func main() {
	cassandra.InitSession()

	r := gin.Default()

        // Configuración CORS
    r.Use(cors.Default())  
    /*
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000"},
        AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge: 12 * time.Hour,
    }))
    */

	// Endpoint para obtener un usuario específico
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

	// Nuevo endpoint para obtener todos los usuarios
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

	r.Run(":8080")
}
