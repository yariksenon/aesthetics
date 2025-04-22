package admin

import (
	"aesthetics/models"
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

func AdminGetProducts(db *sql.DB) gin.HandlerFunc {
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
		// Получаем файл изображения
		file, err := c.FormFile("image")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Image file is required"})
			return
		}

		// Получаем остальные данные из формы
		imagePath := c.PostForm("image_path")
		if imagePath == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Image path is required"})
			return
		}

		// Сохраняем изображение
		if err := saveImage(imagePath, file); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Создаем продукт из данных формы
		product := models.Product{
			Name:        c.PostForm("name"),
			Description: c.PostForm("description"),
			Summary:     c.PostForm("summary"),
			Color:       c.PostForm("color"),
			Size:        c.PostForm("size"),
			SKU:         c.PostForm("sku"),
			ImagePath:   imagePath,
			CreatedAt:   time.Now(),
		}

		// Парсим числовые значения
		if subCategoryID, err := strconv.Atoi(c.PostForm("sub_category_id")); err == nil {
			product.SubCategoryID = subCategoryID
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid sub_category_id"})
			return
		}

		if price, err := strconv.ParseFloat(c.PostForm("price"), 64); err == nil {
			product.Price = price
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid price"})
			return
		}

		if quantity, err := strconv.Atoi(c.PostForm("quantity")); err == nil {
			product.Quantity = quantity
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid quantity"})
			return
		}

		query := `
			INSERT INTO product (
				name, description, summary, sub_category_id, color, size, sku, 
				price, quantity, image_path, created_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
			RETURNING id
		`

		err = db.QueryRow(
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
			if strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
				c.JSON(http.StatusBadRequest, gin.H{"error": "SKU must be unique"})
				return
			}
			log.Printf("Database error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
			return
		}

		c.JSON(http.StatusCreated, product)
	}
}

func saveImage(imagePath string, file *multipart.FileHeader) error {
	// Разделяем путь, чтобы получить категорию и имя файла
	parts := strings.Split(imagePath, "/")
	if len(parts) < 2 {
		return fmt.Errorf("неверный путь к изображению: %s", imagePath)
	}

	category := parts[0]
	fileName := parts[1]

	// Создаём папку для категории
	dirPath := filepath.Join("image/product", category)
	err := os.MkdirAll(dirPath, os.ModePerm)
	if err != nil {
		return fmt.Errorf("ошибка создания папки: %v", err)
	}

	// Полный путь к файлу
	filePath := filepath.Join(dirPath, fileName)

	// Открываем загруженный файл
	src, err := file.Open()
	if err != nil {
		return fmt.Errorf("ошибка открытия файла: %v", err)
	}
	defer src.Close()

	// Создаём файл для записи
	dst, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("ошибка создания файла: %v", err)
	}
	defer dst.Close()

	// Копируем данные изображения
	if _, err := io.Copy(dst, src); err != nil {
		return fmt.Errorf("ошибка записи файла: %v", err)
	}

	fmt.Printf("Файл сохранён: %s\n", filePath)
	return nil
}

func AdminUpdateProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get product ID from URL
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
			return
		}

		// Parse JSON body
		var updateData struct {
			Name          string  `json:"name"`
			Description   string  `json:"description"`
			Summary       string  `json:"summary"`
			SubCategoryID int     `json:"sub_category_id"`
			Color         string  `json:"color"`
			Size          string  `json:"size"`
			SKU           string  `json:"sku"`
			Price         float64 `json:"price"`
			Quantity      int     `json:"quantity"`
			ImagePath     string  `json:"image_path"`
		}

		if err := c.ShouldBindJSON(&updateData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		// Check if product exists
		var existingProduct models.Product
		err = db.QueryRow(`
            SELECT id FROM product WHERE id = $1`, id).Scan(&existingProduct.ID)

		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
				return
			}
			log.Printf("Database error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch product"})
			return
		}

		// Update product in database
		query := `
            UPDATE product SET
                name = $1,
                description = $2,
                summary = $3,
                sub_category_id = $4,
                color = $5,
                size = $6,
                sku = $7,
                price = $8,
                quantity = $9,
                image_path = $10
            WHERE id = $11
            RETURNING id, name, description, summary, sub_category_id, 
                      color, size, sku, price, quantity, image_path
        `

		err = db.QueryRow(
			query,
			updateData.Name,
			updateData.Description,
			updateData.Summary,
			updateData.SubCategoryID,
			updateData.Color,
			updateData.Size,
			updateData.SKU,
			updateData.Price,
			updateData.Quantity,
			updateData.ImagePath,
			id,
		).Scan(
			&existingProduct.ID,
			&existingProduct.Name,
			&existingProduct.Description,
			&existingProduct.Summary,
			&existingProduct.SubCategoryID,
			&existingProduct.Color,
			&existingProduct.Size,
			&existingProduct.SKU,
			&existingProduct.Price,
			&existingProduct.Quantity,
			&existingProduct.ImagePath,
		)

		if err != nil {
			if strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
				c.JSON(http.StatusBadRequest, gin.H{"error": "SKU must be unique"})
				return
			}
			log.Printf("Database error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
			return
		}

		c.JSON(http.StatusOK, existingProduct)
	}
}
