// profile.js — Profile page

async function loadProfile() {
  const result = await apiRequest('/users/profile');
  if (!result?.ok) return;
  const { user } = result.data;

  document.getElementById('avatar-display').textContent = user.avatar || user.username?.[0]?.toUpperCase() || '?';
  document.getElementById('profile-username').textContent = user.username;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-since').textContent = formatDate(user.createdAt);
  document.getElementById('profile-habit-count').textContent = user.habitCount || 0;
  document.getElementById('profile-bio').textContent = user.bio || 'No bio yet.';

  const roleBadge = document.getElementById('profile-role-badge');
  roleBadge.textContent = user.role;
  if (user.role === 'admin') roleBadge.classList.add('admin');

  // Pre-fill form
  document.getElementById('edit-username').value = user.username || '';
  document.getElementById('edit-email').value = user.email || '';
  document.getElementById('edit-bio').value = user.bio || '';
  document.getElementById('edit-avatar').value = user.avatar || '';
  updateBioCount();
}

// Bio char count
function updateBioCount() {
  const bio = document.getElementById('edit-bio');
  const count = document.getElementById('bio-count');
  if (bio && count) count.textContent = bio.value.length;
}
document.getElementById('edit-bio')?.addEventListener('input', updateBioCount);

// Submit form
document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('profile-error');
  const sucEl = document.getElementById('profile-success');
  errEl.classList.add('hidden');
  sucEl.classList.add('hidden');

  const payload = {
    username: document.getElementById('edit-username').value.trim(),
    email: document.getElementById('edit-email').value.trim(),
    bio: document.getElementById('edit-bio').value.trim(),
    avatar: document.getElementById('edit-avatar').value.trim(),
  };

  const result = await apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  if (result?.ok) {
    // Update local storage
    const updated = { ...currentUser, ...result.data.user };
    localStorage.setItem('user', JSON.stringify(updated));

    sucEl.textContent = 'Profile updated successfully!';
    sucEl.classList.remove('hidden');
    setTimeout(() => sucEl.classList.add('hidden'), 3000);
    loadProfile();
  } else {
    errEl.textContent = result?.data?.message || 'Update failed';
    errEl.classList.remove('hidden');
  }
});

loadProfile();
