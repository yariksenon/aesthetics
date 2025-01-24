package handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type Handler struct {
}

func (h *Handler) InitRoutes() *gin.Engine {
	router := gin.New()
}
