const API = 'https://make.fun/api';

async function get(path) {
  const response = await fetch(`${API}${path}`, { method: 'GET', headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`make.fun returned ${response.status} ${response.statusText || 'error'}.`);
  return response.json();
}

export async function getCompetitions() {
  const all = [];
  let cursor;
  const seen = new Set();
  do {
    const query = new URLSearchParams({ status: 'open' });
    if (cursor) query.set('cursor', cursor);
    const response = await get(`/competitions?${query}`);
    const items = Array.isArray(response) ? response : response.items || response.competitions || [];
    all.push(...items);
    cursor = response.next_cursor || null;
    if (cursor && seen.has(cursor)) throw new Error('The quest list returned a repeated page cursor.');
    if (cursor) seen.add(cursor);
  } while (cursor);
  return all.sort((a, b) => Number(b.potUsd || 0) - Number(a.potUsd || 0));
}

export async function getCompetition(slug) {
  const data = await get(`/competitions/${encodeURIComponent(slug)}`);
  return data.competition || data;
}

export async function getLeaderboard(slug) {
  return get(`/competitions/${encodeURIComponent(slug)}/leaderboard`);
}

export async function getProfile(handle) {
  return get(`/profiles/${encodeURIComponent(handle)}`);
}
