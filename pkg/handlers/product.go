package handlers

import (
	"aesthetics/models"
	"database/sql"
	"github.com/gin-gonic/gin"
	"net/http"
)

func GetProducts(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		query := `
            SELECT id, name, description, summary, sub_category_id, color, size, 
                   sku, price, quantity, image_path, created_at
            FROM product
            ORDER BY id ASC
        `

		rows, err := db.Query(query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var products []models.Product
		for rows.Next() {
			var p models.Product
			err := rows.Scan(
				&p.ID,
				&p.Name,
				&p.Description,
				&p.Summary,
				&p.SubCategoryID,
				&p.Color,
				&p.Size,
				&p.SKU,
				&p.Price,
				&p.Quantity,
				&p.ImagePath,
				&p.CreatedAt,
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			products = append(products, p)
		}

		c.JSON(http.StatusOK, products)
	}
}