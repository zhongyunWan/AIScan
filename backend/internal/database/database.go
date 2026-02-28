package database

import (
	"todo-backend/internal/model"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDatabase() error {
	var err error
	DB, err = gorm.Open(sqlite.Open("todo.db"), &gorm.Config{})
	if err != nil {
		return err
	}

	err = DB.AutoMigrate(&model.Todo{})
	if err != nil {
		return err
	}

	return nil
}

func InitTestDatabase(dbName string) error {
	var err error
	DB, err = gorm.Open(sqlite.Open(dbName), &gorm.Config{})
	if err != nil {
		return err
	}

	err = DB.AutoMigrate(&model.Todo{})
	if err != nil {
		return err
	}

	return nil
}
