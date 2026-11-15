import { date, esc, money, timeLeft } from './format.js';

const pot = (item) => money(item.potUsd ?? 0);
const fee = (item) => Number(item.entryFeeUsd) > 0 ? money(item.entryFeeUsd) : 'Free entry';
const count = (item) => Number(item.submissionCount || 0);
const safeDescription = (text) => esc(text || 'The quest details are still being prepared.');

export function shell(active, content) {
  const links = [['board', '#/', 'The Deck', '◈'], ['leaderboard', '#/leaderboard', 'Leaderboard', '↗']];
  return `<div class="layout">
    <aside class="sidebar"><a class="brand" href="#/"><span class="brand-mark">Q</span><span>quest<span class="brand-light">deck</span><small>make.fun explorer</small></span></a>
      <p class="nav-label">EXPLORE</p><nav>${links.map(([key, href, label, icon]) => `<a class="nav-link ${active === key ? 'active' : ''}" href="${href}"><span class="nav-icon">${icon}</span>${label}</a>`).join('')}</nav>
      <div class="sidebar-note"><span class="sparkle">✦</span><strong>Ready for a new quest?</strong><p>Find your next big build on the deck.</p><a href="#/">Browse open quests <span>→</span></a></div>
      <div class="sidebar-foot"><span class="live-dot"></span> Connected to make.fun</div>
    </aside><main class="main"><div class="mobile-brand"><a class="brand" href="#/"><span class="brand-mark">Q</span><span>quest<span class="brand-light">deck</span></span></a><nav><a class="${active === 'board' ? 'active' : ''}" href="#/">Deck</a><a class="${active === 'leaderboard' ? 'active' : ''}" href="#/leaderboard">Ranks</a></nav></div>${content}</main></div>`;
}

export function loading() { return '<div class="loading"><span class="loader"></span><p>Setting out across the deck…</p></div>'; }

export function errorView(error) {
  return `<section class="state-card error-card"><span class="state-icon">!</span><p class="eyebrow">CONNECTION INTERRUPTED</p><h1>We couldn’t reach the quests.</h1><p class="muted">Quest Deck reads live data from make.fun. Check your connection and try again.</p><p class="error-detail">${esc(error?.message || 'The API request failed.')}</p><button class="button primary" onclick="location.reload()">Try again</button></section>`;
}

export function board(items, categories, state) {
  return `<section class="page-head"><div><p class="eyebrow"><span class="live-dot"></span> THE OPEN BOARD</p><h1>Find your next <span>quest.</span></h1><p class="intro">Big ideas, open challenges, and a little friendly competition.</p></div><a href="#/leaderboard" class="head-link">See the rankings <span>↗</span></a></section>
  <section class="board-tools"><div class="filters" aria-label="Filter by category">${categories.map((category) => `<button class="filter-chip ${state.category === category ? 'selected' : ''}" data-category="${esc(category)}">${esc(category)}</button>`).join('')}</div><label class="search-box"><span>⌕</span><input id="quest-search" type="search" placeholder="Search quests…" value="${esc(state.search)}" aria-label="Search quests"></label></section>
  <div class="results-line"><span><strong>${items.length}</strong> ${items.length === 1 ? 'quest' : 'quests'} to explore</span><span>Sorted by biggest prize <span class="sort-arrow">↓</span></span></div>
  ${items.length ? `<section class="quest-grid">${items.map(card).join('')}</section>` : `<section class="state-card empty-card"><span class="state-icon">⌕</span><h2>No quests found</h2><p class="muted">Try another search or category to keep exploring.</p></section>`}`;
}

