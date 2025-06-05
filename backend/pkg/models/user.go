package models

type User struct {
    UserID int    `json:"user_id"`
    Name   string `json:"name"`
    City   string `json:"city"`
}
