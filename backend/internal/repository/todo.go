package repository

import (
	"errors"
	"todo-backend/internal/database"
	"todo-backend/internal/model"

	"gorm.io/gorm"
)

type TodoRepository struct{}

func NewTodoRepository() *TodoRepository {
	return &TodoRepository{}
}

func (r *TodoRepository) GetAll() ([]model.Todo, error) {
	var todos []model.Todo
	err := database.DB.Order("created_at DESC").Find(&todos).Error
	return todos, err
}

func (r *TodoRepository) GetByID(id uint) (*model.Todo, error) {
	var todo model.Todo
	err := database.DB.First(&todo, id).Error
	if err != nil {
		return nil, err
	}
	return &todo, nil
}

func (r *TodoRepository) Create(todo *model.Todo) error {
	return database.DB.Create(todo).Error
}

func (r *TodoRepository) Update(id uint, updates *model.Todo) error {
	return database.DB.Model(&model.Todo{}).Where("id = ?", id).Updates(updates).Error
}

func (r *TodoRepository) Delete(id uint) error {
	return database.DB.Delete(&model.Todo{}, id).Error
}

func (r *TodoRepository) IsNotFound(err error) bool {
	return errors.Is(err, gorm.ErrRecordNotFound)
}
