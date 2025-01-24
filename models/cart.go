package models

import "time"

type Cart struct {
	Id        int       `json:"-"`
	UserId    int       `json:"user_id"`
	Total     float64   `json:"total"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CartItem struct {
	Id        int       `json:"id"`
	CartId    int       `json:"cart_id"`
	ProductId int       `json:"product_id"`
	Quantity  int       `json:"quantity"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
