// analytics.js — Analytics page + Goals

let habitsForGoal = [];

async function loadAnalytics() {
  const [statsResult, habitsResult] = await Promise.all([
    apiRequest('/habits/stats'),
    apiRequest('/habits'),
  ]);

  if (!statsResult?.ok || !habitsResult?.ok) return;
  const { stats } = statsResult.data;
  habitsForGoal = habitsResult.data.habits.filter(h => h.isActive);

  document.getElementById('an-total').textContent = stats.totalHabits;
  document.getElementById('an-longest').textContent = stats.longestStreak;
  document.getElementById('an-avg').textContent = stats.averageStreak;
  document.getElementById('an-rate').textContent = `${stats.completionRateToday}%`;

  renderCategoryBars(habitsForGoal);
  renderStreakLeaderboard(habitsForGoal);
  renderWeeklyChart(habitsForGoal);
  loadGoals();
}

function renderCategoryBars(habits) {
  const container = document.getElementById('category-bars');
  if (!container) return;

  const catNames = {
    health: '🩺 Health', fitness: '💪 Fitness', mindfulness: '🧘 Mindfulness',
    learning: '📚 Learning', productivity: '⚡ Productivity', social: '👥 Social', other: '✨ Other'
  };
  const cats = ['health','fitness','mindfulness','learning','productivity','social','other'];

  const bars = cats.map(cat => ({
    cat, count: habits.filter(h => h.category === cat).length
  })).filter(b => b.count > 0);

  if (bars.length === 0) {
    container.innerHTML = '<div class="loading-state">No habits yet</div>';
    return;
  }

  const maxCount = Math.max(...bars.map(b => b.count));
  container.innerHTML = bars.map(b => `
    <div class="cat-bar-row">
      <span class="cat-bar-label">${catNames[b.cat]}</span>
      <div class="cat-bar-track">
        <div class="cat-bar-fill" style="width:${(b.count/maxCount)*100}%;background:${CAT_COLORS[b.cat]}"></div>
      </div>
      <span class="cat-bar-count">${b.count}</span>
    </div>
  `).join('');
}

function renderStreakLeaderboard(habits) {
  const container = document.getElementById('streak-list');
  if (!container) return;

  const sorted = [...habits].sort((a, b) => b.streak - a.streak).slice(0, 5);
  if (sorted.length === 0) {
    container.innerHTML = '<div class="loading-state">No habits yet</div>';
    return;
  }

  container.innerHTML = sorted.map((h, i) => `
    <div class="streak-item">
      <div class="streak-rank ${i < 3 ? `streak-rank-${i+1}` : ''}">${i+1}</div>
      <div style="background:${h.color}22;font-size:18px;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">${h.icon}</div>
      <div class="streak-item-name">${h.name}</div>
      <div class="streak-item-val">🔥 ${h.streak}</div>
    </div>
  `).join('');
}

function renderWeeklyChart(habits) {
  const container = document.getElementById('weekly-chart');
  if (!container) return;
  if (habits.length === 0) {
    container.innerHTML = '<div class="loading-state">No habits yet</div>';
    return;
  }

  const todayAbbr = getTodayAbbr();
  container.innerHTML = DAYS.map(day => {
    const targeted  = habits.filter(h => h.targetDays.includes(day)).length || 1;
    const completed = habits.filter(h => h.weeklyStatus[day] && h.targetDays.includes(day)).length;
    const pct       = Math.round((completed / targeted) * 100);
    const isToday   = day === todayAbbr;
    return `
      <div class="chart-bar-col">
        <div class="chart-bar-wrap">
          <div class="chart-bar ${isToday ? 'today' : ''}" style="height:${Math.max(pct, 4)}%"></div>
        </div>
        <div class="chart-day-label ${isToday ? 'today' : ''}">${day}</div>
      </div>
    `;
  }).join('');
}

// ---- GOALS ----

async function loadGoals() {
  const result = await apiRequest('/goals');
  if (!result?.ok) return;
  renderGoals(result.data.goals);
}

