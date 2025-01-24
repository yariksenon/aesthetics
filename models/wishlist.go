package models

import "time"

type Wishlist struct {
	Id        int       `json:"-"`
	UserId    int       `json:"user_id"`
	ProductId int       `json:"product_id"`
	CreatedAt time.Time `json:"created_at"`
	DeletedAt time.Time `json:"deleted_at"`
}
