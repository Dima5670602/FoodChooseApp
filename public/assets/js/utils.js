/* ═══ FoodChooseApp — Shared Utilities ═══ */

const API = '';

// ─── Auth helpers ─────────────────────────────────────
function getToken() { return localStorage.getItem('fc_token') || localStorage.getItem('fc_admin_token') || localStorage.getItem('fc_rest_token') || localStorage.getItem('fc_co_token'); }
function hdrs(tok) { return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tok || getToken()}` }; }

async function apiFetch(url, opts = {}, tok = null) {
  const res = await fetch(API + url, {
    headers: hdrs(tok),
    ...opts,
    body: opts.body ? (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
  return data;
}

// ─── Toast ────────────────────────────────────────────
function toast(msg, type = 'info') {
  let c = document.getElementById('toastContainer');
  if (!c) { c = document.createElement('div'); c.id = 'toastContainer'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  t.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3800);
}

// ─── Notification sound ───────────────────────────────
function playSound(type = 'notif') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'message') {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.08);
    } else {
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(700, ctx.currentTime + 0.2);
    }
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch(e) {}
}

// ─── Notifications polling ────────────────────────────
let lastNotifCount = 0;
let notifPollInterval = null;

function initNotifications(targetType, targetId) {
  loadNotifications();
  notifPollInterval = setInterval(loadNotifications, 6000);
}

async function loadNotifications() {
  try {
    const items = await apiFetch('/api/notifications');
    const unread = items.filter(n => !n.read).length;
    const badge = document.getElementById('notifCount');
    if (badge) {
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'flex' : 'none';
    }
    if (unread > lastNotifCount && lastNotifCount >= 0) playSound('notif');
    lastNotifCount = unread;
    renderNotifDropdown(items);
  } catch(e) {}
}

function renderNotifDropdown(items) {
  const dd = document.getElementById('notifDropdown');
  if (!dd) return;
  if (!items.length) { dd.innerHTML = '<div class="empty-state" style="padding:20px"><span class="icon">🔔</span>Aucune notification</div>'; return; }
  dd.innerHTML = items.slice(0,15).map(n => `
    <div class="notif-item ${n.read?'':'unread'}" onclick="markNotifRead(${n.id}, this)">
      <div class="notif-title">${n.title||''}</div>
      <div class="notif-msg">${n.message||''}</div>
      <div class="notif-time">${timeAgo(n.created_at)}</div>
    </div>
  `).join('');
}

async function markNotifRead(id, el) {
  await apiFetch(`/api/notifications/${id}/read`, { method: 'PUT' });
  el.classList.remove('unread');
  loadNotifications();
}

function toggleNotifDropdown() {
  const dd = document.getElementById('notifDropdown');
  if (dd) dd.classList.toggle('open');
}

// ─── Sidebar (mobile) ─────────────────────────────────
function initSidebar() {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay?.classList.toggle('open');
    });
    overlay?.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }
}

// ─── Navigation ───────────────────────────────────────
function initNav(defaultPage, onSwitch) {
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      item.classList.add('active');
      const pg = document.getElementById(`page-${page}`);
      if (pg) pg.classList.add('active');
      const tb = document.getElementById('pageTitle');
      if (tb) tb.textContent = item.querySelector('span:not(.icon):not(.nav-badge)')?.textContent.trim() || item.textContent.trim();
      // Close sidebar on mobile
      document.getElementById('sidebar')?.classList.remove('open');
      document.getElementById('sidebarOverlay')?.classList.remove('open');
      if (onSwitch) onSwitch(page);
    });
  });
}

// ─── Date helpers ─────────────────────────────────────
function todayStr() { return new Date().toISOString().split('T')[0]; }
function formatDate(d) {
  if (!d) return '—';
  return new Date(d + (d.includes('T') ? '' : 'T12:00:00')).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' });
}
function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
}
function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff/60000);
  if (m < 1) return 'À l\'instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m/60);
  if (h < 24) return `il y a ${h}h`;
  return formatDate(d);
}

// ─── Photo upload to base64 ───────────────────────────
function readFileAsBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ─── Password visibility toggle ───────────────────────
function initPasswordToggles() {
  document.querySelectorAll('.pw-toggle:not([data-pw-init])').forEach(btn => {
    btn.setAttribute('data-pw-init', '1');
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling || btn.closest('.pw-wrap').querySelector('input');
      if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
        btn.textContent = input.type === 'password' ? '👁' : '🙈';
      }
    });
  });
}

// ─── Specialties list ─────────────────────────────────
const SPECIALTIES = [
  'Cuisine Burkinabè', 'Cuisine Ivoirienne', 'Cuisine Togolaise', 'Cuisine Sénégalaise',
  'Cuisine Béninoise', 'Cuisine Nigériane', 'Cuisine Marocaine', 'Cuisine Européenne',
  'Cuisine Asiatique', 'Cuisine Américaine', 'Fast-food', 'Boissons', 'Snack', 'Pizzeria', 'Grillade', 'Végétarien'
];

function renderSpecialties(containerId, selectedList = []) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = SPECIALTIES.map(s => `
    <label style="display:inline-flex;align-items:center;gap:6px;background:white;border:1.5px solid ${selectedList.includes(s)?'var(--orange)':'var(--border)'};border-radius:8px;padding:6px 12px;cursor:pointer;font-size:12.5px;margin:3px;transition:all .2s">
      <input type="checkbox" name="specialty" value="${s}" ${selectedList.includes(s)?'checked':''} style="width:14px;height:14px;accent-color:var(--orange)">
      ${s}
    </label>
  `).join('');
}

function getSelectedSpecialties(containerId) {
  return [...document.querySelectorAll(`#${containerId} input[name="specialty"]:checked`)].map(i => i.value);
}

