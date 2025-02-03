package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

type Category struct {
	ID        int        `json:"id"`
	Name      string     `json:"name"`
	CreatedAt time.Time  `json:"created_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

func GetCategory(c *gin.Context) {
	gender := c.Param("gender")
	category := c.Param("category")
	c.JSON(http.StatusOK, gin.H{
		"gender":   gender,
		"category": category,
	})
}
