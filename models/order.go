package models

import "time"

type Order struct {
	ID              int       `json:"id"`
	UserID          int       `json:"user_id" binding:"required"`
	PaymentProvider string    `json:"payment_provider" binding:"required"`
	Total           float64   `json:"total" binding:"required,gt=0"`
	CreatedAt       time.Time `json:"created_at"`
}

type OrderItem struct {
	ID        int       `json:"id"`
	OrderID   int       `json:"order_id"`
	ProductID int       `json:"product_id"`
	Quantity  int       `json:"quantity" binding:"gte=1"`
	CreatedAt time.Time `json:"created_at"`
}
