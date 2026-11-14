import { API_URL, PAGE_SIZE } from './config.js';

export async function getPosts(offset) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const url = new URL(API_URL);
    url.searchParams.set('_start', offset);
    url.searchParams.set('_limit', PAGE_SIZE);
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const posts = await response.json();
    if (!Array.isArray(posts) || !posts.every((post) =>
      post !== null && Number.isInteger(post.id) && Number.isInteger(post.userId) &&
      typeof post.title === 'string' && typeof post.body === 'string')) {
      throw new Error('Invalid response');
    }
    const totalHeader = response.headers.get('X-Total-Count');
    return { posts, total: totalHeader === null ? NaN : Number(totalHeader) };
  } catch (error) {
    throw new Error(error.name === 'AbortError'
      ? 'Сервер не ответил вовремя. Повторите загрузку.'
      : 'Не удалось загрузить посты. Проверьте подключение и попробуйте снова.');
  } finally {
    clearTimeout(timeout);
  }
}
