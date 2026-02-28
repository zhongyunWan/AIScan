package model

import (
	"time"
)

type Todo struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Title     string    `gorm:"type:text;not null" json:"title"`
	Content   string    `gorm:"type:text" json:"content"`
	Completed bool      `gorm:"default:false" json:"completed"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

type CreateTodoRequest struct {
	Title   string `json:"title" binding:"required"`
	Content string `json:"content"`
}

type UpdateTodoRequest struct {
	Title     string `json:"title"`
	Content   string `json:"content"`
	Completed bool   `json:"completed"`
}

type Response struct {
	Code    int         `json:"code"`
	Data    interface{} `json:"data"`
	Message string      `json:"message"`
}
