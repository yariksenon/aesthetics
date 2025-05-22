package handlers

import (
	"aesthetics/models"
	"database/sql"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type SubCategory struct {
	ID           int    `json:"id"`
	CategoryID   int    `json:"category_id"`
	Name         string `json:"name"`
	ProductCount int    `json:"product_count"` // Добавляем поле для количества товаров
}

func UserGetSubCategories(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Модифицированный SQL запрос с подсчетом товаров для каждой подкатегории
		query := `
			SELECT sc.id, sc.category_id, sc.name, COUNT(p.id) as product_count
			FROM sub_category sc
			LEFT JOIN product p ON p.sub_category_id = sc.id
			GROUP BY sc.id, sc.category_id, sc.name
			ORDER BY sc.category_id, sc.name
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

		for rows.Next() {
			var sc SubCategory
			if err := rows.Scan(&sc.ID, &sc.CategoryID, &sc.Name, &sc.ProductCount); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка обработки данных подкатегорий",
				})
				return
			}
			subCategories = append(subCategories, sc)
		}

		if err := rows.Err(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка при обработке результата запроса",
			})
			return
		}

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

			// Изменённый запрос с подсчётом товаров в каждой категории
			query := `
					SELECT c.id, c.name, COUNT(p.id) as product_count 
					FROM category c
					LEFT JOIN product p ON p.category_id = c.id
					GROUP BY c.id, c.name
					ORDER BY c.id
			`

			rows, err := db.Query(query)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении категорий"})
					log.Println(err)
					return
			}
			defer rows.Close()

			for rows.Next() {
					var category models.Category

					// Добавляем сканирование product_count
					err := rows.Scan(&category.ID, &category.Name, &category.ProductCount)
					if err != nil {
							c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сканировании категорий"})
							log.Println(err)
							return
					}

					categories = append(categories, category)
			}

			c.JSON(http.StatusOK, gin.H{
					"categories": categories,
			})
	}
}