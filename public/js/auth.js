// Authentication Pages
function renderAuthPage() {
  const pageContent = document.getElementById('page-content');
  pageContent.innerHTML = `
    <div style="max-width: 500px; margin: 4rem auto;">
      <div class="card card-gradient" style="text-align: center; padding: 3rem;">
        <h1 style="font-size: 3rem; margin-bottom: 0.5rem;">Nova Credit</h1>
        <p style="font-size: 1.2rem; opacity: 0.9; margin-bottom: 2rem;">Payment Management System</p>
        
        <div id="auth-tabs" style="display: flex; gap: 1rem; margin-bottom: 2rem;">
          <button class="btn btn-secondary" style="flex: 1;" onclick="showLoginForm()">Login</button>
          <button class="btn btn-secondary" style="flex: 1;" onclick="showRegisterForm()">Register</button>
        </div>
        
        <div id="auth-form-container"></div>
      </div>
    </div>
  `;

  showLoginForm();
}

function showLoginForm() {
  const container = document.getElementById('auth-form-container');
  container.innerHTML = `
    <form id="login-form" style="text-align: left;">
      <div class="form-group">
        <label class="form-label" style="color: white;">Username</label>
        <input type="text" id="login-username" class="form-input" placeholder="Enter your username" required>
      </div>
      
      <div class="form-group">
        <label class="form-label" style="color: white;">Password</label>
        <input type="password" id="login-password" class="form-input" placeholder="Enter your password" required>
      </div>
      
      <button type="submit" class="btn btn-secondary" style="width: 100%; background: white; color: #667eea; font-weight: 700;">
        Login
      </button>
    </form>
  `;

  document.getElementById('login-form').addEventListener('submit', handleLogin);
}

function showRegisterForm() {
  const container = document.getElementById('auth-form-container');
  container.innerHTML = `
    <form id="register-form" style="text-align: left;">
      <div class="form-group">
        <label class="form-label" style="color: white;">Full Name</label>
        <input type="text" id="register-name" class="form-input" placeholder="Enter your full name" required>
      </div>

      <div class="form-group">
        <label class="form-label" style="color: white;">Username</label>
        <input type="text" id="register-username" class="form-input" placeholder="Choose a username" required>
      </div>
      
      <div class="form-group">
        <label class="form-label" style="color: white;">Email</label>
        <input type="email" id="register-email" class="form-input" placeholder="Enter your email" required>
      </div>
      
      <div class="form-group">
        <label class="form-label" style="color: white;">Phone</label>
        <input type="tel" id="register-phone" class="form-input" placeholder="10-digit phone number" required>
      </div>
      
      <div class="form-group">
        <label class="form-label" style="color: white;">PAN Card Number</label>
        <input type="text" id="register-pan" class="form-input" placeholder="ABCDE1234F" required style="text-transform: uppercase;">
      </div>

      <div class="form-group">
        <label class="form-label" style="color: white;">Credit Card Number</label>
        <input type="text" id="register-card" class="form-input" placeholder="16-digit card number" required>
      </div>

      <div class="grid grid-2">
        <div class="form-group">
          <label class="form-label" style="color: white;">Expiry Date</label>
          <input type="text" id="register-expiry" class="form-input" placeholder="MM/YY" required>
        </div>
        <div class="form-group">
          <label class="form-label" style="color: white;">CVV</label>
          <input type="password" id="register-cvv" class="form-input" placeholder="123" maxlength="3" required>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label" style="color: white;">Password</label>
        <input type="password" id="register-password" class="form-input" placeholder="Create a password" required>
      </div>
      
      <button type="submit" class="btn btn-secondary" style="width: 100%; background: white; color: #667eea; font-weight: 700;">
        Register
      </button>
    </form>
  `;

  document.getElementById('register-form').addEventListener('submit', handleRegister);
}

async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  try {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    // Store token and user
    localStorage.setItem('nova_credit_token', data.token);
    localStorage.setItem('nova_credit_user', JSON.stringify(data.user));
    AppState.token = data.token;
    AppState.user = data.user;

    showToast('Login successful!', 'success');
    showMainApp();
  } catch (error) {
    showToast(error.message || 'Login failed', 'danger');
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const fullName = document.getElementById('register-name').value;
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const phone = document.getElementById('register-phone').value;
  const panCard = document.getElementById('register-pan').value.toUpperCase();
  const cardNumber = document.getElementById('register-card').value;
  const expiryDate = document.getElementById('register-expiry').value;
  const cvv = document.getElementById('register-cvv').value;
  const password = document.getElementById('register-password').value;

  if (!isValidEmail(email)) {
    showToast('Please enter a valid email', 'danger');
    return;
  }

  if (!isValidPhone(phone)) {
    showToast('Please enter a valid 10-digit phone number', 'danger');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'danger');
    return;
  }

  try {
    const data = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password,
        fullName,
        phone,
        panCard,
        cardNumber,
        expiryDate,
        cvv
      })
    });

    // Store token and user
    localStorage.setItem('nova_credit_token', data.token);
    localStorage.setItem('nova_credit_user', JSON.stringify(data.user));
    AppState.token = data.token;
    AppState.user = data.user;

    showToast('Registration successful!', 'success');
    showMainApp();
  } catch (error) {
    showToast(error.message || 'Registration failed', 'danger');
  }
}
