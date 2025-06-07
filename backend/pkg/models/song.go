package models

type Song struct {
	SongID int    `json:"song_id"`
	Title  string `json:"title"`
	Artist string `json:"artist"`
	Genre  string `json:"genre"`
}
