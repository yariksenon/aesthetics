package admin

import (
	"aesthetics/models"
	"database/sql"
	"net/http"
	"strconv"
	"strings"

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
		var cat struct {
			Name string `json:"name" binding:"required,min=1,max=100"`
		}

		if err := c.ShouldBindJSON(&cat); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Invalid request data",
				"details": err.Error(),
			})
			return
		}

		// Check if category exists
		var exists bool
		err := db.QueryRow(
			"SELECT EXISTS(SELECT 1 FROM category WHERE name = $1)",
			cat.Name,
		).Scan(&exists)

		if err != nil {
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

		// Create new category with error handling for sequence issues
		var id int
		err = db.QueryRow(
			"INSERT INTO category (name) VALUES ($1) RETURNING id",
			cat.Name,
		).Scan(&id)

		if err != nil {
			if strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
				// If it's a sequence error, try to reset it and retry once
				_, seqErr := db.Exec("SELECT setval('category_id_seq', (SELECT MAX(id) FROM category))")
				if seqErr != nil {
					c.JSON(http.StatusInternalServerError, gin.H{
						"error": "Failed to fix sequence issue",
					})
					return
				}

				// Try the insert again
				err = db.QueryRow(
					"INSERT INTO category (name) VALUES ($1) RETURNING id",
					cat.Name,
				).Scan(&id)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{
						"error": "Failed to create category after sequence reset",
					})
					return
				}
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   "Failed to create category",
					"details": err.Error(),
				})
				return
			}
		}

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
