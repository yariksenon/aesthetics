package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type OrderRequest struct {
	PaymentProvider string             `json:"payment_provider"`
	Items          []OrderItemRequest `json:"items"`
}

type OrderItemRequest struct {
	ProductID int `json:"product_id"`
	Quantity  int `json:"quantity"`
}

func PostOrder(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Получаем userId из параметров URL
		userIdStr := c.Param("userId")
		userId, err := strconv.Atoi(userIdStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		// Парсим тело запроса
		var req OrderRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		// Начинаем транзакцию
		tx, err := db.Begin()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
			return
		}
		defer tx.Rollback()

		// 1. Создаем запись в таблице orders
		var orderID int
		err = tx.QueryRow(
			"INSERT INTO orders (user_id, total, payment_provider, payment_status) VALUES ($1, $2, $3, $4) RETURNING id",
			userId,
			0, // Пока total = 0, рассчитаем ниже
			req.PaymentProvider,
			"pending",
		).Scan(&orderID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
			return
		}

		// 2. Добавляем товары в order_item и рассчитываем общую сумму
		var total float64
		for _, item := range req.Items {
			// Получаем цену продукта (предполагаем, что есть таблица products с полем price)
			var price float64
			err := tx.QueryRow("SELECT price FROM products WHERE id = $1", item.ProductID).Scan(&price)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Product not found"})
				return
			}

			// Добавляем запись в order_item
			_, err = tx.Exec(
				"INSERT INTO order_item (order_id, product_id, quantity) VALUES ($1, $2, $3)",
				orderID,
				item.ProductID,
				item.Quantity,
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add order items"})
				return
			}

			total += price * float64(item.Quantity)
		}

		// 3. Обновляем общую сумму в заказе
		_, err = tx.Exec("UPDATE orders SET total = $1 WHERE id = $2", total, orderID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order total"})
			return
		}

		// Фиксируем транзакцию
		if err := tx.Commit(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Order created successfully",
			"order_id": orderID,
			"total": total,
		})
	}
}