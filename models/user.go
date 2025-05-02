package models

import (
	"time"
)

type Role string

const (
	Customer Role = "customer"
	Admin    Role = "admin"
	Seller   Role = "seller"
	Manager  Role = "manager"
)

type User struct {
	ID           int       `json:"id"`
	FirstName    string    `json:"first_name"`
	LastName     string    `json:"last_name"`
	Username     string    `json:"username"`
	Email        string    `json:"email" binding:"required,email"`
	Subscription bool      `json:"subscription"`
	Password     string    `json:"password" binding:"required,min=6"`
	Phone        string    `json:"phone"`
	Role         Role      `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
}

type UserAddress struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	AddressLine string    `json:"address_line" binding:"required"`
	Country     string    `json:"country" binding:"required"`
	City        string    `json:"city" binding:"required"`
	PostalCode  string    `json:"postal_code"`
	CreatedAt   time.Time `json:"created_at"`
}
