package models

import (
	"time"

	"github.com/gocql/gocql"
)

// Listen representa una escucha de una canción por un usuario
type Listen struct {
	ListenID   gocql.UUID `json:"listen_id" cql:"listen_id"`
	UserID     gocql.UUID `json:"user_id" cql:"user_id"`
	SongID     gocql.UUID `json:"song_id" cql:"song_id"`
	ListenDate time.Time  `json:"listen_date" cql:"listen_date"`
}
