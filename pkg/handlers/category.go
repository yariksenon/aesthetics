package handlers

import (
	"aesthetics/models"
	"database/sql"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// type SubCategory struct {
// 	ID           int    `json:"id"`
// 	CategoryID   int    `json:"category_id"`
// 	Name         string `json:"name"`
// 	ProductCount int    `json:"product_count"` // Добавляем поле для количества товаров
// }

func UserGetSubCategories(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		type SubCategoryWithGenderCount struct {
			ID           int    `json:"id"`
			CategoryID   int    `json:"category_id"`
			Name         string `json:"name"`
			ProductCount struct {
				Total   int `json:"total"`
				Men     int `json:"men"`
				Women   int `json:"women"`
				Children int `json:"children"`
			} `json:"product_count"`
		}

		query := `
			SELECT 
				sc.id, 
				sc.category_id, 
				sc.name, 
				COUNT(p.id) as total_count,
				COUNT(CASE WHEN p.gender = 'men' THEN 1 END) as men_count,
				COUNT(CASE WHEN p.gender = 'women' THEN 1 END) as women_count,
				COUNT(CASE WHEN p.gender = 'children' THEN 1 END) as children_count
			FROM sub_category sc
			LEFT JOIN product p ON p.sub_category_id = sc.id
			GROUP BY sc.id, sc.category_id, sc.name
			ORDER BY sc.category_id, sc.name
		`

		rows, err := db.Query(query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Не удалось получить подкатегории",
			})
			return
		}
		defer rows.Close()

		var subCategories []SubCategoryWithGenderCount

		for rows.Next() {
			var sc SubCategoryWithGenderCount
			err := rows.Scan(
				&sc.ID,
				&sc.CategoryID,
				&sc.Name,
				&sc.ProductCount.Total,
				&sc.ProductCount.Men,
				&sc.ProductCount.Women,
				&sc.ProductCount.Children,
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Ошибка обработки данных подкатегорий",
				})
				return
			}
			subCategories = append(subCategories, sc)
		}

		if err := rows.Err(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Ошибка при обработке результата запроса",
			})
			return
		}

		c.JSON(http.StatusOK, subCategories)
	}
}

func GetCategory(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var categories []models.Category

		rows, err := db.Query("SELECT id, name FROM category ORDER BY id")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении категорий"})
			log.Println(err)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var category models.Category

			err := rows.Scan(&category.ID, &category.Name)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сканировании категорий"})
				log.Fatal(err)
				return
			}

			categories = append(categories, category)
		}

		// Возвращаем все поля в JSON-ответе
		c.JSON(http.StatusOK, gin.H{
			"category": categories,
		})
	}
}

func GetCategories(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        type CategoryCount struct {
            ID           int    `json:"id"`
            Name         string `json:"name"`
            TotalCount   int    `json:"total_count"`
            MenCount     int    `json:"men_count"`
            WomenCount   int    `json:"women_count"`
            ChildrenCount int   `json:"children_count"`
        }

        query := `
            SELECT 
                c.id, 
                c.name, 
                COUNT(p.id) as total_count,
                SUM(CASE WHEN p.gender = 'men' THEN 1 ELSE 0 END) as men_count,
                SUM(CASE WHEN p.gender = 'women' THEN 1 ELSE 0 END) as women_count,
                SUM(CASE WHEN p.gender = 'children' THEN 1 ELSE 0 END) as children_count
            FROM category c
            LEFT JOIN product p ON p.category_id = c.id
            GROUP BY c.id, c.name
            ORDER BY c.id
        `

        rows, err := db.Query(query)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении категорий"})
            log.Println(err)
            return
        }
        defer rows.Close()

        var categories []CategoryCount

        for rows.Next() {
            var category CategoryCount
            err := rows.Scan(
                &category.ID,
                &category.Name,
                &category.TotalCount,
                &category.MenCount,
                &category.WomenCount,
                &category.ChildrenCount,
            )
            if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сканировании категорий"})
                log.Println(err)
                return
            }
            categories = append(categories, category)
        }

        c.JSON(http.StatusOK, gin.H{
            "categories": categories,
        })
    }
}