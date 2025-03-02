package models

import (
	"database/sql"
	"time"
)

type User struct {
	Id        int            `json:"id"`
	FirstName sql.NullString `json:"first_name"`
	LastName  sql.NullString `json:"last_name"`
	Username  string         `json:"username"`
	Email     string         `json:"email" binding:"required"`
	Password  string         `json:"password" binding:"required,min=6"`
	Subscribe bool           `json:"subscribe"`
	Phone     string         `json:"phone"`
	Role      string         `json:"role"`
	CreatedAt time.Time      `json:"created_at"`
}

type UserAddress struct {
	Id          int       `json:"id"`
	UserId      int       `json:"user_id"`
	AddressLine string    `json:"address_line"`
	Country     string    `json:"country"`
	City        string    `json:"city"`
	PostalCode  string    `json:"postal_code"`
	CreatedAt   time.Time `json:"created_at"`
}
