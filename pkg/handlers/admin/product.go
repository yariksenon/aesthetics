package admin

import (
	"aesthetics/models"
	"database/sql"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"time"
)

func AdminGetProducts(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var products []models.Product
		rows, err := db.Query(`
            SELECT id, name, description, summary, sub_category_id, color, size, sku, price, quantity, created_at
            FROM product
        `)
		if err != nil {
			log.Println("Не удалось извлечь данные с бд о product:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось извлечь данные с бд о product"})
			return
		}
		defer rows.Close()

		for rows.Next() {
			var product models.Product
			err := rows.Scan(
				&product.ID,
				&product.Name,
				&product.Description,
				&product.Summary,
				&product.SubCategoryID,
				&product.Color,
				&product.Size,
				&product.SKU,
				&product.Price,
				&product.Quantity,
				&product.CreatedAt,
			)
			if err != nil {
				log.Println("Ошибка при сканировании продукта:", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при сканировании продукта"})
				return
			}
			products = append(products, product)
		}
		c.JSON(http.StatusOK, products)
	}
}

func AdminGetProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		productId := c.Param("productID")
		var product models.Product
		err := db.QueryRow(`
            SELECT id, name, description, summary, sub_category_id, color, size, sku, price, quantity, created_at
            FROM product WHERE id=$1
        `, productId).Scan(
			&product.ID, &product.Name, &product.Description, &product.Summary, &product.SubCategoryID,
			&product.Color, &product.Size, &product.SKU, &product.Price, &product.Quantity, &product.CreatedAt,
		)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "Product not found with ID " + productId})
			} else {
				log.Println("Error retrieving product:", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving product: " + err.Error()})
			}
			return
		}
		c.JSON(http.StatusOK, gin.H{"product": product})
	}
}

func AdminAddProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var newProduct models.Product
		if err := c.ShouldBindJSON(&newProduct); err != nil {
			log.Println("Ошибка при парсинге JSON:", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		if newProduct.Name == "" || newProduct.SubCategoryID == 0 || newProduct.Price == 0 || newProduct.Quantity == 0 {
			log.Println("Не все обязательные поля заполнены")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Не все обязательные поля заполнены"})
			return
		}

		query := `
            INSERT INTO product (name, description, summary, sub_category_id, color, size, price, quantity, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, sku
        `
		var productID int
		var sku sql.NullInt64
		err := db.QueryRow(
			query,
			newProduct.Name,
			newProduct.Description,
			newProduct.Summary,
			newProduct.SubCategoryID,
			newProduct.Color,
			newProduct.Size,
			newProduct.Price,
			newProduct.Quantity,
			time.Now(),
		).Scan(&productID, &sku)
		if err != nil {
			log.Println("Ошибка при добавлении товара:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось добавить товар"})
			return
		}

		response := gin.H{"message": "Товар успешно добавлен", "id": productID}
		if sku.Valid {
			response["sku"] = sku.Int64
		} else {
			response["sku"] = nil
		}
		c.JSON(http.StatusCreated, response)
	}
}

func AdminUpdateProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		productID := c.Param("id")
		var updatedProduct models.Product
		if err := c.ShouldBindJSON(&updatedProduct); err != nil {
			log.Println("Ошибка при парсинге JSON:", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		if updatedProduct.Name == "" || updatedProduct.SubCategoryID == 0 || updatedProduct.Price == 0 || updatedProduct.Quantity == 0 {
			log.Println("Не все обязательные поля заполнены")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Не все обязательные поля заполнены"})
			return
		}

		query := `
            UPDATE product
            SET name = $1, description = $2, summary = $3, sub_category_id = $4, color = $5, size = $6, price = $7, quantity = $8
            WHERE id = $9
        `
		result, err := db.Exec(
			query,
			updatedProduct.Name,
			updatedProduct.Description,
			updatedProduct.Summary,
			updatedProduct.SubCategoryID,
			updatedProduct.Color,
			updatedProduct.Size,
			updatedProduct.Price,
			updatedProduct.Quantity,
			productID,
		)
		if err != nil {
			log.Println("Ошибка при обновлении товара:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось обновить товар"})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Товар не найден"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Товар успешно обновлен"})
	}
}

func AdminDeleteProduct(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		productID := c.Param("id")
		result, err := db.Exec("DELETE FROM product WHERE id = $1", productID)
		if err != nil {
			log.Println("Ошибка при удалении товара:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось удалить товар"})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Товар не найден"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Товар успешно удален"})
	}
}
