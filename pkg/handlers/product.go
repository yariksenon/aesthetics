package handlers

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"net/http"
	"math"
	"strconv"
	"encoding/json"
	"io"
	"os"
	"path/filepath"
	"mime/multipart"
	"time"
	"strings"
	"log"
	"fmt"
)


type ProductResponses struct {
	ID           int      `json:"id"`
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	Summary      string   `json:"summary"`
	Price        float64  `json:"price"`
	Category     string   `json:"category"`
	SubCategory  string   `json:"sub_category"`
	Gender       string   `json:"gender"`
	Color        string   `json:"color"`
	Sizes        []Size   `json:"sizes"`
	Images       []string `json:"images"`
	PrimaryImage string   `json:"primary_image"`
	Brand        BrandInfo  `json:"brand"` 
}

type BrandInfo struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Website     string `json:"website"`
}

type Size struct {
	ID       int    `json:"id"`
	Size     string `json:"size"`
	Quantity int    `json:"quantity"`
	Description string `json:"description"`
}


func GetProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
			productID := c.Param("id")
			if productID == "" {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Product ID is required"})
					return
			}

			// Временная структура для основного запроса
			var tempProduct struct {
					ID           int
					Name         string
					Description  sql.NullString
					Summary      sql.NullString
					Price        float64
					Category     sql.NullString
					SubCategory  sql.NullString
					Gender       string
					Color        sql.NullString
					PrimaryImage sql.NullString
					SizeTypeID   sql.NullInt64
					BrandID      sql.NullInt64
			}

			// Получаем основную информацию о товаре
			err := db.QueryRow(`
					SELECT 
							p.id, 
							p.name, 
							p.description, 
							p.summary,
							p.price,
							c.name as category,
							sc.name as sub_category,
							p.gender,
							p.color,
							pi.image_path as primary_image,
							p.size_type_id,
							p.brand_id
					FROM product p
					LEFT JOIN category c ON p.category_id = c.id
					LEFT JOIN sub_category sc ON p.sub_category_id = sc.id
					LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
					WHERE p.id = $1`, productID).Scan(
					&tempProduct.ID,
					&tempProduct.Name,
					&tempProduct.Description,
					&tempProduct.Summary,
					&tempProduct.Price,
					&tempProduct.Category,
					&tempProduct.SubCategory,
					&tempProduct.Gender,
					&tempProduct.Color,
					&tempProduct.PrimaryImage,
					&tempProduct.SizeTypeID,
					&tempProduct.BrandID,
			)

			if err != nil {
					if err == sql.ErrNoRows {
							c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
							return
					}
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
			}

			// Получаем информацию о бренде, если brand_id указан
			var brand BrandInfo
			if tempProduct.BrandID.Valid {
					err = db.QueryRow(`
							SELECT id, name, description, website 
							FROM brand 
							WHERE id = $1`, tempProduct.BrandID.Int64).Scan(
							&brand.ID,
							&brand.Name,
							&brand.Description,
							&brand.Website,
					)
					if err != nil && err != sql.ErrNoRows {
							c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get brand info: " + err.Error()})
							return
					}
			}

			// Создаем финальный объект продукта
			product := ProductResponses{
					ID:           tempProduct.ID,
					Name:         tempProduct.Name,
					Description:  tempProduct.Description.String,
					Summary:      tempProduct.Summary.String,
					Price:        tempProduct.Price,
					Category:     tempProduct.Category.String,
					SubCategory:  tempProduct.SubCategory.String,
					Gender:       tempProduct.Gender,
					Color:        tempProduct.Color.String,
					PrimaryImage: tempProduct.PrimaryImage.String,
					Brand:        brand,
					Sizes:        []Size{},
					Images:       []string{},
			}

			// Добавляем основное изображение в список изображений
			if product.PrimaryImage != "" {
					product.Images = append(product.Images, product.PrimaryImage)
			}

			// Получаем все изображения товара
			rows, err := db.Query(`
					SELECT image_path 
					FROM product_images 
					WHERE product_id = $1 AND (is_primary = false OR is_primary IS NULL) 
					ORDER BY display_order`, productID)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
			}
			defer rows.Close()

			for rows.Next() {
					var imagePath string
					if err := rows.Scan(&imagePath); err != nil {
							continue
					}
					product.Images = append(product.Images, imagePath)
			}

			// Получаем все размеры товара с полной информацией
			sizeRows, err := db.Query(`
					SELECT 
							s.id, 
							s.value as size, 
							ps.quantity,
							st.name as size_type_name,
							s.description as size_description
					FROM product_sizes ps
					JOIN sizes s ON ps.size_id = s.id
					JOIN size_types st ON s.size_type_id = st.id
					WHERE ps.product_id = $1
					ORDER BY st.name, s.value`, productID)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
			}
			defer sizeRows.Close()

			for sizeRows.Next() {
					var size Size
					var sizeType string
					var description string
					if err := sizeRows.Scan(
							&size.ID,
							&size.Size,
							&size.Quantity,
							&sizeType,
							&description,
					); err != nil {
							continue
					}
					size.Description = fmt.Sprintf("%s (%s)", description, sizeType)
					product.Sizes = append(product.Sizes, size)
			}

			// Если у товара есть size_type_id, но нет размеров в product_sizes,
			// получаем все размеры этого типа
			if tempProduct.SizeTypeID.Valid && len(product.Sizes) == 0 {
					allSizeRows, err := db.Query(`
							SELECT 
									s.id, 
									s.value as size, 
									0 as quantity,
									st.name as size_type_name,
									s.description as size_description
							FROM sizes s
							JOIN size_types st ON s.size_type_id = st.id
							WHERE s.size_type_id = $1
							ORDER BY s.value`, tempProduct.SizeTypeID.Int64)
					if err != nil {
							c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
							return
					}
					defer allSizeRows.Close()

					for allSizeRows.Next() {
							var size Size
							var sizeType string
							var description string
							if err := allSizeRows.Scan(
									&size.ID,
									&size.Size,
									&size.Quantity,
									&sizeType,
									&description,
							); err != nil {
									continue
							}
							size.Description = fmt.Sprintf("%s (%s)", description, sizeType)
							product.Sizes = append(product.Sizes, size)
					}
			}

			c.JSON(http.StatusOK, product)
	}
}





