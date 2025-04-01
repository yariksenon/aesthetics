package handlers

import (
	"aesthetics/config"
	"aesthetics/database"
	"aesthetics/models"
	"aesthetics/twilio"
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"log"
	"net/http"
	"strings"
	"time"
)

const (
	defaultRole = "customer"
)

func valueExists(db *sql.DB, queryName string, value interface{}) (bool, error) {
	query, ok := database.Queries[queryName]
	if !ok {
		return false, fmt.Errorf("Query %s does not exist", queryName)
	}
	var exists bool
	err := db.QueryRow(query, value).Scan(&exists)
	return exists, err
}

func RegisterPage(db *sql.DB, twilioClient *twilio.TwilioClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User

		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		if len(user.Password) < 8 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Password must be at least 8 characters"})
			return
		}

		checks := map[string]struct {
			queryName string
			value     interface{}
			msg       string
		}{
			"username": {"user/verificationName", user.Username, "Username already exists"},
			"email":    {"user/verificationEmail", strings.ToLower(user.Email), "Email already exists"},
			"phone":    {"user/verificationPhone", user.Phone, "Phone already in use"},
		}

		for _, check := range checks {
			exists, err := valueExists(db, check.queryName, check.value)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Server error"})
				return
			}
			if exists {
				c.JSON(http.StatusConflict, gin.H{"message": check.msg})
				return
			}
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not process password"})
			return
		}

		query, ok := database.Queries["user/createUser"]
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Server configuration error"})
			return
		}

		var userID int
		err = db.QueryRow(query,
			user.Username,
			strings.ToLower(user.Email),
			hashedPassword,
			user.Phone,
			defaultRole,
			time.Now(),
		).Scan(&userID)

		if err != nil {
			log.Printf("Failed to create user: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to create user",
				"details": err.Error(),
			})
			return
		}

		token, err := config.GenerateJWT(userID, user.Username)
		if err != nil {
			log.Printf("Failed to generate JWT: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"id":       userID,
			"username": user.Username,
			"email":    user.Email,
			"token":    token,
		})
	}
}
