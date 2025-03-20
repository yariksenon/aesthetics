package admin

import (
	"aesthetics/database"
	"database/sql"
	_ "embed"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

func AdminGetPanel(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		queries := map[string]string{
			"users":    "user/countOfUsers",
			"orders":   "order/countOfOrders",
			"products": "product/countOfProducts",
		}

		results := make(map[string]int)

		for key, queryKey := range queries {
			query, ok := database.Queries[queryKey]
			if !ok {
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Query for %s not found", key)})
				return
			}

			var count int
			if err := db.QueryRow(query).Scan(&count); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get count of %s", key)})
				return
			}

			results[key] = count
		}

		c.JSON(http.StatusOK, results)
	}
}
