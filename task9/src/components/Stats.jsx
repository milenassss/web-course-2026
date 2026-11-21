import { memo } from 'react'

function Stats({ total, active, completed }) {
  return (
    <section className="stats" aria-label="Статистика задач" aria-live="polite">
      <div><span>Всего</span><strong>{total}</strong></div>
      <div><span>Осталось</span><strong>{active}</strong></div>
      <div><span>Выполнено</span><strong>{completed}</strong></div>
    </section>
  )
}
export default memo(Stats)
