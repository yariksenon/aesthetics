package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"log"

	"github.com/gin-gonic/gin"
)

type OrderItem struct {
	ProductID     int     `json:"product_id"`
	SizeID        int     `json:"size_id"`
	Quantity      int     `json:"quantity"`
	Price         float64 `json:"price"`
	ProductName   string  `json:"product_name"`
	SizeValue     string  `json:"size_value"`
	AvailableQty  int     `json:"available_qty"`
}

type OrderRequest struct {
	UserID int `json:"user_id" uri:"userId" binding:"required"`
}

func PostOrder(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
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

		// Получаем ID пользователя из параметров пути
		userID, err := strconv.Atoi(c.Param("userId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		// 1. Получаем последнюю корзину пользователя
		var cartID int
		err = tx.QueryRow(`
			SELECT id FROM cart 
			WHERE user_id = $1 
			ORDER BY created_at DESC 
			LIMIT 1
		`, userID).Scan(&cartID)

		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Cart not found for this user"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			}
			return
		}

		// 2. Получаем товары из корзины
		rows, err := tx.Query(`
			SELECT 
				ci.product_id, 
				ci.size_id, 
				ci.quantity as desired_quantity,
				p.price,
				p.name as product_name,
				s.value as size_value,
				COALESCE(ps.quantity, 0) as available_quantity
			FROM cart_item ci
			JOIN product p ON ci.product_id = p.id
			JOIN sizes s ON ci.size_id = s.id
			LEFT JOIN product_sizes ps ON ci.product_id = ps.product_id AND ci.size_id = ps.size_id
			WHERE ci.cart_id = $1
		`, cartID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cart items"})
			return
		}
		defer rows.Close()

		var items []OrderItem
		var stockErrors []string
		totalAmount := 0.0

		for rows.Next() {
			var item OrderItem
			err := rows.Scan(
				&item.ProductID,
				&item.SizeID,
				&item.Quantity,
				&item.Price,
				&item.ProductName,
				&item.SizeValue,
				&item.AvailableQty,
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan cart item"})
				return
			}

			// Проверяем доступность товара
			if item.AvailableQty == 0 {
				stockErrors = append(stockErrors, 
					fmt.Sprintf("Товар \"%s\" (размер %s) больше не доступен", 
						item.ProductName, item.SizeValue))
				continue
			}

			if item.Quantity > item.AvailableQty {
				stockErrors = append(stockErrors, 
					fmt.Sprintf("Для товара \"%s\" (размер %s) доступно только %d шт. (вы запросили %d)", 
						item.ProductName, item.SizeValue, item.AvailableQty, item.Quantity))
				continue
			}

			items = append(items, item)
			totalAmount += item.Price * float64(item.Quantity)
		}

		if len(stockErrors) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"errors": stockErrors})
			return
		}

		if len(items) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No valid items in cart"})
			return
		}

		// 3. Создаем заказ
		var orderID int
		err = tx.QueryRow(`
			INSERT INTO orders (user_id, total, payment_provider, payment_status)
			VALUES ($1, $2, 'online', 'pending')
			RETURNING id
		`, userID, totalAmount).Scan(&orderID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
			return
		}

		// 4. Добавляем товары в заказ и обновляем остатки
		for _, item := range items {
			// Добавляем товар в заказ
			_, err = tx.Exec(`
				INSERT INTO order_item (order_id, product_id, size_id, quantity, price_at_purchase)
				VALUES ($1, $2, $3, $4, $5)
			`, orderID, item.ProductID, item.SizeID, item.Quantity, item.Price)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add item to order"})
				return
			}

			// Обновляем остатки
			_, err = tx.Exec(`
				UPDATE product_sizes
				SET quantity = quantity - $1
				WHERE product_id = $2 AND size_id = $3
			`, item.Quantity, item.ProductID, item.SizeID)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product stock"})
				return
			}
		}

		// 5. Очищаем корзину
		_, err = tx.Exec("DELETE FROM cart_item WHERE cart_id = $1", cartID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart items"})
			return
		}

		_, err = tx.Exec("DELETE FROM cart WHERE id = $1", cartID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete cart"})
			return
		}

		// Фиксируем транзакцию
		err = tx.Commit()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"order_id":    orderID,
			"total":       totalAmount,
			"items_count": len(items),
			"message":     "Order created successfully",
		})
	}
}



type Order struct {
	ID            int     `json:"id"`
	UserID        int     `json:"user_id"`
	Total         float64 `json:"total"`
	PaymentStatus string  `json:"payment_status"`
	CreatedAt     string  `json:"created_at"`
}

type OrderItemDetail struct {
	ProductName     string  `json:"product_name"`
	PhotoURL        string  `json:"photo_url"`
	SizeValue       string  `json:"size_value"`
	Quantity        int     `json:"quantity"`
	PriceAtPurchase float64 `json:"price_at_purchase"`
}

