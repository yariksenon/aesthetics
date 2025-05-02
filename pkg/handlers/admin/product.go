package admin

import (
	"aesthetics/models"
	"database/sql"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

// AdminGetProducts возвращает список всех товаров
func AdminGetProducts(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		query := `
			SELECT p.id, p.name, p.description, p.summary, 
				   p.category_id, p.sub_category_id, 
				   p.color, p.size, p.sku, p.price, 
				   p.quantity, p.image_path, p.currency, p.created_at,
				   c.name as category_name,
				   sc.name as sub_category_name
			FROM product p
			LEFT JOIN category c ON p.category_id = c.id
			LEFT JOIN sub_category sc ON p.sub_category_id = sc.id
			ORDER BY p.created_at DESC
		`

		rows, err := db.Query(query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var products []map[string]interface{}
		for rows.Next() {
			var p models.Product
			var categoryName, subCategoryName sql.NullString
			err := rows.Scan(
				&p.ID, &p.Name, &p.Description, &p.Summary,
				&p.CategoryID, &p.SubCategoryID,
				&p.Color, &p.Size, &p.SKU, &p.Price,
				&p.Quantity, &p.ImagePath, &p.Currency, &p.CreatedAt,
				&categoryName, &subCategoryName,
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			product := map[string]interface{}{
				"id":                p.ID,
				"name":              p.Name,
				"description":       p.Description,
				"summary":           p.Summary,
				"category_id":       p.CategoryID,
				"sub_category_id":   p.SubCategoryID,
				"color":             p.Color,
				"size":              p.Size,
				"sku":               p.SKU,
				"price":             p.Price,
				"quantity":          p.Quantity,
				"image_path":        p.ImagePath,
				"currency":          p.Currency,
				"created_at":        p.CreatedAt,
				"category_name":     categoryName.String,
				"sub_category_name": subCategoryName.String,
			}
			products = append(products, product)
		}

		c.JSON(http.StatusOK, products)
	}
}

// AdminGetProduct возвращает товар по ID
func AdminGetProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var p models.Product
		var categoryName, subCategoryName sql.NullString
		err := db.QueryRow(`
			SELECT p.id, p.name, p.description, p.summary, 
				   p.category_id, p.sub_category_id, 
				   p.color, p.size, p.sku, p.price, 
				   p.quantity, p.image_path, p.currency, p.created_at,
				   c.name as category_name,
				   sc.name as sub_category_name
			FROM product p
			LEFT JOIN category c ON p.category_id = c.id
			LEFT JOIN sub_category sc ON p.sub_category_id = sc.id
			WHERE p.id = $1
		`, id).Scan(
			&p.ID, &p.Name, &p.Description, &p.Summary,
			&p.CategoryID, &p.SubCategoryID,
			&p.Color, &p.Size, &p.SKU, &p.Price,
			&p.Quantity, &p.ImagePath, &p.Currency, &p.CreatedAt,
			&categoryName, &subCategoryName,
		)

		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"id":                p.ID,
			"name":              p.Name,
			"description":       p.Description,
			"summary":           p.Summary,
			"category_id":       p.CategoryID,
			"sub_category_id":   p.SubCategoryID,
			"color":             p.Color,
			"size":              p.Size,
			"sku":               p.SKU,
			"price":             p.Price,
			"quantity":          p.Quantity,
			"image_path":        p.ImagePath,
			"currency":          p.Currency,
			"created_at":        p.CreatedAt,
			"category_name":     categoryName.String,
			"sub_category_name": subCategoryName.String,
		})
	}
}

// AdminCreateProduct создает новый товар с загрузкой изображения
func AdminCreateProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Сначала обрабатываем загрузку файла
		file, header, err := c.Request.FormFile("Image")
		var imagePath string

		if err == nil && header != nil {
			defer file.Close()

			// Получаем SKU из формы
			sku := c.PostForm("SKU")
			if sku == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "SKU is required when uploading image"})
				return
			}

			// Сохраняем изображение
			imagePath, err = saveProductImage(file, header, sku)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save image: %v", err)})
				return
			}
			log.Printf("Image saved at: %s", imagePath)
		} else {
			log.Printf("No image uploaded: %v", err)
		}

		// 2. Парсим остальные данные формы
		var p models.Product
		if err := c.ShouldBind(&p); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// 3. Устанавливаем путь к изображению, если файл был загружен
		if imagePath != "" {
			p.ImagePath = imagePath
		}

		// 4. Проверка SKU на уникальность
		var skuExists bool
		err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM product WHERE sku = $1)", p.SKU).Scan(&skuExists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if skuExists {
			// Удаляем сохраненное изображение, если SKU не уникален
			if imagePath != "" {
				os.Remove(filepath.Join("uploads", imagePath))
			}
			c.JSON(http.StatusBadRequest, gin.H{"error": "Product with this SKU already exists"})
			return
		}

		// 5. Установка значений по умолчанию
		if p.Currency == "" {
			p.Currency = "USD"
		}
		if p.Quantity < 0 {
			p.Quantity = 0
		}

		// 6. Создание товара в БД
		err = db.QueryRow(`
            INSERT INTO product (
                name, description, summary, category_id, sub_category_id,
                color, size, sku, price, quantity, image_path, currency, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id, created_at
        `,
			p.Name, p.Description, p.Summary, p.CategoryID, p.SubCategoryID,
			p.Color, p.Size, p.SKU, p.Price, p.Quantity, p.ImagePath, p.Currency, time.Now(),
		).Scan(&p.ID, &p.CreatedAt)

		if err != nil {
			// Удаляем сохраненное изображение при ошибке
			if imagePath != "" {
				os.Remove(filepath.Join("uploads", imagePath))
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// 7. Логирование успешного создания
		log.Printf("Created product: ID=%d, Name=%s, ImagePath=%s", p.ID, p.Name, p.ImagePath)

		c.JSON(http.StatusCreated, p)
	}
}

