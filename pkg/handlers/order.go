package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"encoding/json"
	"net/url"
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

type OrderItemResponse struct {
	ProductID       int       `json:"product_id"`
	SizeID          int       `json:"size_id"`
	Quantity        int       `json:"quantity"`
	PriceAtPurchase float64   `json:"price_at_purchase"`
	ProductName     string    `json:"product_name"`
	SizeValue       string    `json:"size_value"`
	ImagePaths      []string  `json:"image_paths"`
}

type OrderDetailsResponse struct {
	Order struct {
			ID             int     `json:"id"`
			Total          float64 `json:"total"`
			Address       string  `json:"address"`
			City           string  `json:"city"`
			PaymentMethod  string  `json:"payment_method"`
			Status         string  `json:"status"`
			Notes          string  `json:"notes"`
			CreatedAt     string  `json:"created_at"`
	} `json:"order"`
	User struct {
			FirstName string `json:"first_name"`
			LastName  string `json:"last_name"`
			Email     string `json:"email"`
			Phone     string `json:"phone"`
	} `json:"user"`
	OrderDate string               `json:"order_date"`
	Items     []OrderItemResponse  `json:"items"`
}

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

			// Получаем информацию о заказе
			var order struct {
					ID            int
					Total         float64
					Address       string
					City          string
					PaymentMethod string
					Status        string
					Notes         string
					CreatedAt     string
			}
			err = db.QueryRow(`
					SELECT id, total, address, city, payment_provider, status, notes, created_at
					FROM orders
					WHERE id = $1 AND user_id = $2
			`, orderID, userID).Scan(
					&order.ID, &order.Total, &order.Address, &order.City,
					&order.PaymentMethod, &order.Status, &order.Notes, &order.CreatedAt,
			)
			if err != nil {
					if errors.Is(err, sql.ErrNoRows) {
							c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
					} else {
							c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
					}
					return
			}

			// Получаем информацию о пользователе
			var user struct {
					FirstName string
					LastName  string
					Email     string
					Phone     string
			}
			err = db.QueryRow(`
					SELECT first_name, last_name, email, phone
					FROM users
					WHERE id = $1
			`, userID).Scan(&user.FirstName, &user.LastName, &user.Email, &user.Phone)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user data"})
					return
			}

			// Получаем элементы заказа с группировкой изображений
			rows, err := db.Query(`
					SELECT 
							oi.product_id, 
							oi.size_id, 
							oi.quantity, 
							oi.price_at_purchase,
							p.name AS product_name, 
							s.value AS size_value,
							p.description AS product_description,
							p.category_id AS product_category,
							COALESCE(pi.image_path, '') AS image_path
					FROM order_item oi
					JOIN product p ON oi.product_id = p.id
					JOIN sizes s ON oi.size_id = s.id
					LEFT JOIN product_images pi ON oi.product_id = pi.product_id
					WHERE oi.order_id = $1
					ORDER BY oi.product_id
			`, orderID)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch order items"})
					return
			}
			defer rows.Close()

			itemsMap := make(map[int]*OrderItemResponse)
			for rows.Next() {
					var (
							productID       int
							sizeID          int
							quantity        int
							priceAtPurchase float64
							productName     string
							sizeValue       string
							productDescription string
							productCategory int
							imagePath      string
					)
					
					err := rows.Scan(
							&productID, &sizeID, &quantity, &priceAtPurchase,
							&productName, &sizeValue, &productDescription, &productCategory, &imagePath,
					)
					if err != nil {
							c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan order item"})
							return
					}

					// Если товара еще нет в мапе, добавляем его
					if _, exists := itemsMap[productID]; !exists {
							itemsMap[productID] = &OrderItemResponse{
									ProductID:       productID,
									SizeID:          sizeID,
									Quantity:        quantity,
									PriceAtPurchase: priceAtPurchase,
									ProductName:     productName,
									SizeValue:       sizeValue,
									ImagePaths:      make([]string, 0),
							}
					}

					// Добавляем изображение, если оно есть
					if imagePath != "" {
							itemsMap[productID].ImagePaths = append(itemsMap[productID].ImagePaths, imagePath)
					}
			}

			// Преобразуем мапу в слайс
			items := make([]OrderItemResponse, 0, len(itemsMap))
			for _, item := range itemsMap {
					items = append(items, *item)
			}

			// Формируем ответ
			response := OrderDetailsResponse{
					Order: struct {
							ID             int     `json:"id"`
							Total          float64 `json:"total"`
							Address       string  `json:"address"`
							City           string  `json:"city"`
							PaymentMethod  string  `json:"payment_method"`
							Status         string  `json:"status"`
							Notes          string  `json:"notes"`
							CreatedAt     string  `json:"created_at"`
					}{
							ID:            order.ID,
							Total:         order.Total,
							Address:       order.Address,
							City:          order.City,
							PaymentMethod: order.PaymentMethod,
							Status:        order.Status,
							Notes:         order.Notes,
							CreatedAt:    order.CreatedAt,
					},
					User: struct {
							FirstName string `json:"first_name"`
							LastName  string `json:"last_name"`
							Email     string `json:"email"`
							Phone     string `json:"phone"`
					}{
							FirstName: user.FirstName,
							LastName:  user.LastName,
							Email:     user.Email,
							Phone:     user.Phone,
					},
					OrderDate: order.CreatedAt,
					Items:     items,
			}

			c.JSON(http.StatusOK, response)
	}
}



