package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func PostSeller(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Получаем данные формы
		storeName := c.PostForm("store_name")
		description := c.PostForm("description")
		email := c.PostForm("email")
		phone := c.PostForm("phone")
		businessCategory := c.PostForm("business_category")

		// Получаем файл (логотип)
		file, err := c.FormFile("Logo")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка загрузки файла"})
			return
		}

		// Генерируем путь сохранения файла
		filePath := "uploads/seller/" + file.Filename

		// Сохраняем файл
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось сохранить файл"})
			return
		}

		// Сохранение заявки в БД
		_, err = db.Exec(`
            INSERT INTO seller_applications (store_name, description, email, phone, category, logo_path, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        `, storeName, description, email, phone, businessCategory, filePath)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сохранения заявки"})
			return
		}

		// Ответ клиенту
		c.JSON(http.StatusOK, gin.H{"message": "Заявка успешно отправлена, ожидайте подтверждения."})
	}
}
