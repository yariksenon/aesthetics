package database

import (
	"database/sql"
	_ "embed"
	"fmt"
	_ "github.com/lib/pq"
	"log"
)

//go:embed queries/schema.sql
var script string

//go:embed queries/setupUsers.sql
var user string

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

func InitSchema(db *sql.DB) error {
	_, err := db.Exec(script)
	if err != nil {
		return fmt.Errorf("can't exec sql script to inti schema: %w", err)
	}

	log.Println("Schema initialized successfully")
	return nil
}

func InitDate(db *sql.DB) error {
	_, err := db.Exec(user)
	if err != nil {
		log.Println("can't exec sql statement to init user: %w", err)
		return err
	}

	return nil
}
