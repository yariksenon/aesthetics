package handlers

import (
	"database/sql"
	"log"
	"aesthetics/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GET /sub-categories?category_id=X
func GetSubCategories(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		categoryID := c.DefaultQuery("category_id", "")
		if categoryID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "category_id обязателен"})
			return
		}

		// Convert category_id from string to integer
		categoryIDInt, err := strconv.Atoi(categoryID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category_id"})
			return
		}

		var subCategories []models.SubCategory

		// Use parameterized query to prevent SQL injection
		rows, err := db.Query("SELECT id, name, category_id FROM sub_category WHERE category_id = $1", categoryIDInt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении подкатегорий"})
			log.Println(err)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var subCategory models.SubCategory
			err := rows.Scan(&subCategory.ID, &subCategory.Name, &subCategory.CategoryID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сканировании подкатегорий"})
				log.Println(err)
				return
			}

			subCategories = append(subCategories, subCategory)
		}

		// Handle the case where no sub-categories are found
		if len(subCategories) == 0 {
			c.JSON(http.StatusOK, gin.H{"sub_categories": []string{}})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"sub_categories": subCategories,
		})
	}
}