function card(item) {
  const ended = timeLeft(item.deadline) === 'ended';
  return `<a class="quest-card" href="#/bounty/${encodeURIComponent(item.slug)}"><div class="card-top"><span class="category-chip">${esc(item.category || 'Open quest')}</span><span class="card-arrow">↗</span></div><h2>${esc(item.title)}</h2><p class="card-description">${esc(item.description || 'A new challenge is waiting for your idea.')}</p><div class="card-prize"><span>PRIZE POT</span><strong>${pot(item)}</strong></div><div class="card-meta"><span><b>${fee(item)}</b><small>ENTRY</small></span><span><b>${count(item)}</b><small>SUBMISSIONS</small></span><span><b class="${ended ? 'ended' : ''}">${esc(timeLeft(item.deadline))}</b><small>DEADLINE</small></span></div><div class="card-cta">Explore quest <span>→</span></div></a>`;
}

export function bounty(item) {
  const rewards = Array.isArray(item.rewards) ? item.rewards : [];
  return `<a class="back-link" href="#/">← Back to the deck</a><section class="detail-hero"><div><span class="category-chip">${esc(item.category || 'Open quest')}</span><p class="eyebrow detail-eyebrow">QUEST BRIEF</p><h1>${esc(item.title)}</h1></div><div class="hero-pot"><span>PRIZE POT</span><strong>${pot(item)}</strong><small>${count(item)} ${count(item) === 1 ? 'submission' : 'submissions'}</small></div></section>
  <div class="detail-layout"><div class="detail-main"><section class="content-card"><p class="eyebrow">THE CHALLENGE</p><h2>What you’re building</h2><div class="description">${safeDescription(item.description)}</div></section>
    <section class="content-card"><p class="eyebrow">THE PAYOUT</p><h2>Rewards breakdown</h2>${rewards.length ? `<div class="rewards-list">${rewards.map((reward, i) => `<div class="reward-row"><span class="reward-rank">${esc(reward.place || reward.rank || `${i + 1}${ordinal(i + 1)}`)}</span><strong>${esc(reward.title || reward.label || `Place ${i + 1}`)}</strong><b>${money(reward.amountUsd ?? reward.prizeUsd ?? reward.amount ?? 0)}</b></div>`).join('')}</div>` : `<p class="muted">Reward details will be announced by the organizer.</p>`}</section>
    <section class="content-card"><p class="eyebrow">BEFORE YOU ENTER</p><h2>Requirements at a glance</h2><ul class="requirements"><li><span>✓</span> Submit your original work before the deadline.</li><li><span>✓</span> Make sure your entry follows the challenge description.</li><li><span>✓</span> Entry fee: ${fee(item)}.</li></ul></section></div>
    <aside class="detail-aside"><section class="content-card stats-card"><p class="eyebrow">QUEST DETAILS</p><div class="stat-line"><span>Deadline</span><strong>${esc(timeLeft(item.deadline))}</strong></div><div class="stat-line"><span>Closes</span><strong>${esc(date(item.deadline))}</strong></div><div class="stat-line"><span>Entry fee</span><strong>${fee(item)}</strong></div><div class="stat-line"><span>Submissions</span><strong>${count(item)}</strong></div><div class="stat-line"><span>Prize pot</span><strong>${pot(item)}</strong></div><a class="button primary full" href="https://make.fun/bounty/${encodeURIComponent(item.slug)}" target="_blank" rel="noopener">View on make.fun <span>↗</span></a></section></aside></div>`;
}

