package routes

import (
	"aesthetics/cmd/smtp"
	"aesthetics/cmd/twilio"
	"aesthetics/pkg/handlers"
	"aesthetics/pkg/handlers/admin"
	"database/sql"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine, db *sql.DB, smtpClient *smtp.SMTPClient, twilioClient *twilio.TwilioClient) {
	v1 := r.Group("/api/v1")
	{
		v1.GET("/", handlers.HomePage)

		sexGroup := v1.Group("/:gender")
		{
			sexGroup.GET("/", handlers.GetGender)

			categoryGroup := sexGroup.Group("/:category")
			{

				categoryGroup.GET("/", handlers.GetCategory(db))
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
		v1.GET("/reverse-geocode", handlers.ReverseGeocodeHandler())

		v1.DELETE("/orders/:userId/:orderId/items/:productId/:sizeId", handlers.RemoveOrderItem(db))


		// Profile
		v1.GET("/profile/:userId", handlers.GetProfile(db))
		v1.PUT("/profile/:userId", handlers.UpdateProfile(db))
		v1.PUT("/profile/:userId/password", handlers.PutPasswordProfile(db))


		// Reviews
		v1.GET("/reviews/:id", handlers.GetReviews(db))
		v1.POST("/reviews/:userId", handlers.CreateReview(db))
		

		// Cart
		v1.GET("/cart/:userId", handlers.GetCart(db))                         // Получить содержимое корзины пользователя
		v1.POST("/cart/:userId", handlers.AddCartProduct(db))                 // Добавить товар в корзину
		v1.PUT("/cart/:userId/:productId", handlers.UpdateCartProduct(db))    // Обновить количество товара в корзине
		v1.DELETE("/cart/:userId/clear", handlers.ClearCart(db))                    // Очистить корзину пользователя
		v1.DELETE("/cart/:userId/items", handlers.DeleteCartItems(db))	

			// Wishlist
		v1.GET("/wishlist/:userId", handlers.GetWishlist(db))
    v1.POST("/wishlist/:userId/:productId", handlers.AddToWishlist(db))
    v1.DELETE("/wishlist/:userId/:productId", handlers.RemoveFromWishlist(db))
    v1.GET("/wishlist/:userId/:productId", handlers.RemoveFromWishlist(db))

		// Email
		v1.POST("/subscribe", handlers.HandleEmail(db, smtpClient))
		v1.POST("/unsubscribe", handlers.HandleUnsubscribe(db))
		v1.GET("/subscribe/check/:email", handlers.CheckSubscribeByEmail(db))


		v1.GET("/categories", handlers.GetCategories(db))
		
		v1.GET("/sub-categories", handlers.GetSubCategories(db))
	
		v1.GET("/size-types", handlers.GetSizeTypes(db))
		v1.GET("/sizes", handlers.GetSizes(db))

		v1.POST("/be-brand", handlers.PostBrand(db))
		v1.GET("/check-brand-application", handlers.CheckBrandApplication(db))
		v1.PUT("/brand/:id/resubmit", handlers.ResubmitBrand(db))
		//NEW
		v1.GET("/my-product/:brandId", handlers.GetBrandProduct(db))
		v1.DELETE("/products/:id", handlers.DeleteProduct(db))
		v1.GET("/statistics/:brandId", handlers.GetSalesStatistics(db))

		// Products
		v1.GET("/products", handlers.GetProducts(db))
		v1.GET("/product/:id", handlers.GetProduct(db))
		v1.POST("/create-product/:userId", handlers.BrandCreateProduct(db))       // Создание товара

		// Search
		v1.GET("/products/sku/:sku", handlers.GetProductBySKU(db))


		v1.POST("/be-courier", handlers.PostCourier(db))
		v1.GET("/check-courier-application", handlers.CheckCourierApplication(db))
		v1.PUT("/courier/:id/resubmit", handlers.ResubmitCourier(db))
		
		// Получение списка доступных заказов для курьера (по городу)
		v1.GET("/courier/available-orders", handlers.GetAvailableOrders(db))
		v1.PUT("/courier/accept/:order_id", handlers.AcceptOrder(db))
		v1.PUT("/courier/orders/:order_id/status", handlers.UpdateOrderStatus(db, smtpClient))
		
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
			}

			reviews := routesAdmin.Group("/reviews")
			{
				reviews.PUT("/:id/approve", admin.ApproveReview(db))
				reviews.DELETE("/:id", admin.DeleteReview(db))
			}

			order := routesAdmin.Group("/order")
			{
				order.GET("", admin.GetOrders(db))
				order.GET("/:orderId", admin.GetOrderDetails(db))
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
					brand.DELETE("/:id", admin.AdminDeleteBrand(db))
			}

			courier := routesAdmin.Group("/courier")
			{
					courier.GET("", admin.AdminGetAllCouriers(db))
					courier.GET("/approved", admin.AdminGetApprovedCouriers(db))
					courier.GET("/pending", admin.AdminGetPendingCouriers(db))
					courier.GET("/:id", admin.AdminGetCourierByID(db))
					courier.PUT("/:id/approve", admin.AdminApproveCourier(db, smtpClient))
					courier.PUT("/:id/reject", admin.AdminRejectCourier(db, smtpClient))
					courier.DELETE("/:id", admin.AdminDeleteCourier(db))
					courier.PUT("/:id/resubmit", admin.AdminResubmitCourier(db))
			}

			newsletter := routesAdmin.Group("/newsletter")
			{
				newsletter.POST("", admin.SendNewsletter(db, smtpClient))
			}
		}
	}
}
