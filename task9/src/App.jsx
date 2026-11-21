import { useCallback, useEffect, useMemo, useState } from 'react'
import TodoForm from './components/TodoForm.jsx'
import Filters from './components/Filters.jsx'
import Stats from './components/Stats.jsx'
import TodoList from './components/TodoList.jsx'
import { selectTasks, summarizeTasks } from './utils/tasks.js'
import { loadTasks, saveTasks } from './services/storage.js'

export default function App() {
  const [initial] = useState(loadTasks)
  const [tasks, setTasks] = useState(initial.tasks)
  const [storageError, setStorageError] = useState(initial.error)
  const [filters, setFilters] = useState({ status: 'all', query: '', sort: 'newest' })

  useEffect(() => {
    let active = true
    queueMicrotask(() => {
      if (active) setStorageError(saveTasks(tasks))
    })
    return () => { active = false }
  }, [tasks])

  const addTask = useCallback((text, completed) => {
    setTasks(current => [...current, {
      id: crypto.randomUUID(), text, completed, createdAt: Date.now(),
    }])
  }, [])

  const toggleTask = useCallback(id => {
    setTasks(current => current.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task))
  }, [])

  const deleteTask = useCallback(id => {
    setTasks(current => current.filter(task => task.id !== id))
  }, [])

  const editTask = useCallback((id, text) => {
    setTasks(current => current.map(task => task.id === id ? { ...task, text } : task))
  }, [])

  const changeFilters = useCallback((key, value) => {
    setFilters(current => ({ ...current, [key]: value }))
  }, [])

  // Сортируем копию, исходный массив задач не изменяется.
  const visibleTasks = useMemo(() => selectTasks(tasks, filters), [tasks, filters])
  const stats = useMemo(() => summarizeTasks(tasks), [tasks])

  return (
    <main className="app">
      <header className="page-header">
        <p className="eyebrow">Личное пространство</p>
        <h1>Всё по плану</h1>
        <p>Освободите голову. Запишите то, что важно.</p>
      </header>
      <Stats total={stats.total} active={stats.active} completed={stats.completed} />
      {storageError && <p className="error" role="alert">{storageError}</p>}
      <TodoForm onAdd={addTask} />
      <section className="panel" aria-labelledby="list-heading">
        <div className="section-heading"><h2 id="list-heading">Мои задачи</h2>
          <span className="muted" role="status">Показано: {visibleTasks.length}</span>
        </div>
        <Filters filters={filters} onChange={changeFilters} />
        <TodoList tasks={visibleTasks} hasTasks={tasks.length > 0}
          onToggle={toggleTask} onDelete={deleteTask} onEdit={editTask} />
      </section>
      <footer>Список сохраняется в этом браузере на этом компьютере.</footer>
    </main>
  )
}
