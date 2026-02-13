// habits.js — Habit management page

let allHabits = [];
let currentFilter = 'all';
let editingId = null;
let deletingId = null;

// Open add modal
document.getElementById('add-habit-btn')?.addEventListener('click', openAddModal);
document.getElementById('empty-add-btn')?.addEventListener('click', openAddModal);
document.getElementById('modal-close')?.addEventListener('click', () => closeModal('habit-modal'));
document.getElementById('modal-cancel')?.addEventListener('click', () => closeModal('habit-modal'));
document.getElementById('habit-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'habit-modal') closeModal('habit-modal');
});

// Delete modal
document.getElementById('delete-cancel')?.addEventListener('click', () => closeModal('delete-modal'));
document.getElementById('delete-confirm')?.addEventListener('click', confirmDelete);

// Filter chips
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.filter;
    renderHabits();
  });
});

// Search
document.getElementById('habit-search')?.addEventListener('input', renderHabits);

function openAddModal() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'New Habit';
  document.getElementById('submit-habit-btn').textContent = 'Save Habit';
  document.getElementById('habit-form').reset();
  document.getElementById('habit-icon').value = '⭐';
  document.getElementById('habit-color').value = '#6366f1';
  document.querySelectorAll('#day-selector input').forEach(c => {
    c.checked = ['Mon','Tue','Wed','Thu','Fri'].includes(c.value);
  });
  document.getElementById('habit-form-error').classList.add('hidden');
  openModal('habit-modal');
}

function openEditModal(habit) {
  editingId = habit._id;
  document.getElementById('modal-title').textContent = 'Edit Habit';
  document.getElementById('submit-habit-btn').textContent = 'Update Habit';
  document.getElementById('habit-name').value = habit.name;
  document.getElementById('habit-description').value = habit.description || '';
  document.getElementById('habit-category').value = habit.category;
  document.getElementById('habit-color').value = habit.color;
  document.getElementById('habit-icon').value = habit.icon;
  document.querySelectorAll('#day-selector input').forEach(c => {
    c.checked = habit.targetDays.includes(c.value);
  });
  document.getElementById('habit-form-error').classList.add('hidden');
  openModal('habit-modal');
}

function openDeleteModal(habit) {
  deletingId = habit._id;
  document.getElementById('delete-habit-name').textContent = habit.name;
  openModal('delete-modal');
}

async function confirmDelete() {
  if (!deletingId) return;
  const result = await apiRequest(`/habits/${deletingId}`, { method: 'DELETE' });
  if (result?.ok) {
    closeModal('delete-modal');
    deletingId = null;
    loadHabits();
  }
}

// Form submit
document.getElementById('habit-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('habit-form-error');
  errEl.classList.add('hidden');

  const targetDays = [...document.querySelectorAll('#day-selector input:checked')].map(i => i.value);
  if (targetDays.length === 0) {
    errEl.textContent = 'Please select at least one target day';
    errEl.classList.remove('hidden');
    return;
  }

  const payload = {
    name: document.getElementById('habit-name').value.trim(),
    description: document.getElementById('habit-description').value.trim(),
    category: document.getElementById('habit-category').value,
    color: document.getElementById('habit-color').value,
    icon: document.getElementById('habit-icon').value || '⭐',
    targetDays,
  };

  const url = editingId ? `/habits/${editingId}` : '/habits';
  const method = editingId ? 'PUT' : 'POST';

  const result = await apiRequest(url, { method, body: JSON.stringify(payload) });
  if (result?.ok) {
    closeModal('habit-modal');
    loadHabits();
  } else {
    errEl.textContent = result?.data?.message || 'Failed to save habit';
    errEl.classList.remove('hidden');
  }
});

// Load and render habits
async function loadHabits() {
  const result = await apiRequest('/habits');
  if (!result?.ok) return;
  allHabits = result.data.habits;
  renderHabits();
}

function renderHabits() {
  const grid = document.getElementById('habits-grid');
  const emptyState = document.getElementById('empty-state');
  const searchVal = document.getElementById('habit-search')?.value.toLowerCase() || '';

  let filtered = allHabits.filter(h => h.isActive);
  if (currentFilter !== 'all') filtered = filtered.filter(h => h.category === currentFilter);
  if (searchVal) filtered = filtered.filter(h => h.name.toLowerCase().includes(searchVal));

  if (filtered.length === 0 && allHabits.length === 0) {
    grid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  grid.classList.remove('hidden');
  emptyState.classList.add('hidden');

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="loading-state" style="grid-column:1/-1">No habits match this filter.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(h => `
    <div class="habit-card" style="--habit-color:${h.color}">
      <div class="habit-card-header">
        <div class="habit-card-icon" style="background:${h.color}22">${h.icon}</div>
        <div class="habit-card-menu">
          <button class="card-btn edit-btn" data-id="${h._id}" title="Edit">✎</button>
          <button class="card-btn delete delete-btn" data-id="${h._id}" title="Delete">✕</button>
        </div>
      </div>
      <div class="habit-card-name">${h.name}</div>
      <div class="habit-card-desc">${h.description || 'No description'}</div>
      <div class="habit-card-footer">
        <span class="habit-cat-badge">${h.category}</span>
        <span class="habit-streak">${h.streak > 0 ? `🔥 ${h.streak} days` : 'No streak yet'}</span>
      </div>
    </div>
  `).join('');

  // Edit/Delete listeners
  grid.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const habit = allHabits.find(h => h._id === btn.dataset.id);
      if (habit) openEditModal(habit);
    });
  });
  grid.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const habit = allHabits.find(h => h._id === btn.dataset.id);
      if (habit) openDeleteModal(habit);
    });
  });
}

// Init
loadHabits();
