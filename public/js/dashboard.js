// dashboard.js — Dashboard page logic

// Greet by time
const hour = new Date().getHours();
const greetEl = document.getElementById('time-greeting');
if (greetEl) {
  greetEl.textContent = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
}

// User name
const nameEl = document.getElementById('user-name');
if (nameEl && currentUser.username) nameEl.textContent = currentUser.username;

// Today's date
const dateEl = document.getElementById('today-date');
if (dateEl) {
  dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// Today's day
const todayAbbr = getTodayAbbr();
const todayDayLabel = document.getElementById('today-day-label');
if (todayDayLabel) todayDayLabel.textContent = todayAbbr;

let allHabits = [];

// Load stats
async function loadStats() {
  const result = await apiRequest('/habits/stats');
  if (!result?.ok) return;
  const { stats } = result.data;
  document.getElementById('stat-total').textContent = stats.totalHabits;
  document.getElementById('stat-today').textContent = stats.totalCompletedToday;
  document.getElementById('stat-streak').textContent = stats.averageStreak;
  document.getElementById('stat-rate').textContent = `${stats.completionRateToday}%`;
}

// Load habits
async function loadHabits() {
  const result = await apiRequest('/habits');
  if (!result?.ok) return;
  allHabits = result.data.habits;
  renderTodayHabits();
  renderWeeklyGrid();
}

// Render today's habits
function renderTodayHabits() {
  const container = document.getElementById('today-habits-list');
  if (!container) return;

  const todayHabits = allHabits.filter(h => h.isActive && h.targetDays.includes(todayAbbr));
  if (todayHabits.length === 0) {
    container.innerHTML = `<div class="loading-state" style="padding:30px">No habits scheduled for today. <a href="/pages/habits.html" style="color:var(--accent-2)">Add some →</a></div>`;
    return;
  }

  container.innerHTML = todayHabits.map(h => {
    const done = h.weeklyStatus[todayAbbr];
    return `
      <div class="habit-today-item ${done ? 'completed' : ''}" data-id="${h._id}">
        <button class="habit-check-btn" data-id="${h._id}" data-done="${done}">
          ${done ? '✓' : ''}
        </button>
        <div class="habit-today-icon" style="background:${h.color}22">${h.icon}</div>
        <div class="habit-today-info">
          <div class="habit-today-name">${h.name}</div>
          <div class="habit-today-meta">${h.category}</div>
        </div>
        <div class="streak-badge">${h.streak > 0 ? `🔥 ${h.streak}` : ''}</div>
      </div>
    `;
  }).join('');

  // Attach check listeners
  container.querySelectorAll('.habit-check-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const isDone = btn.dataset.done === 'true';
      await toggleHabit(id, !isDone);
    });
  });
}

// Toggle habit check
async function toggleHabit(id, completed) {
  const result = await apiRequest(`/habits/${id}/check`, {
    method: 'PUT',
    body: JSON.stringify({ day: todayAbbr, completed }),
  });
  if (result?.ok) {
    // Update local data
    const habit = allHabits.find(h => h._id === id);
    if (habit) {
      habit.weeklyStatus[todayAbbr] = completed;
      habit.streak = result.data.habit.streak;
    }
    renderTodayHabits();
    loadStats();
  }
}

// Render weekly grid
function renderWeeklyGrid() {
  const grid = document.getElementById('weekly-grid');
  if (!grid) return;

  if (allHabits.length === 0) {
    grid.innerHTML = `<div class="loading-state" style="padding:20px">No habits yet. <a href="/pages/habits.html" style="color:var(--accent-2)">Create one →</a></div>`;
    return;
  }

  const shown = allHabits.filter(h => h.isActive).slice(0, 6);
  grid.innerHTML = shown.map(h => `
    <div class="weekly-habit-row">
      <div class="weekly-habit-name">${h.icon} ${h.name}</div>
      ${DAYS.map(day => {
        const done = h.weeklyStatus[day];
        const isToday = day === todayAbbr;
        return `<div class="week-day-dot ${done ? 'filled' : ''} ${isToday && !done ? 'today' : ''}" title="${day}">${day.slice(0,1)}</div>`;
      }).join('')}
    </div>
  `).join('');
}

// Modal logic
const addBtn = document.getElementById('add-habit-top-btn');
const modal = document.getElementById('habit-modal');
const closeBtn = document.getElementById('modal-close');
const cancelBtn = document.getElementById('modal-cancel');
const form = document.getElementById('habit-form');

addBtn?.addEventListener('click', () => openModal('habit-modal'));
closeBtn?.addEventListener('click', () => closeModal('habit-modal'));
cancelBtn?.addEventListener('click', () => closeModal('habit-modal'));
modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal('habit-modal'); });

form?.addEventListener('submit', async (e) => {
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

  const result = await apiRequest('/habits', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (result?.ok) {
    closeModal('habit-modal');
    form.reset();
    document.getElementById('habit-icon').value = '⭐';
    loadHabits();
    loadStats();
  } else {
    errEl.textContent = result?.data?.message || 'Failed to create habit';
    errEl.classList.remove('hidden');
  }
});

// Init
loadStats();
loadHabits();
