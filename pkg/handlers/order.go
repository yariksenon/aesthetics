package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"
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
	Address         string `json:"address"`
	City           string `json:"city"`
	Notes          string `json:"notes"`
	PaymentProvider  string `json:"payment_provider"`
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

		// Парсим данные заказа
		var orderReq OrderRequest
		if err := c.ShouldBindJSON(&orderReq); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
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
		// Проверяем, что выбран допустимый метод оплаты
		if orderReq.PaymentProvider != "cash" && orderReq.PaymentProvider != "card" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment method. Only 'cash' or 'card' allowed"})
				return
		}

		err = tx.QueryRow(`
				INSERT INTO orders (user_id, total, payment_provider, address, city, notes)
				VALUES ($1, $2, $3, $4, $5, $6)
				RETURNING id
		`, userID, totalAmount, orderReq.PaymentProvider, orderReq.Address, orderReq.City, orderReq.Notes).Scan(&orderID)

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


func CancelOrder(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Начинаем транзакцию
		tx, err := db.Begin()
		if err != nil {
			log.Printf("Failed to start transaction: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
			return
		}
		defer func() {
			if err != nil {
				log.Printf("Rolling back transaction due to error: %v", err)
				tx.Rollback()
			}
		}()

		// Парсим параметры пути
		userID, err := strconv.Atoi(c.Param("userId"))
		if err != nil {
			log.Printf("Invalid user ID: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}
		orderID, err := strconv.Atoi(c.Param("orderId"))
		if err != nil {
			log.Printf("Invalid order ID: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
			return
		}

		// Проверяем, что заказ существует и статус "pending"
		var orderStatus string
		err = tx.QueryRow(`SELECT status FROM orders WHERE id = $1 AND user_id = $2`, orderID, userID).Scan(&orderStatus)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				log.Printf("Order not found: orderID=%d, userID=%d", orderID, userID)
				c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			} else {
				log.Printf("Database error when checking order status: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			}
			return
		}
		if orderStatus != "pending" {
			log.Printf("Attempt to cancel non-pending order: orderID=%d, status=%s", orderID, orderStatus)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Only pending orders can be cancelled"})
			return
		}

		// Получаем все позиции заказа для восстановления запасов
		rows, err := tx.Query(`
			SELECT product_id, size_id, quantity FROM order_item WHERE order_id = $1
		`, orderID)
		if err != nil {
			log.Printf("Failed to get order items: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get order items"})
			return
		}
		defer rows.Close()

		for rows.Next() {
			var productID, sizeID, quantity int
			if err := rows.Scan(&productID, &sizeID, &quantity); err != nil {
				log.Printf("Failed to scan order item: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan order item"})
				return
			}

			// Восстанавливаем запас товара на складе
			var currentQty int
err = tx.QueryRow(`
    SELECT quantity FROM product_sizes 
    WHERE product_id = $1 AND size_id = $2
    FOR UPDATE`, productID, sizeID).Scan(&currentQty)

if err != nil {
    if errors.Is(err, sql.ErrNoRows) {
        // Если записи нет, создаем новую
        _, err = tx.Exec(`
            INSERT INTO product_sizes (product_id, size_id, quantity)
            VALUES ($1, $2, $3)`,
            productID, sizeID, quantity)
    } else {
        log.Printf("Failed to get current quantity: productID=%d, sizeID=%d, error=%v", 
            productID, sizeID, err)
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": fmt.Sprintf("Database error for product_id=%d, size_id=%d", 
                productID, sizeID)})
        return
    }
} else {
    // Обновляем существующую запись
    _, err = tx.Exec(`
        UPDATE product_sizes
        SET quantity = quantity + $1
        WHERE product_id = $2 AND size_id = $3`,
        quantity, productID, sizeID)
}
			if err != nil {
				log.Printf("Failed to restore stock: productID=%d, sizeID=%d, error=%v", productID, sizeID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to restore stock for product_id=%d, size_id=%d", productID, sizeID)})
				return
			}
		}

		// Обновляем статус заказа на "cancelled"
		_, err = tx.Exec(`
			UPDATE orders
			SET status = 'cancelled'
			WHERE id = $1
		`, orderID)
		if err != nil {
			log.Printf("Failed to update order status: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order status"})
			return
		}

		// Фиксируем транзакцию
		err = tx.Commit()
		if err != nil {
			log.Printf("Failed to commit transaction: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
			return
		}

		log.Printf("Order cancelled successfully: orderID=%d, userID=%d", orderID, userID)
		c.JSON(http.StatusOK, gin.H{
			"message":  "Order cancelled successfully",
			"order_id": orderID,
		})
	}
}


