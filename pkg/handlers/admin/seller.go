package admin

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Добавьте эту структуру для ответа
type Seller struct {
	ID           int    `json:"id"`
	FirstName    string `json:"first_name"`
	LastName     string `json:"last_name"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	Phone        string `json:"phone"`
	Role         string `json:"role"`
	CreatedAt    string `json:"created_at"`
	SellerStatus string `json:"seller_status"` // Добавляем статус
	LogoPath     string `json:"logo_path"`
}

func AdminGetSellers(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Query(`
            SELECT 
                u.id, 
                u.first_name, 
                u.last_name, 
                u.username, 
                u.email, 
                u.phone, 
                u.role, 
                u.created_at,
                sa.status as seller_status,
                sa.logo_path
            FROM 
                users u
            JOIN 
                seller_applications sa ON u.id = sa.user_id
            WHERE 
                sa.status IN ('approved', 'pending')
        `)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Ошибка при получении списка продавцов",
				"details": err.Error(),
			})
			return
		}
		defer rows.Close()

		var sellers []Seller
		for rows.Next() {
			var seller Seller
			err := rows.Scan(
				&seller.ID,
				&seller.FirstName,
				&seller.LastName,
				&seller.Username,
				&seller.Email,
				&seller.Phone,
				&seller.Role,
				&seller.CreatedAt,
				&seller.SellerStatus,
				&seller.LogoPath,
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   "Ошибка при обработке данных",
					"details": err.Error(),
				})
				return
			}
			sellers = append(sellers, seller)
		}

		c.JSON(http.StatusOK, sellers)
	}
}

func AdminApproveSeller(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		sellerID := c.Param("id")
		fmt.Printf("Начало обработки подтверждения продавца ID: %s\n", sellerID)

		tx, err := db.Begin()
		if err != nil {
			fmt.Printf("Ошибка начала транзакции: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Ошибка начала транзакции",
				"details": err.Error(),
			})
			return
		}

		defer func() {
			if err != nil {
				fmt.Printf("Откат транзакции из-за ошибки: %v\n", err)
				tx.Rollback()
			}
		}()

		// 1. Обновляем статус заявки
		fmt.Println("Обновление статуса заявки...")
		res, err := tx.Exec(`
            UPDATE seller_applications 
            SET status = 'approved' 
            WHERE user_id = $1 AND status = 'pending'
        `, sellerID)

		if err != nil {
			fmt.Printf("Ошибка обновления статуса: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Ошибка обновления статуса заявки",
				"details": err.Error(),
			})
			return
		}

		rowsAffected, _ := res.RowsAffected()
		fmt.Printf("Строк обновлено: %d\n", rowsAffected)

		if rowsAffected == 0 {
			msg := "Заявка не найдена или уже подтверждена"
			fmt.Println(msg)
			c.JSON(http.StatusNotFound, gin.H{"error": msg})
			return
		}

		// 2. Обновляем роль пользователя
		fmt.Println("Обновление роли пользователя...")
		_, err = tx.Exec(`
            UPDATE users 
            SET role = 'seller' 
            WHERE id = $1
        `, sellerID)

		if err != nil {
			fmt.Printf("Ошибка обновления роли: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Ошибка обновления роли пользователя",
				"details": err.Error(),
			})
			return
		}

		// 3. Получаем обновленные данные (упрощенная версия)
		fmt.Println("Получение обновленных данных...")
		var seller struct {
			ID        int    `json:"id"`
			FirstName string `json:"first_name"`
			LastName  string `json:"last_name"`
			Email     string `json:"email"`
			Role      string `json:"role"`
			Status    string `json:"status"`
		}

		err = tx.QueryRow(`
            SELECT u.id, u.first_name, u.last_name, u.email, u.role, sa.status
            FROM users u
            JOIN seller_applications sa ON u.id = sa.user_id
            WHERE u.id = $1
        `, sellerID).Scan(
			&seller.ID,
			&seller.FirstName,
			&seller.LastName,
			&seller.Email,
			&seller.Role,
			&seller.Status,
		)

		if err != nil {
			fmt.Printf("Ошибка получения данных: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Ошибка получения данных продавца",
				"details": err.Error(),
			})
			return
		}

		// Коммит транзакции
		if err = tx.Commit(); err != nil {
			fmt.Printf("Ошибка коммита транзакции: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Ошибка завершения транзакции",
				"details": err.Error(),
			})
			return
		}

		fmt.Println("Транзакция успешно завершена")
		c.JSON(http.StatusOK, gin.H{
			"message": "Продавец успешно подтвержден",
			"seller":  seller,
		})
	}
}
