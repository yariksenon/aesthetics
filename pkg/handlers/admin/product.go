package admin

import (
	"database/sql"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"encoding/json"
	"path/filepath"
	"time"
    "strconv"
    "strings"

	"github.com/gin-gonic/gin"
)


func AdminCreateProduct(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // 1. Начало транзакции
        log.Println("Начало создания товара")
        tx, err := db.Begin()
        if err != nil {
            log.Printf("Ошибка начала транзакции: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Не удалось начать транзакцию",
                "details": err.Error(),
            })
            return
        }
        defer func() {
            if err != nil {
                log.Printf("Откат транзакции из-за ошибки: %v", err)
                tx.Rollback()
            }
        }()

        // 2. Парсинг формы
        log.Println("Парсинг multipart формы")
        if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32MB
            log.Printf("Ошибка парсинга формы: %v", err)
            c.JSON(http.StatusBadRequest, gin.H{
                "error": "Ошибка чтения формы",
                "details": err.Error(),
            })
            return
        }

        // Логируем полученные данные формы (кроме файлов)
        log.Println("Полученные данные формы:")
        for key, values := range c.Request.PostForm {
            log.Printf("%s: %v", key, values)
        }

        // 3. Основные данные товара
        product := struct {
            Name         string  `form:"name" binding:"required"`
            Description  string  `form:"description"`
            Summary      string  `form:"summary"`
            CategoryID   int     `form:"category_id" binding:"required"`
            SubCategoryID int    `form:"sub_category_id"`
            Color        string  `form:"color"`
            SKU          string  `form:"sku" binding:"required"`
            Price        float64 `form:"price" binding:"required"`
            Gender       string  `form:"gender"`
            SizeTypeID   int     `form:"size_type_id"`
            SizeQuantities string `form:"size_quantities"`
        }{}

        log.Println("Привязка данных формы к структуре")
        if err := c.ShouldBind(&product); err != nil {
            log.Printf("Ошибка привязки данных: %v", err)
            c.JSON(http.StatusBadRequest, gin.H{
                "error": "Неверные данные товара",
                "details": err.Error(),
            })
            return
        }

        log.Printf("Полученные данные товара: %+v", product)

        // 4. Создание товара в БД
        log.Println("Вставка данных товара в БД")
        var productID int
        err = tx.QueryRow(`
            INSERT INTO product (
                name, description, summary, 
                category_id, sub_category_id,
                color, sku, price, gender, size_type_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id
        `,
            product.Name, product.Description, product.Summary,
            product.CategoryID, product.SubCategoryID,
            product.Color, product.SKU, product.Price, product.Gender, product.SizeTypeID,
        ).Scan(&productID)

        if err != nil {
            log.Printf("Ошибка вставки товара: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Ошибка создания товара",
                "details": err.Error(),
            })
            return
        }

        log.Printf("Товар создан с ID: %d", productID)

        // 5. Обработка размеров
        if product.SizeQuantities != "" {
            log.Printf("Обработка размеров: %s", product.SizeQuantities)
            var sizes map[string]interface{}
            if err := json.Unmarshal([]byte(product.SizeQuantities), &sizes); err != nil {
                log.Printf("Ошибка парсинга размеров: %v", err)
            } else {
                for sizeID, quantity := range sizes {
                    if sizeID == "type_id" {
                        continue
                    }
                    
                    if qty, ok := quantity.(float64); ok {
                        log.Printf("Добавление размера %s: %d", sizeID, int(qty))
                        _, err = tx.Exec(`
                            INSERT INTO product_sizes 
                            (product_id, size_id, quantity)
                            VALUES ($1, $2, $3)
                        `, productID, sizeID, int(qty))
                        
                        if err != nil {
                            log.Printf("Ошибка добавления размера: %v", err)
                        }
                    }
                }
            }
        }

        // 6. Обработка изображений
        log.Println("Обработка изображений")
        files := c.Request.MultipartForm.File["images"]
        altTexts := c.Request.PostForm["alt_texts"]
        isPrimaryList := c.Request.PostForm["is_primary"]

        log.Printf("Получено %d изображений", len(files))
        
        for i, file := range files {
            // Сохранение файла с использованием новой функции
            imagePath, err := saveProductImage(file, product.SKU, i)
            if err != nil {
                log.Printf("Ошибка сохранения изображения: %v", err)
                continue
            }

            // Получение дополнительных данных
            altText := ""
            if i < len(altTexts) {
                altText = altTexts[i]
            }
            
            isPrimary := false
            if i < len(isPrimaryList) {
                isPrimary = isPrimaryList[i] == "true"
            }

            log.Printf("Данные изображения %d: alt='%s', primary=%v", i, altText, isPrimary)
            
            // Добавление в БД
            _, err = tx.Exec(`
                INSERT INTO product_images 
                (product_id, image_path, alt_text, is_primary, display_order)
                VALUES ($1, $2, $3, $4, $5)
            `,
                productID,
                imagePath,
                altText,
                isPrimary,
                i,
            )
            
            if err != nil {
                log.Printf("Ошибка добавления изображения: %v", err)
            }
        }

        // 7. Завершение транзакции
        log.Println("Завершение транзакции")
        if err := tx.Commit(); err != nil {
            log.Printf("Ошибка коммита транзакции: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Ошибка завершения транзакции",
                "details": err.Error(),
            })
            return
        }

        log.Println("Товар успешно создан")
        c.JSON(http.StatusCreated, gin.H{
            "id": productID,
            "message": "Товар успешно создан",
        })
    }
}

