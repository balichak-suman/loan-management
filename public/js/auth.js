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
      
      <div style="text-align: right; margin-bottom: 1.5rem;">
        <a href="#" style="color: white; font-size: 0.9rem;" onclick="showForgotPasswordForm()">Forgot Password?</a>
      </div>
      
      <button type="submit" class="btn btn-secondary" style="width: 100%; background: white; color: #667eea; font-weight: 700;">
        Login
      </button>
    </form>
  `;

  document.getElementById('login-form').addEventListener('submit', handleLogin);
}

let registrationData = {};

function showRegisterForm(step = 1) {
  const container = document.getElementById('auth-form-container');

  if (step === 1) {
    container.innerHTML = `
      <form id="register-step-1" style="text-align: left;">
        <div class="form-group">
          <label class="form-label" style="color: white;">Full Name</label>
          <input type="text" id="reg-name" class="form-input" placeholder="Enter your full name" value="${registrationData.fullName || ''}" required>
        </div>
        
        <div class="form-group">
          <label class="form-label" style="color: white;">Email</label>
          <input type="email" id="reg-email" class="form-input" placeholder="Enter your email" value="${registrationData.email || ''}" required>
        </div>
        
        <div class="form-group">
          <label class="form-label" style="color: white;">Phone</label>
          <input type="tel" id="reg-phone" class="form-input" placeholder="10-digit phone number" value="${registrationData.phone || ''}" required>
        </div>
        
        <button type="submit" class="btn btn-secondary" style="width: 100%; background: white; color: #667eea; font-weight: 700;">
          Get OTP & Continue
        </button>
      </form>
    `;
    document.getElementById('register-step-1').addEventListener('submit', handleStep1);
  } else if (step === 2) {
    container.innerHTML = `
      <form id="register-step-2" style="text-align: left;">
        <p style="color: white; margin-bottom: 1rem;">OTP sent to ${registrationData.email}</p>
        <div class="form-group">
          <label class="form-label" style="color: white;">Enter 6-digit OTP</label>
          <input type="text" id="reg-otp" class="form-input" placeholder="123456" required>
        </div>
        
        <button type="submit" class="btn btn-secondary" style="width: 100%; background: white; color: #667eea; font-weight: 700;">
          Verify OTP
        </button>
        <button type="button" class="btn btn-link" style="width: 100%; color: white; margin-top: 1rem;" onclick="showRegisterForm(1)">Back</button>
      </form>
    `;
    document.getElementById('register-step-2').addEventListener('submit', handleStep2);
  } else if (step === 3) {
    container.innerHTML = `
      <form id="register-step-3" style="text-align: left;">
        <div class="form-group">
          <label class="form-label" style="color: white;">Username</label>
          <input type="text" id="reg-username" class="form-input" placeholder="Choose a username" required>
        </div>
        
        <div class="form-group">
          <label class="form-label" style="color: white;">PAN Card Number</label>
          <input type="text" id="reg-pan" class="form-input" placeholder="ABCDE1234F" required style="text-transform: uppercase;">
        </div>
        
        <div class="form-group">
          <label class="form-label" style="color: white;">Create Password</label>
          <input type="password" id="reg-password" class="form-input" placeholder="Min 6 characters" required>
        </div>
        
        <button type="submit" class="btn btn-secondary" style="width: 100%; background: white; color: #667eea; font-weight: 700;">
          Complete Registration
        </button>
      </form>
    `;
    document.getElementById('register-step-3').addEventListener('submit', handleRegisterFinal);
  }
}

async function handleStep1(e) {
  e.preventDefault();
  const fullName = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const phone = document.getElementById('reg-phone').value;

  if (!isValidEmail(email)) {
    showToast('Please enter a valid email', 'danger');
    return;
  }
  if (!isValidPhone(phone)) {
    showToast('Please enter a valid phone number', 'danger');
    return;
  }

  try {
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = 'Sending OTP...';
    btn.disabled = true;

    await apiCall('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    registrationData = { ...registrationData, fullName, email, phone };
    showToast('OTP sent to your email', 'success');
    showRegisterForm(2);
  } catch (error) {
    showToast(error.message || 'Failed to send OTP', 'danger');
  }
}

async function handleStep2(e) {
  e.preventDefault();
  const otp = document.getElementById('reg-otp').value;

  try {
    await apiCall('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email: registrationData.email, otp })
    });

    registrationData.otp = otp;
    showToast('OTP verified!', 'success');
    showRegisterForm(3);
  } catch (error) {
    showToast(error.message || 'Invalid OTP', 'danger');
  }
}

async function handleRegisterFinal(e) {
  e.preventDefault();

  const username = document.getElementById('reg-username').value;
  const panCard = document.getElementById('reg-pan').value.toUpperCase();
  const password = document.getElementById('reg-password').value;

  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'danger');
    return;
  }

  try {
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = 'Registering...';
    btn.disabled = true;

    const data = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...registrationData,
        username,
        panCard,
        password
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

async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  try {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    if (data.otpRequired) {
      showToast('OTP sent to your email', 'success');
      showLoginOTPForm(data.email);
      return;
    }

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

function showLoginOTPForm(email) {
  const container = document.getElementById('auth-form-container');
  container.innerHTML = `
    <form id="login-otp-form" style="text-align: left;">
      <p style="color: white; margin-bottom: 1rem;">OTP sent to ${email}</p>
      <div class="form-group">
        <label class="form-label" style="color: white;">Enter 6-digit OTP</label>
        <input type="text" id="login-otp" class="form-input" placeholder="123456" required>
      </div>
      
      <button type="submit" class="btn btn-secondary" style="width: 100%; background: white; color: #667eea; font-weight: 700;">
        Verify & Login
      </button>
      <button type="button" class="btn btn-link" style="width: 100%; color: white; margin-top: 1rem;" onclick="showLoginForm()">Back</button>
    </form>
  `;

  document.getElementById('login-otp-form').addEventListener('submit', (e) => handleLoginOTP(e, email));
}

async function handleLoginOTP(e, email) {
  e.preventDefault();
  const otp = document.getElementById('login-otp').value;

  try {
    const data = await apiCall('/auth/login/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    });

    // Store token and user
    localStorage.setItem('nova_credit_token', data.token);
    localStorage.setItem('nova_credit_user', JSON.stringify(data.user));
    AppState.token = data.token;
    AppState.user = data.user;

    showToast('Login successful!', 'success');
    showMainApp();
  } catch (error) {
    showToast(error.message || 'Invalid OTP', 'danger');
  }
}

let forgotPasswordData = {};

function showForgotPasswordForm(step = 1) {
  const container = document.getElementById('auth-form-container');

  if (step === 1) {
    container.innerHTML = `
      <form id="forgot-password-step-1" style="text-align: left;">
        <h3 style="color: white; margin-bottom: 1rem;">Reset Password</h3>
        <p style="color: white; font-size: 0.9rem; opacity: 0.8; margin-bottom: 1.5rem;">Enter your email address and we'll send you an OTP to reset your password.</p>
        <div class="form-group">
          <label class="form-label" style="color: white;">Email</label>
          <input type="email" id="forgot-email" class="form-input" placeholder="Enter your email" required>
        </div>
        
        <button type="submit" class="btn btn-secondary" style="width: 100%; background: white; color: #667eea; font-weight: 700;">
          Send OTP
        </button>
        <button type="button" class="btn btn-link" style="width: 100%; color: white; margin-top: 1rem;" onclick="showLoginForm()">Back to Login</button>
      </form>
    `;
    document.getElementById('forgot-password-step-1').addEventListener('submit', handleForgotStep1);
  } else if (step === 2) {
    container.innerHTML = `
      <form id="forgot-password-step-2" style="text-align: left;">
        <h3 style="color: white; margin-bottom: 1rem;">Verify OTP</h3>
        <p style="color: white; margin-bottom: 1rem;">OTP sent to ${forgotPasswordData.email}</p>
        <div class="form-group">
          <label class="form-label" style="color: white;">Enter 6-digit OTP</label>
          <input type="text" id="forgot-otp" class="form-input" placeholder="123456" required>
        </div>
        
        <button type="submit" class="btn btn-secondary" style="width: 100%; background: white; color: #667eea; font-weight: 700;">
          Verify OTP
        </button>
        <button type="button" class="btn btn-link" style="width: 100%; color: white; margin-top: 1rem;" onclick="showForgotPasswordForm(1)">Back</button>
      </form>
    `;
    document.getElementById('forgot-password-step-2').addEventListener('submit', handleForgotStep2);
  } else if (step === 3) {
    container.innerHTML = `
      <form id="forgot-password-step-3" style="text-align: left;">
        <h3 style="color: white; margin-bottom: 1rem;">New Password</h3>
        <div class="form-group">
          <label class="form-label" style="color: white;">Enter New Password</label>
          <input type="password" id="forgot-new-password" class="form-input" placeholder="Min 6 characters" required>
        </div>
        <div class="form-group">
          <label class="form-label" style="color: white;">Confirm New Password</label>
          <input type="password" id="forgot-confirm-password" class="form-input" placeholder="Confirm password" required>
        </div>
        
        <button type="submit" class="btn btn-secondary" style="width: 100%; background: white; color: #667eea; font-weight: 700;">
          Reset Password
        </button>
      </form>
    `;
    document.getElementById('forgot-password-step-3').addEventListener('submit', handleForgotFinal);
  }
}

async function handleForgotStep1(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value;

  try {
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = 'Sending OTP...';
    btn.disabled = true;

    await apiCall('/auth/forgot-password/request-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    forgotPasswordData = { email };
    showToast('OTP sent to your email', 'success');
    showForgotPasswordForm(2);
  } catch (error) {
    showToast(error.message || 'Failed to send OTP', 'danger');
  }
}

async function handleForgotStep2(e) {
  e.preventDefault();
  const otp = document.getElementById('forgot-otp').value;

  try {
    await apiCall('/auth/forgot-password/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email: forgotPasswordData.email, otp })
    });

    forgotPasswordData.otp = otp;
    showToast('OTP verified!', 'success');
    showForgotPasswordForm(3);
  } catch (error) {
    showToast(error.message || 'Invalid OTP', 'danger');
  }
}

async function handleForgotFinal(e) {
  e.preventDefault();
  const newPassword = document.getElementById('forgot-new-password').value;
  const confirmPassword = document.getElementById('forgot-confirm-password').value;

  if (newPassword.length < 6) {
    showToast('Password must be at least 6 characters', 'danger');
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast('Passwords do not match', 'danger');
    return;
  }

  try {
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = 'Resetting...';
    btn.disabled = true;

    await apiCall('/auth/forgot-password/reset', {
      method: 'POST',
      body: JSON.stringify({
        email: forgotPasswordData.email,
        otp: forgotPasswordData.otp,
        newPassword
      })
    });

    showToast('Password reset successfully! Please login.', 'success');
    showLoginForm();
  } catch (error) {
    showToast(error.message || 'Failed to reset password', 'danger');
  }
}

