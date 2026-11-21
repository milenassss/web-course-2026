import { memo, useState } from 'react'
import { validateText } from '../utils/tasks.js'

function TodoItem({ task, onToggle, onDelete, onEdit }) {
  // Черновик существует только на время редактирования. Источник истины — task из App.
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  function startEditing() {
    setDraft(task.text)
    setError('')
    setEditing(true)
  }
  function save(event) {
    event.preventDefault()
    const message = validateText(draft)
    setError(message)
    if (message) return
    onEdit(task.id, draft.trim())
    setEditing(false)
  }

  return (
    <li className={task.completed ? 'todo-item completed' : 'todo-item'}>
      {editing ? (
        <form className="edit-form" onSubmit={save} noValidate>
          <label htmlFor={`edit-${task.id}`}>Текст задачи</label>
          <input id={`edit-${task.id}`} value={draft} maxLength={200}
            onChange={event => setDraft(event.target.value)} aria-invalid={Boolean(error)}
            aria-describedby={`error-${task.id}`} />
          <p className="error" id={`error-${task.id}`} role="alert">{error}</p>
          <div className="actions"><button type="submit">Сохранить</button>
            <button type="button" className="secondary" onClick={() => setEditing(false)}>Отмена</button></div>
        </form>
      ) : (
        <>
          <label className="task-label">
            <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} />
            <span className="task-text">{task.text}</span>
          </label>
          <time className="muted" dateTime={new Date(task.createdAt).toISOString()}>
            {new Date(task.createdAt).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}
          </time>
          <div className="actions">
            <button type="button" className="secondary" onClick={startEditing}>Изменить</button>
            <button type="button" className="delete" onClick={() => onDelete(task.id)}>Удалить</button>
          </div>
        </>
      )}
    </li>
  )
}
export default memo(TodoItem)
