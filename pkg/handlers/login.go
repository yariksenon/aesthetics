package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte("TheSecretKeyAlwayssafe")

func LoginHandler(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
			return
		}

		email := strings.TrimSpace(strings.ToLower(req.Email))

		var userID int
		var role string
		var dbPassword string

		err := db.QueryRow(`
            SELECT id, role, password 
            FROM users 
            WHERE email = $1
        `, email).Scan(&userID, &role, &dbPassword)

		if err != nil {
			time.Sleep(500 * time.Millisecond)
			if err == sql.ErrNoRows {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			} else {
				log.Printf("Database error: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			}
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(dbPassword), []byte(req.Password)); err != nil {
			time.Sleep(time.Second)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id": userID,
			"email":   email,
			"role":    role,
			"exp":     time.Now().Add(24 * time.Hour).Unix(),
		})

		tokenString, err := token.SignedString(jwtSecret)
		if err != nil {
			log.Printf("JWT generation error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		// Устанавливаем токен в куки
		c.SetSameSite(http.SameSiteLaxMode)
		c.SetCookie(
			"auth_token", // имя куки
			tokenString,  // значение
			86400,        // время жизни в секундах (24 часа)
			"/",          // путь
			"",           // домен (пусто для текущего домена)
			false,        // secure (false для HTTP, true для HTTPS)
			true,         // httpOnly (ограничивает доступ JavaScript)
		)

		// Возвращаем ответ без токена в теле
		c.JSON(http.StatusOK, gin.H{
			"message":    "Login successful",
			"token":     tokenString, // Добавляем токен в ответ
			"user_id":    userID,
			"role":       role,
			// "first_name": firstName, // Добавьте это поле, если оно есть в вашей БД
			"expires_in": 86400,
		})
	}
}
