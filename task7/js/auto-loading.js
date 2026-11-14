export function createAutoLoading({ state, search, sentinel, loadNextPage }) {
  // Поле меняется сразу, а state.query — только после debounce.
  function isSearchActive() {
    return state.query !== '' || search.value.trim() !== '';
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting) &&
        !state.error && !isSearchActive()) loadNextPage();
  }, { rootMargin: '0px 0px 200px 0px' });
  function update() {
    observer.unobserve(sentinel);
    if (state.hasMore && !state.error && !isSearchActive()) observer.observe(sentinel);
  }
  return { update };
}
