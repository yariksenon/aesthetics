package handlers

import (
	"aesthetics/config"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"net/smtp"
)

type SubscribeRequest struct {
	Email string `json:"email"`
}

func HandleEmail(c *gin.Context) {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Can't load config smtp", err)
	}

	var req SubscribeRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	auth := smtp.PlainAuth("", cfg.Smtp.From, cfg.Smtp.Password, cfg.Smtp.Host)
	to := []string{req.Email}
	msg := []byte("To: " + req.Email + "\r\n" +
		"Subject: Подписка на рассылку\r\n" +
		"\r\n" +
		"Вы успешно подписались на нашу рассылку.\r\n")

	err = smtp.SendMail(cfg.Smtp.Host+":"+cfg.Smtp.Port, auth, cfg.Smtp.From, to, msg)
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
