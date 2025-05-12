package models

import "time"

type Wishlist struct {
    ID        int       `json:"id"`
    UserID    int       `json:"user_id"`
    ProductID int       `json:"product_id"`
    AddedAt   time.Time `json:"added_at"`
}