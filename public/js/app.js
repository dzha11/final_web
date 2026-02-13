// app.js — Shared utilities for all authenticated pages

const API = '/api';

// Auth guard
const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');
if (!token || !userStr) {
  window.location.href = '/index.html';
}
const currentUser = JSON.parse(userStr || '{}');

// Auth headers
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// API request helper
async function apiRequest(url, options = {}) {
  const res = await fetch(API + url, {
    ...options,
    headers: authHeaders(),
  });
  const data = await res.json();
  if (res.status === 401) {
    logout();
    return null;
  }
  return { ok: res.ok, status: res.status, data };
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

// Sidebar toggle
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const sidebarClose = document.getElementById('sidebar-close');

// Create overlay
const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
document.body.appendChild(overlay);

menuToggle?.addEventListener('click', () => {
  sidebar.classList.add('open');
  overlay.classList.add('show');
});
sidebarClose?.addEventListener('click', closeSidebar);
overlay?.addEventListener('click', closeSidebar);

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
}

// Logout button
document.getElementById('logout-btn')?.addEventListener('click', logout);

// Modal utility
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

// Format date
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Get today's day abbreviation
function getTodayAbbr() {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
}

// Day order
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Category colors
const CAT_COLORS = {
  health:        '#f87171',
  fitness:       '#fb923c',
  mindfulness:   '#34d399',
  learning:      '#60a5fa',
  productivity:  '#7c6af7',
  social:        '#f472b6',
  other:         '#94a3b8',
};


// Inject Admin Panel link in sidebar for admins
if (currentUser.role === 'admin') {
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (sidebarNav && !document.getElementById('admin-nav-link')) {
    const adminLink = document.createElement('a');
    adminLink.href = '/pages/admin.html';
    adminLink.id = 'admin-nav-link';
    adminLink.className = 'nav-item' + (window.location.pathname.includes('admin') ? ' active' : '');
    adminLink.innerHTML = '<span class="nav-icon">⚙</span> Admin Panel';
    // Style it orange to stand out
    adminLink.style.color = 'var(--orange)';
    adminLink.addEventListener('mouseenter', () => adminLink.style.background = 'rgba(251,146,60,0.1)');
    adminLink.addEventListener('mouseleave', () => { if (!adminLink.classList.contains('active')) adminLink.style.background = ''; });
    sidebarNav.appendChild(adminLink);
  }
}
