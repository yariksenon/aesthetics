package admin

import (
	"database/sql"
	"github.com/gin-gonic/gin"
)

func AdminGetOrderItems(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
func AdminGetOrderItem(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
func AdminCreateOrderItem(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
func AdminUpdateOrderItem(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
func AdminDeleteOrderItem(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
