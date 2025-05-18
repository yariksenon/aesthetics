package admin

import (
	"database/sql"
	"net/http"
	"log"
	"aesthetics/cmd/smtp"

	"github.com/gin-gonic/gin"
)

func AdminApproveBrand(db *sql.DB, smtpClient *smtp.SMTPClient) gin.HandlerFunc {
	return func(c *gin.Context) {
			id := c.Param("id")

			// Получаем данные бренда
			var email, name string
			err := db.QueryRow(
					"SELECT email, name FROM brand WHERE id = $1", id,
			).Scan(&email, &name)

			if err == sql.ErrNoRows {
					c.JSON(http.StatusNotFound, gin.H{"error": "Бренд не найден"})
					return
			} else if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении данных бренда: " + err.Error()})
					return
			}

			// Обновляем статус бренда
			_, err = db.Exec("UPDATE brand SET status='approved', updated_at=CURRENT_TIMESTAMP WHERE id=$1", id)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка одобрения бренда: " + err.Error()})
					return
			}

			// Отправляем email-уведомление
			subject := "Ваша заявка бренда одобрена"
			body := `Уважаемый пользователь,

Поздравляем! Ваш бренд успешно одобрен. Теперь вы можете начать добавлять продукты.

С уважением,
Команда Aesthetics`

			err = smtpClient.SendMail("aesthetics.team.contacts@gmail.com", email, subject, body)
			if err != nil {
					log.Printf("Ошибка при отправке письма для бренда %s: %v", id, err)
					// Не прерываем выполнение, так как статус уже обновлён
			}

			c.JSON(http.StatusOK, gin.H{"message": "Бренд одобрен!"})
	}
}

// Отклонить бренд (меняет статус на rejected и отправляет email)
func AdminRejectBrand(db *sql.DB, smtpClient *smtp.SMTPClient) gin.HandlerFunc {
	return func(c *gin.Context) {
			id := c.Param("id")

			// Получаем данные бренда
			var email, name string
			err := db.QueryRow(
					"SELECT email, name FROM brand WHERE id = $1", id,
			).Scan(&email, &name)

			if err == sql.ErrNoRows {
					c.JSON(http.StatusNotFound, gin.H{"error": "Бренд не найден"})
					return
			} else if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении данных бренда: " + err.Error()})
					return
			}

			// Обновляем статус бренда
			_, err = db.Exec("UPDATE brand SET status='rejected', updated_at=CURRENT_TIMESTAMP WHERE id=$1", id)
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка отклонения бренда: " + err.Error()})
					return
			}

			// Отправляем email-уведомление
			subject := "Ваша заявка бренда отклонена"
			body := `Уважаемый пользователь,

К сожалению, ваша заявка бренда "${name}" была отклонена. Пожалуйста, обновите данные и отправьте заявку повторно.

С уважением,
Команда Aesthetics`

			err = smtpClient.SendMail("aesthetics.team.contacts@gmail.com", email, subject, body)
			if err != nil {
					log.Printf("Ошибка при отправке письма для бренда %s: %v", id, err)
					// Не прерываем выполнение, так как статус уже обновлён
			}

			c.JSON(http.StatusOK, gin.H{"message": "Бренд отклонён!"})
	}
}

// Получить список одобренных брендов
func AdminGetApprovedSellers(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Query("SELECT id, user_id, name, email, description, website, status, created_at FROM brand WHERE status='approved'")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения одобренных брендов"})
			return
		}
		defer rows.Close()

		var brands []map[string]interface{}
		for rows.Next() {
			var id, userID int
			var name, email, description, website, status, createdAt string

			rows.Scan(&id, &userID, &name, &email, &description, &website, &status, &createdAt)
			brands = append(brands, map[string]interface{}{
				"id":          id,
				"user_id":     userID,
				"name":        name,
				"email":       email,
				"description": description,
				"website":     website,
				"status":      status,
				"created_at":  createdAt,
			})
		}
		c.JSON(http.StatusOK, brands)
	}
}

