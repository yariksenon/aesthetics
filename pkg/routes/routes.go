package routes

import (
	"aesthetics/pkg/handlers"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	v1 := r.Group("/api/v1")
	{
		v1.GET("/products", handlers.HelloHandler)
		v1.POST("/submit")
		v1.POST("/read")
	}
}
