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
		rows, err := db.Query("SELECT id, parent_id, name, created_at FROM subcategories")
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

// GetSubCategory возвращает подкатегорию по ID
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

// CreateSubCategory создает новую подкатегорию
func CreateSubCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var sc models.SubCategory
		if err := c.ShouldBindJSON(&sc); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := db.QueryRow(
			"INSERT INTO subcategories (parent_id, name, created_at) VALUES ($1, $2, $3) RETURNING id, created_at",
			sc.ParentId, sc.Name, time.Now(),
		).Scan(&sc.ID, &sc.CreatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, sc)
	}
}

// UpdateSubCategory обновляет подкатегорию
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

// DeleteSubCategory удаляет подкатегорию
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
