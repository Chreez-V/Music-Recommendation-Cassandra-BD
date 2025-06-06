
package models

import "github.com/gocql/gocql"

// Song representa una canción en el sistema
type Song struct {
    SongID gocql.UUID `json:"song_id" cql:"song_id"`
    Title  string     `json:"title" cql:"title"`
    Artist string     `json:"artist" cql:"artist"`
    Genre  string     `json:"genre" cql:"genre"`
}