function renderGoals(goals) {
  const container = document.getElementById('goals-list');
  if (!container) return;

  if (goals.length === 0) {
    container.innerHTML = `
      <div class="loading-state" style="padding:30px">
        No goals yet. Click <strong>+ Set Goal</strong> to create one!
      </div>`;
    return;
  }

  container.innerHTML = goals.map(g => {
    const habit     = g.habit;
    const progress  = habit ? Math.min(Math.round((habit.streak / g.targetStreak) * 100), 100) : 0;
    const isDone    = g.isCompleted;
    const dueDate   = g.targetDate ? `📅 Due ${formatDate(g.targetDate)}` : '';

    return `
      <div class="goal-item ${isDone ? 'goal-done' : ''}">
        <div class="goal-item-header">
          <div class="goal-habit-badge" style="background:${habit?.color || '#7c6af7'}22;border-color:${habit?.color || '#7c6af7'}44">
            ${habit?.icon || '⭐'} ${habit?.name || 'Unknown habit'}
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            ${isDone ? '<span class="goal-complete-badge">✅ Completed!</span>' : ''}
            <button class="card-btn delete goal-delete-btn" data-id="${g._id}" title="Delete goal">✕</button>
          </div>
        </div>
        <div class="goal-title">${g.title}</div>
        <div class="goal-meta">
          🎯 Target: <strong>${g.targetStreak} days</strong> &nbsp;•&nbsp;
          🔥 Current: <strong>${habit?.streak || 0} days</strong>
          ${dueDate ? `&nbsp;•&nbsp; ${dueDate}` : ''}
          ${g.reward ? `&nbsp;•&nbsp; 🎁 <em>${g.reward}</em>` : ''}
        </div>
        <div class="goal-progress-track">
          <div class="goal-progress-fill ${isDone ? 'goal-progress-done' : ''}" style="width:${progress}%"></div>
        </div>
        <div class="goal-progress-label">${progress}% there</div>
      </div>
    `;
  }).join('');

  // Delete buttons
  container.querySelectorAll('.goal-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this goal?')) return;
      const result = await apiRequest(`/goals/${btn.dataset.id}`, { method: 'DELETE' });
      if (result?.ok) loadGoals();
    });
  });
}

// Goal Modal
const addGoalBtn      = document.getElementById('add-goal-btn');
const goalModal       = document.getElementById('goal-modal');
const goalModalClose  = document.getElementById('goal-modal-close');
const goalModalCancel = document.getElementById('goal-modal-cancel');
const goalForm        = document.getElementById('goal-form');

addGoalBtn?.addEventListener('click', () => {
  // Populate habit dropdown
  const sel = document.getElementById('goal-habit-id');
  sel.innerHTML = '<option value="">— Select habit —</option>' +
    habitsForGoal.map(h => `<option value="${h._id}">${h.icon} ${h.name} (streak: ${h.streak})</option>`).join('');
  document.getElementById('goal-form-error').classList.add('hidden');
  goalForm.reset();
  openModal('goal-modal');
});

goalModalClose?.addEventListener('click', () => closeModal('goal-modal'));
goalModalCancel?.addEventListener('click', () => closeModal('goal-modal'));
goalModal?.addEventListener('click', (e) => { if (e.target === goalModal) closeModal('goal-modal'); });

goalForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('goal-form-error');
  errEl.classList.add('hidden');

  const payload = {
    habitId:      document.getElementById('goal-habit-id').value,
    title:        document.getElementById('goal-title').value.trim(),
    targetStreak: parseInt(document.getElementById('goal-target-streak').value),
    targetDate:   document.getElementById('goal-target-date').value || undefined,
    reward:       document.getElementById('goal-reward').value.trim(),
  };

  if (!payload.habitId) {
    errEl.textContent = 'Please select a habit';
    errEl.classList.remove('hidden');
    return;
  }

  const result = await apiRequest('/goals', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (result?.ok) {
    closeModal('goal-modal');
    goalForm.reset();
    loadGoals();
  } else {
    errEl.textContent = result?.data?.message || 'Failed to create goal';
    errEl.classList.remove('hidden');
  }
});

loadAnalytics();