// saveProductImage сохраняет изображение товара в ./uploads/products
func saveProductImage(file *multipart.FileHeader, sku string, index int) (string, error) {
    // Создаем директорию, если она не существует
    uploadDir := "./uploads/products"
    if err := os.MkdirAll(uploadDir, 0755); err != nil {
        return "", fmt.Errorf("не удалось создать директорию: %v", err)
    }

    // Получаем расширение файла
    ext := filepath.Ext(file.Filename)
    
    // Генерируем уникальное имя файла на основе SKU, времени и индекса
    newFilename := fmt.Sprintf("%s_%d_%d%s", 
        strings.ReplaceAll(sku, "/", "_"), // Заменяем недопустимые символы
        time.Now().UnixNano(),             // Добавляем временную метку
        index,                            // Индекс изображения
        strings.ToLower(ext),             // Расширение файла в нижнем регистре
    )
    
    // Полный путь для сохранения
    fullPath := filepath.Join(uploadDir, newFilename)
    
    // Открываем исходный файл
    src, err := file.Open()
    if err != nil {
        return "", fmt.Errorf("не удалось открыть файл: %v", err)
    }
    defer src.Close()
    
    // Создаем новый файл
    dst, err := os.Create(fullPath)
    if err != nil {
        return "", fmt.Errorf("не удалось создать файл: %v", err)
    }
    defer dst.Close()
    
    // Копируем содержимое файла
    if _, err := io.Copy(dst, src); err != nil {
        return "", fmt.Errorf("не удалось сохранить файл: %v", err)
    }

    // Возвращаем относительный путь (только products/newFilename)
    return filepath.Join("products", newFilename), nil
}











func AdminGetProducts(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Получаем параметры пагинации
        page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
        pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
        offset := (page - 1) * pageSize

        // Основной запрос с информацией о товарах и изображениях
        query := `
            SELECT 
                p.id, p.name, p.description, p.summary,
                p.category_id, p.sub_category_id, p.color, p.sku,
                p.price, p.gender, p.size_type_id, p.created_at,
                
                cat.name AS category_name,
                subcat.name AS sub_category_name,
                
                (
                    SELECT json_agg(json_build_object(
                        'id', pi.id,
                        'image_path', pi.image_path,
                        'is_primary', pi.is_primary,
                        'alt_text', COALESCE(pi.alt_text, ''),
                        'display_order', pi.display_order
                    ) ORDER BY pi.display_order)
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                ) AS images
            FROM product p
            LEFT JOIN category cat ON cat.id = p.category_id
            LEFT JOIN sub_category subcat ON subcat.id = p.sub_category_id
            ORDER BY p.created_at DESC
            LIMIT $1 OFFSET $2
        `

        // Запрос для подсчета общего количества товаров
        countQuery := `SELECT COUNT(*) FROM product`

        // Выполняем запрос
        rows, err := db.Query(query, pageSize, offset)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Ошибка выполнения запроса",
                "details": err.Error(),
            })
            return
        }
        defer rows.Close()

        // Получаем общее количество товаров
        var total int
        err = db.QueryRow(countQuery).Scan(&total)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Ошибка подсчета товаров",
                "details": err.Error(),
            })
            return
        }

        var products []gin.H

        for rows.Next() {
            var (
                id, categoryID, subCategoryID, sizeTypeID        int64
                name, description, summary, color, sku           string
                gender, categoryName, subCategoryName            string
                price                                            float64
                createdAt                                        time.Time
                imagesJSON                                       []byte
            )

            err := rows.Scan(
                &id, &name, &description, &summary,
                &categoryID, &subCategoryID, &color, &sku,
                &price, &gender, &sizeTypeID, &createdAt,
                &categoryName, &subCategoryName,
                &imagesJSON,
            )
            if err != nil {
                continue
            }

            // Парсим JSON с изображениями
            var images []map[string]interface{}
            if len(imagesJSON) > 0 {
                json.Unmarshal(imagesJSON, &images)
            }

            // Определяем основное изображение
            // Определяем основное изображение
            var mainImagePath string
            for _, img := range images {
                if isPrimary, ok := img["is_primary"].(bool); ok && isPrimary {
                    if path, ok := img["image_path"].(string); ok {
                        // Изменяем путь с uploads на static
                        mainImagePath = strings.Replace(path, "uploads", "static", 1)
                    }
                    break
                }
            }

            product := gin.H{
                "id":                id,
                "name":              name,
                "description":       description,
                "summary":           summary,
                "category_id":       categoryID,
                "sub_category_id":   subCategoryID,
                "category_name":     categoryName,
                "sub_category_name": subCategoryName,
                "color":             color,
                "sku":              sku,
                "price":            price,
                "gender":           gender,
                "size_type_id":     sizeTypeID,
                "created_at":       createdAt.Format("2006-01-02 15:04:05"),
                "images":           images,
                "image_path":       mainImagePath, // Основное изображение для обратной совместимости
            }

            products = append(products, product)
        }

        c.JSON(http.StatusOK, gin.H{
            "products": products,
            "total":    total,
            "page":     page,
            "pageSize": pageSize,
        })
    }
}
















