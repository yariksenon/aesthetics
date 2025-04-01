package handlers

import (
	"aesthetics/models"
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

func GetProfile(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Not authenticated",
				"details": "User ID not found in context",
			})
			return
		}

		id, ok := userID.(int)
		if !ok {
			// Логируем фактический тип для отладки
			log.Printf("Invalid userID type: %T, value: %v", userID, userID)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Invalid user ID",
				"details": fmt.Sprintf("Expected int, got %T", userID),
			})
			return
		}

		// 3. Запрос к базе данных
		var user models.User
		err := db.QueryRow(`
            SELECT id, first_name, last_name, username, email, 
                   subscription, phone, role, created_at
            FROM users
            WHERE id = $1
        `, id).Scan(
			&user.ID, &user.FirstName, &user.LastName, &user.Username,
			&user.Email, &user.Subscription, &user.Phone, &user.Role, &user.CreatedAt,
		)

		// 4. Обработка ошибок запроса
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{
					"error":   "User not found",
					"user_id": id,
				})
			} else {
				log.Printf("Database error: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   "Database error",
					"details": err.Error(),
				})
			}
			return
		}

		// 5. Успешный ответ
		c.JSON(http.StatusOK, gin.H{
			"id":           user.ID,
			"first_name":   user.FirstName,
			"last_name":    user.LastName,
			"username":     user.Username,
			"email":        user.Email,
			"subscription": user.Subscription,
			"phone":        user.Phone,
			"role":         user.Role,
			"created_at":   user.CreatedAt, // Исправлено: используем значение из БД, а не текущее время
		})
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
            UPDATE users
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
