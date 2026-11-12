const KEY = 'zen-money-filters';
export const defaultFilters = () => ({ type: '', category: '', from: '', to: '' });
export function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    const filters = defaultFilters();
    for (const key of Object.keys(filters)) {
      if (saved && typeof saved[key] === 'string') filters[key] = saved[key];
    }
    return filters;
  } catch { return defaultFilters(); }
}
export function saveSettings(filters) {
  try { localStorage.setItem(KEY, JSON.stringify(filters)); return true; }
  catch { return false; }
}
