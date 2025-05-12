package models

import "time"


type Product struct {
    ID           int       `json:"id"`
    Name         string    `json:"name"`
    Description  string    `json:"description"`
    Summary      string    `json:"summary"`
    CategoryID   int       `json:"category_id"`
    SubCategoryID int      `json:"sub_category_id"`
    Color        string    `json:"color"`
    SKU          string    `json:"sku"`
    Price        float64   `json:"price"`
    Currency     string    `json:"currency"`
    Gender       string    `json:"gender"`
    ImagePath    string    `json:"image_path"`
    SizeTypeID   int       `json:"size_type_id"`
    CreatedAt    time.Time `json:"created_at"`
}

type ProductSize struct {
    ProductID int `json:"product_id"`
    SizeID    int `json:"size_id"`
    Quantity  int `json:"quantity"`
}

type ProductImage struct {
    ID          int       `json:"id"`
    ProductID   int       `json:"product_id"`
    ImagePath   string    `json:"image_path"`
    IsPrimary   bool      `json:"is_primary"`
    AltText     string    `json:"alt_text"`
    DisplayOrder int      `json:"display_order"`
    CreatedAt   time.Time `json:"created_at"`
}