// AdminUpdateProduct обновляет товар
func AdminUpdateProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var p models.Product
		if err := c.ShouldBind(&p); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Получаем текущий товар
		var currentProduct models.Product
		err := db.QueryRow(`
			SELECT id, sku, image_path FROM product WHERE id = $1
		`, id).Scan(&currentProduct.ID, &currentProduct.SKU, &currentProduct.ImagePath)

		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		// Проверка SKU на уникальность (если изменился)
		if p.SKU != currentProduct.SKU {
			var skuExists bool
			err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM product WHERE sku = $1 AND id != $2)", p.SKU, id).Scan(&skuExists)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if skuExists {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Another product with this SKU already exists"})
				return
			}
		}

		// Обработка загрузки нового изображения
		file, header, err := c.Request.FormFile("image")
		var newImagePath string
		if err == nil && header != nil {
			defer file.Close()
			newImagePath, err = saveProductImage(file, header, p.SKU)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			p.ImagePath = newImagePath
		}

		// Обновление товара в БД
		_, err = db.Exec(`
			UPDATE product SET
				name = $1,
				description = $2,
				summary = $3,
				category_id = $4,
				sub_category_id = $5,
				color = $6,
				size = $7,
				sku = $8,
				price = $9,
				quantity = $10,
				image_path = COALESCE($11, image_path),
				currency = $12
			WHERE id = $13
		`,
			p.Name, p.Description, p.Summary, p.CategoryID, p.SubCategoryID,
			p.Color, p.Size, p.SKU, p.Price, p.Quantity, p.ImagePath, p.Currency, id,
		)

		if err != nil {
			// Удаляем новое изображение при ошибке
			if newImagePath != "" {
				os.Remove(filepath.Join("uploads", newImagePath))
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Удаляем старое изображение, если было загружено новое
		if newImagePath != "" && currentProduct.ImagePath != "" {
			os.Remove(filepath.Join("uploads", currentProduct.ImagePath))
		}

		c.JSON(http.StatusOK, gin.H{"message": "Product updated successfully"})
	}
}

// AdminDeleteProduct удаляет товар
func AdminDeleteProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		// Проверяем наличие связанных заказов
		var orderItemsCount int
		err := db.QueryRow(`
			SELECT COUNT(*) FROM order_item WHERE product_id = $1
		`, id).Scan(&orderItemsCount)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if orderItemsCount > 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Cannot delete product with existing order items",
			})
			return
		}

		// Получаем путь к изображению для удаления
		var imagePath string
		err = db.QueryRow(`
			SELECT image_path FROM product WHERE id = $1
		`, id).Scan(&imagePath)

		if err != nil && err != sql.ErrNoRows {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Удаляем товар из БД
		result, err := db.Exec(`
			DELETE FROM product WHERE id = $1
		`, id)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		// Удаляем изображение товара, если оно существует
		if imagePath != "" {
			fullPath := filepath.Join("uploads", imagePath)
			if _, err := os.Stat(fullPath); err == nil {
				if err := os.Remove(fullPath); err != nil {
					log.Printf("Failed to delete product image: %v", err)
				}
			}
		}

		c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
	}
}

// saveProductImage сохраняет изображение товара
func saveProductImage(file multipart.File, header *multipart.FileHeader, sku string) (string, error) {
	// Логирование начала загрузки
	log.Printf("Начало загрузки изображения для товара SKU: %s", sku)
	log.Printf("Исходное имя файла: %s, Размер: %d байт", header.Filename, header.Size)

	// Создаем директорию для загрузки
	uploadDir := "./uploads/products"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		log.Printf("Ошибка создания директории %s: %v", uploadDir, err)
		return "", fmt.Errorf("failed to create upload directory: %v", err)
	}
	log.Printf("Директория для загрузки создана или уже существует: %s", uploadDir)

	// Генерируем уникальное имя файла
	ext := filepath.Ext(header.Filename)
	newFilename := fmt.Sprintf("%s_%d%s", sku, time.Now().Unix(), ext)
	imagePath := filepath.Join("products", newFilename)
	fullPath := filepath.Join(uploadDir, newFilename)

	log.Printf("Готово к сохранению файла как: %s", fullPath)

	// Создаем файл
	dst, err := os.Create(fullPath)
	if err != nil {
		log.Printf("Ошибка создания файла %s: %v", fullPath, err)
		return "", fmt.Errorf("failed to create file: %v", err)
	}
	defer dst.Close()

	// Копируем содержимое файла
	bytesCopied, err := io.Copy(dst, file)
	if err != nil {
		log.Printf("Ошибка копирования файла: %v", err)
		return "", fmt.Errorf("failed to save file: %v", err)
	}

	log.Printf("Файл успешно сохранен. Скопировано байт: %d", bytesCopied)
	log.Printf("Изображение сохранено по пути: %s", imagePath)

	return imagePath, nil
}
