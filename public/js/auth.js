// Authentication Pages
function renderAuthPage() {
  const pageContent = document.getElementById('page-content');
  pageContent.classList.add('full-bleed');
  
  pageContent.innerHTML = `
    <!-- TopAppBar -->
    <nav class="fixed top-0 w-full z-50 py-3 sm:py-4 backdrop-blur-xl bg-opacity-60 border-b border-[#72dcff]/20 bg-[#090e18] shadow-none">
    <div class="max-w-screen-2xl mx-auto flex justify-between items-center px-4 sm:px-6">
    <div class="flex items-center gap-2 sm:gap-3" style="cursor: pointer;" onclick="showLandingPage()">
    <span class="material-symbols-outlined text-[#72dcff] text-xl sm:text-2xl" data-icon="account_balance">account_balance</span>
    <span class="text-lg sm:text-2xl font-bold tracking-tighter text-[#72dcff] font-['Inter']">Nova Credit</span>
    </div>
    </div>
    </nav>

    <div class="min-h-screen bg-[#090e18] hero-gradient flex items-center justify-center px-4 py-20 pt-32">
      <div class="w-full max-w-md">
        <div class="glass-card rounded-2xl md:p-10 p-6 shadow-2xl relative overflow-hidden">
          <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>
          
          <div class="text-center mb-8 relative z-10">
            <h1 class="text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">Vault Access</h1>
            <p class="text-on-surface-variant text-sm">Secure financial management portal</p>
          </div>
          
          <div id="auth-tabs" class="flex p-1 bg-surface-container rounded-xl mb-8 relative z-10">
            <button class="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all auth-tab-btn active bg-surface-variant text-on-surface" onclick="showLoginForm(this)">Login</button>
            <button class="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all auth-tab-btn text-on-surface-variant hover:text-on-surface" onclick="showRegisterForm(this)">Register</button>
          </div>
          
          <div id="auth-form-container" class="relative z-10"></div>
          
          <div class="mt-8 text-center pt-6 border-t border-outline-variant/10 relative z-10">
            <a href="#" class="text-primary text-xs font-bold hover:underline" onclick="showLandingPage()">Back to Main Platform</a>
          </div>
        </div>
      </div>
    </div>
  `;

  showLoginForm();
}

function showLoginForm(btn) {
  if (btn) {
    document.querySelectorAll('.auth-tab-btn').forEach(b => {
      b.classList.remove('active', 'bg-surface-variant', 'text-on-surface');
      b.classList.add('text-on-surface-variant');
    });
    btn.classList.add('active', 'bg-surface-variant', 'text-on-surface');
    btn.classList.remove('text-on-surface-variant');
  }

  const container = document.getElementById('auth-form-container');
  container.innerHTML = `
    <form id="login-form" class="space-y-5">
      <div class="space-y-2">
        <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Username</label>
        <input type="text" id="login-username" class="w-full bg-surface-container-high border border-outline-variant/15 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-all" placeholder="Enter your username" required>
      </div>
      
      <div class="space-y-2">
        <div class="flex justify-between items-center px-1">
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest">Password</label>
          <a href="#" class="text-[10px] text-primary hover:underline font-bold" onclick="showForgotPasswordForm()">Forgot?</a>
        </div>
        <input type="password" id="login-password" class="w-full bg-surface-container-high border border-outline-variant/15 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/50 transition-all" placeholder="Enter your password" required>
      </div>
      
      <button type="submit" class="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all mt-4">
        Access Account
      </button>
    </form>
  `;

  document.getElementById('login-form').addEventListener('submit', handleLogin);
}

function showRegisterForm(btnOrStep) {
  let step = 1;
  let btn = null;

  if (typeof btnOrStep === 'object' && btnOrStep.classList.contains('auth-tab-btn')) {
    btn = btnOrStep;
    step = 1;
  } else if (typeof btnOrStep === 'number') {
    step = btnOrStep;
    // Find the current active button
    btn = document.querySelector('.auth-tab-btn.active');
  }

  if (btn) {
    document.querySelectorAll('.auth-tab-btn').forEach(b => {
      b.classList.remove('active', 'bg-surface-variant', 'text-on-surface');
      b.classList.add('text-on-surface-variant');
    });
    btn.classList.add('active', 'bg-surface-variant', 'text-on-surface');
    btn.classList.remove('text-on-surface-variant');
  }

  const container = document.getElementById('auth-form-container');

  if (step === 1) {
    container.innerHTML = `
      <form id="register-step-1" class="space-y-4">
        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Full Name</label>
          <input type="text" id="reg-name" class="w-full bg-surface-container-high border border-outline-variant/15 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all" placeholder="Enter full name" value="${registrationData.fullName || ''}" required>
        </div>
        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Email Address</label>
          <input type="email" id="reg-email" class="w-full bg-surface-container-high border border-outline-variant/15 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all" placeholder="name@company.com" value="${registrationData.email || ''}" required>
        </div>
        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Phone Number</label>
          <input type="tel" id="reg-phone" class="w-full bg-surface-container-high border border-outline-variant/15 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all" placeholder="10-digit number" value="${registrationData.phone || ''}" required>
        </div>
        <button type="submit" class="w-full py-4 rounded-xl bg-gradient-to-r from-secondary to-secondary-dim text-white font-bold shadow-lg shadow-secondary/20 hover:opacity-90 active:scale-95 transition-all mt-4">
          Get OTP & Continue
        </button>
      </form>
    `;
    document.getElementById('register-step-1').addEventListener('submit', handleStep1);
  } else if (step === 2) {
    container.innerHTML = `
      <form id="register-step-2" class="space-y-6">
        <div class="text-center">
          <p class="text-on-surface-variant text-xs mb-2">Check your email</p>
          <p class="text-primary font-bold text-sm">${registrationData.email}</p>
        </div>
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1 text-center mb-2">Enter 6-digit OTP</label>
          <input type="text" id="reg-otp" class="w-full bg-surface-container-high border border-outline-variant/15 rounded-xl px-4 py-4 text-center text-2xl font-black tracking-[0.5em] text-on-surface focus:outline-none focus:border-primary/50 transition-all" placeholder="000000" maxlength="6" required>
        </div>
        <div class="space-y-3">
          <button type="submit" class="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
            Verify OTP
          </button>
          <button type="button" class="w-full text-on-surface-variant text-xs font-bold hover:text-on-surface transition-colors" onclick="showRegisterForm(1)">
            Change Email
          </button>
        </div>
      </form>
    `;
    document.getElementById('register-step-2').addEventListener('submit', handleStep2);
  } else if (step === 3) {
    container.innerHTML = `
      <form id="register-step-3" class="space-y-4">
        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Choose Username</label>
          <input type="text" id="reg-username" class="w-full bg-surface-container-high border border-outline-variant/15 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all" placeholder="Choose a unique username" required>
        </div>
        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">PAN Card Number</label>
          <input type="text" id="reg-pan" class="w-full bg-surface-container-high border border-outline-variant/15 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 tracking-widest transition-all uppercase" placeholder="ABCDE1234F" required>
        </div>
        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Create Password</label>
          <input type="password" id="reg-password" class="w-full bg-surface-container-high border border-outline-variant/15 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary/50 transition-all" placeholder="Minimum 6 characters" required>
        </div>
        <button type="submit" class="w-full py-4 rounded-xl bg-gradient-to-r from-tertiary to-tertiary-dim text-on-tertiary font-bold shadow-lg shadow-tertiary/20 hover:opacity-90 active:scale-95 transition-all mt-4">
          Complete Setup
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

    // Store token and user directly
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