func AdminUpdateProduct(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        productID := c.Param("id")
        if productID == "" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Product ID is required"})
            return
        }

        // Начинаем транзакцию
        tx, err := db.Begin()
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
            return
        }
        defer func() {
            if err != nil {
                tx.Rollback()
            }
        }()

        // Парсим multipart форму
        if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32MB max
            c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form data"})
            return
        }
        form := c.Request.MultipartForm

        // Парсим основные данные товара
        var product struct {
            Name          string  `form:"name"`
            Description   string  `form:"description"`
            Summary       string  `form:"summary"`
            CategoryID    int     `form:"category_id"`
            SubCategoryID int     `form:"sub_category_id"`
            Color         string  `form:"color"`
            SKU           string  `form:"sku"`
            Price         float64 `form:"price"`
            Gender        string  `form:"gender"`
            SizeTypeID    int     `form:"size_type_id"`
        }

        if err := c.ShouldBind(&product); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        // Обновляем данные товара
        _, err = tx.Exec(`
            UPDATE product SET
                name = $1,
                description = $2,
                summary = $3,
                category_id = $4,
                sub_category_id = $5,
                color = $6,
                sku = $7,
                price = $8,
                gender = $9,
                size_type_id = $10,
                updated_at = NOW()
            WHERE id = $11
        `,
            product.Name, product.Description, product.Summary,
            product.CategoryID, product.SubCategoryID,
            product.Color, product.SKU, product.Price,
            product.Gender, product.SizeTypeID,
            productID,
        )

        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product: " + err.Error()})
            return
        }

        // Обрабатываем размеры
        sizeQuantities := form.Value["size_quantities"]
        if len(sizeQuantities) > 0 {
            var sizes map[string]int
            if err := json.Unmarshal([]byte(sizeQuantities[0]), &sizes); err == nil {
                // Удаляем старые размеры
                _, err = tx.Exec(`DELETE FROM product_sizes WHERE product_id = $1`, productID)
                if err != nil {
                    log.Printf("Failed to delete old sizes: %v", err)
                }

                // Добавляем новые размеры
                for sizeID, quantity := range sizes {
                    _, err = tx.Exec(`
                        INSERT INTO product_sizes (product_id, size_id, quantity)
                        VALUES ($1, $2, $3)
                        ON CONFLICT (product_id, size_id) DO UPDATE SET quantity = $3
                    `, productID, sizeID, quantity)
                    
                    if err != nil {
                        log.Printf("Failed to add size %s: %v", sizeID, err)
                    }
                }
            }
        }

        // Обрабатываем изображения
        // 1. Сначала собираем информацию о существующих изображениях
        existingImages := make(map[string]struct {
            AltText      string
            IsPrimary    bool
            DisplayOrder int
        })

        if ids, ok := form.Value["existing_images"]; ok {
            for i, id := range ids {
                altText := ""
                if len(form.Value["existing_alt_texts"]) > i {
                    altText = form.Value["existing_alt_texts"][i]
                }

                isPrimary := false
                if len(form.Value["existing_is_primary"]) > i {
                    isPrimary = form.Value["existing_is_primary"][i] == "true"
                }

                displayOrder := i
                if len(form.Value["existing_display_orders"]) > i {
                    if order, err := strconv.Atoi(form.Value["existing_display_orders"][i]); err == nil {
                        displayOrder = order
                    }
                }

                existingImages[id] = struct {
                    AltText      string
                    IsPrimary    bool
                    DisplayOrder int
                }{
                    AltText:      altText,
                    IsPrimary:    isPrimary,
                    DisplayOrder: displayOrder,
                }

                // Обновляем информацию об изображении
                _, err = tx.Exec(`
                    UPDATE product_images SET
                        alt_text = $1,
                        is_primary = $2,
                        display_order = $3
                    WHERE id = $4 AND product_id = $5
                `, altText, isPrimary, displayOrder, id, productID)
                
                if err != nil {
                    log.Printf("Failed to update image %s: %v", id, err)
                }
            }
        }

        // 2. Удаляем изображения, которые отсутствуют в списке существующих
        var currentImageIDs []string
        rows, err := tx.Query(`SELECT id FROM product_images WHERE product_id = $1`, productID)
        if err == nil {
            defer rows.Close()
            for rows.Next() {
                var id string
                if err := rows.Scan(&id); err == nil {
                    currentImageIDs = append(currentImageIDs, id)
                }
            }
        }

        for _, id := range currentImageIDs {
            if _, exists := existingImages[id]; !exists {
                // Получаем путь к изображению перед удалением
                var imagePath string
                err := tx.QueryRow(`
                    SELECT image_path FROM product_images 
                    WHERE id = $1 AND product_id = $2
                `, id, productID).Scan(&imagePath)
                
                if err == nil && imagePath != "" {
                    // Удаляем файл изображения
                    os.Remove(filepath.Join("uploads", imagePath))
                    
                    // Удаляем запись из БД
                    _, err = tx.Exec(`
                        DELETE FROM product_images 
                        WHERE id = $1 AND product_id = $2
                    `, id, productID)
                    
                    if err != nil {
                        log.Printf("Failed to delete image %s: %v", id, err)
                    }
                }
            }
        }

        // 3. Добавляем новые изображения
        if files, ok := form.File["new_images"]; ok {
            for i, file := range files {
                if i >= 10 { // Ограничиваем количество новых изображений
                    break
                }

                // Генерируем уникальное имя файла
                ext := filepath.Ext(file.Filename)
                newFilename := fmt.Sprintf("%s_%d%s", product.SKU, time.Now().UnixNano(), ext)
                imagePath := filepath.Join("products", newFilename)

                // Сохраняем файл
                if err := c.SaveUploadedFile(file, filepath.Join("uploads", imagePath)); err != nil {
                    log.Printf("Failed to save image: %v", err)
                    continue
                }

                // Получаем дополнительные данные для изображения
                altText := ""
                if len(form.Value["new_alt_texts"]) > i {
                    altText = form.Value["new_alt_texts"][i]
                }

                isPrimary := false
                if len(form.Value["new_is_primary"]) > i {
                    isPrimary = form.Value["new_is_primary"][i] == "true"
                }

                displayOrder := 0
                if len(form.Value["new_display_orders"]) > i {
                    if order, err := strconv.Atoi(form.Value["new_display_orders"][i]); err == nil {
                        displayOrder = order
                    }
                }

                // Добавляем запись в БД
                _, err = tx.Exec(`
                    INSERT INTO product_images 
                    (product_id, image_path, alt_text, is_primary, display_order)
                    VALUES ($1, $2, $3, $4, $5)
                `, productID, imagePath, altText, isPrimary, displayOrder)
                
                if err != nil {
                    log.Printf("Failed to save image info: %v", err)
                }
            }
        }

        // Убедимся, что есть только одно основное изображение
        if _, err := tx.Exec(`
            UPDATE product_images SET is_primary = false 
            WHERE product_id = $1 AND is_primary = true
            AND id NOT IN (
                SELECT id FROM product_images 
                WHERE product_id = $1 AND is_primary = true
                ORDER BY display_order LIMIT 1
            )
        `, productID); err != nil {
            log.Printf("Failed to fix primary images: %v", err)
        }

        // Завершаем транзакцию
        if err := tx.Commit(); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Product updated successfully"})
    }
}











func AdminDeleteProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		tx, err := db.Begin()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction error"})
			return
		}
		defer tx.Rollback()

		// Удаляем изображения
		_, err = tx.Exec("DELETE FROM product_images WHERE product_id = $1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete images"})
			return
		}

		// Удаляем размеры
		_, err = tx.Exec("DELETE FROM product_sizes WHERE product_id = $1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete sizes"})
			return
		}

		// Удаляем сам товар
		_, err = tx.Exec("DELETE FROM product WHERE id = $1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
			return
		}

		if err := tx.Commit(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Commit error"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Product deleted"})
	}
}

