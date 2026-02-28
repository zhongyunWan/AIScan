import { useState } from 'react'
import TodoForm from './TodoForm'

export default function TodoItem({ todo, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)

  const handleToggleComplete = () => {
    onUpdate({ ...todo, completed: !todo.completed })
  }

  const handleEdit = (title) => {
    onUpdate({ ...todo, title })
    setIsEditing(false)
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {/* Checkbox */}
      <button
        onClick={handleToggleComplete}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          todo.completed
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-green-400'
        }`}
      >
        {todo.completed && (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <TodoForm
            initialValue={todo.title}
            isEditing={true}
            onSubmit={handleEdit}
          />
        ) : (
          <span
            className={`block text-gray-800 truncate ${
              todo.completed ? 'line-through text-gray-400' : ''
            }`}
          >
            {todo.title}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            title="编辑"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onDelete(todo.id)}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="删除"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
