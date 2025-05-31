package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"
	"log"

	"github.com/gin-gonic/gin"
)

type BrandRequest struct {
	Name        string `json:"name" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Description string `json:"description"`
	Website     string `json:"website"`
	UserId      int    `json:"userId" binding:"required"`
}

func PostBrand(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req BrandRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Проверяем существующую заявку (только pending или approved)
		var existingStatus string
		err := db.QueryRow(
			"SELECT status FROM brand WHERE user_id = $1",
			req.UserId,
		).Scan(&existingStatus)

		if err == nil {
			// Заявка существует
			if existingStatus == "pending" || existingStatus == "approved" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Brand application already exists for this user"})
				return
			}
			// Если статус rejected, направляем на использование /resubmit
			c.JSON(http.StatusBadRequest, gin.H{"error": "Existing application is rejected. Please use resubmit endpoint."})
			return
		} else if err != sql.ErrNoRows {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check existing application"})
			return
		}

		// Создаём новую заявку
		var id int
		var createdAt, updatedAt string
		err = db.QueryRow(`
			INSERT INTO brand (name, email, description, website, status, user_id, created_at, updated_at)
			VALUES ($1, $2, $3, $4, 'pending', $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
			RETURNING id, created_at, updated_at
		`, req.Name, req.Email, req.Description, req.Website, req.UserId).Scan(&id, &createdAt, &updatedAt)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create brand"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Заявка на становление брендом успешно отправленна",
			"brand": map[string]interface{}{
				"id":          id,
				"user_id":     req.UserId,
				"name":        req.Name,
				"email":       req.Email,
				"description": req.Description,
				"website":     req.Website,
				"status":      "pending",
				"created_at":  createdAt,
				"updated_at":  updatedAt,
			},
		})
	}
}

func CheckBrandApplication(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIdStr := c.Query("userId")
		userId, err := strconv.Atoi(userIdStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		var brand struct {
			ID          int    `json:"id"`
			Name        string `json:"name"`
			Email       string `json:"email"`
			Description string `json:"description"`
			Website     string `json:"website"`
			Status      string `json:"status"`
			CreatedAt   string `json:"created_at"`
			UpdatedAt   string `json:"updated_at"`
		}

		err = db.QueryRow(`
			SELECT id, name, email, description, website, status, created_at, updated_at
			FROM brand 
			WHERE user_id = $1
		`, userId).Scan(
			&brand.ID, &brand.Name, &brand.Email, &brand.Description, &brand.Website,
			&brand.Status, &brand.CreatedAt, &brand.UpdatedAt,
		)

		if err == sql.ErrNoRows {
			c.JSON(http.StatusOK, gin.H{"exists": false})
			return
		} else if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"exists": true,
			"brand":  brand,
		})
	}
}


func ResubmitBrand(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
			id := c.Param("id")
			
			// Получаем данные из тела запроса
			var requestData struct {
					Name        string `json:"name"`
					Email       string `json:"email"`
					Website     string `json:"website"`
					Description string `json:"description"`
			}
			
			if err := c.ShouldBindJSON(&requestData); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
					return
			}

			// Обновляем запись в базе данных
			result, err := db.Exec(`
					UPDATE brand 
					SET 
							name = $1,
							email = $2,
							website = $3,
							description = $4,
							status = 'pending',
							updated_at = CURRENT_TIMESTAMP
					WHERE id = $5`,
					requestData.Name,
					requestData.Email,
					requestData.Website,
					requestData.Description,
					id,
			)

			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обновлении заявки бренда: " + err.Error()})
					return
			}

			rowsAffected, err := result.RowsAffected()
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при проверке обновления"})
					return
			}

			if rowsAffected == 0 {
					c.JSON(http.StatusNotFound, gin.H{"error": "Бренд не найден"})
					return
			}

			// Получаем обновленные данные бренда для ответа
			var brandID, userID int
			var name, email, description, website, status, createdAt, updatedAt string

			err = db.QueryRow(`
					SELECT id, user_id, name, email, description, website, status, created_at, updated_at 
					FROM brand 
					WHERE id = $1`, id).Scan(
					&brandID, &userID, &name, &email, &description, &website, &status, &createdAt, &updatedAt)

			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении обновленных данных бренда"})
					return
			}

			c.JSON(http.StatusOK, gin.H{
					"message": "Заявка бренда успешно обновлена и отправлена на повторное рассмотрение!",
					"brand": map[string]interface{}{
							"id":          brandID,
							"user_id":     userID,
							"name":        name,
							"email":       email,
							"description": description,
							"website":     website,
							"status":     status,
							"created_at":  createdAt,
							"updated_at":  updatedAt,
					},
			})
	}
}

func GetBrandProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Извлекаем brandId из параметров URL
		brandId := c.Param("brandId")
		
		// Запрос для получения товаров бренда
		productsQuery := `
			SELECT 
				p.id, p.name, p.description, p.summary, 
				p.category_id, p.sub_category_id, p.color, 
				p.sku, p.price, p.gender, p.brand_id, 
				p.size_type_id, p.created_at, st.name as size_type_name
			FROM product p
			JOIN size_types st ON p.size_type_id = st.id
			WHERE p.brand_id = $1
		`
		
		rows, err := db.Query(productsQuery, brandId)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query products"})
			return
		}
		defer rows.Close()
		
		// Создаем слайс для хранения результатов
		var products []map[string]interface{}
		
		// Итерируем по товарам
		for rows.Next() {
			var (
				id              int
				name            string
				description     string
				summary         string
				categoryId      int
				subCategoryId   int
				color           string
				sku             string
				price           float64
				gender          string
				brandId         int
				sizeTypeId      int
				createdAt       time.Time
				sizeTypeName    string
			)
			
			err := rows.Scan(&id, &name, &description, &summary, &categoryId, &subCategoryId, 
				&color, &sku, &price, &gender, &brandId, &sizeTypeId, &createdAt, &sizeTypeName)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan product row"})
				return
			}
			
			// Запрос для получения изображений товара
			imagesQuery := `
				SELECT image_path, is_primary, alt_text, display_order
				FROM product_images
				WHERE product_id = $1
				ORDER BY display_order
			`
			
			imageRows, err := db.Query(imagesQuery, id)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query product images"})
				return
			}
			
			var images []map[string]interface{}
			for imageRows.Next() {
				var (
					imagePath    string
					isPrimary   bool
					altText     string
					displayOrder int
				)
				
				err := imageRows.Scan(&imagePath, &isPrimary, &altText, &displayOrder)
				if err != nil {
					imageRows.Close()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan image row"})
					return
				}
				
				images = append(images, map[string]interface{}{
					"image_path":    imagePath,
					"is_primary":    isPrimary,
					"alt_text":      altText,
					"display_order": displayOrder,
				})
			}
			imageRows.Close()
			
			if err = imageRows.Err(); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error during image rows iteration"})
				return
			}
			
			// Запрос для получения доступных размеров
			sizesQuery := `
				SELECT id, value, description
				FROM sizes
				WHERE size_type_id = $1
				ORDER BY value
			`
			
			sizeRows, err := db.Query(sizesQuery, sizeTypeId)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query product sizes"})
				return
			}
			
			var sizes []map[string]interface{}
			for sizeRows.Next() {
				var (
					sizeId       int
					value        string
					sizeDescription string
				)
				
				err := sizeRows.Scan(&sizeId, &value, &sizeDescription)
				if err != nil {
					sizeRows.Close()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan size row"})
					return
				}
				
				sizes = append(sizes, map[string]interface{}{
					"id":          sizeId,
					"value":       value,
					"description": sizeDescription,
				})
			}
			sizeRows.Close()
			
			if err = sizeRows.Err(); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error during size rows iteration"})
				return
			}
			
			// Создаем map для продукта с изображениями и размерами
			product := map[string]interface{}{
				"id":              id,
				"name":            name,
				"description":     description,
				"summary":         summary,
				"category_id":     categoryId,
				"sub_category_id": subCategoryId,
				"color":           color,
				"sku":             sku,
				"price":           price,
				"gender":          gender,
				"brand_id":        brandId,
				"size_type": map[string]interface{}{
					"id":          sizeTypeId,
					"name":        sizeTypeName,
					"sizes":       sizes,
				},
				"created_at":      createdAt,
				"images":          images,
			}
			
			products = append(products, product)
		}
		
		if err = rows.Err(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error during product rows iteration"})
			return
		}
		
		c.JSON(http.StatusOK, gin.H{"products": products})
	}
}

func DeleteProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Получаем ID товара из параметров URL
		productID := c.Param("id")
		
		// Начинаем транзакцию
		tx, err := db.Begin()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
			return
		}
		
		// 1. Удаляем связанные изображения
		_, err = tx.Exec("DELETE FROM product_images WHERE product_id = $1", productID)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product images"})
			return
		}
		
		// 2. Удаляем сам товар
		result, err := tx.Exec("DELETE FROM product WHERE id = $1", productID)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
			return
		}
		
		// Проверяем, был ли удален хотя бы один товар
		rowsAffected, err := result.RowsAffected()
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check rows affected"})
			return
		}
		
		if rowsAffected == 0 {
			tx.Rollback()
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		
		// Коммитим транзакцию
		err = tx.Commit()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
			return
		}
		
		c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
	}
}


func GetSalesStatistics(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Extract brandId from URL parameters
        brandId := c.Param("brandId")

        // Query for sales statistics, split by status
        statsQuery := `
            SELECT 
                o.status,
                COUNT(DISTINCT o.id) as total_orders,
                COALESCE(SUM(oi.quantity), 0) as total_items,
                COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as total_revenue
            FROM orders o
            JOIN order_item oi ON o.id = oi.order_id
            JOIN product p ON oi.product_id = p.id
            WHERE p.brand_id = $1
            AND o.status IN ('завершено', 'отменён')
            GROUP BY o.status
        `

        rows, err := db.Query(statsQuery, brandId)
        if err != nil {
            log.Printf("Failed to query statistics for brand %s: %v", brandId, err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query statistics"})
            return
        }
        defer rows.Close()

        var completedStats, canceledStats struct {
            TotalOrders   int64   `json:"total_orders"`
            TotalItems    int64   `json:"total_items"`
            TotalRevenue  float64 `json:"total_revenue"`
        }

        for rows.Next() {
            var (
                status        string
                totalOrders   int64
                totalItems    int64
                totalRevenue  float64
            )
            err := rows.Scan(&status, &totalOrders, &totalItems, &totalRevenue)
            if err != nil {
                log.Printf("Failed to scan stats row for brand %s: %v", brandId, err)
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan stats row"})
                return
            }
            if status == "завершено" {
                completedStats.TotalOrders = totalOrders
                completedStats.TotalItems = totalItems
                completedStats.TotalRevenue = totalRevenue
            } else if status == "отменён" {
                canceledStats.TotalOrders = totalOrders
                canceledStats.TotalItems = totalItems
                canceledStats.TotalRevenue = totalRevenue
            }
        }

        if err = rows.Err(); err != nil {
            log.Printf("Error during stats rows iteration for brand %s: %v", brandId, err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Error during stats iteration"})
            return
        }

        // Query for top-selling products (only for completed orders)
        topProductsQuery := `
            SELECT 
                p.id, 
                p.name,
                p.sku,
                COALESCE(SUM(oi.quantity), 0) as units_sold,
                COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as product_revenue
            FROM order_item oi
            JOIN product p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE p.brand_id = $1
            AND o.status = 'завершено'
            GROUP BY p.id, p.name, p.sku
            ORDER BY units_sold DESC
            LIMIT 5
        `

        rows, err = db.Query(topProductsQuery, brandId)
        if err != nil {
            log.Printf("Failed to query top products for brand %s: %v", brandId, err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query top products"})
            return
        }
        defer rows.Close()

        var topProducts []map[string]interface{}
        for rows.Next() {
            var (
                productId      int
                name           string
                sku            string
                unitsSold      int64
                productRevenue float64
            )

            err := rows.Scan(&productId, &name, &sku, &unitsSold, &productRevenue)
            if err != nil {
                log.Printf("Failed to scan top product row for brand %s: %v", brandId, err)
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan top product row"})
                return
            }

            topProducts = append(topProducts, map[string]interface{}{
                "product_id":      productId,
                "name":            name,
                "sku":             sku,
                "units_sold":      unitsSold,
                "product_revenue": productRevenue,
            })
        }

        if err = rows.Err(); err != nil {
            log.Printf("Error during top products iteration for brand %s: %v", brandId, err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Error during top products iteration"})
            return
        }

        // Prepare response
        response := map[string]interface{}{
            "brand_id": brandId,
            "completed": map[string]interface{}{
                "total_orders": completedStats.TotalOrders,
                "total_items":  completedStats.TotalItems,
                "total_revenue": completedStats.TotalRevenue,
            },
            "canceled": map[string]interface{}{
                "total_orders": canceledStats.TotalOrders,
                "total_items":  canceledStats.TotalItems,
                "total_revenue": canceledStats.TotalRevenue,
            },
            "top_products": topProducts,
        }

        c.JSON(http.StatusOK, response)
    }
}