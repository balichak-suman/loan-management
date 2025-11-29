const { dbHelpers } = require('./database');

// Get all transactions for user
async function getTransactions(req, res) {
    try {
        const userId = req.user.userId;
        const limit = parseInt(req.query.limit) || 50;
        const type = req.query.type;

        let transactions = await dbHelpers.getUserTransactions(userId, limit);

        // Filter by type if specified
        if (type) {
            transactions = transactions.filter(t => t.transaction_type === type);
        }

        res.json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get transaction statistics
async function getTransactionStats(req, res) {
    try {
        const userId = req.user.userId;
        const transactions = await dbHelpers.getUserTransactions(userId, 1000);

        const stats = {
            totalTransactions: transactions.length,
            totalLoans: 0,
            totalPayments: 0,
            totalLoanAmount: 0,
            totalPaymentAmount: 0,
            recentTransactions: transactions.slice(0, 10)
        };

        transactions.forEach(t => {
            if (t.transaction_type === 'loan_application') {
                stats.totalLoans++;
                stats.totalLoanAmount += t.amount;
            } else if (t.transaction_type === 'payment') {
                stats.totalPayments++;
                stats.totalPaymentAmount += t.amount;
            }
        });

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Transaction stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getTransactions,
    getTransactionStats
};
