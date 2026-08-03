// ============ Team Steps — shared behaviour ============

// Change this once the backend is deployed somewhere other than your machine
// (e.g. https://team-steps-api.onrender.com/api)
const API_BASE = 'https://team-steps-backend.onrender.com/api';

// --- Auth helpers, shared by login.html and admin.html ---
const TeamStepsAuth = {
  KEY: 'teamsteps_auth',
  save(token, member) {
    localStorage.setItem(this.KEY, JSON.stringify({ token, member }));
  },
  get() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || null;
    } catch {
      return null;
    }
  },
  clear() {
    localStorage.removeItem(this.KEY);
  },
  isOfficer() {
    const auth = this.get();
    return !!auth && ['officer', 'admin'].includes(auth.member?.role);
  },
};

// Wrapper around fetch that attaches the officer's token automatically
async function apiFetch(path, options = {}) {
  const auth = TeamStepsAuth.get();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Render (or re-render) every ladder widget on the page from its data attributes.
// Uses a single compact fill bar instead of one element per member — stays a fixed,
// small height no matter how many members the cap grows to.
function renderLadders() {
  document.querySelectorAll('.ladder-rungs[data-total]').forEach(el => {
    const total = parseInt(el.dataset.total, 10) || 50;
    const filled = parseInt(el.dataset.filled, 10) || 0;
    const pct = Math.max(0, Math.min(100, (filled / total) * 100));

    el.innerHTML = '<div class="ladder-fill"></div>';
    el.querySelector('.ladder-fill').style.width = pct + '%';
    el.setAttribute('role', 'progressbar');
    el.setAttribute('aria-valuenow', filled);
    el.setAttribute('aria-valuemin', '0');
    el.setAttribute('aria-valuemax', total);
    el.setAttribute('aria-label', `${filled} of ${total} members`);
  });
}

// Fetches the real member count and updates every ".js-active" / ".js-remaining" /
// ".js-active-padded" / ".js-max" span and ladder widget on the page. If the API
// is unreachable, the hardcoded fallback numbers already in the HTML stay put.
async function applyLiveMemberStats() {
  try {
    const res = await fetch(`${API_BASE}/members/count`);
    if (!res.ok) return;
    const { active, max } = await res.json();
    const remaining = Math.max(max - active, 0);

    document.querySelectorAll('.js-active').forEach(el => { el.textContent = active; });
    document.querySelectorAll('.js-active-padded').forEach(el => { el.textContent = String(active).padStart(2, '0'); });
    document.querySelectorAll('.js-remaining').forEach(el => { el.textContent = remaining; });
    document.querySelectorAll('.js-max').forEach(el => { el.textContent = max; });
    document.querySelectorAll('.ladder-rungs[data-total]').forEach(el => { el.dataset.filled = active; });
    renderLadders();
  } catch (err) {
    console.error('Could not load live member count, keeping fallback numbers:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('nav.links');
  if (toggle && links){
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const expanded = links.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded);
    });
  }

  // Render any ladder widgets on the page: <div class="ladder-rungs" data-total="50" data-filled="5">
  renderLadders();

  // Overwrite the hardcoded fallback numbers with the real live count, if reachable
  applyLiveMemberStats();

  // Generic form preview handler: shows a confirmation message, does not submit anywhere yet.
  document.querySelectorAll('form.site-form[data-preview]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = form.querySelector('.form-msg');
      if (msg) msg.classList.add('show');
      form.reset();
    });
  });

  // Footer year
  document.querySelectorAll('.js-year').forEach(el => { el.textContent = new Date().getFullYear(); });
});
