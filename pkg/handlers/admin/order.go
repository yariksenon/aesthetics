package admin

import (
	"database/sql"
	"net/http"
	"log"
	"aesthetics/cmd/smtp"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Order struct {
	ID              int     `json:"id"`
	UserID          int     `json:"user_id"`
	Total           float64 `json:"total"`
	PaymentProvider string  `json:"payment_provider"`
	Address         string  `json:"address"`
	City            string  `json:"city"`
	Notes           string  `json:"notes"`
	Status          string  `json:"status"`
	CreatedAt       string  `json:"created_at"`
}

type OrderItemDetail struct {
	ProductName     string  `json:"product_name"`
	SizeValue       string  `json:"size_value"`
	Quantity        int     `json:"quantity"`
	PriceAtPurchase float64 `json:"price_at_purchase"`
}

// GetOrders returns a list of user's orders
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
				payment_provider, 
				address,
				city,
				notes,
				status,
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
				&order.PaymentProvider,
				&order.Address,
				&order.City,
				&order.Notes,
				&order.Status,
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

// GetOrderDetails returns details of a specific order
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

		// Get order information
		var order Order
		err = db.QueryRow(`
			SELECT 
				id, 
				user_id, 
				total, 
				payment_provider, 
				address,
				city,
				notes,
				status,
				created_at 
			FROM orders 
			WHERE id = $1 AND user_id = $2
		`, orderID, userID).Scan(
			&order.ID,
			&order.UserID,
			&order.Total,
			&order.PaymentProvider,
			&order.Address,
			&order.City,
			&order.Notes,
			&order.Status,
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

		// Get order items
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

		// Get user information
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

// CancelOrder cancels an order
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
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
			return
		}
		defer func() {
			if err != nil {
				tx.Rollback()
			}
		}()

		// Check order status
		var status string
		err = tx.QueryRow(`
			SELECT status 
			FROM orders 
			WHERE id = $1 AND user_id = $2
		`, orderID, userID).Scan(&status)

		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			}
			return
		}

		if status == "completed" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot cancel already completed order"})
			return
		}

		// Get order items to return to stock
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

			// Return items to stock
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

		// Update order status
		_, err = tx.Exec(`
			UPDATE orders 
			SET status = 'cancelled' 
			WHERE id = $1
		`, orderID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel order"})
			return
		}

		// Commit transaction
		err = tx.Commit()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Order cancelled successfully"})
	}
}



// Структура запроса для изменения статуса заказа
type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=оформлен в_пути прибыл завершено отменён"`
}

// Обработчик изменения статуса заказа
func UpdateOrderStatus(db *sql.DB, smtpClient *smtp.SMTPClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Получаем ID заказа из URL
		orderID, err := strconv.Atoi(c.Param("orderId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID заказа"})
			return
		}

		// Парсим тело запроса
		var req UpdateOrderStatusRequest
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Получаем информацию о заказе и пользователе
		var currentStatus string
		var userEmail, userName string
		err = db.QueryRow(`
			SELECT o.status, u.email, u.first_name 
			FROM orders o
			JOIN users u ON o.user_id = u.id
			WHERE o.id = $1
		`, orderID).Scan(&currentStatus, &userEmail, &userName)

		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Заказ не найден"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка базы данных"})
			}
			return
		}

		// Обновляем статус заказа
		_, err = db.Exec(`
			UPDATE orders 
			SET status = $1 
			WHERE id = $2
		`, req.Status, orderID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обновлении статуса заказа"})
			return
		}

		// Если статус изменился на "прибыл", отправляем email
		if req.Status == "прибыл" && currentStatus != "прибыл" && smtpClient != nil {
			subject := "Ваш заказ прибыл!"
			body := "Уважаемый " + userName + ",\n\n" +
				"Ваш заказ #" + strconv.Itoa(orderID) + " прибыл и ожидает вас.\n\n" +
				"С уважением,\nКоманда Aesthetics"

			// Отправляем email
			err := smtpClient.SendMail(
				"aesthetics.team.contacts@gmail.com",
				userEmail,
				subject,
				body,
			)

			if err != nil {
				log.Printf("Ошибка при отправке письма: %v", err)
				// Не возвращаем ошибку, так как статус заказа уже обновлен
			}
		}

		c.JSON(http.StatusOK, gin.H{"message": "Статус заказа успешно обновлен"})
	}
}