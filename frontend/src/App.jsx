import { useState, useEffect } from 'react'
import { api } from './api/api'
import TodoList from './components/TodoList'
import TodoForm from './components/TodoForm'

export default function App() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 获取所有 Todo
  const fetchTodos = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getTodos()
      setTodos(data || [])
    } catch (err) {
      setError(err.message)
      console.error('获取 Todo 失败:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  // 创建 Todo
  const handleCreate = async (title) => {
    try {
      await api.createTodo({ title, completed: false })
      await fetchTodos()
    } catch (err) {
      setError(err.message)
      console.error('创建 Todo 失败:', err)
    }
  }

  // 更新 Todo
  const handleUpdate = async (todo) => {
    try {
      await api.updateTodo(todo.id, todo)
      setTodos(todos.map((t) => (t.id === todo.id ? todo : t)))
    } catch (err) {
      setError(err.message)
      console.error('更新 Todo 失败:', err)
    }
  }

  // 删除 Todo
  const handleDelete = async (id) => {
    try {
      await api.deleteTodo(id)
      setTodos(todos.filter((t) => t.id !== id))
    } catch (err) {
      setError(err.message)
      console.error('删除 Todo 失败:', err)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Scan Todo</h1>
          <p className="text-gray-500">管理你的待办事项</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <TodoForm onSubmit={handleCreate} />

        {/* Stats */}
        <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
          <span>共 {todos.length} 项</span>
          <span>已完成 {todos.filter((t) => t.completed).length} 项</span>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-2">加载中...</p>
          </div>
        ) : (
          /* List */
          <TodoList
            todos={todos}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  )
}
