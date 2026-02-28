const BASE_URL = '/api'

const handleResponse = async (response) => {
  const result = await response.json()
  if (result.code !== 0) {
    throw new Error(result.message || '请求失败')
  }
  return result.data
}

export const api = {
  // 获取所有 Todo
  getTodos: async () => {
    const response = await fetch(`${BASE_URL}/todos`)
    return handleResponse(response)
  },

  // 获取单个 Todo
  getTodo: async (id) => {
    const response = await fetch(`${BASE_URL}/todos/${id}`)
    return handleResponse(response)
  },

  // 创建 Todo
  createTodo: async (todo) => {
    const response = await fetch(`${BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo),
    })
    return handleResponse(response)
  },

  // 更新 Todo
  updateTodo: async (id, todo) => {
    const response = await fetch(`${BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo),
    })
    return handleResponse(response)
  },

  // 删除 Todo
  deleteTodo: async (id) => {
    const response = await fetch(`${BASE_URL}/todos/${id}`, {
      method: 'DELETE',
    })
    return handleResponse(response)
  },
}
