package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"todo-backend/internal/database"
	"todo-backend/internal/handler"
	"todo-backend/internal/model"

	"github.com/gin-gonic/gin"
)

const baseURL = "http://localhost:8080/api"

var testServer *httptest.Server

func setupTestServer() *httptest.Server {
	gin.SetMode(gin.TestMode)

	r := gin.New()

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

	todoHandler := handler.NewTodoHandler()
	api := r.Group("/api")
	{
		api.GET("/todos", todoHandler.GetAllTodos)
		api.GET("/todos/:id", todoHandler.GetTodoByID)
		api.POST("/todos", todoHandler.CreateTodo)
		api.PUT("/todos/:id", todoHandler.UpdateTodo)
		api.DELETE("/todos/:id", todoHandler.DeleteTodo)
	}

	return httptest.NewServer(r)
}

func setupTestDB() {
	os.Remove("todo_test.db")
	database.DB = nil
	database.InitTestDatabase("todo_test.db")
}

func TestMain(m *testing.M) {
	setupTestDB()
	testServer = setupTestServer()
	defer testServer.Close()
	defer os.Remove("todo_test.db")

	m.Run()
}

func makeRequest(method, url string, body interface{}) (*http.Response, error) {
	var reqBody []byte
	if body != nil {
		reqBody, _ = json.Marshal(body)
	}

	req, err := http.NewRequest(method, url, bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	return client.Do(req)
}

func parseResponse(resp *http.Response) (model.Response, error) {
	var response model.Response
	decoder := json.NewDecoder(resp.Body)
	err := decoder.Decode(&response)
	return response, err
}

func TestCreateTodo(t *testing.T) {
	body := model.CreateTodoRequest{
		Title:   "Test Todo",
		Content: "Test Content",
	}

	resp, err := makeRequest("POST", testServer.URL+"/api/todos", body)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		t.Errorf("Expected status 201, got %d", resp.StatusCode)
	}

	response, err := parseResponse(resp)
	if err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.Code != 0 {
		t.Errorf("Expected code 0, got %d", response.Code)
	}

	if response.Message != "success" {
		t.Errorf("Expected message 'success', got %s", response.Message)
	}

	todo, ok := response.Data.(*model.Todo)
	if !ok {
		t.Fatal("Failed to cast data to Todo")
	}

	if todo.Title != "Test Todo" {
		t.Errorf("Expected title 'Test Todo', got %s", todo.Title)
	}

	if todo.Content != "Test Content" {
		t.Errorf("Expected content 'Test Content', got %s", todo.Content)
	}

	if !todo.Completed {
		t.Error("Expected completed to be false by default")
	}

	t.Logf("Created todo with ID: %d", todo.ID)
}

func TestGetAllTodos(t *testing.T) {
	// Create a todo first
	body := model.CreateTodoRequest{
		Title:   "Get All Test",
		Content: "Content for get all",
	}
	resp, err := makeRequest("POST", testServer.URL+"/api/todos", body)
	if err != nil {
		t.Fatalf("Failed to create todo: %v", err)
	}
	resp.Body.Close()

	// Get all todos
	resp, err = makeRequest("GET", testServer.URL+"/api/todos", nil)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	response, err := parseResponse(resp)
	if err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.Code != 0 {
		t.Errorf("Expected code 0, got %d", response.Code)
	}

	todos, ok := response.Data.([]interface{})
	if !ok {
		t.Fatal("Failed to cast data to []interface{}")
	}

	if len(todos) == 0 {
		t.Error("Expected at least one todo")
	}

	t.Logf("Found %d todos", len(todos))
}

func TestGetTodoByID(t *testing.T) {
	// Create a todo first
	body := model.CreateTodoRequest{
		Title:   "Get By ID Test",
		Content: "Content for get by id",
	}
	resp, err := makeRequest("POST", testServer.URL+"/api/todos", body)
	if err != nil {
		t.Fatalf("Failed to create todo: %v", err)
	}
	defer resp.Body.Close()

	response, err := parseResponse(resp)
	if err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	todo, ok := response.Data.(*model.Todo)
	if !ok {
		t.Fatal("Failed to cast data to Todo")
	}

	todoID := todo.ID

	// Get todo by ID
	resp, err = makeRequest("GET", testServer.URL+"/api/todos/"+string(rune(todoID))+"", nil)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	response, err = parseResponse(resp)
	if err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.Code != 0 {
		t.Errorf("Expected code 0, got %d", response.Code)
	}

	retrievedTodo, ok := response.Data.(*model.Todo)
	if !ok {
		t.Fatal("Failed to cast data to Todo")
	}

	if retrievedTodo.ID != todoID {
		t.Errorf("Expected ID %d, got %d", todoID, retrievedTodo.ID)
	}

	if retrievedTodo.Title != "Get By ID Test" {
		t.Errorf("Expected title 'Get By ID Test', got %s", retrievedTodo.Title)
	}
}

