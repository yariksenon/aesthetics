package admin

import (
	"database/sql"
	"log"
	"net/http"
	"aesthetics/cmd/smtp"

	"github.com/gin-gonic/gin"
)

// Get all couriers
func AdminGetAllCouriers(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Query("SELECT id, user_id, name, phone, email, transport, experience, city, status, created_at, updated_at FROM courier")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения списка курьеров"})
			return
		}
		defer rows.Close()

		var couriers []map[string]interface{}
		for rows.Next() {
			var id, userID, experience int
			var name, phone, transport, city, status string
			var createdAt sql.NullTime
			var updatedAt sql.NullTime
			var emailNull sql.NullString

			if err := rows.Scan(&id, &userID, &name, &phone, &emailNull, &transport, &experience, &city, &status, &createdAt, &updatedAt); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка чтения данных курьера"})
				return
			}
			courier := map[string]interface{}{
				"id":         id,
				"user_id":    userID,
				"name":       name,
				"phone":      phone,
				"email":      emailNull.String,
				"transport":  transport,
				"experience": experience,
				"city":       city,
				"status":     status,
				"created_at": createdAt.Time.String(),
			}
			if updatedAt.Valid {
				courier["updated_at"] = updatedAt.Time.String()
			}
			couriers = append(couriers, courier)
		}
		c.JSON(http.StatusOK, couriers)
	}
}

// Get approved couriers
func AdminGetApprovedCouriers(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Query("SELECT id, user_id, name, phone, email, transport, experience, city, status, created_at, updated_at FROM courier WHERE status='approved'")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения одобренных курьеров"})
			return
		}
		defer rows.Close()

		var couriers []map[string]interface{}
		for rows.Next() {
			var id, userID, experience int
			var name, phone, transport, city, status string
			var createdAt sql.NullTime
			var updatedAt sql.NullTime
			var emailNull sql.NullString

			if err := rows.Scan(&id, &userID, &name, &phone, &emailNull, &transport, &experience, &city, &status, &createdAt, &updatedAt); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка чтения данных курьера"})
				return
			}
			courier := map[string]interface{}{
				"id":         id,
				"user_id":    userID,
				"name":       name,
				"phone":      phone,
				"email":      emailNull.String,
				"transport":  transport,
				"experience": experience,
				"city":       city,
				"status":     status,
				"created_at": createdAt.Time.String(),
			}
			if updatedAt.Valid {
				courier["updated_at"] = updatedAt.Time.String()
			}
			couriers = append(couriers, courier)
		}
		c.JSON(http.StatusOK, couriers)
	}
}

// Get pending couriers
func AdminGetPendingCouriers(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Query("SELECT id, user_id, name, phone, email, transport, experience, city, status, created_at, updated_at FROM courier WHERE status='pending'")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения курьеров на модерации"})
			return
		}
		defer rows.Close()

		var couriers []map[string]interface{}
		for rows.Next() {
			var id, userID, experience int
			var name, phone, transport, city, status string
			var createdAt sql.NullTime
			var updatedAt sql.NullTime
			var emailNull sql.NullString

			if err := rows.Scan(&id, &userID, &name, &phone, &emailNull, &transport, &experience, &city, &status, &createdAt, &updatedAt); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка чтения данных курьера"})
				return
			}
			courier := map[string]interface{}{
				"id":         id,
				"user_id":    userID,
				"name":       name,
				"phone":      phone,
				"email":      emailNull.String,
				"transport":  transport,
				"experience": experience,
				"city":       city,
				"status":     status,
				"created_at": createdAt.Time.String(),
			}
			if updatedAt.Valid {
				courier["updated_at"] = updatedAt.Time.String()
			}
			couriers = append(couriers, courier)
		}
		c.JSON(http.StatusOK, couriers)
	}
}

// Get courier by ID
func AdminGetCourierByID(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var courierID, userID, experience int
		var name, phone, transport, city, status string
		var createdAt sql.NullTime
		var updatedAt sql.NullTime
		var emailNull sql.NullString

		err := db.QueryRow("SELECT id, user_id, name, phone, email, transport, experience, city, status, created_at, updated_at FROM courier WHERE id=$1", id).Scan(
			&courierID, &userID, &name, &phone, &emailNull, &transport, &experience, &city, &status, &createdAt, &updatedAt)

		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Курьер не найден"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения данных курьера"})
			}
			return
		}

		courier := map[string]interface{}{
			"id":         courierID,
			"user_id":    userID,
			"name":       name,
			"phone":      phone,
			"email":      emailNull.String,
			"transport":  transport,
			"experience": experience,
			"city":       city,
			"status":     status,
			"created_at": createdAt.Time.String(),
		}
		if updatedAt.Valid {
			courier["updated_at"] = updatedAt.Time.String()
		}

		c.JSON(http.StatusOK, courier)
	}
}

