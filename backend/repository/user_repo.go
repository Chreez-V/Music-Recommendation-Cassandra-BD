package repository

import (
	"music-recommendation/pkg/models"

	"github.com/gocql/gocql"
)

type UserRepository struct {
	session *gocql.Session
}

func NewUserRepository(session *gocql.Session) *UserRepository {
	return &UserRepository{session: session}
}

func (r *UserRepository) Create(user *models.User) error {
	query := `INSERT INTO users (user_id, name, city) VALUES (?, ?, ?)`
	return r.session.Query(query, user.UserID, user.Name, user.City).Exec()
}

func (r *UserRepository) GetByID(userID int) (*models.User, error) {
	user := &models.User{}
	query := `SELECT user_id, name, city FROM users WHERE user_id = ? LIMIT 1`
	err := r.session.Query(query, userID).Consistency(gocql.One).Scan(
		&user.UserID, &user.Name, &user.City)
	return user, err
}
