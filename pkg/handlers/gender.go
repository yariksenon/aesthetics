package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func GetGender(c *gin.Context) {
	gender := c.Param("gender")
	c.JSON(http.StatusOK, gin.H{
		"gender": gender,
	})
}
