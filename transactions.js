const { dbHelpers, executeSQL } = require('./database');

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

// Admin: Get all transactions
async function getAllTransactions(req, res) {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const limit = parseInt(req.query.limit) || 100;
        const { rows: transactions } = await executeSQL(
            'SELECT t.*, u.username, u.full_name FROM transactions t LEFT JOIN users u ON t.user_id = u.id ORDER BY t.transaction_date DESC LIMIT ?',
            [limit]
        );

        res.json({
            success: true,
            transactions
        });
    } catch (error) {
        console.error('Get all transactions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Admin: Update transaction
async function updateTransaction(req, res) {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { transactionId } = req.params;
        const { transactionType, amount, description, transactionDate } = req.body;

        // Validate inputs
        if (amount !== undefined && amount < 0) {
            return res.status(400).json({ error: 'Amount must be positive' });
        }

        const updates = [];
        const values = [];

        if (transactionType) {
            updates.push('transaction_type = ?');
            values.push(transactionType);
        }
        if (amount !== undefined) {
            updates.push('amount = ?');
            values.push(amount);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }
        if (transactionDate) {
            updates.push('transaction_date = ?');
            values.push(transactionDate);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(transactionId);

        await executeSQL(
            `UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({
            success: true,
            message: 'Transaction updated successfully'
        });
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Admin: Delete transaction
async function deleteTransaction(req, res) {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { transactionId } = req.params;

        await executeSQL('DELETE FROM transactions WHERE id = ?', [transactionId]);

        res.json({
            success: true,
            message: 'Transaction deleted successfully'
        });
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getTransactions,
    getTransactionStats,
    getAllTransactions,
    updateTransaction,
    deleteTransaction
};
