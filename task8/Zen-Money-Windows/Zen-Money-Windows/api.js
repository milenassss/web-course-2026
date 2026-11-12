const BASE_URL = 'http://localhost:3001';

async function request(path, method = 'GET', data) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method, signal: controller.signal,
      headers: data === undefined ? {} : { 'Content-Type': 'application/json' },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Сервер вернул ошибку ${response.status}`);
    if (method === 'DELETE') return;
    return await response.json();
  } catch (error) {
    throw new Error(error.name === 'AbortError'
      ? 'Сервер не ответил вовремя. Попробуйте ещё раз.'
      : `Не удалось выполнить запрос. Проверьте, что сервер запущен на порту 3001. ${error.message}`);
  } finally { clearTimeout(timer); }
}

export const getTransactions = () => request('/transactions');
export const getCategories = () => request('/categories');
export const addTransaction = (data) => request('/transactions', 'POST', data);
export const updateTransaction = (id, data) => request(`/transactions/${encodeURIComponent(id)}`, 'PATCH', data);
export const deleteTransaction = (id) => request(`/transactions/${encodeURIComponent(id)}`, 'DELETE');
export const addCategory = (data) => request('/categories', 'POST', data);
