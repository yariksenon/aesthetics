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

				// subCategoryGroup := categoryGroup.Group("/:subcategory")
				// {
					// subCategoryGroup.GET("/", handlers.GetSubCategories(db))
				// }
			}
		}

		v1.GET("/subcategory", handlers.UserGetSubCategories(db))

		// Authorization
		v1.POST("/register", handlers.RegisterPage(db, twilioClient))
		v1.POST("/login", handlers.LoginHandler(db))

		// Orders
		v1.POST("/orders/:userId", handlers.PostOrder(db))
		v1.GET("/orders/:userId", handlers.GetOrders(db))
		v1.GET("/orders/:userId/:orderId", handlers.GetOrderDetails(db))
		v1.PUT("/:orderId/status", admin.UpdateOrderStatus(db, smtpClient))

		// v1.PUT("/orders/:userId/:orderId/cancel", handlers.CancelOrder(db))
		// v1.PUT("/:orderId/status", admin.CancelOrder(db))

		v1.DELETE("/orders/:userId/:orderId/items/:productId/:sizeId", handlers.RemoveOrderItem(db))


		// Profile
		v1.GET("/profile/:userId", handlers.GetProfile(db))
		v1.PUT("/profile/:userId", handlers.UpdateProfile(db))
		v1.PUT("/profile/:userId/password", handlers.PutPasswordProfile(db))
		// v1.GET("/profile/address", handlers.GetAddress(db))
		// v1.POST("/profile/address", handlers.SaveAddress(db))


		// Reviews
		v1.GET("/reviews/:id", handlers.GetReviews(db))
		v1.POST("/reviews/:userId", handlers.CreateReview(db))
		

		// Cart
		v1.GET("/cart/:userId", handlers.GetCart(db))                         // Получить содержимое корзины пользователя
		v1.POST("/cart/:userId", handlers.AddCartProduct(db))                 // Добавить товар в корзину
		v1.PUT("/cart/:userId/:productId", handlers.UpdateCartProduct(db))    // Обновить количество товара в корзине
		v1.DELETE("/cart/:userId/clear", handlers.ClearCart(db))                    // Очистить корзину пользователя

			// Wishlist
		v1.GET("/wishlist/:userId", handlers.GetWishlist(db))
    v1.POST("/wishlist/:userId/:productId", handlers.AddToWishlist(db))
    v1.DELETE("/wishlist/:userId/:productId", handlers.RemoveFromWishlist(db))
    v1.GET("/wishlist/:userId/:productId", handlers.RemoveFromWishlist(db))

		// Email
		v1.POST("/subscribe", handlers.HandleEmail(smtpClient))


		v1.GET("/categories", handlers.GetCategories(db))
		v1.GET("/sub-categories", handlers.GetSubCategories(db))
	
		v1.GET("/size-types", handlers.GetSizeTypes(db))
		v1.GET("/sizes", handlers.GetSizes(db))

		v1.POST("/be-brand", handlers.PostBrand(db))
		v1.GET("/check-brand-application", handlers.CheckBrandApplication(db))
		v1.PUT("/brand/:id/resubmit", handlers.ResubmitBrand(db))

		// Products
		v1.GET("/products", handlers.GetProducts(db))
		v1.GET("/product/:id", handlers.GetProduct(db))
		v1.POST("/create-product/:userId", handlers.BrandCreateProduct(db))       // Создание товара

		// v1.GET("", handlers.BrandGetProducts(db))          // Получение всех товаров
		// v1.PUT("/:id", handlers.BrandUpdateProduct(db))    // Обновление товара
		// v1.DELETE("/:id", handlers.BrandDeleteProduct(db)) // Удаление товара

		// Search
		v1.GET("/products/sku/:sku", handlers.GetProductBySKU(db))
		
		
		routesAdmin := v1.Group("/admin")
		{
			routesAdmin.GET("", admin.AdminGetPanel(db))

			user := routesAdmin.Group("/users")
			{
				user.GET("", admin.AdminGetUsers(db))
				user.PUT("/:id", admin.AdminUpdateUser(db))
				user.DELETE("/:id", admin.AdminDeleteUser(db))
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
				product.PUT("/:productId", admin.AdminUpdateProduct(db))    // Обновление товара
				product.DELETE("/:productId", admin.AdminDeleteProduct(db)) // Удаление товара
				// product.POST("", admin.AdminCreateProduct(db))       // Создание товара
			}

			reviews := routesAdmin.Group("/reviews")
			{
				reviews.PUT("/:id/approve", admin.ApproveReview(db))
				reviews.DELETE("/:id", admin.DeleteReview(db))
			}

			order := routesAdmin.Group("/order")
			{
				order.GET("/:userId", admin.GetOrders(db))
				order.GET("/:userId/:orderId", admin.GetOrderDetails(db))
				order.PUT("/:orderId/status", admin.UpdateOrderStatus(db, smtpClient))
				order.DELETE("/:userId/:orderId", admin.CancelOrder(db))
			}

			brand := routesAdmin.Group("/brand")
			{
					brand.GET("/approved", admin.AdminGetApprovedSellers(db))
					brand.GET("/pending", admin.AdminGetPendingSellers(db))
					
					
					brand.GET("/:id", admin.AdminGetSellerByID(db))

					brand.PUT("/:id/approve", admin.AdminApproveBrand(db, smtpClient))
					brand.PUT("/:id/reject", admin.AdminRejectBrand(db, smtpClient))
					// brand.PUT("/:id/resubmit", admin.AdminResubmitBrand(db))
					
					brand.DELETE("/:id", admin.AdminDeleteBrand(db))
			}
		}
	}
}
