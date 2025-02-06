package handlers

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

type User struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func LoginPage(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user User
		if err := c.ShouldBindJSON(&user); err != nil {
			log.Println("Ошибка получения данных из запроса:", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
			return
		}

		rows, err := db.Query("SELECT email, password FROM \"user\" WHERE email=$1", user.Email)
		if err != nil {
			log.Println("Ошибка выполнения запроса:", err)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var dbUser User
			err := rows.Scan(&dbUser.Email, &dbUser.Password)
			if err != nil {
				log.Println("Ошибка сканирования строки:", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
				return
			}
			log.Println(dbUser.Email, dbUser.Password)
		}

		if err := rows.Err(); err != nil {
			log.Println("Ошибка при обходе строк:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}
	}
}
