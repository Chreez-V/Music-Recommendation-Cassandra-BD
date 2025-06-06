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




// Rutas OLAP
// Rutas OLAP
olapRoutes := router.Group("/api/olap")
{


olapRoutes.GET("/monthly", func(c *gin.Context) {
    year := c.Query("year")
    if year == "" {
        c.JSON(400, gin.H{"error": "Year parameter is required"})
        return
    }

    // Convertir año a time.Time para los límites
    yearInt, err := strconv.Atoi(year)
    if err != nil {
        c.JSON(400, gin.H{"error": "Invalid year format"})
        return
    }

    startDate := time.Date(yearInt, time.January, 1, 0, 0, 0, 0, time.UTC)
    endDate := startDate.AddDate(1, 0, 0) // Un año después

    // Primero obtener todas las escuchas en el rango de fechas
    query := `
        SELECT 
            user_id,
            song_id,
            listen_date
        FROM listens
        WHERE listen_date >= ? AND listen_date < ?
        ALLOW FILTERING`

    iter := session.Query(query, startDate, endDate).Iter()

    var userID int
    var songID int
    var listenDate time.Time

    // Procesar escuchas y recolectar IDs de canciones
    monthlyCounts := make(map[string]map[int]int) // Mapa de mes -> song_id -> conteo
    songGenres := make(map[int]string)            // Mapa de song_id -> género

    for iter.Scan(&userID, &songID, &listenDate) {
        // Agrupar por mes (formato YYYY-MM) y canción
        monthKey := listenDate.Format("2006-01")
        
        if _, ok := monthlyCounts[monthKey]; !ok {
            monthlyCounts[monthKey] = make(map[int]int)
        }
        monthlyCounts[monthKey][songID]++
        
        // Si no tenemos el género de esta canción, lo obtendremos después
        if _, ok := songGenres[songID]; !ok {
            songGenres[songID] = ""
        }
    }

    if err := iter.Close(); err != nil {
        c.JSON(500, gin.H{"error": "Database error", "details": err.Error()})
        return
    }

    // Obtener géneros para todas las canciones únicas
    if len(songGenres) > 0 {
        songIDs := make([]int, 0, len(songGenres))
        for id := range songGenres {
            songIDs = append(songIDs, id)
        }

        // Consulta por lotes para obtener géneros
        for _, id := range songIDs {
            var genre string
            if err := session.Query(`SELECT genre FROM songs WHERE song_id = ? LIMIT 1`, id).Scan(&genre); err == nil {
                songGenres[id] = genre
            }
        }
    }

    // Agregar por mes y género
    monthlyData := make(map[string]map[string]int)
    for month, songs := range monthlyCounts {
        if _, ok := monthlyData[month]; !ok {
            monthlyData[month] = make(map[string]int)
        }
        
        for songID, count := range songs {
            genre := songGenres[songID]
            if genre != "" {
                monthlyData[month][genre] += count
            }
        }
    }

    // Convertir a formato para el frontend
    var result []map[string]interface{}
    for month, genres := range monthlyData {
        entry := map[string]interface{}{"month": month}
        for g, c := range genres {
            entry[g] = c
        }
        result = append(result, entry)
    }

    c.JSON(200, result)
})


olapRoutes.GET("/quarterly", func(c *gin.Context) {
    year := c.Query("year")
    if year == "" {
        c.JSON(400, gin.H{"error": "Year parameter is required"})
        return
    }

    // Convertir año a time.Time para los límites
    yearInt, err := strconv.Atoi(year)
    if err != nil {
        c.JSON(400, gin.H{"error": "Invalid year format"})
        return
    }

    startDate := time.Date(yearInt, time.January, 1, 0, 0, 0, 0, time.UTC)
    endDate := startDate.AddDate(1, 0, 0) // Un año después

    // Primero obtener todas las escuchas en el rango de fechas
    query := `
        SELECT 
            user_id,
            song_id,
            listen_date
        FROM listens
        WHERE listen_date >= ? AND listen_date < ?
        ALLOW FILTERING`

    iter := session.Query(query, startDate, endDate).Iter()

    var userID int
    var songID int
    var listenDate time.Time

    // Procesar escuchas y recolectar IDs de canciones
    quarterlyCounts := make(map[string]map[int]int) // Mapa de trimestre -> song_id -> conteo
    songGenres := make(map[int]string)              // Mapa de song_id -> género

    for iter.Scan(&userID, &songID, &listenDate) {
        // Determinar el trimestre (Q1, Q2, Q3, Q4)
        quarter := fmt.Sprintf("Q%d-%d", (listenDate.Month()-1)/3+1, listenDate.Year())
        
        if _, ok := quarterlyCounts[quarter]; !ok {
            quarterlyCounts[quarter] = make(map[int]int)
        }
        quarterlyCounts[quarter][songID]++
        
        // Si no tenemos el género de esta canción, lo obtendremos después
        if _, ok := songGenres[songID]; !ok {
            songGenres[songID] = ""
        }
    }

    if err := iter.Close(); err != nil {
        c.JSON(500, gin.H{"error": "Database error", "details": err.Error()})
        return
    }

    // Obtener géneros para todas las canciones únicas
    if len(songGenres) > 0 {
        songIDs := make([]int, 0, len(songGenres))
        for id := range songGenres {
            songIDs = append(songIDs, id)
        }

        // Consulta por lotes para obtener géneros
        for _, id := range songIDs {
            var genre string
            if err := session.Query(`SELECT genre FROM songs WHERE song_id = ? LIMIT 1`, id).Scan(&genre); err == nil {
                songGenres[id] = genre
            }
        }
    }

    // Agregar por trimestre y género
    quarterlyData := make(map[string]map[string]int)
    for quarter, songs := range quarterlyCounts {
        if _, ok := quarterlyData[quarter]; !ok {
            quarterlyData[quarter] = make(map[string]int)
        }
        
        for songID, count := range songs {
            genre := songGenres[songID]
            if genre != "" {
                quarterlyData[quarter][genre] += count
            }
        }
    }

    // Convertir a formato para el frontend
    var result []map[string]interface{}
    for quarter, genres := range quarterlyData {
        entry := map[string]interface{}{"quarter": quarter}
        for g, c := range genres {
            entry[g] = c
        }
        result = append(result, entry)
    }

    c.JSON(200, result)
})


    olapRoutes.GET("/by-user", func(c *gin.Context) {
        // Primero obtener todas las escuchas
        listenQuery := `
            SELECT 
                user_id,
                song_id
            FROM listens`

        listenIter := session.Query(listenQuery).Iter()

        var userID int
        var songID int

        // Procesar escuchas y recolectar datos
        userCounts := make(map[int]map[int]int) // Mapa de user_id -> song_id -> conteo
        songGenres := make(map[int]string)      // Mapa de song_id -> género

        for listenIter.Scan(&userID, &songID) {
            if _, ok := userCounts[userID]; !ok {
                userCounts[userID] = make(map[int]int)
            }
            userCounts[userID][songID]++
            
            // Si no tenemos el género de esta canción, lo obtendremos después
            if _, ok := songGenres[songID]; !ok {
                songGenres[songID] = ""
            }
        }

        if err := listenIter.Close(); err != nil {
            c.JSON(500, gin.H{"error": "Database error", "details": err.Error()})
            return
        }

        // Obtener géneros para todas las canciones únicas
        if len(songGenres) > 0 {
            songIDs := make([]int, 0, len(songGenres))
            for id := range songGenres {
                songIDs = append(songIDs, id)
            }

            // Consulta por lotes para obtener géneros
            for _, id := range songIDs {
                var genre string
                if err := session.Query(`SELECT genre FROM songs WHERE song_id = ? LIMIT 1`, id).Scan(&genre); err == nil {
                    songGenres[id] = genre
                }
            }
        }

        // Obtener nombres de usuario
        userNames := make(map[int]string)
        for userID := range userCounts {
            var name string
            if err := session.Query(`SELECT name FROM users WHERE user_id = ? LIMIT 1`, userID).Scan(&name); err == nil {
                userNames[userID] = name
            }
        }

        // Agregar por usuario y género
        userData := make(map[int]map[string]int)
        for userID, songs := range userCounts {
            if _, ok := userData[userID]; !ok {
                userData[userID] = make(map[string]int)
            }
            
            for songID, count := range songs {
                genre := songGenres[songID]
                if genre != "" {
                    userData[userID][genre] += count
                }
            }
        }

        // Convertir a formato para el frontend
        var result []map[string]interface{}
        for userID, genres := range userData {
            userName := userNames[userID]
            if userName == "" {
                userName = fmt.Sprintf("User %d", userID)
            }
            
            entry := map[string]interface{}{
                "userId": userID,
                "userName": userName,
            }
            for g, c := range genres {
                entry[g] = c
            }
            result = append(result, entry)
        }

        c.JSON(200, result)
    })



	}


	router.Run(":8080")

}
