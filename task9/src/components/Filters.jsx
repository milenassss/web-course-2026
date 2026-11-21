import { memo } from 'react'
import { SORT_OPTIONS, STATUS_FILTERS } from '../utils/tasks.js'

function Filters({ filters, onChange }) {
  return (
    <div className="filters">
      <div className="tabs" role="group" aria-label="Статус задачи">
        {STATUS_FILTERS.map(option => (
          <button key={option.value} type="button" className="tab"
            aria-pressed={filters.status === option.value}
            onClick={() => onChange('status', option.value)}>{option.label}</button>
        ))}
      </div>
      <div className="filter-fields">
        <label>Поиск по тексту
          <input type="search" value={filters.query} placeholder="Найти задачу"
            onChange={event => onChange('query', event.target.value)} />
        </label>
        <label>Сортировка
          <select value={filters.sort} onChange={event => onChange('sort', event.target.value)}>
            {SORT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>
    </div>
  )
}
export default memo(Filters)
