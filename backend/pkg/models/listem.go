package models

import "time"

type Listen struct {
	ListenID   string    `json:"listen_id"`
	UserID     int       `json:"user_id"`
	SongID     int       `json:"song_id"`
	ListenDate time.Time `json:"listen_date"`
}

type ListenByCity struct {
	City       string    `json:"city"`
	ListenDate time.Time `json:"listen_date"`
	UserID     int       `json:"user_id"`
	SongID     int       `json:"song_id"`
}