// GetOrders returns a list of a user's orders
func GetOrders(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.Atoi(c.Param("userId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		rows, err := db.Query(`
			SELECT 
				id, 
				user_id, 
				total, 
				payment_status, 
				created_at 
			FROM orders 
			WHERE user_id = $1 
			ORDER BY created_at DESC
		`, userID)
		if err != nil {
			log.Printf("Database error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		defer rows.Close()

		var orders []Order
		for rows.Next() {
			var order Order
			err := rows.Scan(
				&order.ID,
				&order.UserID,
				&order.Total,
				&order.PaymentStatus,
				&order.CreatedAt,
			)
			if err != nil {
				log.Printf("Failed to scan order: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan order"})
				return
			}
			orders = append(orders, order)
		}

		c.JSON(http.StatusOK, gin.H{"orders": orders})
	}
}

// GetOrderDetails returns details for a specific order, including product photos
func GetOrderDetails(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.Atoi(c.Param("userId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		orderID, err := strconv.Atoi(c.Param("orderId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
			return
		}

		// Fetch order info
		var order Order
		err = db.QueryRow(`
			SELECT 
				id, 
				user_id, 
				total, 
				payment_status, 
				created_at 
			FROM orders 
			WHERE id = $1 AND user_id = $2
		`, orderID, userID).Scan(
			&order.ID,
			&order.UserID,
			&order.Total,
			&order.PaymentStatus,
			&order.CreatedAt,
		)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			} else {
				log.Printf("Database error fetching order: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			}
			return
		}

		// Fetch order items with primary product image
		rows, err := db.Query(`
			SELECT 
				p.name AS product_name,
				pi.image_path AS photo_url,
				s.value AS size_value,
				oi.quantity,
				oi.price_at_purchase
			FROM order_item oi
			JOIN product p ON oi.product_id = p.id
			JOIN sizes s ON oi.size_id = s.id
			LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
			WHERE oi.order_id = $1
		`, orderID)
		if err != nil {
			log.Printf("Failed to get order items: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get order items"})
			return
		}
		defer rows.Close()

		var items []OrderItemDetail
		for rows.Next() {
			var item OrderItemDetail
			var photoURL sql.NullString
			err := rows.Scan(
				&item.ProductName,
				&photoURL,
				&item.SizeValue,
				&item.Quantity,
				&item.PriceAtPurchase,
			)
			if err != nil {
				log.Printf("Failed to scan order item: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan order item"})
				return
			}
			item.PhotoURL = photoURL.String
			items = append(items, item)
		}

		if err = rows.Err(); err != nil {
			log.Printf("Row iteration error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Row iteration error"})
			return
		}

		// Fetch user info
		var user struct {
			FirstName string `json:"first_name"`
			LastName  string `json:"last_name"`
			Email     string `json:"email"`
			Phone     string `json:"phone"`
		}
		err = db.QueryRow(`
			SELECT first_name, last_name, email, phone 
			FROM users 
			WHERE id = $1
		`, userID).Scan(
			&user.FirstName,
			&user.LastName,
			&user.Email,
			&user.Phone,
		)
		if err != nil {
			log.Printf("Failed to get user info: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"order":      order,
			"items":      items,
			"user":       user,
			"order_date": order.CreatedAt,
		})
	}
}

// CancelOrder cancels an order and returns items to stock
func CancelOrder(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, err := strconv.Atoi(c.Param("userId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		orderID, err := strconv.Atoi(c.Param("orderId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
			return
		}

		// Start transaction
		tx, err := db.Begin()
		if err != nil {
			log.Printf("Failed to start transaction: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
			return
		}
		defer func() {
			if err != nil {
				tx.Rollback()
			}
		}()

		// Check order status
		var paymentStatus string
		err = tx.QueryRow(`
			SELECT payment_status 
			FROM orders 
			WHERE id = $1 AND user_id = $2
		`, orderID, userID).Scan(&paymentStatus)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			} else {
				log.Printf("Database error checking order status: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			}
			return
		}

		if paymentStatus == "completed" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot cancel already completed order"})
			return
		}
		if paymentStatus == "refunded" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Order already cancelled"})
			return
		}

		// Fetch order items to return to stock
		rows, err := tx.Query(`
			SELECT product_id, size_id, quantity 
			FROM order_item 
			WHERE order_id = $1
		`, orderID)
		if err != nil {
			log.Printf("Failed to get order items: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get order items"})
			return
		}
		defer rows.Close()

		for rows.Next() {
			var productID, sizeID, quantity int
			err := rows.Scan(&productID, &sizeID, &quantity)
			if err != nil {
				log.Printf("Failed to scan order item: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan order item"})
				return
			}

			// Return items to stock
			_, err = tx.Exec(`
				UPDATE product_sizes 
				SET quantity = quantity + $1 
				WHERE product_id = $2 AND size_id = $3
			`, quantity, productID, sizeID)
			if err != nil {
				log.Printf("Failed to return items to stock: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to return items to stock"})
				return
			}
		}

		// Update order status
		_, err = tx.Exec(`
			UPDATE orders 
			SET payment_status = 'refunded' 
			WHERE id = $1
		`, orderID)
		if err != nil {
			log.Printf("Failed to cancel order: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel order"})
			return
		}

		// Commit transaction
		err = tx.Commit()
		if err != nil {
			log.Printf("Failed to commit transaction: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Order cancelled successfully"})
	}
}