func GetProducts(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Получаем параметры пагинации
        page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
        limit, _ := strconv.Atoi(c.DefaultQuery("limit", "12"))
        offset := (page - 1) * limit

        // Основной запрос к продуктам с размерами, всеми путями к изображениям и названием бренда
        query := `
            SELECT 
                p.id, p.name, p.description, p.summary, 
                p.price, p.sku, p.color, p.gender,
                p.category_id, p.sub_category_id,
                c.name as category_name,
                sc.name as sub_category_name,
                b.name as brand_name,
                (
                    SELECT json_agg(image_path)
                    FROM (
                        SELECT pi.image_path
                        FROM product_images pi
                        WHERE pi.product_id = p.id
                        ORDER BY pi.display_order, pi.created_at
                    ) sub
                ) as image_paths,
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', s.id,
                            'value', s.value,
                            'quantity', ps.quantity,
                            'description', s.description
                        )
                    )
                    FROM product_sizes ps
                    JOIN sizes s ON ps.size_id = s.id
                    WHERE ps.product_id = p.id
                ) as sizes
            FROM product p
            LEFT JOIN category c ON p.category_id = c.id
            LEFT JOIN sub_category sc ON p.sub_category_id = sc.id
            LEFT JOIN brand b ON p.brand_id = b.id
            ORDER BY p.created_at DESC
            LIMIT $1 OFFSET $2
        `

        rows, err := db.Query(query, limit, offset)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error":   "Database query error",
                "details": err.Error(),
            })
            return
        }
        defer rows.Close()

        var products []gin.H
        for rows.Next() {
            var p struct {
                ID              int
                Name            string
                Description     string
                Summary         string
                Price           float64
                SKU             string
                Color           string
                Gender          string
                CategoryID      int
                SubCategoryID   int
                CategoryName    sql.NullString
                SubCategoryName sql.NullString
                BrandName       sql.NullString // Добавлено поле для названия бренда
                ImagePaths      []byte
                Sizes           []byte
            }

            err := rows.Scan(
                &p.ID, &p.Name, &p.Description, &p.Summary,
                &p.Price, &p.SKU, &p.Color, &p.Gender,
                &p.CategoryID, &p.SubCategoryID,
                &p.CategoryName, &p.SubCategoryName,
                &p.BrandName, // Сканируем название бренда
                &p.ImagePaths, &p.Sizes,
            )
            if err != nil {
                continue
            }

            // Парсим JSON массив путей к изображениям
            var imagePaths []string
            if p.ImagePaths != nil {
                err = json.Unmarshal(p.ImagePaths, &imagePaths)
                if err != nil {
                    continue
                }
            }

            // Парсим JSON массив размеров
            var sizes []gin.H
            if p.Sizes != nil {
                err = json.Unmarshal(p.Sizes, &sizes)
                if err != nil {
                    continue
                }
            }

            product := gin.H{
                "id":              p.ID,
                "name":            p.Name,
                "description":     p.Description,
                "summary":         p.Summary,
                "price":           p.Price,
                "sku":             p.SKU,
                "color":           p.Color,
                "gender":          p.Gender,
                "category_id":     p.CategoryID,
                "sub_category_id": p.SubCategoryID,
                "category":        p.CategoryName.String,
                "sub_category":    p.SubCategoryName.String,
                "brand_name":      p.BrandName.String, // Добавляем название бренда
                "image_paths":     imagePaths,
                "sizes":           sizes,
            }

            products = append(products, product)
        }

        if err = rows.Err(); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error":   "Error processing results",
                "details": err.Error(),
            })
            return
        }

        // Подсчёт общего количества товаров
        var total int
        countQuery := "SELECT COUNT(*) FROM product"
        err = db.QueryRow(countQuery).Scan(&total)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error":   "Count query error",
                "details": err.Error(),
            })
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "products": products,
            "pagination": gin.H{
                "total":       total,
                "page":        page,
                "limit":       limit,
                "total_pages": int(math.Ceil(float64(total) / float64(limit))),
            },
        })
    }
}










func BrandCreateProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
			// 1. Получаем ID пользователя из параметра URL
			userIDStr := c.Param("userId")
			userID, err := strconv.Atoi(userIDStr)
			if err != nil || userID <= 0 {
					c.JSON(http.StatusBadRequest, gin.H{
							"error": "Неверный ID пользователя",
					})
					return
			}

			// 2. Проверяем, что пользователь является брендом и получаем brand_id
			var brandID int
			err = db.QueryRow("SELECT id FROM brand WHERE user_id = $1", userID).Scan(&brandID)
			if err != nil {
					if err == sql.ErrNoRows {
							c.JSON(http.StatusForbidden, gin.H{
									"error": "Только бренды могут создавать товары",
							})
							return
					}
					log.Printf("Ошибка при проверке бренда для userID %v: %v", userID, err)
					c.JSON(http.StatusInternalServerError, gin.H{
							"error":   "Ошибка при проверке бренда",
							"details": err.Error(),
					})
					return
			}

			// Остальной код остается без изменений
			// 3. Начало транзакции
			log.Printf("Начало создания товара для brand_id: %d", brandID)
			tx, err := db.Begin()
			if err != nil {
					log.Printf("Ошибка начала транзакции: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{
							"error":   "Не удалось начать транзакцию",
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

			// 4. Парсинг формы
			log.Println("Парсинг multipart формы")
			if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32MB
					log.Printf("Ошибка парсинга формы: %v", err)
					c.JSON(http.StatusBadRequest, gin.H{
							"error":   "Ошибка чтения формы",
							"details": err.Error(),
					})
					return
			}

			// Логируем полученные данные формы (кроме файлов)
			log.Println("Полученные данные формы:")
			for key, values := range c.Request.PostForm {
					log.Printf("%s: %v", key, values)
			}

			// 5. Основные данные товара
			product := struct {
					Name           string  `form:"name" binding:"required"`
					Description    string  `form:"description"`
					Summary        string  `form:"summary"`
					CategoryID     int     `form:"category_id" binding:"required"`
					SubCategoryID  int     `form:"sub_category_id"`
					Color          string  `form:"color"`
					SKU            string  `form:"sku" binding:"required"`
					Price          float64 `form:"price" binding:"required"`
					Gender         string  `form:"gender"`
					SizeTypeID     int     `form:"size_type_id"`
					SizeQuantities string  `form:"size_quantities"`
			}{}

			log.Println("Привязка данных формы к структуре")
			if err := c.ShouldBind(&product); err != nil {
					log.Printf("Ошибка привязки данных: %v", err)
					c.JSON(http.StatusBadRequest, gin.H{
							"error":   "Неверные данные товара",
							"details": err.Error(),
					})
					return
			}

			log.Printf("Полученные данные товара: %+v", product)

			// 6. Создание товара в БД с указанием brand_id
			log.Println("Вставка данных товара в БД")
			var productID int
			err = tx.QueryRow(`
					INSERT INTO product (
							name, description, summary, 
							category_id, sub_category_id,
							color, sku, price, gender, size_type_id, brand_id
					) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
					RETURNING id
			`,
					product.Name, product.Description, product.Summary,
					product.CategoryID, product.SubCategoryID,
					product.Color, product.SKU, product.Price, product.Gender, product.SizeTypeID, brandID,
			).Scan(&productID)

			if err != nil {
					log.Printf("Ошибка вставки товара: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{
							"error":   "Ошибка создания товара",
							"details": err.Error(),
					})
					return
			}

			log.Printf("Товар создан с ID: %d, brand_id: %d", productID, brandID)

			// 7. Обработка размеров
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

			// 8. Обработка изображений
			log.Println("Обработка изображений")
			files := c.Request.MultipartForm.File["images"]
			altTexts := c.Request.PostForm["alt_texts"]
			isPrimaryList := c.Request.PostForm["is_primary"]

			log.Printf("Получено %d изображений", len(files))

			for i, file := range files {
					// Сохранение файла с использованием функции saveProductImage
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

			// 9. Завершение транзакции
			log.Println("Завершение транзакции")
			if err := tx.Commit(); err != nil {
					log.Printf("Ошибка коммита транзакции: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{
							"error":   "Ошибка завершения транзакции",
							"details": err.Error(),
					})
					return
			}

			log.Printf("Товар успешно создан с ID %d для brand_id %d", productID, brandID)
			c.JSON(http.StatusCreated, gin.H{
					"id":      productID,
					"message": "Товар успешно создан",
			})
	}
}

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


// BrandUpdateProduct
// BrandDeleteProduct
// BrandGetProducts