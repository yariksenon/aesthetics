package models

type SizeType struct {
    ID          int    `json:"id" db:"id"`
    Name        string `json:"name" db:"name"`
    Description string `json:"description" db:"description"`
}

type Size struct {
    ID          int    `json:"id" db:"id"`
    SizeTypeID  int    `json:"size_type_id" db:"size_type_id"`
    Value       string `json:"value" db:"value"`
    Description string `json:"description,omitempty" db:"description"` // omitempty если описание необязательное
}