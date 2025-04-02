package models

import (
	"time"
)

type Product struct {
	ID            int       `json:"id"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	Summary       string    `json:"summary"`
	SubCategoryID *int      `json:"sub_category_id"`
	Color         *string   `json:"color"`
	Size          *string   `json:"size"`
	SKU           string    `json:"sku"`
	Price         float64   `json:"price"`
	Quantity      int       `json:"quantity"`
	ImagePath     string    `json:"image_path"`
	CreatedAt     time.Time `json:"created_at"`
}
