package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func HomePage(c *gin.Context) {
	c.Redirect(http.StatusMovedPermanently, "/api/v1/woman")

}
