package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func HelloHandler(c *gin.Context) {
	c.String(http.StatusOK, "Hello, world!")
}
