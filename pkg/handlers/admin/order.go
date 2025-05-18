package admin

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Order struct {
	ID            int     `json:"id"`
	UserID        int     `json:"user_id"`
	Total         float64 `json:"total"`
	PaymentStatus string  `json:"payment_status"`
	CreatedAt     string  `json:"created_at"`
}

type OrderItemDetail struct {
	ProductName     string  `json:"product_name"`
	SizeValue       string  `json:"size_value"`
	Quantity        int     `json:"quantity"`
	PriceAtPurchase float64 `json:"price_at_purchase"`
}

// GetOrders возвращает список заказов пользователя
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
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan order"})
				return
			}
			orders = append(orders, order)
		}

		c.JSON(http.StatusOK, gin.H{"orders": orders})
	}
}

// GetOrderDetails возвращает детали конкретного заказа
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

		// Получаем основную информацию о заказе
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
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			}
			return
		}

		// Получаем товары в заказе
		rows, err := db.Query(`
			SELECT 
				p.name as product_name,
				s.value as size_value,
				oi.quantity,
				oi.price_at_purchase
			FROM order_item oi
			JOIN product p ON oi.product_id = p.id
			JOIN sizes s ON oi.size_id = s.id
			WHERE oi.order_id = $1
		`, orderID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get order items"})
			return
		}
		defer rows.Close()

		var items []OrderItemDetail
		for rows.Next() {
			var item OrderItemDetail
			err := rows.Scan(
				&item.ProductName,
				&item.SizeValue,
				&item.Quantity,
				&item.PriceAtPurchase,
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan order item"})
				return
			}
			items = append(items, item)
		}

		// Получаем информацию о пользователе
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

// CancelOrder отменяет заказ
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

		// Проверяем статус заказа
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
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			}
			return
		}

		if paymentStatus == "completed" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot cancel already completed order"})
			return
		}

		// Получаем товары из заказа для возврата на склад
		rows, err := tx.Query(`
			SELECT product_id, size_id, quantity 
			FROM order_item 
			WHERE order_id = $1
		`, orderID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get order items"})
			return
		}
		defer rows.Close()

		for rows.Next() {
			var productID, sizeID, quantity int
			err := rows.Scan(&productID, &sizeID, &quantity)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan order item"})
				return
			}

			// Возвращаем товары на склад
			_, err = tx.Exec(`
				UPDATE product_sizes 
				SET quantity = quantity + $1 
				WHERE product_id = $2 AND size_id = $3
			`, quantity, productID, sizeID)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to return items to stock"})
				return
			}
		}

		// Обновляем статус заказа
		_, err = tx.Exec(`
			UPDATE orders 
			SET payment_status = 'refunded' 
			WHERE id = $1
		`, orderID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel order"})
			return
		}

		// Фиксируем транзакцию
		err = tx.Commit()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Order cancelled successfully"})
	}
}