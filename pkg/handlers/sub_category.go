package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

type SubCategory struct {
	ID        int        `json:"id"`
	ParentID  int        `json:"parent_id"`
	Name      string     `json:"name"`
	CreatedAt time.Time  `json:"created_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

func GetSubCategory(c *gin.Context) {
	gender := c.Param("gender")
	category := c.Param("category")
	subCategory := c.Param("subcategory")
	c.JSON(http.StatusOK, gin.H{
		"gender":      gender,
		"category":    category,
		"subcategory": subCategory,
	})
}
