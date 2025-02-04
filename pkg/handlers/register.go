package handlers

import (
	"aesthetics/models"
	"database/sql"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"time"
)

func RegisterPage(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User

		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			log.Println("error:", err)
			return
		}

		// Вставка данных пользователя в базу данных
		_, err := db.Exec(`
            INSERT INTO "user" (username, email, password, phone, role, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, user.Username, user.Email, user.Password, user.Phone, "user", time.Now())

		log.Println(user.Username, user.Email, user.Password, "user", user.Phone)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сохранении данных пользователя"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"username": user.Username,
			"email":    user.Email,
			"phone":    user.Phone,
			"password": user.Password,
		})
	}
}
