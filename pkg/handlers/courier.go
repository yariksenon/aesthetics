package handlers

import (
	"database/sql"
	"aesthetics/cmd/smtp"
	"net/http"
	"strconv"
	"time"
	"fmt"
	"log"
	
	"github.com/gin-gonic/gin"
)

type CourierRequest struct {
	UserId    int    `json:"userId" binding:"required"`
	Name      string `json:"name" binding:"required"`
	Phone     string `json:"phone" binding:"required"`
	Email     string `json:"email"`
	Transport string `json:"transport" binding:"required"`
	Experience int    `json:"experience"`
	City      string `json:"city" binding:"required"`
}

func PostCourier(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CourierRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Проверяем существующую заявку (только pending или approved)
		var existingStatus string
		err := db.QueryRow(
			"SELECT status FROM courier WHERE user_id = $1",
			req.UserId,
		).Scan(&existingStatus)

		if err == nil {
			// Заявка существует
			if existingStatus == "pending" || existingStatus == "approved" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Courier application already exists for this user"})
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
			INSERT INTO courier (user_id, name, phone, email, transport, experience, city, status, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
			RETURNING id, created_at, updated_at
		`, req.UserId, req.Name, req.Phone, req.Email, req.Transport, req.Experience, req.City).Scan(&id, &createdAt, &updatedAt)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create courier application"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Courier application created successfully",
			"courier": map[string]interface{}{
				"id":         id,
				"user_id":    req.UserId,
				"name":      req.Name,
				"phone":     req.Phone,
				"email":     req.Email,
				"transport": req.Transport,
				"experience": req.Experience,
				"city":      req.City,
				"status":    "pending",
				"created_at": createdAt,
				"updated_at": updatedAt,
			},
		})
	}
}

func CheckCourierApplication(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIdStr := c.Query("userId")
		userId, err := strconv.Atoi(userIdStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		var courier struct {
			ID         int    `json:"id"`
			Name       string `json:"name"`
			Phone      string `json:"phone"`
			Email      string `json:"email"`
			Transport  string `json:"transport"`
			Experience int    `json:"experience"`
			City       string `json:"city"`
			Status     string `json:"status"`
			CreatedAt  string `json:"created_at"`
			UpdatedAt  string `json:"updated_at"`
		}

		err = db.QueryRow(`
			SELECT id, name, phone, email, transport, experience, city, status, created_at, updated_at
			FROM courier 
			WHERE user_id = $1
		`, userId).Scan(
			&courier.ID, &courier.Name, &courier.Phone, &courier.Email, &courier.Transport,
			&courier.Experience, &courier.City, &courier.Status, &courier.CreatedAt, &courier.UpdatedAt,
		)

		if err == sql.ErrNoRows {
			c.JSON(http.StatusOK, gin.H{"exists": false})
			return
		} else if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"exists":  true,
			"courier": courier,
		})
	}
}

func ResubmitCourier(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		
		var requestData struct {
			Name       string `json:"name"`
			Phone      string `json:"phone"`
			Email      string `json:"email"`
			Transport  string `json:"transport"`
			Experience int    `json:"experience"`
			City       string `json:"city"`
		}
		
		if err := c.ShouldBindJSON(&requestData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		result, err := db.Exec(`
			UPDATE courier 
			SET 
				name = $1,
				phone = $2,
				email = $3,
				transport = $4,
				experience = $5,
				city = $6,
				status = 'pending',
				updated_at = CURRENT_TIMESTAMP
			WHERE id = $7`,
			requestData.Name,
			requestData.Phone,
			requestData.Email,
			requestData.Transport,
			requestData.Experience,
			requestData.City,
			id,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update courier application: " + err.Error()})
			return
		}

		rowsAffected, err := result.RowsAffected()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check update"})
			return
		}

		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Courier application not found"})
			return
		}

		var courierID, userID int
		var name, phone, email, transport, city, status, createdAt, updatedAt string
		var experience int

		err = db.QueryRow(`
			SELECT id, user_id, name, phone, email, transport, experience, city, status, created_at, updated_at 
			FROM courier 
			WHERE id = $1`, id).Scan(
			&courierID, &userID, &name, &phone, &email, &transport, &experience, &city, &status, &createdAt, &updatedAt)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get updated courier data"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Courier application updated and resubmitted successfully!",
			"courier": map[string]interface{}{
				"id":         courierID,
				"user_id":    userID,
				"name":       name,
				"phone":      phone,
				"email":      email,
				"transport":  transport,
				"experience": experience,
				"city":       city,
				"status":     status,
				"created_at": createdAt,
				"updated_at": updatedAt,
			},
		})
	}
}


func GetAvailableOrders(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Query(`
			SELECT 
				id, user_id, total, payment_provider, 
				address, city, notes, status, created_at
			FROM orders
			ORDER BY created_at ASC`)
		
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка при получении заказов",
				"details": err.Error(),
			})
			return
		}
		defer rows.Close()

		// 2. Формируем список заказов
		var orders []map[string]interface{}
		for rows.Next() {
			var order struct {
				ID              int
				UserID          *int
				Total           float64
				PaymentProvider string
				Address         string
				City            string
				Notes           string
				Status          string
				CreatedAt       time.Time
			}

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
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка обработки данных заказа",
					"details": err.Error(),
				})
				return
			}

			orders = append(orders, map[string]interface{}{
				"id":               order.ID,
				"user_id":          order.UserID,
				"total":            order.Total,
				"payment_provider": order.PaymentProvider,
				"address":         order.Address,
				"city":            order.City,
				"notes":           order.Notes,
				"status":          order.Status,
				"created_at":      order.CreatedAt,
			})
		}

		// 3. Возвращаем результат
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"orders":  orders,
			"count":   len(orders),
		})
	}
}


// UpdateOrderStatus handles updating the status of an order
func UpdateOrderStatus(db *sql.DB, smtpClient *smtp.SMTPClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get order_id from URL parameter
		orderID := c.Param("order_id")

		// Define valid statuses
		validStatuses := map[string]bool{
			"оформлен":          true,
			"ожидает":           true,
			"в_пути":            true,
			"прибыл":            true,
			"завершено":         true,
			"завершено_частично": true, // Fixed typo from "звершено_частично"
			"отменён":           true,
		}

		// Parse request body
		var requestBody struct {
			Status string `json:"status"`
		}

		if err := c.ShouldBindJSON(&requestBody); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "Invalid request body",
			})
			return
		}

		// Validate status
		if !validStatuses[requestBody.Status] {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "Invalid status value",
			})
			return
		}

		// Get user email and current status before updating
		var userEmail string
		var userName string
		var currentStatus string
		err := db.QueryRow(`
			SELECT u.email, u.first_name, o.status 
			FROM orders o 
			JOIN users u ON o.user_id = u.id 
			WHERE o.id = $1
		`, orderID).Scan(&userEmail, &userName, &currentStatus)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{
					"success": false,
					"error":   "Order not found",
				})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"error":   "Failed to get order details",
				})
			}
			return
		}

		// Update order status in database
		query := `UPDATE orders SET status = $1 WHERE id = $2`
		result, err := db.Exec(query, requestBody.Status, orderID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Failed to update order status",
			})
			return
		}

		// Check if any rows were affected
		rowsAffected, err := result.RowsAffected()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Failed to verify update",
			})
			return
		}

		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "Order not found",
			})
			return
		}

		// Send email notification if status changed to "прибыл" or "завершено_частично"
		if smtpClient != nil && currentStatus != requestBody.Status {
			if requestBody.Status == "прибыл" {
				subject := "Ваш заказ прибыл"
				body := fmt.Sprintf(
					"Уважаемый %s,\n\nВаш заказ #%s прибыл и ожидает вас.\n\nС уважением,\nКоманда Aesthetics",
					userName, orderID,
				)

				err := smtpClient.SendMail(
					"aesthetics.team.contacts@gmail.com", // from
					userEmail,                           // to
					subject,                             // subject
					body,                                // body
				)

				if err != nil {
					log.Printf("Failed to send email notification for 'прибыл': %v", err)
					// Do not interrupt execution, just log the error
				}
			} else if requestBody.Status == "завершено_частично" {
				subject := "Ваш заказ частично завершен"
				body := fmt.Sprintf(
					"Уважаемый %s,\n\nВаш заказ #%s был частично завершен. Некоторые товары могут быть недоставлены.\n"+
						"Пожалуйста, свяжитесь с нами для уточнения деталей.\n\nС уважением,\nКоманда Aesthetics",
					userName, orderID,
				)

				err := smtpClient.SendMail(
					"aesthetics.team.contacts@gmail.com", // from
					userEmail,                           // to
					subject,                             // subject
					body,                                // body
				)

				if err != nil {
					log.Printf("Failed to send email notification for 'завершено_частично': %v", err)
					// Do not interrupt execution, just log the error
				}
			}
		}

		// Return success response
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Order status updated successfully",
		})
	}
}



func AcceptOrder(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
			// Получаем ID заказа из URL
			orderID := c.Param("order_id")

			// Парсим JSON с ID курьера
			var request struct {
					CourierID int `json:"courier_id"`
			}
			
			if err := c.ShouldBindJSON(&request); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
					return
			}

			// Простое обновление заказа
			_, err := db.Exec(
					"UPDATE orders SET courier_id = $1, status = 'в_пути' WHERE id = $2",
					request.CourierID,
					orderID,
			)
			
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
					return
			}

			c.JSON(http.StatusOK, gin.H{"success": true})
	}
}