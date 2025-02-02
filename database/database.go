package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq" // Import PostgreSQL driver
)

func InitDB(user, password, host, port, dbname string) (*sql.DB, error) {
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, password, host, port, dbname)
	db, err := sql.Open("postgres", dsn)

	if err != nil {
		return nil, fmt.Errorf("can't connect to database: %w", err)
	}

	err = db.Ping()
	if err != nil {
		return nil, fmt.Errorf("unable to ping database: %w", err)
	}

	log.Println("Connected to database")
	return db, nil
}
