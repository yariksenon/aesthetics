package handlers

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Category struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type SubCategory struct {
	ID         int    `json:"id"`
	CategoryID int    `json:"category_id" db:"category_id"`
	Name       string `json:"name"`
}

func GetCategories(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var categories []Category

		rows, err := db.Query("SELECT id, name FROM category ORDER BY id")
		if err != nil {
			log.Println("Ошибка при получении категорий:", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Не удалось получить список категорий",
				"details": err.Error(),
			})
			return
		}
		defer func() {
			if err := rows.Close(); err != nil {
				log.Println("Ошибка при закрытии rows:", err)
			}
		}()

		for rows.Next() {
			var category Category
			if err := rows.Scan(&category.ID, &category.Name); err != nil {
				log.Println("Ошибка при сканировании категории:", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   "Ошибка обработки данных",
					"details": err.Error(),
				})
				return
			}
			categories = append(categories, category)
		}

		if err := rows.Err(); err != nil {
			log.Println("Ошибка после итерации:", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Ошибка при обработке запроса",
				"details": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"category": categories,
		})
	}
}

func GetSubCategories(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var subCategories []SubCategory

		rows, err := db.Query("SELECT id, category_id, name FROM sub_category ORDER BY category_id, id")
		if err != nil {
			log.Println("Ошибка при получении подкатегорий:", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Не удалось получить список подкатегорий",
				"details": err.Error(),
			})
			return
		}
		defer func() {
			if err := rows.Close(); err != nil {
				log.Println("Ошибка при закрытии rows:", err)
			}
		}()

		for rows.Next() {
			var subCat SubCategory
			if err := rows.Scan(&subCat.ID, &subCat.CategoryID, &subCat.Name); err != nil {
				log.Println("Ошибка при сканировании подкатегории:", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   "Ошибка обработки данных",
					"details": err.Error(),
				})
				return
			}
			subCategories = append(subCategories, subCat)
		}

		if err := rows.Err(); err != nil {
			log.Println("Ошибка после итерации:", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Ошибка при обработке запроса",
				"details": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, subCategories)
	}
}