// CancelOrder cancels an order, returns items to stock, and deletes records



// RemoveOrderItem removes a specific item from an order
func RemoveOrderItem(db *sql.DB) gin.HandlerFunc {
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

			// Получаем параметры
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

			// Проверяем, что заказ принадлежит пользователю и имеет статус "оформлен"
			var status string
			err = tx.QueryRow(`
					SELECT status
					FROM orders
					WHERE id = $1 AND user_id = $2
			`, orderID, userID).Scan(&status)
			if err != nil {
					if errors.Is(err, sql.ErrNoRows) {
							c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
					} else {
							c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
					}
					return
			}
			if status != "оформлен" {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Only orders with status 'оформлен' can be modified"})
					return
			}

			// Получаем количество товара в заказе
			var quantity int
			err = tx.QueryRow(`
					SELECT quantity
					FROM order_item
					WHERE order_id = $1 AND product_id = $2 AND size_id = $3
			`, orderID, productID, sizeID).Scan(&quantity)
			if err != nil {
					if errors.Is(err, sql.ErrNoRows) {
							c.JSON(http.StatusNotFound, gin.H{"error": "Order item not found"})
					} else {
							c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
					}
					return
			}

			// Восстанавливаем остатки
			_, err = tx.Exec(`
					UPDATE product_sizes
					SET quantity = quantity + $1
					WHERE product_id = $2 AND size_id = $3
			`, quantity, productID, sizeID)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to restore product stock"})
					return
			}

			// Удаляем товар из заказа
			_, err = tx.Exec(`
					DELETE FROM order_item
					WHERE order_id = $1 AND product_id = $2 AND size_id = $3
			`, orderID, productID, sizeID)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete order item"})
					return
			}

			// Проверяем, остались ли товары в заказе
			var itemCount int
			err = tx.QueryRow(`
					SELECT COUNT(*)
					FROM order_item
					WHERE order_id = $1
			`, orderID).Scan(&itemCount)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check order items"})
					return
			}

			if itemCount == 0 {
					// Удаляем заказ, если он стал пустым
					_, err = tx.Exec(`
							DELETE FROM orders
							WHERE id = $1
					`, orderID)
					if err != nil {
							c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete empty order"})
							return
					}
					err = tx.Commit()
					if err != nil {
							c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
							return
					}
					c.JSON(http.StatusOK, gin.H{
							"message": "Order item deleted, order was empty and removed",
					})
					return
			}

			// Обновляем сумму заказа
			var total float64
			err = tx.QueryRow(`
					SELECT COALESCE(SUM(quantity * price_at_purchase), 0)
					FROM order_item
					WHERE order_id = $1
			`, orderID).Scan(&total)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to calculate order total"})
					return
			}

			_, err = tx.Exec(`
					UPDATE orders
					SET total = $1
					WHERE id = $2
			`, total, orderID)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order total"})
					return
			}

			// Фиксируем транзакцию
			err = tx.Commit()
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
					return
			}

			c.JSON(http.StatusOK, gin.H{
					"message": "Order item deleted successfully",
			})
	}
}




















