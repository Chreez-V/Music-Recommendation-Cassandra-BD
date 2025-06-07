package repository

import (
	"fmt"
	"log"
	"sync"

	"github.com/gocql/gocql"
)

// CassandraRepository mantiene la conexión a Cassandra
type CassandraRepository struct {
	session *gocql.Session
}

var (
	instance *CassandraRepository
	once     sync.Once
)

// NewCassandraRepository crea una nueva instancia (singleton) del repositorio de Cassandra
func NewCassandraRepository(hosts []string, keyspace string) (*CassandraRepository, error) {
	var initError error

	once.Do(func() {
		cluster := gocql.NewCluster(hosts...)
		cluster.Keyspace = keyspace
		cluster.Consistency = gocql.Quorum
		cluster.PoolConfig.HostSelectionPolicy = gocql.TokenAwareHostPolicy(gocql.RoundRobinHostPolicy())

		// Configuración adicional para producción
		cluster.NumConns = 3
		cluster.ConnectTimeout = cluster.Timeout
		cluster.ReconnectInterval = cluster.Timeout / 2

		session, err := cluster.CreateSession()
		if err != nil {
			initError = fmt.Errorf("error al crear sesión de Cassandra: %v", err)
			return
		}

		instance = &CassandraRepository{session: session}
		log.Println("Conexión a Cassandra establecida correctamente")
	})

	if initError != nil {
		return nil, initError
	}

	return instance, nil
}

// GetSession devuelve la sesión de Cassandra
func (c *CassandraRepository) GetSession() *gocql.Session {
	return c.session
}

// Close cierra la conexión a Cassandra
func (c *CassandraRepository) Close() {
	if c.session != nil {
		c.session.Close()
		log.Println("Conexión a Cassandra cerrada")
	}
}

// HealthCheck verifica el estado de la conexión a Cassandra
func (c *CassandraRepository) HealthCheck() error {
	if c.session == nil {
		return fmt.Errorf("sesión de Cassandra no inicializada")
	}

	iter := c.session.Query(`SELECT now() FROM system.local`).Iter()
	if err := iter.Close(); err != nil {
		return fmt.Errorf("error al verificar salud de Cassandra: %v", err)
	}
	return nil
}

// CreateSchemaIfNotExists crea el esquema básico si no existe
func (c *CassandraRepository) CreateSchemaIfNotExists() error {
	queries := []string{
		`CREATE KEYSPACE IF NOT EXISTS music_recommendation WITH replication = {
			'class': 'SimpleStrategy',
			'replication_factor': 1
		}`,

		`CREATE TABLE IF NOT EXISTS music_recommendation.users (
			user_id INT PRIMARY KEY,
			name TEXT,
			city TEXT
		)`,

		`CREATE TABLE IF NOT EXISTS music_recommendation.songs (
			song_id INT PRIMARY KEY,
			title TEXT,
			artist TEXT,
			genre TEXT
		)`,

		`CREATE TABLE IF NOT EXISTS music_recommendation.listens (
			listen_id UUID,
			user_id INT,
			song_id INT,
			listen_date TIMESTAMP,
			PRIMARY KEY ((user_id), listen_date, song_id)
		) WITH CLUSTERING ORDER BY (listen_date DESC)`,

		`CREATE TABLE IF NOT EXISTS music_recommendation.listens_by_city (
			city TEXT,
			listen_date TIMESTAMP,
			user_id INT,
			song_id INT,
			PRIMARY KEY ((city), listen_date, user_id, song_id)
		) WITH CLUSTERING ORDER BY (listen_date DESC)`,

		`CREATE INDEX IF NOT EXISTS songs_genre_idx ON music_recommendation.songs(genre)`,
	}

	for _, query := range queries {
		if err := c.session.Query(query).Exec(); err != nil {
			return fmt.Errorf("error al ejecutar query '%s': %v", query, err)
		}
	}

	log.Println("Esquema de Cassandra verificado/creado correctamente")
	return nil
}
