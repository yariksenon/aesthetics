package handlers

import (
	"aesthetics/models"
	"database/sql"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

func AdminPage(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var users []models.User

		rows, err := db.Query("SELECT id, first_name, last_name, username, email, subscribe, password, phone, role, created_at FROM \"user\"")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при загрузке пользователей"})
			return
		}
		defer rows.Close()

		for rows.Next() {
			var user models.User
			if err := rows.Scan(
				&user.Id,
				&user.FirstName,
				&user.LastName,
				&user.Username,
				&user.Email,
				&user.Subscribe,
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
