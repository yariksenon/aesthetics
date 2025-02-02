package handlers

import (
	"github.com/gin-gonic/gin"
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

func HandleEmail(c *gin.Context) {
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
