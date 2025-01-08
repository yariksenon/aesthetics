package main

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
	_ "github.com/redis/go-redis/v9"
	"log"
	"net/http"
)

const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = " 040206"
	dbname   = "aesthetics"
	sslmode  = "disable"
	table1   = "users"
)

var psqlInfo = fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s", host, port, user, password, dbname, sslmode)

func main() {
	//Connecting to postgres
	conn, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}

	err = conn.Ping()
	if err != nil {
		panic(err)
	}
	fmt.Println("Successfully connected postgres!")
	//Connecting to redis
	client := redis.NewClient(&redis.Options{
		Addr: host + ":6379",
		DB:   0,
	})
	ctx := context.Background()
	client.Ping(ctx)

	fmt.Println("Successfully connected redis!")
	//Run server
	r := gin.Default()
	r.Use(func(c *gin.Context) {
		c.Set("db", conn)
		c.Set("redis", client)
		c.Set("ctx", ctx)
		c.Next()
	})
	// Serve frontend static files
	r.Use(static.Serve("/", static.LocalFile("./client/build", true)))
	r.GET("/name", getName)
	api := r.Group("/api")
	{
		api.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "pong",
			})
		})
	}

	r.Run(":8080")
}

func getName(c *gin.Context) {
	ctx := c.MustGet("ctx").(context.Context)
	client := c.MustGet("redis").(*redis.Client)
	db := c.MustGet("db").(*sql.DB)

	val, err := client.Get(ctx, "users").Result()

	if err == redis.Nil {
		fmt.Println("Quering postgresql")
		var human []string

		row, err := db.Query("SELECT * FROM user")
		if err != nil {
			log.Fatal(err)
		}
		defer row.Close()

		for row.Next() {
			var first_name string
			if err := row.Scan(&first_name); err != nil {
				log.Fatal(err)
			}
			human = append(human, first_name)
		}

		client.Set(ctx, "human", human, 0)
		c.HTML(http.StatusOK, "index.html", gin.H{
			"human": "get on Postgresql",
		})
	} else if err != nil {
		log.Fatal(err)
	} else {
		fmt.Println("Key exists in Redis, returning cached data...")
		c.HTML(http.StatusOK, "index.html", gin.H{
			"human": val + " get on Redis",
		})
	}
}