// Approve courier
func AdminApproveCourier(db *sql.DB, smtpClient *smtp.SMTPClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		// Get courier data
		var name, phone string
		var emailNull sql.NullString
		err := db.QueryRow("SELECT name, phone, email FROM courier WHERE id = $1", id).Scan(&name, &phone, &emailNull)
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Курьер не найден"})
			return
		} else if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении данных курьера: " + err.Error()})
			return
		}

		// Update courier status
		_, err = db.Exec("UPDATE courier SET status='approved', updated_at=NOW() WHERE id=$1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка одобрения курьера: " + err.Error()})
			return
		}

		// Send email notification if email exists
		if emailNull.Valid {
			subject := "Ваша заявка курьера одобрена"
			body := `Уважаемый(ая) ${name},

Поздравляем! Ваша заявка на статус курьера успешно одобрена. Теперь вы можете начать принимать заказы.

С уважением,
Команда Aesthetics`

			err = smtpClient.SendMail("aesthetics.team.contacts@gmail.com", emailNull.String, subject, body)
			if err != nil {
				log.Printf("Ошибка при отправке письма для курьера %s: %v", id, err)
				// Continue execution as status is already updated
			}
		}

		c.JSON(http.StatusOK, gin.H{"message": "Курьер одобрен!"})
	}
}

// Reject courier
func AdminRejectCourier(db *sql.DB, smtpClient *smtp.SMTPClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		// Get courier data
		var name, phone string
		var emailNull sql.NullString
		err := db.QueryRow("SELECT name, phone, email FROM courier WHERE id = $1", id).Scan(&name, &phone, &emailNull)
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Курьер не найден"})
			return
		} else if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении данных курьера: " + err.Error()})
			return
		}

		// Update courier status
		_, err = db.Exec("UPDATE courier SET status='rejected', updated_at=NOW() WHERE id=$1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка отклонения курьера: " + err.Error()})
			return
		}

		// Send email notification if email exists
		if emailNull.Valid {
			subject := "Ваша заявка курьера отклонена"
			body := `Уважаемый(ая) ${name},

К сожалению, ваша заявка на статус курьера была отклонена. Пожалуйста, обновите данные и отправьте заявку повторно.

С уважением,
Команда Aesthetics`

			err = smtpClient.SendMail("aesthetics.team.contacts@gmail.com", emailNull.String, subject, body)
			if err != nil {
				log.Printf("Ошибка при отправке письма для курьера %s: %v", id, err)
				// Continue execution as status is already updated
			}
		}

		c.JSON(http.StatusOK, gin.H{"message": "Курьер отклонён!"})
	}
}

// Delete courier
func AdminDeleteCourier(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		_, err := db.Exec("DELETE FROM courier WHERE id=$1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка удаления курьера"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Курьер удалён!"})
	}
}

// Resubmit courier application
func AdminResubmitCourier(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		// Get data from request body
		var requestData struct {
			Name       string `json:"name"`
			Phone      string `json:"phone"`
			Email      string `json:"email"`
			Transport  string `json:"transport"`
			Experience int    `json:"experience"`
			City       string `json:"city"`
		}

		if err := c.ShouldBindJSON(&requestData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		// Update courier data
		var emailValue interface{}
		if requestData.Email == "" {
			emailValue = nil
		} else {
			emailValue = requestData.Email
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
				updated_at = NOW()
			WHERE id = $7`,
			requestData.Name,
			requestData.Phone,
			emailValue,
			requestData.Transport,
			requestData.Experience,
			requestData.City,
			id,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обновлении заявки курьера: " + err.Error()})
			return
		}

		rowsAffected, err := result.RowsAffected()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при проверке обновления"})
			return
		}

		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Курьер не найден"})
			return
		}

		// Get updated courier data
		var courierID, userID, experience int
		var name, phone, transport, city, status string
		var createdAt sql.NullTime
		var updatedAt sql.NullTime
		var emailNull sql.NullString

		err = db.QueryRow(`
			SELECT id, user_id, name, phone, email, transport, experience, city, status, created_at, updated_at 
			FROM courier 
			WHERE id = $1`, id).Scan(
			&courierID, &userID, &name, &phone, &emailNull, &transport, &experience, &city, &status, &createdAt, &updatedAt)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении обновленных данных курьера"})
			return
		}

		courier := map[string]interface{}{
			"id":         courierID,
			"user_id":    userID,
			"name":       name,
			"phone":      phone,
			"email":      emailNull.String,
			"transport":  transport,
			"experience": experience,
			"city":       city,
			"status":     status,
			"created_at": createdAt.Time.String(),
		}
		if updatedAt.Valid {
			courier["updated_at"] = updatedAt.Time.String()
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Заявка курьера успешно обновлена и отправлена на повторное рассмотрение!",
			"courier": courier,
		})
	}
}