// Получить список брендов, ожидающих модерации
func AdminGetPendingSellers(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Query("SELECT id, user_id, name, email, description, website, status, created_at FROM brand WHERE status='pending'")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения брендов на модерации"})
			return
		}
		defer rows.Close()

		var brands []map[string]interface{}
		for rows.Next() {
			var id, userID int
			var name, email, description, website, status, createdAt string

			rows.Scan(&id, &userID, &name, &email, &description, &website, &status, &createdAt)
			brands = append(brands, map[string]interface{}{
				"id":          id,
				"user_id":     userID,
				"name":        name,
				"email":       email,
				"description": description,
				"website":     website,
				"status":      status,
				"created_at":  createdAt,
			})
		}
		c.JSON(http.StatusOK, brands)
	}
}

// Получить бренд по ID
func AdminGetSellerByID(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var brandID, userID int
		var name, email, description, website, status, createdAt string

		err := db.QueryRow("SELECT id, user_id, name, email, description, website, status, created_at FROM brand WHERE id=$1", id).Scan(
			&brandID, &userID, &name, &email, &description, &website, &status, &createdAt)

		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Бренд не найден"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения данных бренда"})
			}
			return
		}

		brand := map[string]interface{}{
			"id":          brandID,
			"user_id":     userID,
			"name":        name,
			"email":       email,
			"description": description,
			"website":     website,
			"status":      status,
			"created_at":  createdAt,
		}

		c.JSON(http.StatusOK, brand)
	}
}

// Одобрить бренд (меняет статус на approved)
// func AdminApproveBrand(db *sql.DB) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		id := c.Param("id")
// 		_, err := db.Exec("UPDATE brand SET status='approved' WHERE id=$1", id)
// 		if err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка одобрения бренда"})
// 			return
// 		}
// 		c.JSON(http.StatusOK, gin.H{"message": "Бренд одобрен!"})
// 	}
// }

// // Отклонить бренд (меняет статус на rejected)
// func AdminRejectBrand(db *sql.DB) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		id := c.Param("id")
// 		_, err := db.Exec("UPDATE brand SET status='rejected' WHERE id=$1", id)
// 		if err != nil {
// 			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка отклонения бренда"})
// 			return
// 		}
// 		c.JSON(http.StatusOK, gin.H{"message": "Бренд отклонён!"})
// 	}
// }

// Удалить бренд
func AdminDeleteBrand(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		_, err := db.Exec("DELETE FROM brand WHERE id=$1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка удаления бренда"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Бренд удалён!"})
	}
}




// Повторная отправка заявки бренда (обновляет данные и меняет статус на pending)
func AdminResubmitBrand(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
			id := c.Param("id")
			
			// Получаем данные из тела запроса
			var requestData struct {
					Name        string `json:"name"`
					Email       string `json:"email"`
					Website     string `json:"website"`
					Description string `json:"description"`
			}
			
			if err := c.ShouldBindJSON(&requestData); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
					return
			}

			// Обновляем запись в базе данных
			result, err := db.Exec(`
					UPDATE brand 
					SET 
							name = $1,
							email = $2,
							website = $3,
							description = $4,
							status = 'pending',
							updated_at = CURRENT_TIMESTAMP
					WHERE id = $5`,
					requestData.Name,
					requestData.Email,
					requestData.Website,
					requestData.Description,
					id,
			)

			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обновлении заявки бренда: " + err.Error()})
					return
			}

			rowsAffected, err := result.RowsAffected()
			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при проверке обновления"})
					return
			}

			if rowsAffected == 0 {
					c.JSON(http.StatusNotFound, gin.H{"error": "Бренд не найден"})
					return
			}

			// Получаем обновленные данные бренда для ответа
			var brandID, userID int
			var name, email, description, website, status, createdAt, updatedAt string

			err = db.QueryRow(`
					SELECT id, user_id, name, email, description, website, status, created_at, updated_at 
					FROM brand 
					WHERE id = $1`, id).Scan(
					&brandID, &userID, &name, &email, &description, &website, &status, &createdAt, &updatedAt)

			if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении обновленных данных бренда"})
					return
			}

			c.JSON(http.StatusOK, gin.H{
					"message": "Заявка бренда успешно обновлена и отправлена на повторное рассмотрение!",
					"brand": map[string]interface{}{
							"id":          brandID,
							"user_id":     userID,
							"name":        name,
							"email":       email,
							"description": description,
							"website":     website,
							"status":     status,
							"created_at":  createdAt,
							"updated_at":  updatedAt,
					},
			})
	}
}