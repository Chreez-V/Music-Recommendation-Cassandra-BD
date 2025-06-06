package repository

import (
	"music-recommendation/pkg/models"

	"github.com/gocql/gocql"
)

type ListenRepository struct {
	session *gocql.Session
}

func NewListenRepository(session *gocql.Session) *ListenRepository {
	return &ListenRepository{session: session}
}

func (r *ListenRepository) Create(listen *models.Listen) error {
	query := `INSERT INTO listens (listen_id, user_id, song_id, listen_date) VALUES (?, ?, ?, ?)`
	return r.session.Query(query, listen.ListenID, listen.UserID, listen.SongID, listen.ListenDate).Exec()
}

func (r *ListenRepository) GetByUserID(userID int) ([]models.Listen, error) {
	var listens []models.Listen
	query := `SELECT listen_id, user_id, song_id, listen_date FROM listens WHERE user_id = ?`
	iter := r.session.Query(query, userID).Iter()

	var listen models.Listen
	for iter.Scan(&listen.ListenID, &listen.UserID, &listen.SongID, &listen.ListenDate) {
		listens = append(listens, listen)
	}

	if err := iter.Close(); err != nil {
		return nil, err
	}

	return listens, nil
}

func (r *ListenRepository) RecordListenByCity(listen *models.ListenByCity) error {
	query := `INSERT INTO listens_by_city (city, listen_date, user_id, song_id) VALUES (?, ?, ?, ?)`
	return r.session.Query(query, listen.City, listen.ListenDate, listen.UserID, listen.SongID).Exec()
}

func (r *ListenRepository) GetPopularSongsByCity(city string, limit int) ([]int, error) {
	var songIDs []int
	query := `SELECT song_id FROM listens_by_city WHERE city = ? GROUP BY song_id ORDER BY COUNT(*) DESC LIMIT ?`
	iter := r.session.Query(query, city, limit).Iter()

	var songID int
	for iter.Scan(&songID) {
		songIDs = append(songIDs, songID)
	}

	if err := iter.Close(); err != nil {
		return nil, err
	}

	return songIDs, nil
}

// Algoritmo de recomendación basado en ciudad y género
func (r *ListenRepository) GetRecommendationsByCityAndGenre(city string, genre string, limit int) ([]int, error) {
	var songIDs []int
	query := `SELECT l.song_id FROM listens_by_city l 
	          JOIN songs s ON l.song_id = s.song_id 
	          WHERE l.city = ? AND s.genre = ? 
	          GROUP BY l.song_id 
	          ORDER BY COUNT(*) DESC LIMIT ?`
	iter := r.session.Query(query, city, genre, limit).Iter()

	var songID int
	for iter.Scan(&songID) {
		songIDs = append(songIDs, songID)
	}

	if err := iter.Close(); err != nil {
		return nil, err
	}

	return songIDs, nil
}
