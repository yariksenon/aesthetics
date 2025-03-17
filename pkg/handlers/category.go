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

		// Обновление категории в базе данных
		var createdAt time.Time
		err := db.QueryRow(
			"UPDATE category SET name = $1 WHERE id = $2 RETURNING created_at",
			updatedCategory.Name, id,
		).Scan(&createdAt)

		if err != nil {
			log.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обновлении категории"})
			return
		}

		// Возвращаем обновлённую категорию
		c.JSON(http.StatusOK, gin.H{
			"id":         id,
			"name":       updatedCategory.Name,
			"created_at": createdAt,
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
		var id int
		var createdAt time.Time
		err := db.QueryRow(
			"INSERT INTO category (name, created_at) VALUES ($1, $2) RETURNING id, created_at",
			newCategory.Name, time.Now(),
		).Scan(&id, &createdAt)

		if err != nil {
			log.Println(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при создании категории"})
			return
		}

		// Возвращаем созданную категорию
		c.JSON(http.StatusCreated, gin.H{
			"id":         id,
			"name":       newCategory.Name,
			"created_at": createdAt,
		})
	}
}
