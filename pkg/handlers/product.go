package handlers

import (
	"aesthetics/models"
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
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

func GetProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		productID := c.Param("id")

		query := `
            SELECT id, name, description, summary, sub_category_id, color, size, 
                   sku, price, quantity, image_path, created_at
            FROM product
            WHERE id = $1
            LIMIT 1
        `

		var product models.Product
		err := db.QueryRow(query, productID).Scan(
			&product.ID,
			&product.Name,
			&product.Description,
			&product.Summary,
			&product.SubCategoryID,
			&product.Color,
			&product.Size,
			&product.SKU,
			&product.Price,
			&product.Quantity,
			&product.ImagePath,
			&product.CreatedAt,
		)

		// Обработка ошибок
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{
					"error": fmt.Sprintf("Product with ID %s not found", productID),
				})
			} else {
				log.Printf("Error retrieving product: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Internal server error",
				})
			}
			return
		}

		// Возвращаем найденный товар
		c.JSON(http.StatusOK, product)
	}
}
