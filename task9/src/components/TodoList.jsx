import { memo } from 'react'
import TodoItem from './TodoItem.jsx'

function TodoList({ tasks, hasTasks, onToggle, onDelete, onEdit }) {
  if (!tasks.length) return (
    <div className="empty"><span aria-hidden="true">✓</span>
      <h3>{hasTasks ? 'Ничего не найдено' : 'Здесь начинается ваш план'}</h3>
      <p>{hasTasks ? 'Измените фильтр или поисковый запрос.' : 'Добавьте первую задачу с помощью формы выше.'}</p>
    </div>
  )
  return (
    <ul className="todo-list">
      {tasks.map(task => <TodoItem key={task.id} task={task}
        onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />)}
    </ul>
  )
}
export default memo(TodoList)
