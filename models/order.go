package models

import "time"

type Order struct {
    ID            int       `json:"id"`
    UserID        int       `json:"user_id"`
    Total         float64   `json:"total"`
    PaymentProvider string   `json:"payment_provider"`
    PaymentStatus  string   `json:"payment_status"`
    CreatedAt     time.Time `json:"created_at"`
}

type OrderItem struct {
    ID              int       `json:"id"`
    OrderID         int       `json:"order_id"`
    ProductID       int       `json:"product_id"`
    SizeID          int       `json:"size_id"`
    Quantity        int       `json:"quantity"`
    PriceAtPurchase float64   `json:"price_at_purchase"`
    CreatedAt       time.Time `json:"created_at"`
}