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
	"time"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		ExposeHeaders:    []string{"Content-Length"},
		MaxAge:           12 * time.Hour,
	}))

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

	if err = database.InitSchema(db); err != nil {
		log.Fatalf("Failed to initialize schema: %v", err)
	}

	if err = database.InitDate(db); err != nil {
		log.Fatalf("Failed to initialize date: %v", err)
	}

	if err = database.LoadQueries("database/queries"); err != nil {
		log.Fatalf("Ошибка загрузки SQL-запросов: %v", err)
	}

	smtpClient := smtp.NewSMTPClient(cfg.Smtp.From, cfg.Smtp.Password, cfg.Smtp.Host, cfg.Smtp.Port)

	redisClient := database.NewRedisClient(cfg.Redis.Host+cfg.Redis.Port, cfg.Redis.Password, cfg.Redis.DB)

	routes.SetupRoutes(r, db, smtpClient, redisClient)

	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
