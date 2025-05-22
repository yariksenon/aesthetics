package admin

import (
    "database/sql"
    "log"
    "net/http"
    "sync"
    "aesthetics/cmd/smtp"
    "github.com/gin-gonic/gin"
)

// EmailMessage represents the structure for admin email message
type EmailMessage struct {
    Subject string `json:"subject"`
    Body    string `json:"body"`
}

// SendNewsletter handles sending emails to all subscribers
func SendNewsletter(db *sql.DB, smtpClient *smtp.SMTPClient) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Parse request body
        var message EmailMessage
        if err := c.BindJSON(&message); err != nil {
            log.Printf("Ошибка при разборе тела запроса: %v", err)
            c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат запроса"})
            return
        }

        // Validate input
        if message.Subject == "" || message.Body == "" {
            log.Printf("Отсутствует тема или тело письма")
            c.JSON(http.StatusBadRequest, gin.H{"error": "Тема и тело письма обязательны"})
            return
        }

        // Get all subscribed emails from database
        rows, err := db.Query("SELECT email FROM users WHERE subscription = true")
        if err != nil {
            log.Printf("Ошибка при получении списка подписчиков: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить список подписчиков"})
            return
        }
        defer rows.Close()

        // Collect emails
        var emails []string
        for rows.Next() {
            var email string
            if err := rows.Scan(&email); err != nil {
                log.Printf("Ошибка при сканировании email: %v", err)
                continue
            }
            emails = append(emails, email)
        }

        // Check for errors from iterating over rows
        if err = rows.Err(); err != nil {
            log.Printf("Ошибка при обработке строк результата: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обработке подписчиков"})
            return
        }

        // Send emails concurrently with a limit
        const maxConcurrent = 10 // Максимальное количество одновременных отправок
        var wg sync.WaitGroup
        failedEmails := 0
        mu := &sync.Mutex{} // Для синхронизации счетчика failedEmails
        semaphore := make(chan struct{}, maxConcurrent)

        for _, email := range emails {
            // Занимаем слот в семафоре
            semaphore <- struct{}{}
            wg.Add(1)

            go func(email string) {
                defer wg.Done()
                defer func() { <-semaphore }() // Освобождаем слот

                err := smtpClient.SendMail("aesthetics.team.contacts@gmail.com", email, message.Subject, message.Body)
                if err != nil {
                    mu.Lock()
                    log.Printf("Ошибка при отправке письма на %s: %v", email, err)
                    failedEmails++
                    mu.Unlock()
                }
            }(email)
        }

        // Ждем завершения всех горутин
        wg.Wait()

        if failedEmails > 0 {
            log.Printf("Не удалось отправить письма на %d адресов", failedEmails)
            c.JSON(http.StatusOK, gin.H{
                "message": "Рассылка отправлена, но некоторые письма не доставлены",
                "failed":  failedEmails,
            })
            return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Рассылка успешно отправлена"})
    }
}