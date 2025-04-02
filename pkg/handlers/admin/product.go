package admin

import (
	"aesthetics/models"
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

func AdminGetProducts(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		query := `
            SELECT id, name, description, summary, sub_category_id, color, size, 
                   sku, price, quantity, image_path, created_at
            FROM product
            ORDER BY created_at DESC
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

func AdminGetProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		productId := c.Param("productID")
		var product models.Product
		err := db.QueryRow(`
            SELECT id, name, description, summary, sub_category_id, color, size, sku, price, quantity, created_at
            FROM product WHERE id=$1
        `, productId).Scan(
			&product.ID, &product.Name, &product.Description, &product.Summary, &product.SubCategoryID,
			&product.Color, &product.Size, &product.SKU, &product.Price, &product.Quantity, &product.CreatedAt,
		)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Product not found with ID " + productId})
			} else {
				log.Println("Error retrieving product:", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving product: " + err.Error()})
			}
			return
		}
		c.JSON(http.StatusOK, gin.H{"product": product})
	}
}

//func AdminUpdateProduct(db *sql.DB) gin.HandlerFunc {
//	return func(c *gin.Context) {
//		productID := c.Param("id")
//		var updatedProduct models.Product
//		if err := c.ShouldBindJSON(&updatedProduct); err != nil {
//			log.Println("Ошибка при парсинге JSON:", err)
//			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
//			return
//		}
//
//		if updatedProduct.Name == "" || updatedProduct.SubCategoryID == 0 || updatedProduct.Price == 0 || updatedProduct.Quantity == 0 {
//			log.Println("Не все обязательные поля заполнены")
//			c.JSON(http.StatusBadRequest, gin.H{"error": "Не все обязательные поля заполнены"})
//			return
//		}
//
//		query := `
//            UPDATE product
//            SET name = $1, description = $2, summary = $3, sub_category_id = $4, color = $5, size = $6, price = $7, quantity = $8
//            WHERE id = $9
//        `
//		result, err := db.Exec(
//			query,
//			updatedProduct.Name,
//			updatedProduct.Description,
//			updatedProduct.Summary,
//			updatedProduct.SubCategoryID,
//			updatedProduct.Color,
//			updatedProduct.Size,
//			updatedProduct.Price,
//			updatedProduct.Quantity,
//			productID,
//		)
//		if err != nil {
//			log.Println("Ошибка при обновлении товара:", err)
//			c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить товар"})
//			return
//		}
//
//		rowsAffected, _ := result.RowsAffected()
//		if rowsAffected == 0 {
//			c.JSON(http.StatusNotFound, gin.H{"error": "Товар не найден"})
//			return
//		}
//
//		c.JSON(http.StatusOK, gin.H{"message": "Товар успешно обновлен"})
//	}
//}

func AdminDeleteProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		productID := c.Param("id")
		result, err := db.Exec("DELETE FROM product WHERE id = $1", productID)
		if err != nil {
			log.Println("Ошибка при удалении товара:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось удалить товар"})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Товар не найден"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Товар успешно удален"})
	}
}

func AdminUploadImage(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Get the image file
		file, err := c.FormFile("image")
		if err != nil {
			log.Printf("Error getting image file: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get image file"})
			return
		}

		// 2. Get product ID
		productID := c.PostForm("product_id")
		if productID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Product ID is required"})
			return
		}

		// 3. Create uploads directory with proper permissions
		uploadDir := "./uploads"
		if err := os.MkdirAll(uploadDir, 0755); err != nil {
			log.Printf("Error creating upload directory: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
			return
		}

		// 4. Generate unique filename
		ext := filepath.Ext(file.Filename)
		newFilename := fmt.Sprintf("product_%s_%d%s", productID, time.Now().Unix(), ext)
		filePath := filepath.Join(uploadDir, newFilename)

		// 5. Save the file
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			log.Printf("Error saving file: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}

		// 6. Update database
		_, err = db.Exec("UPDATE products SET image_path = $1 WHERE id = $2", newFilename, productID)
		if err != nil {
			log.Printf("Database error: %v", err)
			os.Remove(filePath)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to update product image path",
				"details": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":    "Image uploaded successfully",
			"image_path": newFilename,
		})
	}
}

func AdminAddProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var product models.Product
		if err := c.ShouldBindJSON(&product); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		product.CreatedAt = time.Now()

		query := `
			INSERT INTO product (
				name, description, summary, sub_category_id, color, size, sku, 
				price, quantity, image_path, created_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
			RETURNING id
		`

		err := db.QueryRow(
			query,
			product.Name,
			product.Description,
			product.Summary,
			product.SubCategoryID,
			product.Color,
			product.Size,
			product.SKU,
			product.Price,
			product.Quantity,
			product.ImagePath,
			product.CreatedAt,
		).Scan(&product.ID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		log.Println(product.ImagePath)

		c.JSON(http.StatusCreated, product)
	}
}
