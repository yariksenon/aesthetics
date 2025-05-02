package models

type Category struct {
	ID   int    `json:"id"`
	Name string `json:"name" binding:"required"`
}

type SubCategory struct {
	ID         int    `json:"id"`
	CategoryID int    `json:"category_id"`
	Name       string `json:"name" binding:"required"`
}
