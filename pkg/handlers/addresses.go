package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AddressRequest struct {
	UserID      int64  `json:"user_id" binding:"required"`
	AddressLine string `json:"address_line" binding:"required"`
	Country     string `json:"country" binding:"required"`
	City        string `json:"city" binding:"required"`
	PostalCode  string `json:"postal_code" binding:"required"`
}

type AddressResponse struct {
	ID          int64  `json:"id"`
	UserID      int64  `json:"user_id"`
	AddressLine string `json:"address_line"`
	Country     string `json:"country"`
	City        string `json:"city"`
	PostalCode  string `json:"postal_code"`
	CreatedAt   string `json:"created_at,omitempty"`
}

func GetAddress(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.Query("user_id")
		if userID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
			return
		}

		var address AddressResponse
		err := db.QueryRow(`
			SELECT id, user_id, address_line, country, city, postal_code, created_at 
			FROM user_address 
			WHERE user_id = $1
		`, userID).Scan(
			&address.ID,
			&address.UserID,
			&address.AddressLine,
			&address.Country,
			&address.City,
			&address.PostalCode,
			&address.CreatedAt,
		)

		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "address not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
			return
		}

		c.JSON(http.StatusOK, address)
	}
}

func SaveAddress(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req AddressRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if address exists for user
		var exists bool
		err := db.QueryRow(`
			SELECT EXISTS(SELECT 1 FROM user_address WHERE user_id = $1)
		`, req.UserID).Scan(&exists)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
			return
		}

		var query string
		var args []interface{}

		if exists {
			// Update existing address
			query = `
				UPDATE user_address 
				SET address_line = $1, country = $2, city = $3, postal_code = $4
				WHERE user_id = $5
				RETURNING id, user_id, address_line, country, city, postal_code, created_at
			`
			args = []interface{}{req.AddressLine, req.Country, req.City, req.PostalCode, req.UserID}
		} else {
			// Insert new address
			query = `
				INSERT INTO user_address (user_id, address_line, country, city, postal_code)
				VALUES ($1, $2, $3, $4, $5)
				RETURNING id, user_id, address_line, country, city, postal_code, created_at
			`
			args = []interface{}{req.UserID, req.AddressLine, req.Country, req.City, req.PostalCode}
		}

		var address AddressResponse
		err = db.QueryRow(query, args...).Scan(
			&address.ID,
			&address.UserID,
			&address.AddressLine,
			&address.Country,
			&address.City,
			&address.PostalCode,
			&address.CreatedAt,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save address"})
			return
		}

		c.JSON(http.StatusOK, address)
	}
}