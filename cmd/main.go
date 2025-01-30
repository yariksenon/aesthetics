package main

import (
	"aesthetics/pkg/routes"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	_ "github.com/redis/go-redis/v9"
	"log"
)

func main() {
	//Connecting to postgres
	r := gin.Default()

	routes.SetupRoutes(r)

	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
