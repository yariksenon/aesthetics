package handlers

import (
	"aesthetics/models"
	"database/sql"
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

func RegisterPage(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User

		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Проверка уникальности username
		var usernameExists bool
		err := db.QueryRow(`SELECT EXISTS (SELECT 1 FROM "user" WHERE username = $1)`, user.Username).Scan(&usernameExists)
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
		err = db.QueryRow(`SELECT EXISTS (SELECT 1 FROM "user" WHERE email = $1)`, user.Email).Scan(&emailExists)
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
		err = db.QueryRow(`SELECT EXISTS (SELECT 1 FROM "user" WHERE phone = $1)`, user.Phone).Scan(&phoneExists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}
		if phoneExists {
			c.JSON(http.StatusConflict, gin.H{"message": "Телефон уже используется"})
			return
		}

		// Вставка данных пользователя в базу данных
		_, err = db.Exec(`INSERT INTO "user" (username, email, password, phone, role, created_at) VALUES ($1, $2, $3, $4, $5, $6)`, user.Username, user.Email, user.Password, user.Phone, "user", time.Now())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сохранении данных пользователя"})
			return
		}
	}
}
