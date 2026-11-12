export const money = (value) => new Intl.NumberFormat('ru-BY', { style: 'currency', currency: 'BYN' }).format(value);
const node = (tag, text, className) => {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
};

export function renderCategories(select, categories, placeholder, selected = '') {
  select.replaceChildren(new Option(placeholder, ''), ...categories.map(category =>
    new Option(`${category.name} · ${category.type === 'income' ? 'доход' : 'расход'}`, category.id)));
  select.value = selected;
}

export function renderSummary(transactions) {
  // Считаем в копейках, чтобы избежать ошибок сложения дробных сумм.
  const sum = type => transactions.filter(t => t.type === type)
    .reduce((total, t) => total + Math.round(Number(t.amount) * 100), 0);
  const income = sum('income'), expense = sum('expense');
  document.querySelector('#income').textContent = money(income / 100);
  document.querySelector('#expense').textContent = money(expense / 100);
  document.querySelector('#balance').textContent = money((income - expense) / 100);
}

export function renderTransactions(transactions, categories, filters, busy) {
  const list = document.querySelector('#transactions');
  const visible = transactions.filter(t => (!filters.type || t.type === filters.type) &&
    (!filters.category || String(t.categoryId) === filters.category) &&
    (!filters.from || t.date >= filters.from) && (!filters.to || t.date <= filters.to))
    .sort((a,b) => b.date.localeCompare(a.date));
  document.querySelector('#count').textContent = `Показано ${visible.length} из ${transactions.length}. Сводка учитывает все операции.`;
  list.replaceChildren();
  list.setAttribute('aria-busy', String(busy));
  if (!visible.length) list.append(node('p', 'Операций нет. Добавьте новую или измените фильтры.'));
  for (const transaction of visible) {
    const article = node('article', '', 'transaction');
    const content = node('div', '');
    const category = categories.find(c => String(c.id) === String(transaction.categoryId));
    content.append(node('h3', category?.name || 'Неизвестная категория'), node('p', transaction.date), node('p', transaction.comment || 'Без комментария'));
    const actions = node('div', '', 'actions');
    for (const [action, label] of [['edit', 'Изменить'], ['delete', 'Удалить']]) {
      const button = node('button', label, 'secondary');
      button.type = 'button'; button.dataset.action = action; button.dataset.id = transaction.id;
      button.disabled = busy; actions.append(button);
    }
    content.append(actions);
    const amount = node('strong', `${transaction.type === 'income' ? '+' : '−'}${money(transaction.amount)}`, transaction.type);
    article.append(content, amount); list.append(article);
  }
}

export function clearErrors(form) {
  form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  form.querySelectorAll('.error').forEach(el => { el.textContent = ''; });
}
export function showFieldError(id, message) {
  document.getElementById(id).setAttribute('aria-invalid', 'true');
  document.getElementById(`${id}-error`).textContent = message;
}
