import { memo, useState } from 'react'
import { validateText } from '../utils/tasks.js'

// Текст новой задачи локален: его ввод не перерисовывает App и список.
function TodoForm({ onAdd }) {
  const [text, setText] = useState('')
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    const message = validateText(text)
    setError(message)
    if (message) return
    onAdd(text.trim(), completed)
    setText('')
    setCompleted(false)
  }

  return (
    <section className="panel" aria-labelledby="new-heading">
      <h2 id="new-heading">Новая задача</h2>
      <form onSubmit={submit} noValidate>
        <label htmlFor="new-task">Что нужно сделать?</label>
        <div className="add-row">
          <input id="new-task" value={text} onChange={event => {
            setText(event.target.value); setError('')
          }} placeholder="Например, подготовиться к защите" maxLength={200}
            aria-invalid={Boolean(error)} aria-describedby="new-error" />
          <button type="submit">Добавить</button>
        </div>
        <p className="error" id="new-error" role="alert">{error}</p>
        <label className="checkbox-label">
          <input type="checkbox" checked={completed} onChange={event => setCompleted(event.target.checked)} />
          Уже выполнена
        </label>
      </form>
    </section>
  )
}
export default memo(TodoForm)
