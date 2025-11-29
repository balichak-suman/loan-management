const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { initializeDatabase, executeSQL } = require('./database');
const { seedUsers } = require('./seed');
const auth = require('./auth');
const loans = require('./loans');
const payments = require('./payments');
const { getTransactions, getTransactionStats } = require('./transactions');
const profile = require('./profile');
const admin = require('./admin'); // Import as object

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: '*' })); // Allow all origins for debugging
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
// Use process.cwd() for Vercel compatibility
app.use(express.static(path.join(process.cwd(), 'public')));

// Initialize database and seed users
(async () => {
    try {
        await initializeDatabase();
        // Seed users only if running locally or if needed. 
        await seedUsers();
    } catch (err) {
        console.error('Initialization error:', err);
    }
})();

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Nova Credit API is running' });
});

// Debug endpoint
app.get('/api/debug', async (req, res) => {
    try {
        const { get: user } = await executeSQL('SELECT count(*) as count FROM users');
        res.json({
            status: 'ok',
            db_connected: true,
            user_count: user ? user.count : 0,
            env: {
                has_db_url: !!process.env.TURSO_DATABASE_URL,
                has_auth_token: !!process.env.TURSO_AUTH_TOKEN
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
});

// Auth routes
app.post('/api/auth/register', auth.register);
app.post('/api/auth/login', auth.login);
app.get('/api/parameters', admin.getPublicSystemParameters); // Public route for calculator

// Loan routes (protected)
app.post('/api/loans/apply', auth.authenticateToken, loans.applyForLoan);
app.get('/api/loans', auth.authenticateToken, loans.getUserLoans);
app.get('/api/loans/:loanId', auth.authenticateToken, loans.getLoanById);
app.post('/api/loans/:loanId/approve', auth.authenticateToken, loans.approveLoan);

// Payment routes (protected)
app.post('/api/payments', auth.authenticateToken, payments.makePayment);
app.get('/api/payments/history', auth.authenticateToken, payments.getPaymentHistory);
app.get('/api/payments/pending', auth.authenticateToken, payments.getPendingPayments);

// Transaction routes (protected)
app.get('/api/transactions', auth.authenticateToken, getTransactions);
app.get('/api/transactions/stats', auth.authenticateToken, getTransactionStats);

// Profile routes (protected)
app.get('/api/profile', auth.authenticateToken, profile.getProfile);
app.put('/api/profile', auth.authenticateToken, profile.updateProfile);
app.get('/api/profile/cards', auth.authenticateToken, profile.getCreditCards);
app.put('/api/profile/cards/:cardId', auth.authenticateToken, profile.updateCard);

// Admin routes (protected)
app.get('/api/admin/parameters', auth.authenticateToken, admin.getSystemParameters);
app.put('/api/admin/parameters', auth.authenticateToken, admin.updateSystemParameters);
app.get('/api/admin/users', auth.authenticateToken, admin.getAllUsers);
app.put('/api/admin/users/:userId', auth.authenticateToken, admin.updateUser);
app.get('/api/admin/loans', auth.authenticateToken, admin.getAllLoans);
app.put('/api/admin/loans/:loanId', auth.authenticateToken, admin.updateLoan);
app.post('/api/admin/users/:userId/loans', auth.authenticateToken, admin.createLoanForUser);
app.delete('/api/admin/loans/:loanId', auth.authenticateToken, admin.deleteLoan);
app.get('/api/admin/payments/pending', auth.authenticateToken, admin.getPendingPayments);
app.post('/api/admin/payments/:paymentId/approve', auth.authenticateToken, admin.approvePayment);
app.post('/api/admin/loans/:loanId/approve', auth.authenticateToken, loans.approveLoan);

// Admin transaction management routes
const { getAllTransactions, updateTransaction, deleteTransaction } = require('./transactions');
app.get('/api/admin/transactions', auth.authenticateToken, getAllTransactions);
app.put('/api/admin/transactions/:transactionId', auth.authenticateToken, updateTransaction);
app.delete('/api/admin/transactions/:transactionId', auth.authenticateToken, deleteTransaction);

// Admin logs routes (read-only)
const logsAPI = require('./logs');
app.get('/api/admin/logs', auth.authenticateToken, logsAPI.getAdminLogs);
app.get('/api/admin/logs/admins', auth.authenticateToken, logsAPI.getAdminUsernames);

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server only if running directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`\n🚀 Nova Credit Server running on http://localhost:${PORT}`);
        console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
        console.log(`💳 Dashboard available at http://localhost:${PORT}\n`);
    });
}

// Export for Vercel
module.exports = app;
