// ===== ADMIN LOGIN SCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('adminLoginForm');
  const errorDiv = document.getElementById('loginError');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Clear previous error
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store admin data
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        localStorage.setItem('adminToken', data.token);
        
        if (rememberMe) {
          localStorage.setItem('rememberAdmin', 'true');
        }

        // Redirect to dashboard
        window.location.href = '/admin-dashboard';
      } else {
        showError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Server connection error. Please try again.');
    }
  });

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
});
