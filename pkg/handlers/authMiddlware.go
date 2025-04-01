package handlers

import (
	"aesthetics/config"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func JWTMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Authorization header required",
				"details": "Expected format: 'Bearer <token>'",
			})
			c.Abort()
			return
		}

		const bearerPrefix = "Bearer "
		if !strings.HasPrefix(tokenString, bearerPrefix) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Invalid authorization format",
				"details": "Token must be prefixed with 'Bearer '",
			})
			c.Abort()
			return
		}
		tokenString = strings.TrimPrefix(tokenString, bearerPrefix)

		token, err := config.ParseJWT(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Invalid token",
				"details": err.Error(),
			})
			c.Abort()
			return
		}

		if !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Token is not valid",
				"details": "Token may be expired or invalid",
			})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Invalid token structure",
				"details": "Could not parse token claims",
			})
			c.Abort()
			return
		}

		userID, ok := claims["user_id"].(float64)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Invalid user ID in token",
				"details": "user_id claim missing or invalid",
			})
			c.Abort()
			return
		}

		username, ok := claims["username"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Invalid username in token",
				"details": "username claim missing or invalid",
			})
			c.Abort()
			return
		}

		c.Set("userID", int(userID))
		c.Set("username", username)

		c.Next()
	}
}
