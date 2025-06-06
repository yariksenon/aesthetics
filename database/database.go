package database

import (
	"database/sql"
	_ "embed"
	"fmt"
	"io/fs"
	"log"
	"os"
	"path/filepath"

	_ "github.com/lib/pq"
)

//go:embed queries/general/initTable.sql
var initTable string

//go:embed queries/general/initData.sql
var initData string

var Queries = map[string]string{}

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

func InitTable(db *sql.DB) error {
	if _, err := db.Exec(initTable); err != nil {
		log.Println("Init schema not execute")
		return err
	}

	return nil
}

func InitData(db *sql.DB) error {
	if _, err := db.Exec(initData); err != nil {
		log.Println("Cannot execute initData")
		return err
	}

	return nil
}

func LoadQueries(baseDir string) error {
	err := filepath.WalkDir(baseDir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return fmt.Errorf("ошибка при доступе к файлу %s: %w", path, err)
		}

		if d.IsDir() {
			return nil
		}

		if filepath.Ext(path) == ".sql" {
			content, err := os.ReadFile(path)
			if err != nil {
				return fmt.Errorf("ошибка при чтении файла %s: %w", path, err)
			}

			relativePath, _ := filepath.Rel(baseDir, path)
			key := relativePath[:len(relativePath)-len(filepath.Ext(relativePath))]

			Queries[key] = string(content)
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("ошибка при загрузке запросов: %w", err)
	}

	log.Println("SQL-запросы успешно загружены")
	return nil
}
