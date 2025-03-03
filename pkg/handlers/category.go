package handlers

import (
	"aesthetics/models"
	"database/sql"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"time"
)

func GetCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var categories []models.Category

		rows, err := db.Query("SELECT id, name, created_at FROM category ORDER BY id")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении категорий"})
			log.Println(err)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var category models.Category

			err := rows.Scan(&category.ID, &category.Name, &category.CreatedAt)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сканировании категорий"})
				log.Fatal(err)
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

func UpdateCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var updatedCategory models.Category
		if err := c.ShouldBindJSON(&updatedCategory); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		_, err := db.Exec(
			"UPDATE category SET name = $1 WHERE id = $2",
			updatedCategory.Name, id,
		)

		if err != nil {
			log.Fatal(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обновлении категории"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Категория успешно обновлена",
		})
	}
}

func DeleteCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id") // Получаем ID из параметров запроса

		// Удаление категории из базы данных
		_, err := db.Exec("DELETE FROM category WHERE id = $1", id)
		if err != nil {
			log.Fatal(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при удалении категории"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Категория успешно удалена",
		})
	}
}

func CreateCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var newCategory models.Category
		if err := c.ShouldBindJSON(&newCategory); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		// Вставка новой категории в базу данных
		_, err := db.Exec(
			"INSERT INTO category (name, created_at) VALUES ($1, $2)",
			newCategory.Name, time.Now(),
		)

		if err != nil {
			log.Fatal(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при создании категории"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Категория успешно создана",
		})
	}
}
