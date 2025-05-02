package admin

import (
	"aesthetics/models"
	"database/sql"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// AdminGetCategories возвращает список всех категорий
func AdminGetCategories(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Query("SELECT id, name FROM category")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var categories []models.Category
		for rows.Next() {
			var cat models.Category
			if err := rows.Scan(&cat.ID, &cat.Name); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			categories = append(categories, cat)
		}

		c.JSON(http.StatusOK, categories)
	}
}

// AdminCreateCategory создает новую категорию
func AdminCreateCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Логируем входящий запрос
		requestBody, _ := c.GetRawData()
		log.Printf("Received request to create category: %s", string(requestBody))

		var cat struct {
			Name string `json:"name" binding:"required,min=1,max=100"`
		}

		if err := c.ShouldBindJSON(&cat); err != nil {
			log.Printf("Bad request: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Invalid request data",
				"details": err.Error(),
			})
			return
		}

		// Проверяем, не существует ли уже категория с таким именем
		var exists bool
		err := db.QueryRow(
			"SELECT EXISTS(SELECT 1 FROM category WHERE name = $1)",
			cat.Name,
		).Scan(&exists)

		if err != nil {
			log.Printf("Database check error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Database error",
			})
			return
		}

		if exists {
			c.JSON(http.StatusConflict, gin.H{
				"error": "Category with this name already exists",
			})
			return
		}

		// Создаем новую категорию
		var id int
		err = db.QueryRow(
			"INSERT INTO category (name) VALUES ($1) RETURNING id",
			cat.Name,
		).Scan(&id)

		if err != nil {
			log.Printf("Database insert error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to create category",
				"details": err.Error(),
			})
			return
		}

		log.Printf("Successfully created category with ID: %d", id)
		c.JSON(http.StatusCreated, gin.H{
			"id":   id,
			"name": cat.Name,
		})
	}
}

// AdminUpdateCategory обновляет категорию
func AdminUpdateCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
			return
		}

		var cat models.Category
		if err := c.ShouldBindJSON(&cat); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		result, err := db.Exec(
			"UPDATE category SET name = $1 WHERE id = $2",
			cat.Name, id,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
			return
		}

		cat.ID = id
		c.JSON(http.StatusOK, cat)
	}
}

// AdminDeleteCategory удаляет категорию
func AdminDeleteCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
			return
		}

		// Проверяем есть ли подкатегории у этой категории
		var subCategoriesCount int
		err = db.QueryRow("SELECT COUNT(*) FROM sub_category WHERE category_id = $1", id).Scan(&subCategoriesCount)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if subCategoriesCount > 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Cannot delete category with existing subcategories. Delete subcategories first.",
			})
			return
		}

		result, err := db.Exec("DELETE FROM category WHERE id = $1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
	}
}
