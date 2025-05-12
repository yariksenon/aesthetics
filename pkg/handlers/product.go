package handlers

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"net/http"
	"math"
	"strconv"
	"fmt"
)


type ProductResponses struct {
	ID           int      `json:"id"`
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	Price        float64  `json:"price"`
	Category     string   `json:"category"`
	SubCategory  string   `json:"sub_category"`
	Gender       string   `json:"gender"`
	Color        string   `json:"color"`
	Sizes        []Size   `json:"sizes"`
	Images       []string `json:"images"`
	PrimaryImage string   `json:"primary_image"`
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
					Price        float64
					Category     sql.NullString
					SubCategory  sql.NullString
					Gender       string
					Color        sql.NullString
					PrimaryImage sql.NullString
					SizeTypeID   sql.NullInt64 // Добавляем size_type_id из product
			}

			// Получаем основную информацию о товаре
			err := db.QueryRow(`
					SELECT 
							p.id, 
							p.name, 
							p.description, 
							p.price,
							c.name as category,
							sc.name as sub_category,
							p.gender,
							p.color,
							pi.image_path as primary_image,
							p.size_type_id
					FROM product p
					LEFT JOIN category c ON p.category_id = c.id
					LEFT JOIN sub_category sc ON p.sub_category_id = sc.id
					LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
					WHERE p.id = $1`, productID).Scan(
					&tempProduct.ID,
					&tempProduct.Name,
					&tempProduct.Description,
					&tempProduct.Price,
					&tempProduct.Category,
					&tempProduct.SubCategory,
					&tempProduct.Gender,
					&tempProduct.Color,
					&tempProduct.PrimaryImage,
					&tempProduct.SizeTypeID,
			)

			if err != nil {
					if err == sql.ErrNoRows {
							c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
							return
					}
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
			}

			// Создаем финальный объект продукта
			product := ProductResponses{
					ID:           tempProduct.ID,
					Name:         tempProduct.Name,
					Description:  tempProduct.Description.String,
					Price:        tempProduct.Price,
					Category:     tempProduct.Category.String,
					SubCategory:  tempProduct.SubCategory.String,
					Gender:       tempProduct.Gender,
					Color:        tempProduct.Color.String,
					PrimaryImage: tempProduct.PrimaryImage.String,
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
									0 as quantity,  // Указываем 0, так как этих размеров нет в product_sizes
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

			// Основной запрос к продуктам
			query := `
					SELECT 
							p.id, p.name, p.description, p.summary, 
							p.price, p.sku, p.color, p.gender,
							p.category_id, p.sub_category_id,
							c.name as category_name,
							sc.name as sub_category_name,
							(
									SELECT pi.image_path 
									FROM product_images pi 
									WHERE pi.product_id = p.id AND pi.is_primary = true
									LIMIT 1
							) as primary_image
					FROM product p
					LEFT JOIN category c ON p.category_id = c.id
					LEFT JOIN sub_category sc ON p.sub_category_id = sc.id
					ORDER BY p.created_at DESC
					LIMIT $1 OFFSET $2
			`

			rows, err := db.Query(query, limit, offset)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{
							"error": "Database query error",
							"details": err.Error(),
					})
					return
			}
			defer rows.Close()

			var products []gin.H
			for rows.Next() {
					var p struct {
							ID            int
							Name          string
							Description   string
							Summary       string
							Price        float64
							SKU          string
							Color        string
							Gender       string
							CategoryID   int
							SubCategoryID int
							CategoryName sql.NullString
							SubCategoryName sql.NullString
							PrimaryImage sql.NullString
					}

					err := rows.Scan(
							&p.ID, &p.Name, &p.Description, &p.Summary,
							&p.Price, &p.SKU, &p.Color, &p.Gender,
							&p.CategoryID, &p.SubCategoryID,
							&p.CategoryName, &p.SubCategoryName, &p.PrimaryImage,
					)
					if err != nil {
							continue 
					}

					product := gin.H{
							"id": p.ID,
							"name": p.Name,
							"description": p.Description,
							"summary": p.Summary,
							"price": p.Price,
							"sku": p.SKU,
							"color": p.Color,
							"gender": p.Gender,
							"category_id": p.CategoryID,
							"sub_category_id": p.SubCategoryID,
							"category": p.CategoryName.String,
							"sub_category": p.SubCategoryName.String,
							"primary_image": p.PrimaryImage.String,
					}

					products = append(products, product)
			}

			var total int
			countQuery := "SELECT COUNT(*) FROM product"
			err = db.QueryRow(countQuery).Scan(&total)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{
							"error": "Count query error",
							"details": err.Error(),
					})
					return
			}

			c.JSON(http.StatusOK, gin.H{
					"products": products,
					"pagination": gin.H{
							"total": total,
							"page": page,
							"limit": limit,
							"total_pages": int(math.Ceil(float64(total)/float64(limit))),
					},
			})
	}
}



// func GetProduct(db *sql.DB) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		productID := c.Param("id")

// 		query := `
//             SELECT id, name, description, summary, sub_category_id, color, size, 
//                    sku, price, quantity, image_path, created_at
//             FROM product
//             WHERE id = $1
//             LIMIT 1
//         `

// 		var product models.Product
// 		err := db.QueryRow(query, productID).Scan(
// 			&product.ID,
// 			&product.Name,
// 			&product.Description,
// 			&product.Summary,
// 			&product.SubCategoryID,
// 			&product.Color,
// 			&product.Size,
// 			&product.SKU,
// 			&product.Price,
// 			&product.Quantity,
// 			&product.ImagePath,
// 			&product.CreatedAt,
// 		)

// 		// Обработка ошибок
// 		if err != nil {
// 			if err == sql.ErrNoRows {
// 				c.JSON(http.StatusNotFound, gin.H{
// 					"error": fmt.Sprintf("Product with ID %s not found", productID),
// 				})
// 			} else {
// 				log.Printf("Error retrieving product: %v", err)
// 				c.JSON(http.StatusInternalServerError, gin.H{
// 					"error": "Internal server error",
// 				})
// 			}
// 			return
// 		}

// 		// Возвращаем найденный товар
// 		c.JSON(http.StatusOK, product)
// 	}
// }