func TestUpdateTodo(t *testing.T) {
	// Create a todo first
	body := model.CreateTodoRequest{
		Title:   "Update Test",
		Content: "Original Content",
	}
	resp, err := makeRequest("POST", testServer.URL+"/api/todos", body)
	if err != nil {
		t.Fatalf("Failed to create todo: %v", err)
	}
	defer resp.Body.Close()

	response, err := parseResponse(resp)
	if err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	todo, ok := response.Data.(*model.Todo)
	if !ok {
		t.Fatal("Failed to cast data to Todo")
	}

	todoID := todo.ID

	// Update todo
	updateBody := model.UpdateTodoRequest{
		Title:     "Updated Title",
		Content:   "Updated Content",
		Completed: true,
	}

	resp, err = makeRequest("PUT", testServer.URL+"/api/todos/"+string(rune(todoID))+"", updateBody)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	response, err = parseResponse(resp)
	if err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.Code != 0 {
		t.Errorf("Expected code 0, got %d", response.Code)
	}

	updatedTodo, ok := response.Data.(*model.Todo)
	if !ok {
		t.Fatal("Failed to cast data to Todo")
	}

	if updatedTodo.Title != "Updated Title" {
		t.Errorf("Expected title 'Updated Title', got %s", updatedTodo.Title)
	}

	if updatedTodo.Content != "Updated Content" {
		t.Errorf("Expected content 'Updated Content', got %s", updatedTodo.Content)
	}

	if !updatedTodo.Completed {
		t.Error("Expected completed to be true")
	}

	// Test marking as incomplete
	updateBody = model.UpdateTodoRequest{
		Title:     "Updated Title",
		Content:   "Updated Content",
		Completed: false,
	}

	resp, err = makeRequest("PUT", testServer.URL+"/api/todos/"+string(rune(todoID))+"", updateBody)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	response, err = parseResponse(resp)
	if err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	updatedTodo, ok = response.Data.(*model.Todo)
	if !ok {
		t.Fatal("Failed to cast data to Todo")
	}

	if updatedTodo.Completed {
		t.Error("Expected completed to be false")
	}
}

func TestDeleteTodo(t *testing.T) {
	// Create a todo first
	body := model.CreateTodoRequest{
		Title:   "Delete Test",
		Content: "Content to be deleted",
	}
	resp, err := makeRequest("POST", testServer.URL+"/api/todos", body)
	if err != nil {
		t.Fatalf("Failed to create todo: %v", err)
	}
	defer resp.Body.Close()

	response, err := parseResponse(resp)
	if err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	todo, ok := response.Data.(*model.Todo)
	if !ok {
		t.Fatal("Failed to cast data to Todo")
	}

	todoID := todo.ID

	// Delete todo
	resp, err = makeRequest("DELETE", testServer.URL+"/api/todos/"+string(rune(todoID))+"", nil)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status 200, got %d", resp.StatusCode)
	}

	response, err = parseResponse(resp)
	if err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.Code != 0 {
		t.Errorf("Expected code 0, got %d", response.Code)
	}

	// Try to get the deleted todo
	resp, err = makeRequest("GET", testServer.URL+"/api/todos/"+string(rune(todoID))+"", nil)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", resp.StatusCode)
	}
}

func TestCreateTodoMissingTitle(t *testing.T) {
	body := model.CreateTodoRequest{
		Title:   "",
		Content: "Content without title",
	}

	resp, err := makeRequest("POST", testServer.URL+"/api/todos", body)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", resp.StatusCode)
	}

	response, err := parseResponse(resp)
	if err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.Code != 400 {
		t.Errorf("Expected code 400, got %d", response.Code)
	}
}

func TestGetTodoByInvalidID(t *testing.T) {
	resp, err := makeRequest("GET", testServer.URL+"/api/todos/abc", nil)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", resp.StatusCode)
	}

	response, err := parseResponse(resp)
	if err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.Code != 400 {
		t.Errorf("Expected code 400, got %d", response.Code)
	}
}

func TestGetTodoByNonExistentID(t *testing.T) {
	resp, err := makeRequest("GET", testServer.URL+"/api/todos/99999", nil)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", resp.StatusCode)
	}

	response, err := parseResponse(resp)
	if err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if response.Code != 404 {
		t.Errorf("Expected code 404, got %d", response.Code)
	}
}

func TestUpdateTodoInvalidID(t *testing.T) {
	body := model.UpdateTodoRequest{
		Title:     "Test",
		Content:   "Content",
		Completed: false,
	}

	resp, err := makeRequest("PUT", testServer.URL+"/api/todos/abc", body)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", resp.StatusCode)
	}
}

func TestDeleteTodoInvalidID(t *testing.T) {
	resp, err := makeRequest("DELETE", testServer.URL+"/api/todos/abc", nil)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", resp.StatusCode)
	}
}
