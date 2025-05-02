package models

import (
	"time"
)

type Product struct {
	ID            int       `json:"id"`
	Name          string    `json:"name" binding:"required"`
	Description   string    `json:"description"`
	Summary       string    `json:"summary" binding:"max=255"`
	CategoryID    int       `json:"category_id"`
	SubCategoryID int       `json:"sub_category_id"`
	Color         string    `json:"color"`
	Size          string    `json:"size"`
	SKU           string    `json:"sku"`
	Price         float64   `json:"price" binding:"required,gt=0"`
	Quantity      int       `json:"quantity" binding:"gte=0"`
	ImagePath     string    `json:"image_path"`
	Currency      string    `json:"currency"`
	CreatedAt     time.Time `json:"created_at"`
}
