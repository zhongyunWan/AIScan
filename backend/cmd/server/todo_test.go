package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strconv"
	"testing"

	"todo-backend/internal/database"
	"todo-backend/internal/handler"
	"todo-backend/internal/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var testDB *gorm.DB

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
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

	// 初始化测试数据库
	database.InitDatabase()
	testDB = database.DB

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

	return r
}

func cleanUpTodos() {
	if testDB != nil {
		testDB.Exec("DELETE FROM todos")
	}
}

func TestMain(m *testing.M) {
	// 设置测试数据库
	if err := database.InitDatabase(); err != nil {
		os.Exit(1)
	}

	// 运行测试
	exitCode := m.Run()

	// 清理
	cleanUpTodos()

	os.Exit(exitCode)
}

func TestGetAllTodos(t *testing.T) {
	r := setupTestRouter()
	cleanUpTodos()

	// 创建测试数据
	req := model.CreateTodoRequest{Title: "Test Todo 1", Content: "Content 1"}
	body, _ := json.Marshal(req)
	http.Post("http://localhost:8080/api/todos", "application/json", bytes.NewBuffer(body))

	// 测试获取所有 Todo
	w := httptest.NewRecorder()
	reqHttp, _ := http.NewRequest("GET", "/api/todos", nil)
	r.ServeHTTP(w, reqHttp)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response model.Response
	json.Unmarshal(w.Body.Bytes(), &response)

	if response.Code != 0 {
		t.Errorf("Expected code 0, got %d", response.Code)
	}

	todos, ok := response.Data.([]interface{})
	if !ok || len(todos) == 0 {
		t.Errorf("Expected non-empty todos list")
	}
}

func TestGetTodoByID(t *testing.T) {
	r := setupTestRouter()
	cleanUpTodos()

	// 创建 Todo
	createReq := model.CreateTodoRequest{Title: "Test Todo", Content: "Test Content"}
	createBody, _ := json.Marshal(createReq)
	createW := httptest.NewRecorder()
	createHttpReq, _ := http.NewRequest("POST", "/api/todos", bytes.NewBuffer(createBody))
	createHttpReq.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(createW, createHttpReq)

	var createResp model.Response
	json.Unmarshal(createW.Body.Bytes(), &createResp)

	todo, ok := createResp.Data.(map[string]interface{})
	if !ok {
		t.Fatal("Failed to create todo")
	}

	id := int(todo["id"].(float64))

	// 测试获取单个 Todo
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/todos/"+strconv.Itoa(id), nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response model.Response
	json.Unmarshal(w.Body.Bytes(), &response)

	if response.Code != 0 {
		t.Errorf("Expected code 0, got %d", response.Code)
	}

	data, ok := response.Data.(map[string]interface{})
	if !ok {
		t.Errorf("Expected data to be a map")
	}

	if data["title"] != "Test Todo" {
		t.Errorf("Expected title 'Test Todo', got %v", data["title"])
	}
}

func TestCreateTodo(t *testing.T) {
	r := setupTestRouter()
	cleanUpTodos()

	req := model.CreateTodoRequest{
		Title:   "New Todo",
		Content: "New Content",
	}
	body, _ := json.Marshal(req)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/todos", bytes.NewBuffer(body))
	httpReq.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, httpReq)

	if w.Code != http.StatusCreated {
		t.Errorf("Expected status 201, got %d", w.Code)
	}

	var response model.Response
	json.Unmarshal(w.Body.Bytes(), &response)

	if response.Code != 0 {
		t.Errorf("Expected code 0, got %d - %s", response.Code, response.Message)
	}

	todo, ok := response.Data.(map[string]interface{})
	if !ok {
		t.Fatal("Expected data to be a map")
	}

	if todo["title"] != "New Todo" {
		t.Errorf("Expected title 'New Todo', got %v", todo["title"])
	}

	if todo["completed"] != false {
		t.Errorf("Expected completed false, got %v", todo["completed"])
	}
}

