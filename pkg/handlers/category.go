package handlers

import (
	"aesthetics/models"
	"database/sql"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var categories []models.Category

		rows, err := db.Query("SELECT id, name FROM category ORDER BY id")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении категорий"})
			log.Println(err)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var category models.Category

			err := rows.Scan(&category.ID, &category.Name)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сканировании категорий"})
				log.Fatal(err)
				return
			}

			categories = append(categories, category)
		}

		// Возвращаем все поля в JSON-ответе
		c.JSON(http.StatusOK, gin.H{
			"category": categories,
		})
	}
}
