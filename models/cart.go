package models

import "time"

type Cart struct {
    ID        int       `json:"id"`
    UserID    int       `json:"user_id"`
    CreatedAt time.Time `json:"created_at"`
}

type CartItem struct {
    ID        int       `json:"id"`
    CartID    int       `json:"cart_id"`
    ProductID int       `json:"product_id"`
    SizeID    int       `json:"size_id"`
    Quantity  int       `json:"quantity"`
    AddedAt   time.Time `json:"added_at"`
}
