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

		// sexGroup := v1.Group("/:gender")
		// {
		// 	sexGroup.GET("/", handlers.GetGender)

		// 	categoryGroup := sexGroup.Group("/:category")
		// 	{

		// 		categoryGroup.GET("/", handlers.GetCategory(db))

		// 		subCategoryGroup := categoryGroup.Group("/:subcategory")
		// 		{
		// 			subCategoryGroup.GET("/", handlers.GetSubCategories(db))
		// 		}
		// 	}
		// }

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

		auth := v1.Group("/")
		auth.Use(handlers.JWTMiddleware())
		{
			auth.GET("profile", handlers.GetProfile(db))
			auth.PUT("profile", handlers.UpdateProfile(db))
		}
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
			seller.GET("")
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

			cart := routesAdmin.Group("/carts")
			{
				cart.GET("", admin.AdminGetCarts(db))          // Получение всех корзин
				cart.GET("/:id", admin.AdminGetCart(db))       // Получение корзины по ID
				cart.POST("", admin.AdminCreateCart(db))       // Создание новой корзины
				cart.PUT("/:id", admin.AdminUpdateCart(db))    // Обновление корзины по ID
				cart.DELETE("/:id", admin.AdminDeleteCart(db)) // Удаление корзины по ID
			}

			cartItem := routesAdmin.Group("/cart_items")
			{
				cartItem.GET("", admin.AdminGetCartItems(db))          // Получение всех элементов корзины
				cartItem.GET("/:id", admin.AdminGetCartItem(db))       // Получение элемента корзины по ID
				cartItem.POST("", admin.AdminCreateCartItem(db))       // Создание нового элемента корзины
				cartItem.PUT("/:id", admin.AdminUpdateCartItem(db))    // Обновление элемента корзины по ID
				cartItem.DELETE("/:id", admin.AdminDeleteCartItem(db)) // Удаление элемента корзины по ID
			}

			wishlist := routesAdmin.Group("/wishlists")
			{
				wishlist.GET("", admin.AdminGetWishlists(db))          // Получение всех списков желаний
				wishlist.GET("/:id", admin.AdminGetWishlist(db))       // Получение списка желаний по ID
				wishlist.POST("", admin.AdminCreateWishlist(db))       // Создание нового списка желаний
				wishlist.PUT("/:id", admin.AdminUpdateWishlist(db))    // Обновление списка желаний по ID
				wishlist.DELETE("/:id", admin.AdminDeleteWishlist(db)) // Удаление списка желаний по ID
			}

			orderDetail := routesAdmin.Group("/orders")
			{
				orderDetail.GET("", admin.AdminGetOrderDetails(db))          // Получение всех деталей заказов
				orderDetail.GET("/:id", admin.AdminGetOrderDetail(db))       // Получение деталей заказа по ID
				orderDetail.POST("", admin.AdminCreateOrderDetail(db))       // Создание новых деталей заказа
				orderDetail.PUT("/:id", admin.AdminUpdateOrderDetail(db))    // Обновление деталей заказа по ID
				orderDetail.DELETE("/:id", admin.AdminDeleteOrderDetail(db)) // Удаление деталей заказа по ID
			}

			orderItem := routesAdmin.Group("/order_items")
			{
				orderItem.GET("", admin.AdminGetOrderItems(db))          // Получение всех элементов заказа
				orderItem.GET("/:id", admin.AdminGetOrderItem(db))       // Получение элемента заказа по ID
				orderItem.POST("", admin.AdminCreateOrderItem(db))       // Создание нового элемента заказа
				orderItem.PUT("/:id", admin.AdminUpdateOrderItem(db))    // Обновление элемента заказа по ID
				orderItem.DELETE("/:id", admin.AdminDeleteOrderItem(db)) // Удаление элемента заказа по ID
			}

			paymentDetail := routesAdmin.Group("/payment_details")
			{
				paymentDetail.GET("", admin.AdminGetPaymentDetails(db))          // Получение всех деталей платежей
				paymentDetail.GET("/:id", admin.AdminGetPaymentDetail(db))       // Получение деталей платежа по ID
				paymentDetail.POST("", admin.AdminCreatePaymentDetail(db))       // Создание новых деталей платежа
				paymentDetail.PUT("/:id", admin.AdminUpdatePaymentDetail(db))    // Обновление деталей платежа по ID
				paymentDetail.DELETE("/:id", admin.AdminDeletePaymentDetail(db)) // Удаление деталей платежа по ID
			}

			statistic := routesAdmin.Group("/statistics")
			{
				statistic.GET("")
			}
		}
	}
}
