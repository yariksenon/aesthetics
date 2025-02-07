package handlers

import (
	"aesthetics/models"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"time"
)

// Генерация безопасного токена сессии
func generateSessionToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func saveSessionToDatabase(db *sql.DB, userID int, sessionToken string) error {
	_, err := db.Exec("INSERT INTO session (user_id, session_token, created_at, updated_at) VALUES ($1, $2, $3, $4)",
		userID, sessionToken, time.Now(), time.Now())
	return err
}

func LoginPage(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User
		var dbPassword string
		var userID int
		var role string

		if err := c.ShouldBindJSON(&user); err != nil {
			log.Println("Ошибка получения данных из запроса:", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неправильный формат JSON"})
			return
		}

		// Проверка существования email и получение пароля и id пользователя
		err := db.QueryRow("SELECT id, password FROM \"user\" WHERE email=$1", user.Email).Scan(&userID, &dbPassword)
		if err != nil {
			if err == sql.ErrNoRows {
				log.Println("Email не существует")
				c.JSON(http.StatusUnauthorized, gin.H{"message": "Нет пользователя с данным email"})
			} else {
				log.Println("Ошибка выполнения запроса на пароль:", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера при проверке пароля"})
			}
			return
		}

		// Сравнение пароля пользователя с паролем из базы данных
		if user.Password != dbPassword {
			log.Println("Неправильный пароль")
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Неверный пароль"})
			return
		}

		err = db.QueryRow("SELECT role FROM \"user\" WHERE id=$1", userID).Scan(&user.Role)
		if err != nil {
			log.Println("Ошибка получения роли пользователя:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера при получении роли пользователя"})
			return
		}

		// Генерация токена сессии
		sessionToken, err := generateSessionToken()
		if err != nil {
			log.Println("Ошибка генерации токена сессии:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера при создании сессии"})
			return
		}

		// Сохранение сессии в базе данных
		err = saveSessionToDatabase(db, userID, sessionToken)
		if err != nil {
			log.Println("Ошибка сохранения сессии в базе данных:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера при создании сессии"})
			return
		}

		// Установка куки
		cookie := &http.Cookie{
			Name:     "session_token",
			Value:    sessionToken,
			Expires:  time.Now().Add(24 * time.Hour),
			HttpOnly: true,
		}
		http.SetCookie(c.Writer, cookie)

		log.Println("Успешный вход:", user.Email, "role:", role)
		c.JSON(http.StatusOK, gin.H{"role": user.Role})
	}
}

func AuthMiddleware(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Cookie("session_token")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Необходимо войти в систему"})
			c.Abort()
			return
		}

		var userID int
		err = db.QueryRow("SELECT user_id FROM session WHERE session_token = $1", cookie).Scan(&userID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Недействительная сессия"})
			c.Abort()
			return
		}

		// Сохранение userID в контексте
		c.Set("userID", userID)
		c.Next()
	}
}
