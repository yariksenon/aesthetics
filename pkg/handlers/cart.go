package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"aesthetics/models"

	"github.com/gin-gonic/gin"
)

type CartItemRequest struct {
	ProductID int `json:"product_id"`
	Quantity  int `json:"quantity"`
}

type Cart struct {
	ID     int
	UserID int
}

type CartItem struct {
	ID        int
	CartID    int
	ProductID int
	Quantity  int
}

func AddCartProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Проверяем userID из URL
		userID, err := strconv.Atoi(c.Param("userId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		// 2. Проверяем Content-Type
		if c.GetHeader("Content-Type") != "application/json" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Content-Type must be application/json"})
			return
		}

		// 3. Парсим тело запроса
		var itemReq CartItemRequest
		if err := c.ShouldBindJSON(&itemReq); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		// 4. Валидация данных
		if itemReq.ProductID <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ProductID must be positive"})
			return
		}
		if itemReq.Quantity <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Quantity must be positive"})
			return
		}

		// 5. Проверяем существование пользователя
		var userExists bool
		err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)", userID).Scan(&userExists)
		if err != nil || !userExists {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		// 6. Проверяем существование товара
		var productExists bool
		err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM product WHERE id = $1)", itemReq.ProductID).Scan(&productExists)
		if err != nil || !productExists {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}

		// 7. Начинаем транзакцию
		tx, err := db.Begin()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
			return
		}
		defer tx.Rollback() // Откатываем в случае ошибки

		// 8. Получаем или создаем корзину
		var cartID int
		err = tx.QueryRow("SELECT id FROM cart WHERE user_id = $1 FOR UPDATE", userID).Scan(&cartID)
		if err == sql.ErrNoRows {
			err = tx.QueryRow("INSERT INTO cart (user_id) VALUES ($1) RETURNING id", userID).Scan(&cartID)
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get/create cart: " + err.Error()})
			return
		}

		// 9. Добавляем/обновляем товар в корзине
		var existingID, existingQty int
		err = tx.QueryRow(
			"SELECT id, quantity FROM cart_item WHERE cart_id = $1 AND product_id = $2",
			cartID, itemReq.ProductID,
		).Scan(&existingID, &existingQty)

		if err == nil {
			// Товар уже в корзине - обновляем количество
			_, err = tx.Exec(
				"UPDATE cart_item SET quantity = quantity + $1 WHERE id = $2",
				itemReq.Quantity, existingID,
			)
		} else if err == sql.ErrNoRows {
			// Товара нет в корзине - добавляем
			_, err = tx.Exec(
				"INSERT INTO cart_item (cart_id, product_id, quantity) VALUES ($1, $2, $3)",
				cartID, itemReq.ProductID, itemReq.Quantity,
			)
		}

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart: " + err.Error()})
			return
		}

		// 10. Фиксируем транзакцию
		if err := tx.Commit(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction: " + err.Error()})
			return
		}

		// 11. Возвращаем успешный ответ
		c.JSON(http.StatusCreated, gin.H{
			"message": "Product added to cart",
			"cart_id": cartID,
		})
	}
}

// //////////////////
type CartItemResponse struct {
	ID        int     `json:"id"`
	ProductID int     `json:"product_id"`
	Name      string  `json:"name"`
	Price     float64 `json:"price"`
	Quantity  int     `json:"quantity"`
	ImagePath string  `json:"image_path"`
}

func GetCart(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.Atoi(c.Param("userId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		// Получаем товары корзины с информацией о продуктах
		rows, err := db.Query(`
			SELECT 
				ci.id,
				ci.product_id,
				p.name,
				p.price,
				ci.quantity,
				p.image_path
			FROM cart_items ci
			JOIN products p ON ci.product_id = p.id
			WHERE ci.cart_id = (
				SELECT id FROM cart WHERE user_id = $1
			)`, userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var items []CartItemResponse
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
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			items = append(items, item)
		}

		c.JSON(http.StatusOK, gin.H{
			"items": items,
			"total": calculateTotal(items),
		})
	}
}

func calculateTotal(items []CartItemResponse) float64 {
	var total float64
	for _, item := range items {
		total += item.Price * float64(item.Quantity)
	}
	return total
}

func UpdateCartProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.Atoi(c.Param("userId"))
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid user ID"})
			return
		}

		productID, err := strconv.Atoi(c.Param("productId"))
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid product ID"})
			return
		}

		var item models.CartItem
		if err := c.ShouldBindJSON(&item); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		cart, err := getUserCart(db, userID)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		_, err = db.Exec("UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?",
			item.Quantity, cart.ID, productID)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"message": "Cart item updated"})
	}
}

func RemoveCartProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.Atoi(c.Param("userId"))
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid user ID"})
			return
		}

		productID, err := strconv.Atoi(c.Param("productId"))
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid product ID"})
			return
		}

		cart, err := getUserCart(db, userID)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		_, err = db.Exec("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
			cart.ID, productID)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"message": "Product removed from cart"})
	}
}

func ClearCart(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.Atoi(c.Param("userId"))
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid user ID"})
			return
		}

		cart, err := getUserCart(db, userID)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		_, err = db.Exec("DELETE FROM cart_items WHERE cart_id = ?", cart.ID)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		c.JSON(200, gin.H{"message": "Cart cleared"})
	}
}

// Вспомогательные функции остаются без изменений

// Вспомогательные функции

func getUserCart(db *sql.DB, userID int) (*models.Cart, error) {
	cart := &models.Cart{}
	err := db.QueryRow("SELECT id, user_id FROM carts WHERE user_id = ?", userID).
		Scan(&cart.ID, &cart.UserID)
	return cart, err
}

func getOrCreateUserCart(db *sql.DB, userID int) (*models.Cart, error) {
	cart, err := getUserCart(db, userID)
	if err == sql.ErrNoRows {
		// Создаем новую корзину, если не найдена
		res, err := db.Exec("INSERT INTO carts (user_id) VALUES (?)", userID)
		if err != nil {
			return nil, err
		}
		id, err := res.LastInsertId()
		if err != nil {
			return nil, err
		}
		return &models.Cart{ID: int(id), UserID: userID}, nil
	}
	return cart, err
}

func getCartItems(db *sql.DB, cartID int) ([]models.CartItem, error) {
	rows, err := db.Query("SELECT id, cart_id, product_id, quantity FROM cart_items WHERE cart_id = ?", cartID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.CartItem
	for rows.Next() {
		var item models.CartItem
		if err := rows.Scan(&item.ID, &item.CartID, &item.ProductID, &item.Quantity); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

func getCartItemByProduct(db *sql.DB, cartID, productID int) (*models.CartItem, error) {
	item := &models.CartItem{}
	err := db.QueryRow("SELECT id, cart_id, product_id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?",
		cartID, productID).
		Scan(&item.ID, &item.CartID, &item.ProductID, &item.Quantity)
	if err != nil {
		return nil, err
	}
	return item, nil
}
