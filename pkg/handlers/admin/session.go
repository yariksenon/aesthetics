package admin

import (
	"database/sql"
	"github.com/gin-gonic/gin"
)

func AdminGetSessions(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
func AdminGetSession(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
func AdminCreateSession(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
func AdminUpdateSession(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
func AdminDeleteSession(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {}
}
