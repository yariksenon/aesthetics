package models

import (
	"time"
)

type User struct {
	ID        int     `json:"id"`
	FirstName *string `json:"first_name"`
	LastName  *string `json:"last_name"`
	Username  string  `json:"username"`
	Email     string  `json:"email" binding:"required"`
	Subscribe bool    `json:"subscribe"`
	Password  string  `json:"password" binding:"required,min=6"`
	Phone     string  `json:"phone"`
	Role      string  `json:"role"`
	CreatedAt string  `json:"created_at"`
}

type UserAddress struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	AddressLine string    `json:"address_line"`
	Country     string    `json:"country"`
	City        string    `json:"city"`
	PostalCode  string    `json:"postal_code"`
	CreatedAt   time.Time `json:"created_at"`
}
