package main

import (
    "encoding/csv"
    "log"
    "os"
    "strconv"
    
    "music-recommendation/pkg/cassandra"
)

func main() {
    session := cassandra.Init()
    defer cassandra.Close()
    
    // Cargar usuarios
    loadUsers(session, "../../cassandra/data/usuarios.csv")
    
    log.Println("Datos cargados exitosamente")
}

func loadUsers(session *gocql.Session, filename string) {
    file, err := os.Open(filename)
    if err != nil {
        log.Fatal(err)
    }
    defer file.Close()
    
    reader := csv.NewReader(file)
    records, err := reader.ReadAll()
    if err != nil {
        log.Fatal(err)
    }
    
    for i, record := range records {
        if i == 0 { // Skip header
            continue
        }
        
        userID, _ := strconv.Atoi(record[0])
        name := record[1]
        city := record[2]
        
        query := "INSERT INTO users (user_id, name, city) VALUES (?, ?, ?)"
        if err := session.Query(query, userID, name, city).Exec(); err != nil {
            log.Printf("Error insertando usuario %d: %v", userID, err)
        }
    }
}

