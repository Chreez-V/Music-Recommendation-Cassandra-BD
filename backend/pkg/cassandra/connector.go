package cassandra

import (
	"log"

	"github.com/gocql/gocql"
)

var Session *gocql.Session

func InitSession() {
	cluster := gocql.NewCluster("127.0.0.1") // o el nombre del servicio en docker-compose
	cluster.Keyspace = "music_recommendation"
	cluster.Consistency = gocql.Quorum

	var err error
	Session, err = cluster.CreateSession()
	if err != nil {
		log.Fatalf("Error al conectar a Cassandra: %v", err)
	}

	log.Println("✅ Conectado a Cassandra")
}

