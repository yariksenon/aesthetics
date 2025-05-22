package handlers

import (
    "aesthetics/cmd/smtp"
    "log"
    "net/http"
    "database/sql"
    "github.com/gin-gonic/gin"
)

type SubscribeRequest struct {
    Email string `json:"email"`
}

func HandleEmail(db *sql.DB, smtpClient *smtp.SMTPClient) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req SubscribeRequest
        if err := c.BindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        // Сначала проверяем, есть ли пользователь с таким email
        var exists bool
        err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", req.Email).Scan(&exists)
        if err != nil {
            log.Printf("Ошибка при проверке пользователя: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при проверке пользователя"})
            return
        }

        if !exists {
            // Если пользователя нет, создаем новую запись
            _, err = db.Exec("INSERT INTO users (email, subscription) VALUES ($1, true)", req.Email)
        } else {
            // Если пользователь есть, обновляем подписку
            _, err = db.Exec("UPDATE users SET subscription = true WHERE email = $1", req.Email)
        }

        if err != nil {
            log.Printf("Ошибка при обновлении подписки: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обновлении подписки"})
            return
        }

        // Отправка письма о подписке
        err = smtpClient.SendMail("aesthetics.team.contacts@gmail.com", req.Email, "Подписка на рассылку", "Вы успешно подписались на нашу рассылку.")
        if err != nil {
            log.Printf("Ошибка при отправке письма: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при отправке письма"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Подписка успешно оформлена", "subscribed": true})
    }
}

func HandleUnsubscribe(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req SubscribeRequest
        if err := c.BindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        _, err := db.Exec("UPDATE users SET subscription = false WHERE email = $1", req.Email)
        if err != nil {
            log.Printf("Ошибка при отписке: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при отписке"})
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Вы успешно отписались", "subscribed": false})
    }
}

func CheckSubscribeByEmail(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        email := c.Param("email")

        var subscription bool
        err := db.QueryRow("SELECT subscription FROM users WHERE email = $1", email).Scan(&subscription)
        if err != nil {
            if err == sql.ErrNoRows {
                c.JSON(http.StatusOK, gin.H{"subscribed": false})
            } else {
                log.Printf("Ошибка при проверке подписки: %v", err)
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при проверке подписки"})
            }
            return
        }

        c.JSON(http.StatusOK, gin.H{"subscribed": subscription})
    }
}