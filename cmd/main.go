package main

import (
	"aesthetics/config"
	"aesthetics/database"
	"aesthetics/pkg/routes"
	"aesthetics/smtp"
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

	// Connection to database
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

	// Init tables on database
	if err = database.InitSchema(db); err != nil {
		log.Fatalf("Failed to initialize schema: %v", err)
	}

	// Create Gin router
	r := gin.Default()

	//Init SMTPClient
	smtpClient := smtp.NewSMTPClient(cfg.Smtp.From, cfg.Smtp.Password, cfg.Smtp.Host, cfg.Smtp.Port)

	//Init Redis
	redisClient := database.NewRedisClient(cfg.Redis.Host+cfg.Redis.Port, cfg.Redis.Password, cfg.Redis.DB)

	// Cors policy
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{http.MethodPost, http.MethodGet, http.MethodDelete, http.MethodPut, http.MethodOptions},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Setup routes
	routes.SetupRoutes(r, db, smtpClient, redisClient)

	// Run server
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
