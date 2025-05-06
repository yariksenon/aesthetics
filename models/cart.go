package models

type Cart struct {
	ID     int        `json:"id"`
	UserID int        `json:"user_id"`
	Items  []CartItem `json:"items"`
}

type CartItem struct {
	ID        int `json:"id"`
	CartID    int `json:"cart_id"`
	ProductID int `json:"product_id"`
	Quantity  int `json:"quantity"`
}
