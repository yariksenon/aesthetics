package handlers

import (
	"aesthetics/models"
	"database/sql"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

func GetUsers(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var users []models.User

		rows, err := db.Query("SELECT id, first_name, last_name, username, email, subscription, password, phone, role, created_at FROM \"user\" ORDER BY id;")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при загрузке пользователей"})
			log.Println(err)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var user models.User
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
				&user.CreatedAt); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обработке данных пользователя"})
				log.Println("Ошибка при проходке по всем данным", err)
				return
			}
			users = append(users, user)
		}

		c.JSON(http.StatusOK, users)
	}
}

func DeleteUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Получаем ID пользователя из параметров запроса
		userID := c.Param("id")

		// Выполняем SQL-запрос на удаление пользователя
		query := `DELETE FROM "user" WHERE id = $1`
		result, err := db.Exec(query, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Не удалось удалить пользователя",
			})
			return
		}

		// Проверяем, был ли удалён хотя бы один пользователь
		rowsAffected, err := result.RowsAffected()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка при проверке количества удалённых строк",
			})
			return
		}

		// Если ни одна строка не была удалена, возвращаем ошибку 404
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Пользователь с указанным ID не найден",
			})
			return
		}

		// Возвращаем успешный ответ
		c.JSON(http.StatusOK, gin.H{
			"message": "Пользователь успешно удалён",
		})
	}
}

func UpdateUser(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User

		if err := c.ShouldBindJSON(&user); err != nil {
			log.Printf("Ошибка при парсинге JSON: %v\n", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON data"})
			return
		}

		log.Printf("Полученные данные: %+v\n", user)

		userId := c.Param("id")

		query := `UPDATE users SET first_name = $1, last_name = $2, username = $3, email = $4, phone = $5, password = $6, role = $7 WHERE id = $8`
		_, err := db.Exec(query, user.FirstName, user.LastName, user.Username, user.Email, user.Phone, user.Password, user.Role, userId)
		if err != nil {
			log.Printf("Не удалось изменить данные о пользователе: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}
