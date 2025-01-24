package models

import "time"

type Product struct {
	Id            int       `json:"-"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	Summary       string    `json:"summary"`
	SubCategoryId int       `json:"sub_category_id"`
	Color         string    `json:"color"`
	Size          int       `json:"size"`
	Sku           string    `json:"sku"`
	Price         float64   `json:"price"`
	Quantity      int       `json:"quantity"`
	CreatedAt     time.Time `json:"created_at"`
	DeletedAt     time.Time `json:"deleted_at"`
}
