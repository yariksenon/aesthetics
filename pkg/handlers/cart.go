package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CartItemResponse struct {
	ID        int     `json:"id"`
	ProductID int     `json:"product_id"`
	Name      string  `json:"name"`
	Price     float64 `json:"price"`
	Quantity  int     `json:"quantity"`
	ImagePath string  `json:"image_path"`
	SizeID    int     `json:"size_id"` 
	Size      string  `json:"size"`    
}

func GetCart(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
			userID, err := strconv.Atoi(c.Param("userId"))
			if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID пользователя"})
					return
			}

			// 1. Получаем cart_id для пользователя
			var cartID int
			err = db.QueryRow("SELECT id FROM cart WHERE user_id = $1", userID).Scan(&cartID)
			if err != nil {
					if err == sql.ErrNoRows {
							c.JSON(http.StatusOK, gin.H{
									"items": []CartItemResponse{},
									"total": 0,
							})
							return
					}
					c.JSON(http.StatusInternalServerError, gin.H{
							"error": "Ошибка базы данных",
							"details": err.Error(),
					})
					return
			}

			// 2. Получаем товары в корзине с информацией о доступном количестве
			rows, err := db.Query(`
					SELECT 
							ci.id,
							ci.product_id,
							p.name,
							p.price,
							ci.quantity,
							COALESCE(pi.image_path, '') as image_path,
							ci.size_id,
							COALESCE(s.value, '') as size,
							COALESCE(ps.quantity, 0) as available_quantity
					FROM cart_item ci
					JOIN product p ON ci.product_id = p.id
					LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
					LEFT JOIN sizes s ON ci.size_id = s.id
					LEFT JOIN product_sizes ps ON p.id = ps.product_id AND s.id = ps.size_id
					WHERE ci.cart_id = $1`, cartID)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{
							"error": "Ошибка при получении товаров",
							"details": err.Error(),
					})
					return
			}
			defer rows.Close()

			var items []CartItemResponse
			var total float64
			var hasExceededItems bool

			for rows.Next() {
					var item CartItemResponse
					var availableQuantity int
					
					err := rows.Scan(
							&item.ID,
							&item.ProductID,
							&item.Name,
							&item.Price,
							&item.Quantity,
							&item.ImagePath,
							&item.SizeID,
							&item.Size,
							&availableQuantity,
					)
					if err != nil {
							c.JSON(http.StatusInternalServerError, gin.H{
									"error": "Ошибка обработки товара",
									"details": err.Error(),
							})
							return
					}

					// Проверяем доступное количество
					if item.Quantity > availableQuantity {
							item.Quantity = availableQuantity
							hasExceededItems = true
							
							_, err = db.Exec("UPDATE cart_item SET quantity = $1 WHERE id = $2", 
									availableQuantity, item.ID)
							if err != nil {
									c.JSON(http.StatusInternalServerError, gin.H{
											"error": "Ошибка при обновлении количества товара",
											"details": err.Error(),
									})
									return
							}
					}

					items = append(items, item)
					total += item.Price * float64(item.Quantity)
			}

			if err = rows.Err(); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{
							"error": "Ошибка при обработке результатов",
							"details": err.Error(),
					})
					return
			}

			if hasExceededItems {
					c.JSON(http.StatusOK, gin.H{
							"items": items,
							"total": total,
							"warning": "Количество некоторых товаров было уменьшено до доступного количества",
					})
					return
			}

			c.JSON(http.StatusOK, gin.H{
					"items": items,
					"total": total,
			})
	}
}

type CartItemRequest struct {
	ProductID int `json:"product_id"`
	Quantity  int `json:"quantity"`
	SizeID    int `json:"size_id"` // Поле для size_id
}

func AddCartProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
			userID, err := strconv.Atoi(c.Param("userId"))
			if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
					return
			}

			var itemReq CartItemRequest
			if err := c.ShouldBindJSON(&itemReq); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
					return
			}

			// Валидация
			if itemReq.ProductID <= 0 {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
					return
			}
			if itemReq.Quantity <= 0 {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Quantity must be positive"})
					return
			}
			if itemReq.SizeID <= 0 {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid size ID"})
					return
			}

			tx, err := db.Begin()
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
					return
			}
			defer tx.Rollback()

			// Получаем или создаем корзину
			var cartID int
			err = tx.QueryRow("SELECT id FROM cart WHERE user_id = $1 FOR UPDATE", userID).Scan(&cartID)
			if err == sql.ErrNoRows {
					err = tx.QueryRow("INSERT INTO cart (user_id) VALUES ($1) RETURNING id", userID).Scan(&cartID)
					if err != nil {
							c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cart"})
							return
					}
			} else if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cart"})
					return
			}

			// Проверяем существование товара
			var productExists bool
			err = tx.QueryRow("SELECT EXISTS(SELECT 1 FROM product WHERE id = $1)", itemReq.ProductID).Scan(&productExists)
			if err != nil || !productExists {
					c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
					return
			}

			// Проверяем существование размера для товара
			var sizeExists bool
			err = tx.QueryRow(
					"SELECT EXISTS(SELECT 1 FROM product_sizes WHERE product_id = $1 AND size_id = $2)",
					itemReq.ProductID, itemReq.SizeID,
			).Scan(&sizeExists)
			if err != nil || !sizeExists {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Size not available for this product"})
					return
			}

			// Добавляем или обновляем товар в корзине
			var existingQuantity int
			err = tx.QueryRow(
					"SELECT quantity FROM cart_item WHERE cart_id = $1 AND product_id = $2 AND size_id = $3",
					cartID, itemReq.ProductID, itemReq.SizeID,
			).Scan(&existingQuantity)

			if err == nil {
					// Товар с этим size_id уже в корзине - обновляем количество
					_, err = tx.Exec(
							"UPDATE cart_item SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3 AND size_id = $4",
							itemReq.Quantity, cartID, itemReq.ProductID, itemReq.SizeID,
					)
			} else if err == sql.ErrNoRows {
					// Товара с этим size_id нет в корзине - добавляем
					_, err = tx.Exec(
							"INSERT INTO cart_item (cart_id, product_id, quantity, size_id) VALUES ($1, $2, $3, $4)",
							cartID, itemReq.ProductID, itemReq.Quantity, itemReq.SizeID,
					)
			} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check cart item"})
					return
			}

			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart"})
					return
			}

			if err := tx.Commit(); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
					return
			}

			c.JSON(http.StatusOK, gin.H{"message": "Product added to cart"})
	}
}

func UpdateCartProduct(db *sql.DB) gin.HandlerFunc {
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

			var itemReq CartItemRequest
			if err := c.ShouldBindJSON(&itemReq); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
					return
			}

			if itemReq.Quantity <= 0 {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Quantity must be positive"})
					return
			}
			if itemReq.SizeID <= 0 {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid size ID"})
					return
			}

			// Получаем cart_id пользователя
			var cartID int
			err = db.QueryRow("SELECT id FROM cart WHERE user_id = $1", userID).Scan(&cartID)
			if err != nil {
					if err == sql.ErrNoRows {
							c.JSON(http.StatusNotFound, gin.H{"error": "Cart not found"})
							return
					}
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
					return
			}

			// Получаем актуальное количество товара в базе
			var availableQuantity int
			err = db.QueryRow("SELECT quantity FROM product_sizes WHERE product_id = $1 AND size_id = $2",
					productID, itemReq.SizeID).Scan(&availableQuantity)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get available quantity"})
					return
			}

			// Проверяем, можно ли установить запрошенное количество
			if itemReq.Quantity > availableQuantity {
					c.JSON(http.StatusBadRequest, gin.H{
							"error":   "Not enough stock available",
							"max_qty": availableQuantity,
					})
					return
			}

			// Обновляем количество
			result, err := db.Exec(
					"UPDATE cart_item SET quantity = $1 WHERE cart_id = $2 AND product_id = $3 AND size_id = $4",
					itemReq.Quantity, cartID, productID, itemReq.SizeID,
			)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart item"})
					return
			}

			rowsAffected, err := result.RowsAffected()
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check update"})
					return
			}

			if rowsAffected == 0 {
					c.JSON(http.StatusNotFound, gin.H{"error": "Product not found in cart"})
					return
			}

			c.JSON(http.StatusOK, gin.H{"message": "Cart item updated"})
	}
}


func ClearCart(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.Atoi(c.Param("userId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		// Получаем cart_id пользователя
		var cartID int
		err = db.QueryRow("SELECT id FROM cart WHERE user_id = $1", userID).Scan(&cartID)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusOK, gin.H{"message": "Cart is already empty"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}

		// Очищаем корзину
		_, err = db.Exec("DELETE FROM cart_item WHERE cart_id = $1", cartID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Cart cleared"})
	}
}