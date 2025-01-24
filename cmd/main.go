package main

import (
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	_ "github.com/redis/go-redis/v9"
	"log"
)

func main() {
	//Connecting to postgres
	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{})
	})

	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
