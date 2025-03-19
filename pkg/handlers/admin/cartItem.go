package admin

import (
	"database/sql"
	"github.com/gin-gonic/gin"
)

func AdminGetCartItems(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
func AdminGetCartItem(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
func AdminCreateCartItem(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
func AdminUpdateCartItem(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
func AdminDeleteCartItem(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
