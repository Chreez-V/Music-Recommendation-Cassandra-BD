package repository

import (
	"github.com/gocql/gocql"
	"music-recommendation/pkg/models"
)

type SongRepository struct {
	session *gocql.Session
}

func NewSongRepository(session *gocql.Session) *SongRepository {
	return &SongRepository{session: session}
}

func (r *SongRepository) Create(song *models.Song) error {
	query := `INSERT INTO songs (song_id, title, artist, genre) VALUES (?, ?, ?, ?)`
	return r.session.Query(query, song.SongID, song.Title, song.Artist, song.Genre).Exec()
}

func (r *SongRepository) GetByID(songID int) (*models.Song, error) {
	song := &models.Song{}
	query := `SELECT song_id, title, artist, genre FROM songs WHERE song_id = ? LIMIT 1`
	err := r.session.Query(query, songID).Consistency(gocql.One).Scan(
		&song.SongID, &song.Title, &song.Artist, &song.Genre)
	return song, err
}

func (r *SongRepository) GetByGenre(genre string) ([]models.Song, error) {
	var songs []models.Song
	query := `SELECT song_id, title, artist, genre FROM songs WHERE genre = ?`
	iter := r.session.Query(query, genre).Iter()

	var song models.Song
	for iter.Scan(&song.SongID, &song.Title, &song.Artist, &song.Genre) {
		songs = append(songs, song)
	}

	if err := iter.Close(); err != nil {
		return nil, err
	}

	return songs, nil
}