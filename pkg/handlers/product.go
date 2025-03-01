package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

type Product struct {
	ID          int        `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Summary     string     `json:"summary"`
	SubCategory string     `json:"sub_category"`
	Color       string     `json:"color"`
	Size        string     `json:"size"`
	Sku         string     `json:"sku"`
	Price       string     `json:"price"`
	Quantity    int        `json:"quantity"`
	CreatedAt   time.Time  `json:"created_at"`
	DeletedAt   *time.Time `json:"deleted_at"`
}

func GetProduct(c *gin.Context) {
	gender := c.Param("gender")
	category := c.Param("category")
	subCategory := c.Param("subcategory")
	productId := c.Param("productId")
	c.JSON(http.StatusOK, gin.H{
		"gender":      gender,
		"category":    category,
		"subcategory": subCategory,
		"productId":   productId,
	})
}