func TestUpdateTodo(t *testing.T) {
	r := setupTestRouter()
	cleanUpTodos()

	// 创建 Todo
	createReq := model.CreateTodoRequest{Title: "Original Title", Content: "Original Content"}
	createBody, _ := json.Marshal(createReq)
	createW := httptest.NewRecorder()
	createHttpReq, _ := http.NewRequest("POST", "/api/todos", bytes.NewBuffer(createBody))
	createHttpReq.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(createW, createHttpReq)

	var createResp model.Response
	json.Unmarshal(createW.Body.Bytes(), &createResp)

	todo, ok := createResp.Data.(map[string]interface{})
	if !ok {
		t.Fatal("Failed to create todo")
	}

	id := int(todo["id"].(float64))

	// 更新 Todo
	updateReq := map[string]interface{}{
		"title":     "Updated Title",
		"completed": true,
	}
	updateBody, _ := json.Marshal(updateReq)

	w := httptest.NewRecorder()
	updateHttpReq, _ := http.NewRequest("PUT", "/api/todos/"+strconv.Itoa(id), bytes.NewBuffer(updateBody))
	updateHttpReq.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, updateHttpReq)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response model.Response
	json.Unmarshal(w.Body.Bytes(), &response)

	if response.Code != 0 {
		t.Errorf("Expected code 0, got %d", response.Code)
	}

	data, ok := response.Data.(map[string]interface{})
	if !ok {
		t.Fatal("Expected data to be a map")
	}

	if data["title"] != "Updated Title" {
		t.Errorf("Expected title 'Updated Title', got %v", data["title"])
	}

	if data["completed"] != true {
		t.Errorf("Expected completed true, got %v", data["completed"])
	}
}

func TestDeleteTodo(t *testing.T) {
	r := setupTestRouter()
	cleanUpTodos()

	// 创建 Todo
	createReq := model.CreateTodoRequest{Title: "To Delete", Content: "Will be deleted"}
	createBody, _ := json.Marshal(createReq)
	createW := httptest.NewRecorder()
	createHttpReq, _ := http.NewRequest("POST", "/api/todos", bytes.NewBuffer(createBody))
	createHttpReq.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(createW, createHttpReq)

	var createResp model.Response
	json.Unmarshal(createW.Body.Bytes(), &createResp)

	todo, ok := createResp.Data.(map[string]interface{})
	if !ok {
		t.Fatal("Failed to create todo")
	}

	id := int(todo["id"].(float64))

	// 删除 Todo
	w := httptest.NewRecorder()
	deleteReq, _ := http.NewRequest("DELETE", "/api/todos/"+strconv.Itoa(id), nil)
	r.ServeHTTP(w, deleteReq)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response model.Response
	json.Unmarshal(w.Body.Bytes(), &response)

	if response.Code != 0 {
		t.Errorf("Expected code 0, got %d", response.Code)
	}

	// 验证 Todo 已被删除
	getW := httptest.NewRecorder()
	getReq, _ := http.NewRequest("GET", "/api/todos/"+strconv.Itoa(id), nil)
	r.ServeHTTP(getW, getReq)

	var getResponse model.Response
	json.Unmarshal(getW.Body.Bytes(), &getResponse)

	if getResponse.Code != 404 {
		t.Errorf("Expected 404 after deletion, got %d", getResponse.Code)
	}
}

func TestGetTodoByInvalidID(t *testing.T) {
	r := setupTestRouter()
	cleanUpTodos()

	// 测试无效 ID
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/todos/99999", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", w.Code)
	}

	var response model.Response
	json.Unmarshal(w.Body.Bytes(), &response)

	if response.Code != 404 {
		t.Errorf("Expected code 404, got %d", response.Code)
	}
}

func TestCreateTodoWithoutTitle(t *testing.T) {
	r := setupTestRouter()
	cleanUpTodos()

	// 测试缺少必需字段
	req := model.CreateTodoRequest{Content: "Content without title"}
	body, _ := json.Marshal(req)

	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/todos", bytes.NewBuffer(body))
	httpReq.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, httpReq)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}
}
