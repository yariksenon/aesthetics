package handlers

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

func GetReviews(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		productID := c.Param("id")
		productIDInt, err := strconv.Atoi(productID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
			return
		}

		query := `
			SELECT id, product_id, user_id, content, rating, status, created_at, published_at
			FROM reviews 
			WHERE product_id = $1
			ORDER BY created_at DESC`

		rows, err := db.Query(query, productIDInt)
		if err != nil {
			log.Printf("Failed to fetch reviews: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
			return
		}
		defer rows.Close()

		var reviews []Review
		for rows.Next() {
			var r Review
			var publishedAt sql.NullString
			err := rows.Scan(&r.ID, &r.ProductID, &r.UserID, &r.Content, &r.Rating, &r.Status, &r.CreatedAt, &publishedAt)
			if err != nil {
				log.Printf("Failed to scan reviews: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan reviews"})
				return
			}
			if publishedAt.Valid {
				r.PublishedAt = publishedAt.String
			}
			reviews = append(reviews, r)
		}

		c.JSON(http.StatusOK, reviews)
	}
}

// CreateReview создаёт новый отзыв
func CreateReview(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.Param("userId")
		userIDInt, err := strconv.Atoi(userID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
			return
		}

		// Проверка существования пользователя
		var exists bool
		err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)", userIDInt).Scan(&exists)
		if err != nil || !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User does not exist"})
			return
		}

		var review Review
		if err := c.ShouldBindJSON(&review); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		// Валидация
		if review.ProductID == 0 || review.Content == "" || review.Rating < 1 || review.Rating > 5 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid review data"})
			return
		}

		// Проверка существования продукта
		err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM product WHERE id = $1)", review.ProductID).Scan(&exists)
		if err != nil || !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Product does not exist"})
			return
		}

		query := `
			INSERT INTO reviews (product_id, user_id, content, rating, status, created_at)
			VALUES ($1, $2, $3, $4, 'pending', NOW())
			RETURNING id, created_at`

		var createdID int
		var createdAt string
		err = db.QueryRow(query, review.ProductID, userIDInt, review.Content, review.Rating).
			Scan(&createdID, &createdAt)
		if err != nil {
			log.Printf("Failed to create review: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create review"})
			return
		}

		review.ID = createdID
		review.UserID = userIDInt
		review.Status = "pending"
		review.CreatedAt = createdAt

		c.JSON(http.StatusCreated, review)
	}
}