import * as api from './api.js';
import { loadSettings, saveSettings, defaultFilters } from './settings.js';
import { renderCategories, renderSummary, renderTransactions, clearErrors, showFieldError } from './ui.js';

const $ = selector => document.querySelector(selector);
const form = $('#transaction-form');
const filtersForm = $('#filters');
const state = { transactions: [], categories: [], filters: loadSettings(), editingId: null, busy: false, ready: false };

function status(message, error = false) {
  $('#status').textContent = message;
  $('#status').classList.toggle('error', error);
}
function render() {
  renderSummary(state.transactions);
  renderTransactions(state.transactions, state.categories, state.filters, state.busy);
  $('#transaction-fields').disabled = state.busy || !state.ready;
  $('#category-fields').disabled = state.busy || !state.ready;
}
function updateCategoryOptions(selected = '') {
  renderCategories($('#categoryId'), state.categories.filter(c => c.type === $('#type').value), 'Выберите категорию', selected);
}
function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function resetForm() {
  state.editingId = null; form.reset(); clearErrors(form);
  $('#date').value = today(); updateCategoryOptions();
  $('#form-title').textContent = 'Новая операция'; $('#save').textContent = 'Добавить'; $('#cancel').hidden = true;
}
function syncCategoryFilter() {
  renderCategories(filtersForm.elements.category, state.categories, 'Все категории', state.filters.category);
  if (filtersForm.elements.category.value !== state.filters.category) state.filters.category = '';
}
async function load() {
  state.busy = true; status('Загрузка…'); $('#reload').hidden = true; render();
  try {
    const [transactions, categories] = await Promise.all([api.getTransactions(), api.getCategories()]);
    if (!Array.isArray(transactions) || !Array.isArray(categories)) throw new Error('Некорректные данные сервера');
    state.transactions = transactions; state.categories = categories; state.ready = true;
    syncCategoryFilter(); resetForm(); status('Данные загружены');
  } catch (error) { status(error.message, true); $('#reload').hidden = false; }
  finally { state.busy = false; render(); }
}

// Изменяем интерфейс только после успешного ответа сервера.
async function mutate(action, successMessage) {
  if (state.busy) return;
  state.busy = true; status('Сохранение…'); render();
  try { await action(); status(successMessage); }
  catch (error) { status(error.message, true); }
  finally { state.busy = false; render(); }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  if (state.busy || !state.ready) return;
  clearErrors(form);
  const amount = Number($('#amount').value);
  const category = state.categories.find(c => String(c.id) === $('#categoryId').value && c.type === $('#type').value);
  const date = $('#date').value;
  let valid = true;
  if (!Number.isFinite(amount) || amount <= 0 || amount > Number.MAX_SAFE_INTEGER / 100 || Math.abs(amount*100-Math.round(amount*100)) > 0.00001) {
    showFieldError('amount', 'Введите положительную сумму с точностью до копеек.'); valid = false;
  }
  if (!category) { showFieldError('categoryId', 'Выберите категорию нужного типа.'); valid = false; }
  if (!date || !$('#date').validity.valid) { showFieldError('date', 'Укажите корректную дату.'); valid = false; }
  if (!valid) { form.querySelector('[aria-invalid="true"]').focus(); return; }
  const data = { amount: Math.round(amount*100)/100, type: $('#type').value, categoryId: category.id, date, comment: $('#comment').value.trim() };
  const id = state.editingId;
  mutate(async () => {
    if (id !== null) {
      const updated = await api.updateTransaction(id, data);
      state.transactions = state.transactions.map(t => String(t.id) === String(id) ? updated : t);
    } else state.transactions.push(await api.addTransaction(data));
    resetForm();
  }, id === null ? 'Операция добавлена' : 'Операция обновлена');
});

$('#type').addEventListener('change', () => { updateCategoryOptions(); clearErrors(form); });
$('#cancel').addEventListener('click', resetForm);
$('#reload').addEventListener('click', load);
$('#transactions').addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button || state.busy) return;
  const transaction = state.transactions.find(t => String(t.id) === button.dataset.id);
  if (!transaction) return;
  if (button.dataset.action === 'delete') {
    mutate(async () => {
      await api.deleteTransaction(transaction.id);
      state.transactions = state.transactions.filter(t => t.id !== transaction.id);
      if (state.editingId === transaction.id) resetForm();
    }, 'Операция удалена');
  } else {
    state.editingId = transaction.id; clearErrors(form);
    $('#type').value = transaction.type; updateCategoryOptions(String(transaction.categoryId));
    $('#amount').value = transaction.amount; $('#date').value = transaction.date; $('#comment').value = transaction.comment;
    $('#form-title').textContent = 'Редактирование операции'; $('#save').textContent = 'Сохранить'; $('#cancel').hidden = false;
    form.scrollIntoView({ block: 'center' }); $('#amount').focus();
  }
});

$('#category-form').addEventListener('submit', event => {
  event.preventDefault();
  if (state.busy || !state.ready) return;
  clearErrors(event.currentTarget);
  const name = $('#category-name').value.trim(), type = $('#category-type').value;
  if (!name || state.categories.some(c => c.type === type && c.name.toLowerCase() === name.toLowerCase())) {
    showFieldError('category-name', name ? 'Такая категория уже существует.' : 'Введите название категории.');
    $('#category-name').focus(); return;
  }
  mutate(async () => {
    const category = await api.addCategory({ name, type }); state.categories.push(category);
    const selected = $('#categoryId').value;
    updateCategoryOptions(type === $('#type').value ? String(category.id) : selected);
    syncCategoryFilter(); $('#category-form').reset();
  }, 'Категория создана');
});

function applyFilters() {
  state.filters = Object.fromEntries(new FormData(filtersForm));
  $('#filter-error').textContent = state.filters.from && state.filters.to && state.filters.from > state.filters.to
    ? 'Дата «с» должна быть не позже даты «по».' : '';
  if (!saveSettings(state.filters)) status('Фильтры применены, но браузер не разрешил сохранить настройки.', true);
  render();
}
filtersForm.addEventListener('submit', event => event.preventDefault());
filtersForm.addEventListener('change', applyFilters);
filtersForm.addEventListener('reset', event => {
  event.preventDefault(); state.filters = defaultFilters();
  for (const key of Object.keys(state.filters)) filtersForm.elements[key].value = '';
  applyFilters();
});
for (const [key, value] of Object.entries(state.filters)) {
  if (key !== 'category') filtersForm.elements[key].value = value;
}
load();
