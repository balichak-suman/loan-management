// Main App Logic
const API_BASE_URL = window.location.origin + '/api';

// State management
const AppState = {
    user: null,
    token: null,
    currentPage: 'dashboard'
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Check for stored token
    const token = localStorage.getItem('nova_credit_token');
    const user = localStorage.getItem('nova_credit_user');

    if (token && user) {
        AppState.token = token;
        AppState.user = JSON.parse(user);
        showMainApp();
    } else {
        showAuthPage();
    }

    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    }, 500);
}

function showAuthPage() {
    document.getElementById('navbar').style.display = 'none';
    renderAuthPage();
}

function showMainApp() {
    document.getElementById('navbar').style.display = 'block';

    const isAdmin = AppState.user && AppState.user.isAdmin;

    // Admin and Logs links
    const adminLink = document.getElementById('admin-nav-link');
    const logsLink = document.getElementById('logs-nav-link');

    if (adminLink) adminLink.style.display = isAdmin ? 'flex' : 'none';
    if (logsLink) logsLink.style.display = isAdmin ? 'flex' : 'none';

    // User sections
    const userSections = ['dashboard', 'loans', 'payments', 'transactions', 'profile'];
    userSections.forEach(section => {
        const link = document.querySelector(`[data-page="${section}"]`);
        if (link) {
            link.style.display = isAdmin ? 'none' : 'flex';
        }
    });

    setupNavigation();

    // Navigate to appropriate starting page
    navigateToPage(AppState.user.isAdmin ? 'admin' : 'dashboard');
}

// Navigation
// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    // Hamburger Toggle
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Close mobile menu
            if (hamburger && navMenu) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }

            // Handle Logout Link
            if (link.id === 'mobile-logout-btn') {
                logout();
                return;
            }

            const page = link.dataset.page;
            if (page) {
                navigateToPage(page);
            }
        });
    });

    // Logout button (Desktop)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

function navigateToPage(page) {
    AppState.currentPage = page;

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    // Render page
    const pageContent = document.getElementById('page-content');
    pageContent.innerHTML = '';
    pageContent.className = 'page-content fade-in';

    switch (page) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'loans':
            renderLoansPage();
            break;
        case 'payments':
            renderPaymentsPage();
            break;
        case 'transactions':
            renderTransactionsPage();
            break;
        case 'profile':
            renderProfilePage();
            break;
        case 'admin':
            renderAdminPage();
            break;
        case 'logs':
            renderLogsPage();
            break;
    }
}

// API Helper
async function apiCall(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (AppState.token) {
        defaultOptions.headers['Authorization'] = `Bearer ${AppState.token}`;
    }

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);
        const data = await response.json();

        if (!response.ok) {
            // Handle auth errors (401/403) by redirecting to login
            if (response.status === 401 || response.status === 403) {
                console.warn('Authentication failed, redirecting to login...');

                // Only logout if we are not already on the login page (to avoid loops if login fails)
                // And if we actually have a token (otherwise we are already "logged out")
                if (AppState.token) {
                    logout();
                    showToast('Session expired. Please login again.', 'error');
                    return; // Stop further processing
                }
            }
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Logout
function logout() {
    localStorage.removeItem('nova_credit_token');
    localStorage.removeItem('nova_credit_user');
    AppState.token = null;
    AppState.user = null;
    showAuthPage();
    showToast('Logged out successfully', 'success');
}
