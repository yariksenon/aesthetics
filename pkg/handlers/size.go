package handlers

import (
	"database/sql"
	"net/http"
	"log"
	"github.com/gin-gonic/gin"
	"strconv"
	"aesthetics/models"
)


// GET /size-types
func GetSizeTypes(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Query("SELECT id, name, description FROM size_types ORDER BY id")
		if err != nil {
			log.Printf("DB query error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "database_error",
				"message": "Failed to fetch size types",
			})
			return
		}
		defer rows.Close()

		var sizeTypes []models.SizeType
		for rows.Next() {
			var st models.SizeType
			if err := rows.Scan(&st.ID, &st.Name, &st.Description); err != nil {
				log.Printf("Row scan error: %v", err)
				continue
			}
			sizeTypes = append(sizeTypes, st)
		}

		if err = rows.Err(); err != nil {
			log.Printf("Rows error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "database_error",
				"message": "Error processing size types",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": gin.H{
				"size_types": sizeTypes,
				"count":      len(sizeTypes),
			},
		})
	}
}


// GET /sizes?size_type_id=X
// GetSizes возвращает размеры по type_id
func GetSizes(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Получаем параметр (поддерживаем оба варианта написания)
		sizeTypeID := c.Query("size_type_id")
		if sizeTypeID == "" {
			sizeTypeID = c.Query("size_types_id")
		}

		if sizeTypeID == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "missing_parameter",
				"message": "size_type_id parameter is required",
				"details": "Use either size_type_id or size_types_id parameter",
			})
			return
		}

		// Проверяем что параметр - число
		typeID, err := strconv.Atoi(sizeTypeID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "invalid_parameter",
				"message": "size_type_id must be an integer",
			})
			return
		}

		// ИСПРАВЛЕННЫЙ ЗАПРОС - используем правильное имя таблицы 'sizes'
		rows, err := db.Query(`
			SELECT id, value, size_type_id, description 
			FROM sizes 
			WHERE size_type_id = $1
			ORDER BY value`, typeID)
		if err != nil {
			log.Printf("DB query error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "database_error",
				"message": "Failed to fetch sizes",
				"details": err.Error(), // Добавляем детали ошибки
			})
			return
		}
		defer rows.Close()

		var sizes []models.Size
		for rows.Next() {
			var size models.Size
			if err := rows.Scan(
				&size.ID,
				&size.Value,
				&size.SizeTypeID,
				&size.Description,
			); err != nil {
				log.Printf("Row scan error: %v", err)
				continue
			}
			sizes = append(sizes, size)
		}

		if err = rows.Err(); err != nil {
			log.Printf("Rows error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "database_error",
				"message": "Error processing sizes",
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"data": gin.H{
				"sizes":       sizes,
				"count":       len(sizes),
				"size_type_id": typeID,
			},
		})
	}
}