package models

import "time"

type Session struct {
	ID           int       `json:"id"`
	UserID       int       `json:"user_id"`
	SessionToken string    `json:"session_token"`
	CreatedAt    time.Time `json:"created_at"`
	UpdateAt     time.Time `json:"update_at"`
}
