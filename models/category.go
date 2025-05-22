package models

type Category struct {
    ID     int    `json:"id"`
    Name   string `json:"name"`
    Gender string `json:"gender"`
    ProductCount int    `json:"product_count"`
}

type SubCategory struct {
    ID         int    `json:"id"`
    CategoryID int    `json:"category_id"`
    Name       string `json:"name"`
}