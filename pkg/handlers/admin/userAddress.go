package admin

import (
	"aesthetics/models"
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// AdminGetUserAddresses возвращает список всех адресов пользователей
func AdminGetUserAddresses(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Query("SELECT id, user_id, address_line, country, city, postal_code, created_at FROM user_address")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var addresses []models.UserAddress
		for rows.Next() {
			var addr models.UserAddress
			if err := rows.Scan(&addr.ID, &addr.UserID, &addr.AddressLine, &addr.Country, &addr.City, &addr.PostalCode, &addr.CreatedAt); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			addresses = append(addresses, addr)
		}

		c.JSON(http.StatusOK, addresses)
	}
}

// AdminGetUserAddress возвращает адрес пользователя по ID
func AdminGetUserAddress(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
			return
		}

		var addr models.UserAddress
		err = db.QueryRow("SELECT id, user_id, address_line, country, city, postal_code, created_at FROM user_address WHERE id = $1", id).
			Scan(&addr.ID, &addr.UserID, &addr.AddressLine, &addr.Country, &addr.City, &addr.PostalCode, &addr.CreatedAt)

		switch {
		case err == sql.ErrNoRows:
			c.JSON(http.StatusNotFound, gin.H{"error": "Address not found"})
			return
		case err != nil:
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, addr)
	}
}

// AdminCreateUserAddress создает новый адрес пользователя
func AdminCreateUserAddress(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var addr models.UserAddress
		if err := c.ShouldBindJSON(&addr); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var id int
		err := db.QueryRow(
			"INSERT INTO user_address (user_id, address_line, country, city, postal_code) VALUES ($1, $2, $3, $4, $5) RETURNING id",
			addr.UserID, addr.AddressLine, addr.Country, addr.City, addr.PostalCode,
		).Scan(&id)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		addr.ID = id
		c.JSON(http.StatusCreated, addr)
	}
}

// AdminUpdateUserAddress обновляет адрес пользователя
func AdminUpdateUserAddress(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
			return
		}

		var addr models.UserAddress
		if err := c.ShouldBindJSON(&addr); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		result, err := db.Exec(
			"UPDATE user_address SET user_id = $1, address_line = $2, country = $3, city = $4, postal_code = $5 WHERE id = $6",
			addr.UserID, addr.AddressLine, addr.Country, addr.City, addr.PostalCode, id,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Address not found"})
			return
		}

		addr.ID = id
		c.JSON(http.StatusOK, addr)
	}
}

// AdminDeleteUserAddress удаляет адрес пользователя
func AdminDeleteUserAddress(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
			return
		}

		result, err := db.Exec("DELETE FROM user_address WHERE id = $1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Address not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Address deleted successfully"})
	}
}
