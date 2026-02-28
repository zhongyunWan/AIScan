import { useState } from 'react'

export default function TodoForm({ onSubmit, initialValue = '', isEditing = false }) {
  const [title, setTitle] = useState(initialValue)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit(title.trim())
    if (!isEditing) {
      setTitle('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="请输入 Todo 标题..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isEditing ? '保存' : '添加'}
      </button>
    </form>
  )
}
