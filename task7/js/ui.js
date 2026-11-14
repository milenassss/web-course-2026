export const elements = {
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

export function render(state) {
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
