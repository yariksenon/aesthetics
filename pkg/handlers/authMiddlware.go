package handlers

import (
	"aesthetics/config"
	"net/http"
	"strings"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func JWTMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        tokenString := c.GetHeader("Authorization")
        
        // Проверяем куки, если нет заголовка
        if tokenString == "" {
            tokenString, _ = c.Cookie("auth_token")
            if tokenString == "" {
                c.JSON(http.StatusUnauthorized, gin.H{
                    "error": "Authorization required",
                    "details": "Provide Bearer token in Authorization header or auth_token cookie",
                })
                c.Abort()
                return
            }
        } else {
            // Обрабатываем Bearer token из заголовка
            const bearerPrefix = "Bearer "
            if !strings.HasPrefix(tokenString, bearerPrefix) {
                c.JSON(http.StatusUnauthorized, gin.H{
                    "error": "Invalid authorization format",
                    "details": "Token must be prefixed with 'Bearer '",
                })
                c.Abort()
                return
            }
            tokenString = strings.TrimPrefix(tokenString, bearerPrefix)
        }

        token, err := config.ParseJWT(tokenString)
        if err != nil {
            log.Printf("JWT validation error: %v", err)
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Invalid token",
                "details": err.Error(),
            })
            c.Abort()
            return
        }

        if !token.Valid {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Token is not valid",
                "details": "Token may be expired or invalid",
            })
            c.Abort()
            return
        }

        claims, ok := token.Claims.(jwt.MapClaims)
        if !ok {
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Invalid token structure",
                "details": "Could not parse token claims",
            })
            c.Abort()
            return
        }

        // Извлекаем user_id с проверкой типа
        var userID int
        switch v := claims["user_id"].(type) {
        case float64:
            userID = int(v)
        case int:
            userID = v
        default:
            c.JSON(http.StatusUnauthorized, gin.H{
                "error": "Invalid user ID in token",
                "details": "user_id claim missing or invalid type",
            })
            c.Abort()
            return
        }

        // Устанавливаем данные в контекст
        c.Set("userID", userID)
        if username, ok := claims["username"].(string); ok {
            c.Set("username", username)
        }
        if role, ok := claims["role"].(string); ok {
            c.Set("role", role)
        }

        c.Next()
    }
}