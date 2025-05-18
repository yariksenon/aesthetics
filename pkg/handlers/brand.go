package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type BrandRequest struct {
	Name        string `json:"name" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	Description string `json:"description"`
	Website     string `json:"website"`
	UserId      int    `json:"userId" binding:"required"`
}

func PostBrand(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req BrandRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Проверяем существующую заявку (только pending или approved)
		var existingStatus string
		err := db.QueryRow(
			"SELECT status FROM brand WHERE user_id = $1",
			req.UserId,
		).Scan(&existingStatus)

		if err == nil {
			// Заявка существует
			if existingStatus == "pending" || existingStatus == "approved" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Brand application already exists for this user"})
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
			INSERT INTO brand (name, email, description, website, status, user_id, created_at, updated_at)
			VALUES ($1, $2, $3, $4, 'pending', $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
			RETURNING id, created_at, updated_at
		`, req.Name, req.Email, req.Description, req.Website, req.UserId).Scan(&id, &createdAt, &updatedAt)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create brand"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Brand created successfully",
			"brand": map[string]interface{}{
				"id":          id,
				"user_id":     req.UserId,
				"name":        req.Name,
				"email":       req.Email,
				"description": req.Description,
				"website":     req.Website,
				"status":      "pending",
				"created_at":  createdAt,
				"updated_at":  updatedAt,
			},
		})
	}
}

func CheckBrandApplication(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIdStr := c.Query("userId")
		userId, err := strconv.Atoi(userIdStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		var brand struct {
			ID          int    `json:"id"`
			Name        string `json:"name"`
			Email       string `json:"email"`
			Description string `json:"description"`
			Website     string `json:"website"`
			Status      string `json:"status"`
			CreatedAt   string `json:"created_at"`
			UpdatedAt   string `json:"updated_at"`
		}

		err = db.QueryRow(`
			SELECT id, name, email, description, website, status, created_at, updated_at
			FROM brand 
			WHERE user_id = $1
		`, userId).Scan(
			&brand.ID, &brand.Name, &brand.Email, &brand.Description, &brand.Website,
			&brand.Status, &brand.CreatedAt, &brand.UpdatedAt,
		)

		if err == sql.ErrNoRows {
			c.JSON(http.StatusOK, gin.H{"exists": false})
			return
		} else if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"exists": true,
			"brand":  brand,
		})
	}
}


func ResubmitBrand(db *sql.DB) gin.HandlerFunc {
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