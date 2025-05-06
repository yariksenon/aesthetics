package handlers

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func LoginHandler(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
		defer cancel()

		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
			return
		}

		email := strings.TrimSpace(strings.ToLower(req.Email))
		if email == "" || req.Password == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email and password are required"})
			return
		}

		// Стандартная задержка для неудачных попыток
		defer func(start time.Time) {
			if c.Writer.Status() != http.StatusOK {
				elapsed := time.Since(start)
				if elapsed < 1*time.Second {
					time.Sleep(1*time.Second - elapsed)
				}
			}
		}(time.Now())

		var userID int
		var role string
		var dbPassword string
		var username string

		err := db.QueryRowContext(ctx, `
            SELECT id, role, password, username 
            FROM users
            WHERE email = $1
        `, email).Scan(&userID, &role, &dbPassword, &username)

		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			} else {
				log.Printf("Database error: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			}
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(dbPassword), []byte(req.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		// Возвращаем данные пользователя без создания сессии
		c.JSON(http.StatusOK, gin.H{
			"message": "Login successful",
			"user": gin.H{
				"id":       userID,
				"username": username,
				"email":    email,
				"role":     role,
			},
		})
	}
}
