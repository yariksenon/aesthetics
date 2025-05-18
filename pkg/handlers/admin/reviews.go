package admin

import (
	"database/sql"
	"net/http"
	"log"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Review структура для представления отзыва
type Review struct {
	ID          int    `json:"id"`
	ProductID   int    `json:"product_id"`
	UserID      int    `json:"user_id"`
	Content     string `json:"content"`
	Rating      int    `json:"rating"`
	Status      string `json:"status"`
	CreatedAt   string `json:"created_at"`
	PublishedAt string `json:"published_at,omitempty"`
}

// ApproveReview одобряет отзыв, меняя статус на 'published'
func ApproveReview(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		reviewID := c.Param("id")
		reviewIDInt, err := strconv.Atoi(reviewID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid review ID"})
			return
		}

		// Проверка существования отзыва
		var exists bool
		err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM reviews WHERE id = $1)", reviewIDInt).Scan(&exists)
		if err != nil {
			log.Printf("Failed to check review existence: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify review"})
			return
		}
		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
			return
		}

		// Проверка текущего статуса
		var currentStatus string
		err = db.QueryRow("SELECT status FROM reviews WHERE id = $1", reviewIDInt).Scan(&currentStatus)
		if err != nil {
			log.Printf("Failed to check review status: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify review status"})
			return
		}
		if currentStatus == "published" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Review already published"})
			return
		}

		// Обновление статуса и published_at
		query := `
			UPDATE reviews 
			SET status = 'published', published_at = NOW()
			WHERE id = $1
			RETURNING id, product_id, user_id, content, rating, status, created_at, published_at`

		var review Review
		var publishedAt sql.NullString
		err = db.QueryRow(query, reviewIDInt).Scan(
			&review.ID,
			&review.ProductID,
			&review.UserID,
			&review.Content,
			&review.Rating,
			&review.Status,
			&review.CreatedAt,
			&publishedAt,
		)
		if err != nil {
			log.Printf("Failed to approve review: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve review"})
			return
		}

		if publishedAt.Valid {
			review.PublishedAt = publishedAt.String
		}

		c.JSON(http.StatusOK, review)
	}
}

// DeleteReview удаляет отзыв
func DeleteReview(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		reviewID := c.Param("id")
		reviewIDInt, err := strconv.Atoi(reviewID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid review ID"})
			return
		}

		query := `DELETE FROM reviews WHERE id = $1`
		result, err := db.Exec(query, reviewIDInt)
		if err != nil {
			log.Printf("Failed to delete review: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete review"})
			return
		}

		rowsAffected, err := result.RowsAffected()
		if err != nil {
			log.Printf("Failed to verify deletion: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify deletion"})
			return
		}

		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Review deleted successfully"})
	}
}