package handlers

import (
	"aesthetics/models"
	"aesthetics/twilio"
	"database/sql"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
	"time"
)

func RegisterPage(db *sql.DB, twilioClient *twilio.TwilioClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User

		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var usernameExists bool
		err := db.QueryRow(`SELECT EXISTS (SELECT 1 FROM users WHERE username = $1)`, user.Username).Scan(&usernameExists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}
		if usernameExists {
			c.JSON(http.StatusConflict, gin.H{"message": "Имя пользователя уже существует"})
			return
		}

		var emailExists bool
		err = db.QueryRow(`SELECT EXISTS (SELECT 1 FROM users WHERE email = $1)`, strings.ToLower(user.Email)).Scan(&emailExists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}
		if emailExists {
			c.JSON(http.StatusConflict, gin.H{"message": "Электронная почта уже существует"})
			return
		}

		var phoneExists bool
		err = db.QueryRow(`SELECT EXISTS (SELECT 1 FROM users WHERE phone = $1)`, user.Phone).Scan(&phoneExists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сервера"})
			return
		}
		if phoneExists {
			c.JSON(http.StatusConflict, gin.H{"message": "Телефон уже используется"})
			return
		}

		_, err = db.Exec(`INSERT INTO users (username, email, password, phone, role, created_at) VALUES ($1, $2, $3, $4, $5, $6)`, user.Username, strings.ToLower(user.Email), user.Password, user.Phone, "customer", time.Now())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сохранении данных пользователя"})
			return
		}

		//code := generateVerificationCode()
		//
		//if err := twilioClient.SendVerificationCode(user.Phone, code); err != nil {
		//	c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка отправки SMS"})
		//	return
		//}
		//
		//c.JSON(http.StatusOK, gin.H{
		//	"message": "Пользователь зарегистрирован. Код подтверждения отправлен.",
		//	"code":    code,
		//})

	}
}

//var verificationCodes = make(map[string]string)
//
//func SendVerificationCode(twilioClient *twilio.TwilioClient) gin.HandlerFunc {
//	return func(c *gin.Context) {
//		var req struct {
//			PhoneNumber string `json:"phoneNumber"`
//		}
//
//		// Привязка JSON-запроса к структуре
//		if err := c.ShouldBindJSON(&req); err != nil {
//			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат запроса"})
//			return
//		}
//
//		// Генерация кода подтверждения
//		code := fmt.Sprintf("%06d", rand.Intn(1000000))
//		verificationCodes[req.PhoneNumber] = code
//
//		// Отправка SMS через Twilio
//		if err := twilioClient.SendVerificationCode(req.PhoneNumber, code); err != nil {
//			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка отправки SMS"})
//			return
//		}
//
//		c.JSON(http.StatusOK, gin.H{
//			"success": true,
//			"message": "Код подтверждения отправлен.",
//		})
//	}
//}
//
//func VerifyCode() gin.HandlerFunc {
//	return func(c *gin.Context) {
//		var req struct {
//			PhoneNumber string `json:"phoneNumber"`
//			Code        string `json:"code"`
//		}
//
//		// Привязка JSON-запроса к структуре
//		if err := c.ShouldBindJSON(&req); err != nil {
//			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат запроса"})
//			return
//		}
//
//		// Проверка кода подтверждения
//		if storedCode, ok := verificationCodes[req.PhoneNumber]; ok && storedCode == req.Code {
//			c.JSON(http.StatusOK, gin.H{
//				"verified": true,
//				"message":  "Код подтвержден.",
//			})
//		} else {
//			c.JSON(http.StatusBadRequest, gin.H{
//				"verified": false,
//				"message":  "Неверный код подтверждения.",
//			})
//		}
//	}
//}
//
//func generateVerificationCode() string {
//	return fmt.Sprintf("%06d", rand.Intn(1000000))
//}
