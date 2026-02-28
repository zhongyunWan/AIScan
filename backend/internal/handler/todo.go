package handler

import (
	"net/http"
	"strconv"

	"todo-backend/internal/model"
	"todo-backend/internal/repository"

	"github.com/gin-gonic/gin"
)

type TodoHandler struct {
	repo *repository.TodoRepository
}

func NewTodoHandler() *TodoHandler {
	return &TodoHandler{
		repo: repository.NewTodoRepository(),
	}
}

func (h *TodoHandler) GetAllTodos(c *gin.Context) {
	todos, err := h.repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{
			Code:    500,
			Data:    nil,
			Message: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Data:    todos,
		Message: "success",
	})
}

func (h *TodoHandler) GetTodoByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Code:    400,
			Data:    nil,
			Message: "invalid id",
		})
		return
	}

	todo, err := h.repo.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, model.Response{
			Code:    404,
			Data:    nil,
			Message: "todo not found",
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Data:    todo,
		Message: "success",
	})
}

func (h *TodoHandler) CreateTodo(c *gin.Context) {
	var req model.CreateTodoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Code:    400,
			Data:    nil,
			Message: err.Error(),
		})
		return
	}

	todo := &model.Todo{
		Title:   req.Title,
		Content: req.Content,
	}

	err := h.repo.Create(todo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{
			Code:    500,
			Data:    nil,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, model.Response{
		Code:    0,
		Data:    todo,
		Message: "success",
	})
}

func (h *TodoHandler) UpdateTodo(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Code:    400,
			Data:    nil,
			Message: "invalid id",
		})
		return
	}

	var req model.UpdateTodoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Code:    400,
			Data:    nil,
			Message: err.Error(),
		})
		return
	}

	updates := &model.Todo{
		Title:     req.Title,
		Content:   req.Content,
		Completed: req.Completed,
	}

	err = h.repo.Update(uint(id), updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{
			Code:    500,
			Data:    nil,
			Message: err.Error(),
		})
		return
	}

	todo, _ := h.repo.GetByID(uint(id))
	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Data:    todo,
		Message: "success",
	})
}

func (h *TodoHandler) DeleteTodo(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.Response{
			Code:    400,
			Data:    nil,
			Message: "invalid id",
		})
		return
	}

	err = h.repo.Delete(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{
			Code:    500,
			Data:    nil,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Data:    nil,
		Message: "success",
	})
}
