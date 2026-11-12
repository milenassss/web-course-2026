const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const PAGE_SIZE = 10;
const SEARCH_DELAY = 300;

// Все загруженные записи хранятся здесь; поиск не меняет этот массив.
const state = { posts: [], query: '', loading: false, hasMore: true, error: '' };
const elements = {
  posts: document.querySelector('#posts'),
  search: document.querySelector('#search'),
  counter: document.querySelector('#counter'),
  empty: document.querySelector('#empty'),
  loading: document.querySelector('#loading'),
  error: document.querySelector('#error'),
  end: document.querySelector('#end'),
  loadMore: document.querySelector('#load-more'),
  sentinel: document.querySelector('#sentinel'),
};

function createPostCard(post) {
  const article = document.createElement('article');
  article.className = 'post';
  const meta = document.createElement('div');
  meta.className = 'post-meta';
  const author = document.createElement('span');
  author.textContent = `Автор #${post.userId}`;
  const number = document.createElement('span');
  number.textContent = `Пост ${String(post.id).padStart(2, '0')}`;
  meta.append(author, number);
  const title = document.createElement('h2');
  title.textContent = post.title;
  const body = document.createElement('p');
  body.className = 'post-body';
  // textContent отображает данные API как текст, а не HTML.
  body.textContent = post.body;
  article.append(meta, title, body);
  return article;
}

function render() {
  const visiblePosts = state.posts.filter((post) =>
    post.title.toLowerCase().includes(state.query));
  const fragment = document.createDocumentFragment();
  visiblePosts.forEach((post) => fragment.append(createPostCard(post)));
  elements.posts.replaceChildren(fragment);
  elements.posts.setAttribute('aria-busy', String(state.loading));
  elements.counter.textContent = `Загружено: ${state.posts.length} · Показано: ${visiblePosts.length}`;
  elements.empty.hidden = visiblePosts.length !== 0 || state.loading || state.posts.length === 0;
  elements.loading.hidden = !state.loading;
  elements.error.hidden = !state.error;
  elements.error.textContent = state.error;
  elements.end.hidden = state.hasMore;
  elements.loadMore.hidden = !state.hasMore || state.loading;
  elements.loadMore.disabled = state.loading;
  elements.loadMore.textContent = state.error ? 'Повторить загрузку' : 'Загрузить ещё';
}

async function loadNextPage() {
  // Защита от одновременных запросов и загрузки после конца ленты.
  if (state.loading || !state.hasMore) return;
  state.loading = true;
  state.error = '';
  render();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const url = new URL(API_URL);
    url.searchParams.set('_start', state.posts.length);
    url.searchParams.set('_limit', PAGE_SIZE);
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const posts = await response.json();
    if (!Array.isArray(posts) || !posts.every((post) =>
      Number.isInteger(post.id) && Number.isInteger(post.userId) &&
      typeof post.title === 'string' && typeof post.body === 'string')) {
      throw new Error('Invalid response');
    }

    state.posts.push(...posts);
    const totalHeader = response.headers.get('X-Total-Count');
    const total = totalHeader === null ? NaN : Number(totalHeader);
    state.hasMore = posts.length === PAGE_SIZE &&
      (!Number.isFinite(total) || state.posts.length < total);
  } catch (error) {
    state.error = error.name === 'AbortError'
      ? 'Сервер не ответил вовремя. Повторите загрузку.'
      : 'Не удалось загрузить посты. Проверьте подключение и попробуйте снова.';
  } finally {
    clearTimeout(timeout);
    state.loading = false;
    render();
    updateAutoLoading();
  }
}

function debounce(callback, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}

// Проверяем и поле ввода: debounce ещё может не применить новый запрос.
function isSearchActive() {
  return state.query !== '' || elements.search.value.trim() !== '';
}

function updateAutoLoading() {
  observer.unobserve(elements.sentinel);
  if (state.hasMore && !state.error && !isSearchActive()) {
    observer.observe(elements.sentinel);
  }
}

const observer = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting) &&
      !state.error && !isSearchActive()) loadNextPage();
}, { rootMargin: '0px 0px 200px 0px' });

elements.search.addEventListener('input', debounce(() => {
  state.query = elements.search.value.trim().toLowerCase();
  render();
  // При поиске новые порции загружаются только кнопкой.
  updateAutoLoading();
}, SEARCH_DELAY));
elements.loadMore.addEventListener('click', loadNextPage);
loadNextPage();
