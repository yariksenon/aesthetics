package main

import (
	"aesthetics/config"
	"aesthetics/database"
	"aesthetics/pkg/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"log"
	"net/http"
)

func main() {
	// Load config
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize database
	db, err := database.InitDB(
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Host,
		cfg.Database.Port,
		cfg.Database.DBName,
	)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Create Gin router
	r := gin.Default()

	// Cors policy
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{http.MethodPost, http.MethodGet, http.MethodDelete, http.MethodPut, http.MethodOptions},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
	}))

	// Setup routes
	routes.SetupRoutes(r, db)

	// Run server
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