type Order struct {
	ID             int       `json:"id"`
	UserID         int       `json:"user_id"`
	Total          float64   `json:"total"`
	PaymentMethod  string    `json:"payment_method"`
	Address        string    `json:"address"`
	City           string    `json:"city"`
	Notes          string    `json:"notes"`
	CreatedAt      time.Time `json:"created_at"`
	Status         string    `json:"status"`
}

type OrderItemDetail struct {
	ProductName     string  `json:"product_name"`
	PhotoURL        string  `json:"photo_url"`
	SizeValue       string  `json:"size_value"`
	Quantity        int     `json:"quantity"`
	PriceAtPurchase float64 `json:"price_at_purchase"`
}

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
							created_at,
							status 
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
							&order.PaymentMethod,
							&order.Address,
							&order.City,
							&order.Notes,
							&order.CreatedAt,
							&order.Status, // Добавьте это сканирование
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
                payment_provider,
                address,
                city,
                notes,
                created_at,
                status 
            FROM orders 
            WHERE id = $1 AND user_id = $2
        `, orderID, userID).Scan(
            &order.ID,
            &order.UserID,
            &order.Total,
            &order.PaymentMethod,
            &order.Address,
            &order.City,
            &order.Notes,
            &order.CreatedAt,
            &order.Status, // Добавьте это сканирование
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



// CancelOrder cancels an order, returns items to stock, and deletes records



// RemoveOrderItem removes a specific item from an order
func RemoveOrderItem(db *sql.DB) gin.HandlerFunc {
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

		productID, err := strconv.Atoi(c.Param("productId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
			return
		}

		sizeID, err := strconv.Atoi(c.Param("sizeId"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid size ID"})
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

		// Check if order exists and belongs to user
		var exists bool
		err = tx.QueryRow(`
			SELECT EXISTS(
				SELECT 1 FROM orders 
				WHERE id = $1 AND user_id = $2
			)
		`, orderID, userID).Scan(&exists)
		if err != nil {
			log.Printf("Database error checking order: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}

		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			return
		}

		// Check if the item exists in the order and get its quantity and price
		var quantity int
		var priceAtPurchase float64
		err = tx.QueryRow(`
			SELECT quantity, price_at_purchase
			FROM order_item 
			WHERE order_id = $1 AND product_id = $2 AND size_id = $3
		`, orderID, productID, sizeID).Scan(&quantity, &priceAtPurchase)
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item not found in order"})
			return
		}
		if err != nil {
			log.Printf("Failed to get order item: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get order item"})
			return
		}

		// Return item quantity to stock
		_, err = tx.Exec(`
			UPDATE product_sizes 
			SET quantity = quantity + $1 
			WHERE product_id = $2 AND size_id = $3
		`, quantity, productID, sizeID)
		if err != nil {
			log.Printf("Failed to return item to stock: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to return item to stock"})
			return
		}

		// Delete the item from order_item
		_, err = tx.Exec(`
			DELETE FROM order_item 
			WHERE order_id = $1 AND product_id = $2 AND size_id = $3
		`, orderID, productID, sizeID)
		if err != nil {
			log.Printf("Failed to delete order item: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete order item"})
			return
		}

		// Update order total
		_, err = tx.Exec(`
			UPDATE orders 
			SET total = (
				SELECT COALESCE(SUM(quantity * price_at_purchase), 0)
				FROM order_item 
				WHERE order_id = $1
			)
			WHERE id = $1
		`, orderID)
		if err != nil {
			log.Printf("Failed to update order total: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order total"})
			return
		}

		// Check if order is empty
		var itemCount int
		err = tx.QueryRow(`
			SELECT COUNT(*) 
			FROM order_item 
			WHERE order_id = $1
		`, orderID).Scan(&itemCount)
		if err != nil {
			log.Printf("Failed to check order items: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check order items"})
			return
		}

		// If order is empty, delete it
		if itemCount == 0 {
			_, err = tx.Exec(`
				DELETE FROM orders 
				WHERE id = $1
			`, orderID)
			if err != nil {
				log.Printf("Failed to delete empty order: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete empty order"})
				return
			}
		}

		// Commit transaction
		err = tx.Commit()
		if err != nil {
			log.Printf("Failed to commit transaction: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Item removed from order successfully"})
	}
}