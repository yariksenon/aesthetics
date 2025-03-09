package models

import (
	"database/sql"
	"time"
)

type Product struct {
	ID            int           `json:"id"`
	Name          string        `json:"name"`
	Description   string        `json:"description"`
	Summary       string        `json:"summary"`
	SubCategoryID int           `json:"sub_category_id"`
	Color         string        `json:"color"`
	Size          float64       `json:"size"`
	SKU           sql.NullInt64 `json:"sku"`
	Price         float64       `json:"price"`
	Quantity      int           `json:"quantity"`
	CreatedAt     time.Time     `json:"created_at"`
}
