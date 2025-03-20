package handlers

import (
	"aesthetics/models"
	"database/sql"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"strings"
	"time"
)

func RegisterPage(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User

		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		log.Println(user)

		// Проверка уникальности username
		var usernameExists bool
		err := db.QueryRow(`SELECT EXISTS (SELECT 1 FROM users WHERE username = $1)`, user.Username).Scan(&usernameExists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}
		if usernameExists {
			c.JSON(http.StatusConflict, gin.H{"message": "Имя пользователя уже существует"})
			return
		}

		// Проверка уникальности email
		var emailExists bool
		err = db.QueryRow(`SELECT EXISTS (SELECT 1 FROM users WHERE email = $1)`, strings.ToLower(user.Email)).Scan(&emailExists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}
		if emailExists {
			c.JSON(http.StatusConflict, gin.H{"message": "Электронная почта уже существует"})
			return
		}

		// Проверка уникальности phone
		var phoneExists bool
		err = db.QueryRow(`SELECT EXISTS (SELECT 1 FROM users WHERE phone = $1)`, user.Phone).Scan(&phoneExists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}
		if phoneExists {
			c.JSON(http.StatusConflict, gin.H{"message": "Телефон уже используется"})
			return
		}

		// Вставка данных пользователя в базу данных
		_, err = db.Exec(`INSERT INTO users (username, email, password, phone, role, created_at) VALUES ($1, $2, $3, $4, $5, $6)`, user.Username, strings.ToLower(user.Email), user.Password, user.Phone, "customer", time.Now())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сохранении данных пользователя"})
			return
		}
	}
}
