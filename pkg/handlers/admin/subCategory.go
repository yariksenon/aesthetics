package admin

import (
	"aesthetics/models"
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// AdminGetSubCategories возвращает все подкатегории
func AdminGetSubCategories(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Query(`
			SELECT sc.id, sc.category_id, sc.name, c.name as category_name 
			FROM sub_category sc
			JOIN category c ON sc.category_id = c.id
		`)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var subCategories []map[string]interface{}
		for rows.Next() {
			var sc models.SubCategory
			var categoryName string
			if err := rows.Scan(&sc.ID, &sc.CategoryID, &sc.Name, &categoryName); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			subCategories = append(subCategories, map[string]interface{}{
				"id":            sc.ID,
				"category_id":   sc.CategoryID,
				"name":          sc.Name,
				"category_name": categoryName,
			})
		}

		c.JSON(http.StatusOK, subCategories)
	}
}

// AdminCreateSubCategory создает новую подкатегорию
func AdminCreateSubCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var sc models.SubCategory
		if err := c.ShouldBindJSON(&sc); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Проверяем существование категории
		var categoryExists bool
		err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM category WHERE id = $1)", sc.CategoryID).Scan(&categoryExists)
		if err != nil || !categoryExists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Category does not exist"})
			return
		}

		var id int
		err = db.QueryRow(
			"INSERT INTO sub_category (category_id, name) VALUES ($1, $2) RETURNING id",
			sc.CategoryID, sc.Name,
		).Scan(&id)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		sc.ID = id
		c.JSON(http.StatusCreated, sc)
	}
}

// AdminUpdateSubCategory обновляет подкатегорию
func AdminUpdateSubCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
			return
		}

		var sc models.SubCategory
		if err := c.ShouldBindJSON(&sc); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Проверяем существование категории
		var categoryExists bool
		err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM category WHERE id = $1)", sc.CategoryID).Scan(&categoryExists)
		if err != nil || !categoryExists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Category does not exist"})
			return
		}

		result, err := db.Exec(
			"UPDATE sub_category SET category_id = $1, name = $2 WHERE id = $3",
			sc.CategoryID, sc.Name, id,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Subcategory not found"})
			return
		}

		sc.ID = id
		c.JSON(http.StatusOK, sc)
	}
}

// AdminDeleteSubCategory удаляет подкатегорию
func AdminDeleteSubCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
			return
		}

		// Проверяем, есть ли связанные товары
		var productsCount int
		err = db.QueryRow("SELECT COUNT(*) FROM product WHERE sub_category_id = $1", id).Scan(&productsCount)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if productsCount > 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Cannot delete subcategory with existing products. Delete products first.",
			})
			return
		}

		result, err := db.Exec("DELETE FROM sub_category WHERE id = $1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Subcategory not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Subcategory deleted successfully"})
	}
}

// AdminGetSubCategoriesByCategory возвращает подкатегории для конкретной категории
func AdminGetSubCategoriesByCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		categoryID, err := strconv.Atoi(c.Param("category_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
			return
		}

		rows, err := db.Query(`
			SELECT id, category_id, name 
			FROM sub_category 
			WHERE category_id = $1
		`, categoryID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var subCategories []models.SubCategory
		for rows.Next() {
			var sc models.SubCategory
			if err := rows.Scan(&sc.ID, &sc.CategoryID, &sc.Name); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			subCategories = append(subCategories, sc)
		}

		c.JSON(http.StatusOK, subCategories)
	}
}
