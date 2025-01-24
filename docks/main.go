package main

import (
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"net/smtp"
)

const (
	password = "djlp sdau zhil kutb" // Пароль приложения
	from     = "aesthetics.team.contacts@gmail.com"
	smtpHost = "smtp.gmail.com"
	smtpPort = "587" // Порт для TLS
)

type SubscribeRequest struct {
	Email string `json:"email"`
}

func subscribeHandler(c *gin.Context) {
	var req SubscribeRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	auth := smtp.PlainAuth("", from, password, smtpHost)
	to := []string{req.Email}
	msg := []byte("To: " + req.Email + "\r\n" +
		"Subject: Подписка на рассылку\r\n" +
		"\r\n" +
		"Вы успешно подписались на нашу рассылку.\r\n")

	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, to, msg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Email send successfully",
	})
}

func main() {
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	r.POST("/api/subscribe", subscribeHandler)
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
