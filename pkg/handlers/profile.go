package handlers

import (
	"aesthetics/models"
	"database/sql"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func GetProfile(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get userId from URL params
		userIdStr := c.Param("userId")
		if userIdStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
			return
		}

		userId, err := strconv.Atoi(userIdStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
			return
		}

		// Query database
		var user models.User
		err = db.QueryRow(`
			SELECT id, first_name, last_name, username, email, 
				   subscription, phone, created_at
			FROM users
			WHERE id = $1
		`, userId).Scan(
			&user.ID, &user.FirstName, &user.LastName, &user.Username,
			&user.Email, &user.Subscription, &user.Phone, &user.CreatedAt,
		)

		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			} else {
				log.Printf("Database error: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			}
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"id":           user.ID,
			"first_name":   user.FirstName,
			"last_name":    user.LastName,
			"username":     user.Username,
			"email":        user.Email,
			"subscription": user.Subscription,
			"phone":        user.Phone,
			"created_at":   user.CreatedAt,
		})
	}
}

func UpdateProfile(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get userId from URL params
		userIdStr := c.Param("userId")
		if userIdStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
			return
		}

		userId, err := strconv.Atoi(userIdStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
			return
		}

		var updateData struct {
			FirstName    string `json:"first_name"`
			LastName     string `json:"last_name"`
			Email        string `json:"email"`
			Phone        string `json:"phone"`
			Subscription bool   `json:"subscription"`
		}

		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		// Update user in database
		_, err = db.Exec(`
			UPDATE users
			SET first_name = $1, last_name = $2, phone = $3, subscription = $4
			WHERE id = $5
		`, updateData.FirstName, updateData.LastName,
			updateData.Phone, updateData.Subscription, userId)

		if err != nil {
			log.Printf("Update error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
	}
}

func PutPasswordProfile(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Получение userId из параметров URL
        userIdStr := c.Param("userId")
        if userIdStr == "" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
            return
        }

        userId, err := strconv.Atoi(userIdStr)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
            return
        }

        // Проверка, существует ли пользователь
        var exists bool
        err = db.QueryRow(`SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)`, userId).Scan(&exists)
        if err != nil || !exists {
            c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
            return
        }

        // Получение нового пароля из запроса
        var passwordData struct {
            Password string `json:"password"`
        }

        if err := c.ShouldBindJSON(&passwordData); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
            return
        }

        // Хеширование пароля
        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(passwordData.Password), bcrypt.DefaultCost)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
            return
        }

        // Обновление пароля в базе данных
        _, err = db.Exec(`UPDATE users SET password = $1 WHERE id = $2`, hashedPassword, userId)
        if err != nil {
            log.Printf("Password update error: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
    }
}
