package smtp

import (
	"log"
	"net/smtp"
)

type SMTPClient struct {
	Auth smtp.Auth
	Host string
	Port string
}

func NewSMTPClient(username, password, host, port string) *SMTPClient {
	auth := smtp.PlainAuth("", username, password, host)
	return &SMTPClient{
		Auth: auth,
		Host: host,
		Port: port,
	}
}

func (s *SMTPClient) SendMail(from, to, subject, body string) error {
	msg := "From: " + from + "\n" +
		"To: " + to + "\n" +
		"Subject: " + subject + "\n\n" +
		body

	err := smtp.SendMail(s.Host+":"+s.Port, s.Auth, from, []string{to}, []byte(msg))
	if err != nil {
		log.Printf("Ошибка при отправке письма: %v", err)
		return err
	}

	log.Println("Письмо успешно отправлено")
	return nil
}
