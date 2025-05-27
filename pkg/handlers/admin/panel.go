package admin

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"net/http"
)

func AdminGetPanel(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Создаем карту для хранения результатов
		results := make(map[string]int)
		var count int
		var err error

		// 1. Количество пользователей
		err = db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users count"})
			return
		}
		results["users"] = count

		// 2. Количество товаров
		err = db.QueryRow("SELECT COUNT(*) FROM product").Scan(&count)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get products count"})
			return
		}
		results["products"] = count

		// 3. Количество заказов
		err = db.QueryRow("SELECT COUNT(*) FROM orders").Scan(&count)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get orders count"})
			return
		}
		results["orders"] = count

		// 4. Количество категорий
		err = db.QueryRow("SELECT COUNT(*) FROM category").Scan(&count)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get categories count"})
			return
		}
		results["categories"] = count

		// 5. Количество подкатегорий
		err = db.QueryRow("SELECT COUNT(*) FROM sub_category").Scan(&count)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get subcategories count"})
			return
		}
		results["subcategories"] = count

		// 6. Количество отзывов
		err = db.QueryRow("SELECT COUNT(*) FROM reviews").Scan(&count)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get reviews count"})
			return
		}
		results["reviews"] = count

		// 7. Количество брендов
		err = db.QueryRow("SELECT COUNT(*) FROM brand").Scan(&count)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get brands count"})
			return
		}
		results["brands"] = count

		// 8. Количество курьеров
		err = db.QueryRow("SELECT COUNT(*) FROM courier").Scan(&count)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get couriers count"})
			return
		}
		results["couriers"] = count

		// Возвращаем все результаты
		c.JSON(http.StatusOK, results)
	}
}