// Структура запроса для изменения статуса заказа
type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=оформлен в_пути прибыл завершено отменён"`
}

// Обработчик изменения статуса заказа
func CancelOrder(db *sql.DB) gin.HandlerFunc {
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


		c.JSON(http.StatusOK, gin.H{"message": "Статус заказа успешно обновлен"})
	}
}



// CacheEntry represents a cached Nominatim response
type CacheEntry struct {
	Response map[string]interface{}
	Expires  time.Time
}

// In-memory cache for reverse geocoding responses
var reverseGeocodeCache = make(map[string]CacheEntry)

// ReverseGeocodeHandler handles reverse geocoding requests to Nominatim
func ReverseGeocodeHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract lat and lon from query parameters, with defaults
		lat := c.Query("lat")
		lon := c.Query("lon")
		if lat == "" {
			lat = "53.6835" // Default latitude (Grodno, Belarus)
		}
		if lon == "" {
			lon = "23.8345" // Default longitude (Grodno, Belarus)
		}

		// Validate coordinates
		latVal, err := strconv.ParseFloat(lat, 64)
		lonVal, err := strconv.ParseFloat(lon, 64)
		if err != nil || latVal < 51 || latVal > 56 || lonVal < 23 || lonVal > 32 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coordinates"})
			return
		}

		// Create cache key
		cacheKey := fmt.Sprintf("%s:%s", lat, lon)

		// Check cache
		if entry, exists := reverseGeocodeCache[cacheKey]; exists && time.Now().Before(entry.Expires) {
			c.JSON(http.StatusOK, entry.Response)
			return
		}

		// Construct Nominatim API URL
		nominatimURL := "https://nominatim.openstreetmap.org/reverse"
		params := url.Values{}
		params.Add("format", "json")
		params.Add("lat", lat)
		params.Add("lon", lon)
		params.Add("zoom", "18")
		params.Add("addressdetails", "1")

		// Create HTTP client with custom User-Agent
		client := &http.Client{
			Timeout: 10 * time.Second,
		}

		// Retry logic for rate-limiting
		const maxRetries = 3
		for attempt := 1; attempt <= maxRetries; attempt++ {
			req, err := http.NewRequest("GET", nominatimURL+"?"+params.Encode(), nil)
			if err != nil {
				log.Printf("Failed to create request: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
				return
			}
			req.Header.Set("User-Agent", "CheckoutApp/1.0 (your-real-email@domain.com)") // Replace with your real email

			// Make request to Nominatim
			resp, err := client.Do(req)
			if err != nil {
				log.Printf("Nominatim request error: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch address from Nominatim"})
				return
			}
			defer resp.Body.Close()

			// Handle response status
			if resp.StatusCode == http.StatusOK {
				// Parse response
				var result map[string]interface{}
				if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
					log.Printf("Failed to parse Nominatim response: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse address data"})
					return
				}

				// Cache the response for 24 hours
				reverseGeocodeCache[cacheKey] = CacheEntry{
					Response: result,
					Expires:  time.Now().Add(24 * time.Hour),
				}

				// Return the response
				c.JSON(http.StatusOK, result)
				return
			} else if resp.StatusCode == http.StatusTooManyRequests {
				// Handle 429 (rate-limiting)
				if attempt == maxRetries {
					log.Printf("Nominatim rate limit exceeded after %d attempts", maxRetries)
					c.JSON(http.StatusTooManyRequests, gin.H{"error": "Nominatim rate limit exceeded"})
					return
				}
				log.Printf("Nominatim 429, retrying (%d/%d)", attempt, maxRetries)
				time.Sleep(time.Second * time.Duration(attempt)) // Exponential backoff
				continue
			} else if resp.StatusCode == http.StatusForbidden {
				// Handle 403 (forbidden)
				log.Printf("Nominatim returned 403 Forbidden")
				c.JSON(http.StatusForbidden, gin.H{"error": "Nominatim access forbidden, check User-Agent or usage policy"})
				return
			} else {
				// Other errors
				log.Printf("Nominatim returned status: %d", resp.StatusCode)
				c.JSON(http.StatusBadGateway, gin.H{"error": fmt.Sprintf("Nominatim API error: %s", resp.Status)})
				return
			}
		}
	}
}