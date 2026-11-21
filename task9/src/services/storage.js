const KEY = 'bsa-todo-tasks-v1'

export function loadTasks() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { tasks: [], error: '' }
    const tasks = JSON.parse(raw)
    const ids = new Set()
    const valid = Array.isArray(tasks) && tasks.every(task => {
      if (!task || typeof task.id !== 'string' || !task.id || ids.has(task.id) ||
          typeof task.text !== 'string' || !task.text.trim() || task.text.length > 200 ||
          typeof task.completed !== 'boolean' || !Number.isFinite(task.createdAt)) return false
      ids.add(task.id)
      return true
    })
    if (!valid) throw new Error('Invalid storage')
    return { tasks, error: '' }
  } catch {
    return { tasks: [], error: 'Не удалось прочитать сохранённый список. Можно начать новый список.' }
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks))
    return ''
  } catch {
    return 'Браузер не разрешил сохранить список. До закрытия страницы задачи доступны в памяти.'
  }
}
