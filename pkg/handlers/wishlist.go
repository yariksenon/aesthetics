package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type SizeResponse struct {
	ID       int    `json:"id"`
	Size     string `json:"size"`
	Quantity int    `json:"quantity"`
	Available bool  `json:"available"` // true, если quantity > 0
}

type ProductResponse struct {
	ID        int            `json:"id"`
	Name      string         `json:"name"`
	Price     float64        `json:"price"`
	ImagePath string         `json:"image_path"`
	Sizes     []SizeResponse `json:"sizes"` // Все размеры
	AvailableSizes []SizeResponse `json:"available_sizes"` // Только доступные
}

func GetWishlist(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
			userID, err := strconv.Atoi(c.Param("userId"))
			if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID пользователя"})
					return
			}

			// Основной запрос для получения товаров в вишлисте
			rows, err := db.Query(`
					SELECT 
							p.id,
							p.name,
							p.price,
							COALESCE(pi.image_path, '') as image_path
					FROM wishlist w
					JOIN product p ON w.product_id = p.id
					LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
					WHERE w.user_id = $1`, userID)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{
							"error": "Ошибка базы данных",
							"details": err.Error(),
					})
					return
			}
			defer rows.Close()

			var items []ProductResponse
			for rows.Next() {
					var item ProductResponse
					if err := rows.Scan(
							&item.ID,
							&item.Name,
							&item.Price,
							&item.ImagePath,
					); err != nil {
							c.JSON(http.StatusInternalServerError, gin.H{
									"error": "Ошибка обработки товара",
									"details": err.Error(),
							})
							return
					}

					// Запрос для получения размеров этого товара
					sizeRows, err := db.Query(`
							SELECT 
									s.id, 
									s.value, 
									COALESCE(ps.quantity, 0) as quantity
							FROM sizes s
							LEFT JOIN product_sizes ps ON s.id = ps.size_id AND ps.product_id = $1
							WHERE s.size_type_id = (SELECT size_type_id FROM product WHERE id = $1)
							ORDER BY s.id`, item.ID)
					if err != nil {
							c.JSON(http.StatusInternalServerError, gin.H{
									"error": "Ошибка при получении размеров",
									"details": err.Error(),
							})
							return
					}

					var allSizes []SizeResponse
					var availableSizes []SizeResponse
					
					for sizeRows.Next() {
							var size SizeResponse
							if err := sizeRows.Scan(
									&size.ID,
									&size.Size,
									&size.Quantity,
							); err != nil {
									sizeRows.Close()
									c.JSON(http.StatusInternalServerError, gin.H{
											"error": "Ошибка обработки размера",
											"details": err.Error(),
									})
									return
							}
							
							size.Available = size.Quantity > 0
							allSizes = append(allSizes, size)
							
							if size.Available {
									availableSizes = append(availableSizes, size)
							}
					}
					sizeRows.Close()

					item.Sizes = allSizes
					item.AvailableSizes = availableSizes
					items = append(items, item)
			}

			if err = rows.Err(); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{
							"error": "Ошибка обработки избранного",
							"details": err.Error(),
					})
					return
			}

			c.JSON(http.StatusOK, gin.H{"items": items})
	}
}

func AddToWishlist(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.Atoi(c.Param("userId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		productID, err := strconv.Atoi(c.Param("productId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
			return
		}

		// Проверяем существует ли продукт
		var exists bool
		err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM product WHERE id = $1)", productID).Scan(&exists)
		if err != nil || !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		// Проверяем нет ли уже товара в вишлисте
		err = db.QueryRow(
			"SELECT EXISTS(SELECT 1 FROM wishlist WHERE user_id = $1 AND product_id = $2)",
			userID, productID,
		).Scan(&exists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		if exists {
			c.JSON(http.StatusConflict, gin.H{"error": "Product already in wishlist"})
			return
		}

		_, err = db.Exec("INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)", userID, productID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add to wishlist: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Продукт добавлен в избранное"})
	}
}

func RemoveFromWishlist(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.Atoi(c.Param("userId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		productID, err := strconv.Atoi(c.Param("productId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
			return
		}

		result, err := db.Exec(
			"DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2",
			userID, productID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove from wishlist: " + err.Error()})
			return
		}

		rowsAffected, err := result.RowsAffected()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check deletion: " + err.Error()})
			return
		}

		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found in wishlist"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Продукт удалён с избарнного",
		})
	}
}