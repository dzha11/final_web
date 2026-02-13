// auth.js — Handles login and registration

const API = '/api';

// If already logged in, redirect to dashboard
if (localStorage.getItem('token')) {
  window.location.href = '/pages/dashboard.html';
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});
document.querySelectorAll('.switch-tab').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab(link.dataset.target);
  });
});

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.toggle('active', f.id === `${tab}-form`));
}

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('login-error');
  const btn = e.target.querySelector('button[type="submit"]');
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  errEl.classList.add('hidden');
  setLoading(btn, true);

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/pages/dashboard.html';
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    setLoading(btn, false);
  }
});

// Register
document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('register-error');
  const sucEl = document.getElementById('register-success');
  const btn = e.target.querySelector('button[type="submit"]');
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  errEl.classList.add('hidden');
  sucEl.classList.add('hidden');
  setLoading(btn, true);

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || (data.errors && data.errors[0]) || 'Registration failed');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    sucEl.textContent = 'Account created! Redirecting...';
    sucEl.classList.remove('hidden');
    setTimeout(() => { window.location.href = '/pages/dashboard.html'; }, 800);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    setLoading(btn, false);
  }
});

function setLoading(btn, loading) {
  btn.querySelector('.btn-text').classList.toggle('hidden', loading);
  btn.querySelector('.btn-loader').classList.toggle('hidden', !loading);
  btn.disabled = loading;
}
