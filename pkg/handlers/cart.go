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
	ImagePath string  `json:"image_path"` // Изменили на обычную string
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
				// Корзина не существует - возвращаем пустой список
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

		// 2. Получаем товары в корзине с основным изображением
		rows, err := db.Query(`
			SELECT 
				ci.id,
				ci.product_id,
				p.name,
				p.price,
				ci.quantity,
				COALESCE(pi.image_path, '') as image_path
			FROM cart_item ci
			JOIN product p ON ci.product_id = p.id
			LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
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

		for rows.Next() {
			var item CartItemResponse
			err := rows.Scan(
				&item.ID,
				&item.ProductID,
				&item.Name,
				&item.Price,
				&item.Quantity,
				&item.ImagePath,
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка обработки товара",
					"details": err.Error(),
				})
				return
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

		c.JSON(http.StatusOK, gin.H{
			"items": items,
			"total": total,
		})
	}
}

type CartItemRequest struct {
	ProductID int `json:"product_id"`
	Quantity  int `json:"quantity"`
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

		// Добавляем или обновляем товар в корзине
		var existingQuantity int
		err = tx.QueryRow(
			"SELECT quantity FROM cart_item WHERE cart_id = $1 AND product_id = $2",
			cartID, itemReq.ProductID,
		).Scan(&existingQuantity)

		if err == nil {
			// Товар уже в корзине - обновляем количество
			_, err = tx.Exec(
				"UPDATE cart_item SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3",
				itemReq.Quantity, cartID, itemReq.ProductID,
			)
		} else if err == sql.ErrNoRows {
			// Товара нет в корзине - добавляем
			_, err = tx.Exec(
				"INSERT INTO cart_item (cart_id, product_id, quantity) VALUES ($1, $2, $3)",
				cartID, itemReq.ProductID, itemReq.Quantity,
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

		// Обновляем количество
		result, err := db.Exec(
			"UPDATE cart_item SET quantity = $1 WHERE cart_id = $2 AND product_id = $3",
			itemReq.Quantity, cartID, productID,
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

func RemoveCartProduct(db *sql.DB) gin.HandlerFunc {
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

		// Удаляем товар из корзины
		result, err := db.Exec(
			"DELETE FROM cart_item WHERE cart_id = $1 AND product_id = $2",
			cartID, productID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove item from cart"})
			return
		}

		rowsAffected, err := result.RowsAffected()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check deletion"})
			return
		}

		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found in cart"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Product removed from cart"})
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