package handlers

import (
	"aesthetics/models"
	"database/sql"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type SubCategory struct {
	ID         int    `json:"id"`
	CategoryID int    `json:"category_id"`
	Name       string `json:"name"`
}

func UserGetSubCategories(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// SQL запрос для получения всех подкатегорий
		query := `
			SELECT id, category_id, name 
			FROM sub_category
			ORDER BY category_id, name
		`

		rows, err := db.Query(query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Не удалось получить подкатегории",
			})
			return
		}
		defer rows.Close()

		var subCategories []SubCategory

		// Итерация по результатам запроса
		for rows.Next() {
			var sc SubCategory
			if err := rows.Scan(&sc.ID, &sc.CategoryID, &sc.Name); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка обработки данных подкатегорий",
				})
				return
			}
			subCategories = append(subCategories, sc)
		}

		// Проверка на ошибки после итерации
		if err := rows.Err(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка при обработке результата запроса",
			})
			return
		}

		// Возвращаем результат
		c.JSON(http.StatusOK, subCategories)
	}
}

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

func GetCategories(db *sql.DB) gin.HandlerFunc {
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
				log.Println(err)
				return
			}

			categories = append(categories, category)
		}

		// Возвращаем все поля в JSON-ответе
		c.JSON(http.StatusOK, gin.H{
			"categories": categories,
		})
	}
}

