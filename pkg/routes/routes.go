package routes

import (
	"aesthetics/pkg/handlers"
	"aesthetics/smtp"
	"database/sql"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

func SetupRoutes(r *gin.Engine, db *sql.DB, smtpClient *smtp.SMTPClient, redisClient *redis.Client) {
	v1 := r.Group("/api/v1")
	{
		// ГЛАВНАЯ
		v1.GET("/", handlers.HomePage)

		// Группа маршрутов для товаров
		sexGroup := v1.Group("/:gender")
		{
			sexGroup.GET("/", handlers.GetGender) //пол

			categoryGroup := sexGroup.Group("/:category")
			{
				categoryGroup.GET("/", handlers.GetCategory) //категории

				subCategoryGroup := categoryGroup.Group("/:subcategory")
				{
					subCategoryGroup.GET("/", handlers.GetSubCategory)

					productGroup := subCategoryGroup.Group("/:productId")
					{
						productGroup.GET("/", handlers.GetProduct) //конкретный товар
					}
				}
			}
		}

		// КОРЗИНА
		v1.GET("/cart", handlers.AuthMiddleware(db))               // Получить корзину пользователя
		v1.POST("/cart/add", handlers.AuthMiddleware(db))          // Добавить товар в корзину
		v1.PUT("/cart/update/:id", handlers.AuthMiddleware(db))    // Обновить количество товаров в корзине
		v1.DELETE("/cart/remove/:id", handlers.AuthMiddleware(db)) // Удалить товар из корзины

		// ЗАКАЗ
		v1.GET("/orders", handlers.AuthMiddleware(db))            // Получить все заказы пользователя
		v1.GET("/orders/:id", handlers.AuthMiddleware(db))        // Получить заказы по ID
		v1.POST("/orders", handlers.AuthMiddleware(db))           // Создать новый заказ
		v1.PUT("/orders/:id/cancel", handlers.AuthMiddleware(db)) // Отменить заказ

		// ПОЛЬЗОВАТЕЛЬ
		v1.POST("/register", handlers.RegisterPage(db)) // Зарегистрироваться
		v1.POST("/login", handlers.LoginPage(db))       // Залогиниться

		protected := v1.Group("/profile")
		protected.Use(handlers.AuthMiddleware(db))
		protected.GET("/") // Просмотреть профиль
		protected.PUT("/") // Обновить профиль

		//Email
		v1.POST("/subscribe", handlers.HandleEmail(smtpClient))
	}
}