function ordinal(n) { return n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'; }

export function leaderboard(comps, selected, response) {
  const rows = response.rows || response.entries || response.leaderboard || response.items || [];
  const columns = Array.isArray(response.columns) ? response.columns : [];
  const keys = columns.map((column) => typeof column === 'string' ? column : column.key || column.name || column.id).filter(Boolean);
  const metricKeys = keys.filter((key) => !['rank', 'entrant', 'agent', 'handle', 'title', 'entry', 'entryTitle'].includes(key));
  return `<section class="page-head"><div><p class="eyebrow">THE HALL OF FAME</p><h1>Quest <span>rankings.</span></h1><p class="intro">A little inspiration from builders already on the board.</p></div></section><section class="leaderboard-panel"><div class="leaderboard-header"><div><p class="eyebrow">LIVE LEADERBOARD</p><h2>Top builders</h2><p class="muted">${esc(response.phase || 'Current standings')}</p></div><label class="select-wrap"><span>QUEST</span><select id="leaderboard-select">${comps.map((c) => `<option value="${esc(c.slug)}" ${c.slug === selected ? 'selected' : ''}>${esc(c.title)}</option>`).join('')}</select></label></div>
  ${rows.length ? `<div class="table-scroll"><table><thead><tr><th>RANK</th><th>BUILDER</th><th>ENTRY</th>${metricKeys.map((key) => `<th>${esc(labelFor(key, columns))}</th>`).join('')}</tr></thead><tbody>${rows.map((row, i) => { const entrant = row.entrant || row.agent || row.handle || {}; const handle = typeof entrant === 'string' ? entrant : entrant.handle || entrant.username || ''; const entrantName = typeof entrant === 'string' ? entrant : entrant.display_name || entrant.name || handle || 'Anonymous builder'; const entryTitle = row.title || row.entryTitle || row.entry_title || row.entry?.title || 'Untitled entry'; return `<tr><td><span class="rank-badge rank-${Number(row.rank || i + 1)}">${esc(row.rank || i + 1)}</span></td><td>${handle ? `<a class="builder-link" href="#/profile/${encodeURIComponent(handle)}">${esc(entrantName)}</a>` : esc(entrantName)}</td><td>${esc(entryTitle)}</td>${metricKeys.map((key) => `<td>${formatMetric(row[key], key)}</td>`).join('')}</tr>`; }).join('')}</tbody></table></div>` : '<div class="table-empty"><span>✦</span><h3>Standings are warming up</h3><p>There are no ranked entries to show just yet.</p></div>'}</section>`;
}

function labelFor(key, columns) {
  const column = columns.find((item) => typeof item === 'object' && (item.key === key || item.name === key || item.id === key));
  return column?.label || column?.title || key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').toUpperCase();
}
function formatMetric(value, key) {
  if (value == null || value === '') return '—';
  if (/win.?rate/i.test(key) && Number.isFinite(Number(value))) return `${Math.round(Number(value) * (Number(value) <= 1 ? 100 : 1))}%`;
  if (typeof value === 'number' && /score/i.test(key)) return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return esc(value);
}

export function profile(data) {
  const record = data.record || {};
  const solutions = data.solutions || [];
  const stats = [['Entered', record.competitions_entered], ['Placed', record.competitions_placed], ['Won', record.competitions_won], ['Podiums', record.podium_finishes], ['Best placement', record.best_placement ? `#${record.best_placement}` : '—'], ['Prize USD', money(record.prize_usd || 0)]];
  return `<a class="back-link" href="#/leaderboard">← Back to rankings</a><section class="profile-hero"><div class="avatar">${esc((data.display_name || data.handle || '?').slice(0, 1).toUpperCase())}</div><div><p class="eyebrow">BUILDER PROFILE</p><h1>${esc(data.display_name || data.handle)}</h1><p class="handle">@${esc(data.handle)}</p>${data.bio ? `<p class="profile-bio">${esc(data.bio)}</p>` : ''}${data.wallet?.address ? `<p class="wallet">◈ ${esc(data.wallet.address)}</p>` : ''}</div></section><section class="record-grid">${stats.map(([label, value]) => `<div class="record-card"><span>${esc(label)}</span><strong>${esc(value ?? '—')}</strong></div>`).join('')}</section><section class="content-card solutions-card"><p class="eyebrow">BUILDER’S WORK</p><h2>Solutions <span class="count-pill">${solutions.length}</span></h2>${solutions.length ? `<div class="solution-list">${solutions.map((solution) => `<a class="solution-row" href="#/bounty/${encodeURIComponent(solution.competition?.slug || '')}"><span><strong>${esc(solution.title || 'Untitled solution')}</strong><small>${esc(solution.competition?.title || 'Quest')}</small></span><span class="solution-status">${esc(solution.competition?.status || 'view quest')} →</span></a>`).join('')}</div>` : '<p class="muted">No solutions listed yet.</p>'}</section>`;
}
