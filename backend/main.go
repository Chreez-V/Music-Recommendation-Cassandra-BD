package main

import (
    "music-recommendation/pkg/cassandra"
    "strconv"

    "github.com/gin-gonic/gin"
)

func main() {
    cassandra.InitSession()

    r := gin.Default()

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

    r.Run(":8080") // Esto es esencial: corre el servidor en el puerto 8080
}

