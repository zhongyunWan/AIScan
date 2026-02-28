package main

import (
	"log"

	"todo-backend/internal/database"
	"todo-backend/internal/handler"

	"github.com/gin-gonic/gin"
)

func main() {
	// 初始化数据库
	if err := database.InitDatabase(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// 初始化 Gin
	r := gin.Default()

	// 添加 CORS 中间件
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// 初始化路由
	todoHandler := handler.NewTodoHandler()
	api := r.Group("/api")
	{
		api.GET("/todos", todoHandler.GetAllTodos)
		api.GET("/todos/:id", todoHandler.GetTodoByID)
		api.POST("/todos", todoHandler.CreateTodo)
		api.PUT("/todos/:id", todoHandler.UpdateTodo)
		api.DELETE("/todos/:id", todoHandler.DeleteTodo)
	}

	// 启动服务器
	log.Println("Server starting on http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
