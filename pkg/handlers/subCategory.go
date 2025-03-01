package handlers

import (
	"aesthetics/models"
	"database/sql"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

func GetSubCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var subCategory models.SubCategory

		rows, err := db.Query("SELECT id, parent_id, name, created_at FROM sub_category ORDER BY parent_id")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка при получении подкатегорий с бд"})
			log.Fatal(err)
		}
		defer rows.Close()

		var subCategories []models.SubCategory
		for rows.Next() {
			err := rows.Scan(&subCategory.ID, &subCategory.ParentId, &subCategory.Name, &subCategory.CreatedAt)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сканировании подкатегорий"})
				log.Fatal(err)
				return
			}
			subCategories = append(subCategories, subCategory)
		}

		c.JSON(http.StatusOK, gin.H{
			"subCategories": subCategories,
		})
	}
}
