package cassandra

import (
	"fmt"
	"log"

	"github.com/gocql/gocql"
)

var session *gocql.Session

func Init() *gocql.Session {
	cluster := gocql.NewCluster("127.0.0.1") // Cambia por tu IP de Cassandra
	cluster.Keyspace = "music_recommendation"
	cluster.Consistency = gocql.Quorum

	var err error
	session, err = cluster.CreateSession()
	if err != nil {
		log.Fatalf("Error al conectar con Cassandra: %v", err)
	}

	fmt.Println("Conexión a Cassandra establecida")
	return session
}

func GetSession() *gocql.Session {
	if session == nil {
		return Init()
	}
	return session
}

func Close() {
	if session != nil {
		session.Close()
	}
}