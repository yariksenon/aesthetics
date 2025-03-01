package models

import "time"

type Wishlist struct {
	Id        int       `json:"id"`
	UserId    int       `json:"user_id"`
	ProductId int       `json:"product_id"`
	CreatedAt time.Time `json:"created_at"`
}
