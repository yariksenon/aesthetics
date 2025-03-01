package models

import "time"

type PaymentDetail struct {
	Id        int       `json:"id"`
	OrderId   int       `json:"order_id"`
	Amount    float64   `json:"amount"`
	Provider  string    `json:"provider"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}
