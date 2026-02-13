// admin.js — Admin Panel page
// Redirects non-admins immediately

if (currentUser.role !== 'admin') {
  alert('Access denied. Admins only.');
  window.location.href = '/pages/dashboard.html';
}

let allUsers = [];
let deletingUserId = null;
let promotingUser  = null;

// ---- Load all users ----
async function loadUsers() {
  const tbody = document.getElementById('users-tbody');
  tbody.innerHTML = '<tr><td colspan="5" class="table-loading">Loading...</td></tr>';

  const result = await apiRequest('/users');
  if (!result?.ok) {
    tbody.innerHTML = `<tr><td colspan="5" class="table-loading" style="color:var(--red)">${result?.data?.message || 'Failed to load users'}</td></tr>`;
    return;
  }

  allUsers = result.data.users;
  renderStats(allUsers);
  renderTable(allUsers);
}

// ---- Render summary stats ----
function renderStats(users) {
  const admins  = users.filter(u => u.role === 'admin').length;
  const regular = users.filter(u => u.role === 'user').length;
  const newest  = users.length > 0
    ? users.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b)
    : null;

  document.getElementById('admin-total-users').textContent   = users.length;
  document.getElementById('admin-total-admins').textContent  = admins;
  document.getElementById('admin-total-regular').textContent = regular;
  document.getElementById('admin-newest').textContent        = newest ? newest.username : '—';
}

// ---- Render table ----
function renderTable(users) {
  const tbody   = document.getElementById('users-tbody');
  const search  = document.getElementById('user-search').value.toLowerCase();
  const filtered = search
    ? users.filter(u => u.username.toLowerCase().includes(search) || u.email.toLowerCase().includes(search))
    : users;

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="table-loading">No users found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(u => {
    const isSelf  = u._id === currentUser.id;
    const isAdmin = u.role === 'admin';
    const initial = (u.avatar && u.avatar.trim()) ? u.avatar : u.username[0].toUpperCase();

    return `
      <tr class="${isSelf ? 'row-self' : ''}">
        <td>
          <div class="user-cell">
            <div class="user-avatar-sm">${initial}</div>
            <div>
              <div class="user-cell-name">${u.username} ${isSelf ? '<span class="you-badge">you</span>' : ''}</div>
              <div class="user-cell-id">ID: ${u._id.slice(-6)}</div>
            </div>
          </div>
        </td>
        <td class="user-email">${u.email}</td>
        <td>
          <span class="role-badge ${isAdmin ? 'admin' : ''}">${u.role}</span>
        </td>
        <td class="user-date">${formatDate(u.createdAt)}</td>
        <td>
          <div class="action-btns">
            ${!isSelf ? `
              <button class="btn-role-toggle" data-id="${u._id}" data-role="${u.role}" data-name="${u.username}"
                title="${isAdmin ? 'Demote to user' : 'Promote to admin'}">
                ${isAdmin ? '↓ Demote' : '↑ Promote'}
              </button>
              <button class="btn-delete-user btn-danger-sm" data-id="${u._id}" data-name="${u.username}"
                title="Delete user">
                ✕ Delete
              </button>
            ` : '<span style="color:var(--text-dim);font-size:13px">—</span>'}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Promote / Demote buttons
  tbody.querySelectorAll('.btn-role-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      promotingUser = { id: btn.dataset.id, name: btn.dataset.name, role: btn.dataset.role };
      const toAdmin = promotingUser.role === 'user';
      document.getElementById('promote-modal-title').textContent = toAdmin ? 'Promote to Admin?' : 'Demote to User?';
      document.getElementById('promote-modal-text').textContent  =
        `${toAdmin
          ? `Give "${promotingUser.name}" full admin privileges?`
          : `Remove admin privileges from "${promotingUser.name}"?`}`;
      openModal('promote-modal');
    });
  });

  // Delete buttons
  tbody.querySelectorAll('.btn-delete-user').forEach(btn => {
    btn.addEventListener('click', () => {
      deletingUserId = btn.dataset.id;
      document.getElementById('delete-user-name').textContent = btn.dataset.name;
      openModal('delete-user-modal');
    });
  });
}

// ---- Delete user ----
document.getElementById('delete-user-cancel').addEventListener('click', () => closeModal('delete-user-modal'));
document.getElementById('delete-user-confirm').addEventListener('click', async () => {
  if (!deletingUserId) return;
  const result = await apiRequest(`/users/${deletingUserId}`, { method: 'DELETE' });
  if (result?.ok) {
    closeModal('delete-user-modal');
    deletingUserId = null;
    loadUsers();
  } else {
    alert(result?.data?.message || 'Failed to delete user');
  }
});

// ---- Promote / Demote ----
document.getElementById('promote-cancel').addEventListener('click', () => closeModal('promote-modal'));
document.getElementById('promote-confirm').addEventListener('click', async () => {
  if (!promotingUser) return;
  const newRole = promotingUser.role === 'user' ? 'admin' : 'user';

  // We use the update profile endpoint — but that's for own profile.
  // So we call a direct MongoDB update via admin endpoint
  const result = await apiRequest(`/users/${promotingUser.id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role: newRole }),
  });

  if (result?.ok) {
    closeModal('promote-modal');
    promotingUser = null;
    loadUsers();
  } else {
    // Fallback: show message that role change requires Compass/script
    closeModal('promote-modal');
    alert(`Role change API not available. Use MongoDB Compass or:\nnode scripts/createAdmin.js --promote ${promotingUser?.name}`);
    promotingUser = null;
  }
});

// ---- Search ----
document.getElementById('user-search').addEventListener('input', () => renderTable(allUsers));
document.getElementById('refresh-btn').addEventListener('click', loadUsers);

// ---- Init ----
loadUsers();
