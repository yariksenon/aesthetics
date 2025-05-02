package admin

import (
	"aesthetics/database"
	"aesthetics/models"
	"database/sql"
	_ "embed"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func AdminGetUsers(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		query, ok := database.Queries["user/getUsers"]
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Query for getting users not found"})
			return
		}

		rows, err := db.Query(query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при загрузке пользователей"})
			log.Println(err)
			return
		}
		defer rows.Close()

		var users []models.User

		for rows.Next() {
			var user models.User
			var createdAt time.Time
			if err := rows.Scan(
				&user.ID,
				&user.FirstName,
				&user.LastName,
				&user.Username,
				&user.Email,
				&user.Subscription,
				&user.Password,
				&user.Phone,
				&user.Role,
				&createdAt); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обработке данных пользователя"})
				log.Println("Ошибка при проходке по всем данным", err)
				return
			}

			users = append(users, user)
		}

		c.JSON(http.StatusOK, users)
	}
}

func AdminDeleteUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.Param("id")

		query, ok := database.Queries["user/deleteUser"]
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Query for getting users not found"})
			return
		}

		_, err := db.Exec(query, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"id":    userID,
				"error": "Не удалось удалить пользователя",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Пользователь успешно удалён",
		})
	}
}

func AdminUpdateUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Получаем SQL-запрос
		query, ok := database.Queries["user/updateUsers"]
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Query for updating user not found"})
			return
		}

		// Парсим входные данные
		var user models.User
		userId := c.Param("id")

		if err := c.ShouldBindJSON(&user); err != nil {
			log.Printf("Ошибка при парсинге JSON: %v\n", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON data"})
			return
		}

		// Если пароль был предоставлен - хешируем его
		if user.Password != "" {
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
			if err != nil {
				log.Printf("Ошибка при хешировании пароля: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
				return
			}
			user.Password = string(hashedPassword)
		} else {
			// Если пароль не предоставлен, получаем текущий хеш из БД
			var currentHash string
			err := db.QueryRow("SELECT password FROM users WHERE id = $1", userId).Scan(&currentHash)
			if err != nil {
				log.Printf("Ошибка при получении текущего пароля: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get current password"})
				return
			}
			user.Password = currentHash
		}

		// Обновляем данные пользователя
		_, err := db.Exec(query,
			user.FirstName,
			user.LastName,
			user.Username,
			user.Email,
			user.Password, // Теперь это хешированный пароль
			user.Phone,
			user.Role,
			userId)

		if err != nil {
			log.Printf("Не удалось изменить данные о пользователе: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
			return
		}

		// Не возвращаем пароль в ответе, даже хешированный
		user.Password = ""
		c.JSON(http.StatusOK, user)
	}
}
