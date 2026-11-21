// Реестры позволяют добавить фильтр или сортировку, не меняя компоненты списка.
export const STATUS_FILTERS = [
  { value: 'all', label: 'Все', test: () => true },
  { value: 'active', label: 'Активные', test: task => !task.completed },
  { value: 'completed', label: 'Завершённые', test: task => task.completed },
]

const collator = new Intl.Collator('ru', { sensitivity: 'base', numeric: true })
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Сначала новые', compare: (a, b) => b.createdAt - a.createdAt },
  { value: 'oldest', label: 'Сначала старые', compare: (a, b) => a.createdAt - b.createdAt },
  { value: 'alphabet', label: 'По алфавиту А → Я', compare: (a, b) => collator.compare(a.text, b.text) },
]

export function selectTasks(tasks, { status, query, sort }) {
  const predicate = STATUS_FILTERS.find(option => option.value === status)?.test ?? (() => true)
  const compare = SORT_OPTIONS.find(option => option.value === sort)?.compare ?? SORT_OPTIONS[0].compare
  const search = query.trim().toLocaleLowerCase('ru')
  return [...tasks].filter(task => predicate(task) &&
    task.text.toLocaleLowerCase('ru').includes(search)).sort(compare)
}

export function summarizeTasks(tasks) {
  const completed = tasks.filter(task => task.completed).length
  return { total: tasks.length, completed, active: tasks.length - completed }
}

export function validateText(text) {
  const value = text.trim()
  if (!value) return 'Введите текст задачи.'
  if (value.length > 200) return 'Не больше 200 символов.'
  return ''
}
