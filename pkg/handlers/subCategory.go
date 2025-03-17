package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"aesthetics/models"
	"github.com/gin-gonic/gin"
)

func GetSubCategories(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Query("SELECT id, parent_id, name, created_at FROM sub_category")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var subCategories []models.SubCategory
		for rows.Next() {
			var sc models.SubCategory
			if err := rows.Scan(&sc.ID, &sc.ParentId, &sc.Name, &sc.CreatedAt); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			subCategories = append(subCategories, sc)
		}

		c.JSON(http.StatusOK, subCategories)
	}
}

func GetSubCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID"})
			return
		}

		var sc models.SubCategory
		err = db.QueryRow("SELECT id, parent_id, name, created_at FROM subcategories WHERE id = $1", id).
			Scan(&sc.ID, &sc.ParentId, &sc.Name, &sc.CreatedAt)
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Подкатегория не найдена"})
			return
		} else if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, sc)
	}
}

func CreateSubCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var sc models.SubCategory
		if err := c.ShouldBindJSON(&sc); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		// Валидация
		if sc.Name == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Название не может быть пустым"})
			return
		}
		if sc.ParentId == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Родительская категория не указана"})
			return
		}

		err := db.QueryRow(
			"INSERT INTO sub_category (parent_id, name, created_at) VALUES ($1, $2, $3) RETURNING id, created_at",
			sc.ParentId, sc.Name, time.Now(),
		).Scan(&sc.ID, &sc.CreatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, sc)
	}
}

func UpdateSubCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID"})
			return
		}

		var sc models.SubCategory
		if err := c.ShouldBindJSON(&sc); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		result, err := db.Exec(
			"UPDATE subcategories SET parent_id = $1, name = $2 WHERE id = $3",
			sc.ParentId, sc.Name, id,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Подкатегория не найдена"})
			return
		}

		// Получаем обновленные данные
		err = db.QueryRow("SELECT created_at FROM subcategories WHERE id = $1", id).Scan(&sc.CreatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		sc.ID = id
		c.JSON(http.StatusOK, sc)
	}
}

func DeleteSubCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID"})
			return
		}

		result, err := db.Exec("DELETE FROM subcategories WHERE id = $1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Подкатегория не найдена"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Подкатегория удалена"})
	}
}
