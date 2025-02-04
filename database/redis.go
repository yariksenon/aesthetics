package database

import (
	"context"
	"github.com/redis/go-redis/v9"
	"log"
)

var ctx = context.Background()

func NewRedisClient(addr, password string, db int) *redis.Client {
	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password, // no password set
		DB:       db,       // use default DB
	})

	// Проверка подключения
	_, err := client.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Ошибка подключения к Redis: %v", err)
	}

	log.Println("Подключение к Redis успешно установлено")
	return client
}
