package routes

import (
	"aesthetics/cmd/smtp"
	"aesthetics/cmd/twilio"
	"aesthetics/pkg/handlers"
	"aesthetics/pkg/handlers/admin"
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

func SetupRoutes(r *gin.Engine, db *sql.DB, smtpClient *smtp.SMTPClient, redisClient *redis.Client, twilioClient *twilio.TwilioClient) {
	v1 := r.Group("/api/v1")
	{
		v1.GET("/", handlers.HomePage)

		sexGroup := v1.Group("/:gender")
		{
			sexGroup.GET("/", handlers.GetGender)

			categoryGroup := sexGroup.Group("/:category")
			{

				categoryGroup.GET("/", handlers.GetCategory(db))

				subCategoryGroup := categoryGroup.Group("/:subcategory")
				{
					subCategoryGroup.GET("/", handlers.GetSubCategories(db))
				}
			}
		}

		// Authorization
		v1.POST("/register", handlers.RegisterPage(db, twilioClient))
		v1.POST("/login", handlers.LoginHandler(db))

		// Products
		v1.GET("/products", handlers.GetProducts(db))
		v1.GET("/product/:id", handlers.GetProduct(db))

		// Orders
		v1.GET("/orders", handlers.GetProducts(db))

		// Wishlist
		v1.GET("/wishlist", handlers.GetProducts(db))

		// Profile
		v1.GET("/profile/address", handlers.GetAddress(db))
		v1.POST("/profile/address", handlers.SaveAddress(db))

		v1.GET("/profile/:userId", handlers.GetProfile(db))
		v1.PUT("/profile/:userId", handlers.UpdateProfile(db))

		// Cart
		v1.GET("/cart/:userId", handlers.GetCart(db))                         // Получить содержимое корзины пользователя
		v1.POST("/cart/:userId", handlers.AddCartProduct(db))                 // Добавить товар в корзину
		v1.PUT("/cart/:userId/:productId", handlers.UpdateCartProduct(db))    // Обновить количество товара в корзине
		v1.DELETE("/cart/:userId/:productId", handlers.RemoveCartProduct(db)) // Удалить товар из корзины
		v1.DELETE("/cart/:userId", handlers.ClearCart(db))                    // Очистить корзину пользователя

		// Email
		v1.POST("/subscribe", handlers.HandleEmail(smtpClient))
		v1.GET("/addresses", handlers.GetProduct(db))

		customer := v1.Group("/customer")
		{
			customer.GET("")
		}

		manager := v1.Group("/manager")
		{
			manager.GET("")
		}

		seller := v1.Group("/seller")
		{
			seller.POST("/application", handlers.PostSeller(db))
		}

		routesAdmin := v1.Group("/admin")
		{
			routesAdmin.GET("", admin.AdminGetPanel(db))

			user := routesAdmin.Group("/users")
			{
				user.GET("", admin.AdminGetUsers(db))
				user.PUT("/:id", admin.AdminUpdateUser(db))
				user.DELETE("/:id", admin.AdminDeleteUser(db))
			}

			userAddress := routesAdmin.Group("/user_addresses")
			{
				userAddress.GET("", admin.AdminGetUserAddresses(db))         // Получение всех адресов пользователя
				userAddress.PUT("/:id", admin.AdminUpdateUserAddress(db))    // Обновление адреса по ID
				userAddress.DELETE("/:id", admin.AdminDeleteUserAddress(db)) // Удаление адреса по ID
			}

			category := routesAdmin.Group("/categories")
			{
				category.GET("", admin.AdminGetCategories(db))         // Получение всех категорий
				category.PUT("/:id", admin.AdminUpdateCategory(db))    // Обновление категории по ID
				category.DELETE("/:id", admin.AdminDeleteCategory(db)) // Удаление категории по ID
				category.POST("", admin.AdminCreateCategory(db))       // Создание новой категории
			}

			subCategory := routesAdmin.Group("/sub_categories")
			{
				subCategory.GET("", admin.AdminGetSubCategories(db))                                    // Получение всех подкатегорий
				subCategory.GET("/by_category/:category_id", admin.AdminGetSubCategoriesByCategory(db)) // Получение подкатегорий по категории
				subCategory.POST("", admin.AdminCreateSubCategory(db))                                  // Создание подкатегории
				subCategory.PUT("/:id", admin.AdminUpdateSubCategory(db))                               // Обновление подкатегории
				subCategory.DELETE("/:id", admin.AdminDeleteSubCategory(db))                            // Удаление подкатегории
			}

			product := routesAdmin.Group("/products")
			{
				product.GET("", admin.AdminGetProducts(db))          // Получение всех товаров
				product.GET("/:id", admin.AdminGetProduct(db))       // Получение товара по ID
				product.POST("", admin.AdminCreateProduct(db))       // Создание товара
				product.PUT("/:id", admin.AdminUpdateProduct(db))    // Обновление товара
				product.DELETE("/:id", admin.AdminDeleteProduct(db)) // Удаление товара
			}

			seller := routesAdmin.Group("/seller")
			{
				seller.GET("", admin.AdminGetSellers(db))
				seller.PUT("/:id/approve", admin.AdminApproveSeller(db))
			}
		}
	}
}
