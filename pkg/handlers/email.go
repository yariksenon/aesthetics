package handlers

import (
	"aesthetics/smtp"
	"github.com/gin-gonic/gin"

	"net/http"
)

type SubscribeRequest struct {
	Email string `json:"email"`
}

func HandleEmail(smtpClient *smtp.SMTPClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req SubscribeRequest
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := smtpClient.SendMail("aesthetics.team.contacts@gmail.com", req.Email, "Подписка на рассылку", "Вы успешно подписались на нашу рассылку.")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при отправке письма"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Email успешно отправлен"})
	}
}
