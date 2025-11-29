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

    // Show admin link if user is admin
    if (AppState.user.isAdmin) {
        document.getElementById('admin-nav-link').style.display = 'flex';
    }

    setupNavigation();
    navigateToPage('dashboard');
}

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateToPage(page);
        });
    });

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logout);
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