// ─── Payment types ────────────────────────────────────
const PAYMENT_TYPES = ['OrangeMoney', 'MoovMoney', 'Telecel Money', 'Compte Bancaire'];

function renderPaymentFields(containerId, existing = []) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const existingMap = {};
  existing.forEach(p => { existingMap[p.type] = p.account; });
  el.innerHTML = PAYMENT_TYPES.map(type => `
    <div style="display:grid;grid-template-columns:150px 1fr;gap:8px;align-items:center;margin-bottom:8px">
      <label style="display:flex;align-items:center;gap:7px;font-size:13px;font-weight:500;color:var(--text)">
        <input type="checkbox" name="paytype" value="${type}" ${existingMap[type]?'checked':''} style="accent-color:var(--orange);width:14px;height:14px">
        ${type}
      </label>
      <input type="text" name="payaccount_${type}" class="form-control" placeholder="N° compte / code" value="${existingMap[type]||''}" style="font-size:12.5px">
    </div>
  `).join('') + `
    <div style="margin-top:8px">
      <label style="font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:6px">Autre mode de paiement</label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <input type="text" id="customPayType" class="form-control" placeholder="Nom du mode" style="font-size:12.5px">
        <input type="text" id="customPayAccount" class="form-control" placeholder="N° / code" style="font-size:12.5px">
      </div>
    </div>
  `;
}

function getPaymentTypes(containerId) {
  const result = [];
  PAYMENT_TYPES.forEach(type => {
    const cb = document.querySelector(`#${containerId} input[value="${type}"]`);
    if (cb && cb.checked) {
      const acc = document.querySelector(`#${containerId} input[name="payaccount_${type}"]`);
      result.push({ type, account: acc?.value || '' });
    }
  });
  const customType = document.getElementById('customPayType')?.value.trim();
  const customAcc = document.getElementById('customPayAccount')?.value.trim();
  if (customType) result.push({ type: customType, account: customAcc || '' });
  return result;
}

// ─── Category colors ──────────────────────────────────
const CAT_COLORS = { plat:'#E85A2A', boisson:'#3B82F6', snack:'#F59E0B', dessert:'#8B5CF6', petit_déjeuner:'#10B981' };
const CAT_ICONS = { plat:'🍜', boisson:'🥤', snack:'🥨', dessert:'🍰', petit_déjeuner:'🥐', default:'🍽' };

// ─── Stars render ─────────────────────────────────────
function renderStars(score, max = 5) {
  return '⭐'.repeat(score) + '☆'.repeat(max - score);
}

// ─── Drink labels ─────────────────────────────────────
const DRINK_LABELS = { lipton:'🍵 Lipton', cafeine:'☕ Caféine', both:'🍵☕ Les deux' };

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.notif-btn') && !e.target.closest('.notif-dropdown')) {
    document.querySelectorAll('.notif-dropdown').forEach(d => d.classList.remove('open'));
  }
});
