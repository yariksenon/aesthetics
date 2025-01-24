package models

import "time"

type Category struct {
	Id        int       `json:"-"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	DeletedAt time.Time `json:"deleted_at"`
}

type SubCategory struct {
	Id        int       `json:"-"`
	ParentId  int       `json:"parent_id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	DeletedAt time.Time `json:"deleted_at"`
}
