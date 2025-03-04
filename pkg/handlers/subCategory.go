package handlers

import (
	"aesthetics/models"
	"database/sql"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

func GetSubCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var subCategory models.SubCategory

		rows, err := db.Query("SELECT id, parent_id, name, created_at FROM sub_category ORDER BY parent_id, id")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка при получении подкатегорий с бд"})
			log.Fatal(err)
		}
		defer rows.Close()

		var subCategories []models.SubCategory
		for rows.Next() {
			err := rows.Scan(&subCategory.ID, &subCategory.ParentId, &subCategory.Name, &subCategory.CreatedAt)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сканировании подкатегорий"})
				log.Fatal(err)
				return
			}
			subCategories = append(subCategories, subCategory)
		}

		c.JSON(http.StatusOK, gin.H{
			"subCategories": subCategories,
		})
	}
}

func UpdateSubCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var updatedSubCategory models.SubCategory
		if err := c.ShouldBindJSON(&updatedSubCategory); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		// Проверка существования подкатегории
		var exists bool
		err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM sub_category WHERE id = $1)", id).Scan(&exists)
		if err != nil {
			log.Printf("Ошибка при проверке существования подкатегории: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при проверке существования подкатегории"})
			return
		}

		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "Подкатегория не найдена"})
			return
		}

		// Обновление подкатегории
		_, err = db.Exec(
			"UPDATE sub_category SET name = $1 WHERE id = $2",
			updatedSubCategory.Name, id,
		)

		if err != nil {
			log.Printf("Ошибка при обновлении подкатегории: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обновлении подкатегории"})
			return
		}

		// Возврат обновленной подкатегории
		var subCategory models.SubCategory
		err = db.QueryRow("SELECT id, name FROM sub_category WHERE id = $1", id).Scan(&subCategory.ID, &subCategory.Name)
		if err != nil {
			log.Printf("Ошибка при получении обновленной подкатегории: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении обновленной подкатегории"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":     "Подкатегория успешно обновлена",
			"subCategory": subCategory,
		})
	}
}

func DeleteSubCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		_, err := db.Exec("DELETE FROM sub_category WHERE id = $1", id)
		if err != nil {
			log.Fatal(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при удалении категории"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Категория успешно удалена",
		})
	}
}
