package handlers

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type User struct {
	ID           int       `json:"id"`
	FirstName    string    `json:"first_name"`
	LastName     string    `json:"last_name"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	Subscription string    `json:"subscription"`
	Phone        string    `json:"phone"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
}

func GetProfile(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.MustGet("userID").(int)

		var user User
		err := db.QueryRow(`
            SELECT id, first_name, last_name, username, email, subscription, phone, role, created_at
            FROM "user"
            WHERE id = $1
        `, userID).Scan(
			&user.ID, &user.FirstName, &user.LastName, &user.Username, &user.Email,
			&user.Subscription, &user.Phone, &user.Role, &user.CreatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user profile"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}

func UpdateProfile(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.MustGet("userID").(int)

		var updateData struct {
			FirstName    string `json:"first_name"`
			LastName     string `json:"last_name"`
			Email        string `json:"email"`
			Phone        string `json:"phone"`
			Subscription string `json:"subscription"`
		}
		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		_, err := db.Exec(`
            UPDATE "user"
            SET first_name = $1, last_name = $2, email = $3, phone = $4, subscription = $5
            WHERE id = $6
        `, updateData.FirstName, updateData.LastName, updateData.Email, updateData.Phone, updateData.Subscription, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
	}
}
