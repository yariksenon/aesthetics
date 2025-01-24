package models

import "time"

type OrderDetail struct {
	Id        int       `json:"id"`
	UserId    int       `json:"user_id"`
	PaymentId int       `json:"payment_id"`
	Total     float64   `json:"total"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type OrderItem struct {
	Id        int       `json:"-"`
	OrderId   int       `json:"order_id"`
	ProductId int       `json:"product_id"`
	Quantity  int       `json:"quantity"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
