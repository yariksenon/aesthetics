package models

type Wishlist struct {
	ID        int `json:"id"`
	UserID    int `json:"user_id" binding:"required"`
	ProductID int `json:"product_id" binding:"required"`
}
