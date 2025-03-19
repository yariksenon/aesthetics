package admin

import (
	"database/sql"
	"github.com/gin-gonic/gin"
)

func AdminGetUserAddresses(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
func AdminGetUserAddress(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
func AdminCreateUserAddress(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
func AdminUpdateUserAddress(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
func AdminDeleteUserAddress(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
