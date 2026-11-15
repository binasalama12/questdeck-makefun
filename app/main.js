import { getCompetitions, getCompetition, getLeaderboard, getProfile } from './api.js';
import { shell, board, bounty, leaderboard, profile, loading, errorView } from './views.js';

const root = document.querySelector('#app');
let pageData = null;
let boardState = { category: 'All', search: '' };
let selectedLeaderboard = null;

function route() {
  const parts = decodeURI(location.hash.replace(/^#\/?/, '')).split('/').filter(Boolean);
  if (parts[0] === 'bounty' && parts[1]) return { page: 'bounty', slug: parts[1] };
  if (parts[0] === 'leaderboard') return { page: 'leaderboard' };
  if (parts[0] === 'profile' && parts[1]) return { page: 'profile', handle: parts[1] };
  return { page: 'board' };
}

function renderBoard() {
  const data = pageData || [];
  const categories = ['All', ...new Set(data.map((item) => item.category).filter(Boolean))];
  const filtered = data.filter((item) => (boardState.category === 'All' || item.category === boardState.category)
    && `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(boardState.search.toLowerCase()));
  root.innerHTML = shell('board', board(filtered, categories, boardState));
  root.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => {
    boardState.category = button.dataset.category;
    renderBoard();
  }));
  root.querySelector('#quest-search')?.addEventListener('input', (event) => {
    const start = event.target.selectionStart;
    boardState.search = event.target.value;
    renderBoard();
    const input = root.querySelector('#quest-search');
    input.focus(); input.setSelectionRange(start, start);
  });
}

async function render() {
  window.__shotReady = false;
  const current = route();
  root.innerHTML = shell(current.page, loading());
  try {
    if (current.page === 'board') {
      if (!pageData) pageData = await getCompetitions();
      renderBoard();
      document.title = 'The Deck · Quest Deck';
    } else if (current.page === 'bounty') {
      const data = await getCompetition(current.slug);
      root.innerHTML = shell(current.page, bounty(data));
      document.title = `${data.title} · Quest Deck`;
    } else if (current.page === 'leaderboard') {
      const comps = pageData || await getCompetitions();
      pageData = comps;
      const chosen = selectedLeaderboard && comps.some((item) => item.slug === selectedLeaderboard) ? selectedLeaderboard
        : [...comps].sort((a, b) => Number(b.submissionCount || 0) - Number(a.submissionCount || 0))[0]?.slug;
      if (!chosen) throw new Error('There are no open quests to rank yet.');
      const result = await getLeaderboard(chosen);
      root.innerHTML = shell(current.page, leaderboard(comps, chosen, result));
      root.querySelector('#leaderboard-select')?.addEventListener('change', (event) => { selectedLeaderboard = event.target.value; render(); });
      document.title = 'Leaderboard · Quest Deck';
    } else {
      const data = await getProfile(current.handle);
      root.innerHTML = shell(current.page, profile(data));
      document.title = `${data.display_name || data.handle} · Quest Deck`;
    }
  } catch (error) {
    root.innerHTML = shell(current.page, errorView(error));
    document.title = 'Quest Deck · Connection issue';
  }
  root.querySelectorAll('a[href^="#/"]').forEach((link) => link.addEventListener('click', () => { window.scrollTo(0, 0); }));
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
