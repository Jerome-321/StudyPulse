document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profile-form');
  const photoInput = document.getElementById('photo-input');
  const firstNameInput = document.getElementById('first-name');
  const lastNameInput = document.getElementById('last-name');
  const emailInput = document.getElementById('email');

  // Load profile data on page load
  fetch('profile.php')
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }
      firstNameInput.value = data.first_name || '';
      lastNameInput.value = data.last_name || '';
      emailInput.value = data.email || '';
      photoInput.value = data.photo || '';
      if (data.photo) {
        document.getElementById('profile-photo').src = data.photo;
      }
    });

  // Submit updated profile
  form.addEventListener('submit', e => {
    e.preventDefault();
    const payload = {
      first_name: firstNameInput.value.trim(),
      last_name: lastNameInput.value.trim(),
      email: emailInput.value.trim(),
      photo: photoInput.value.trim()
    };
    fetch('profile.php', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Profile updated successfully!');
          if (payload.photo) {
            document.getElementById('profile-photo').src = payload.photo;
          }
        } else {
          alert(data.error || data.message || 'Update failed');
        }
      });
  });
});
