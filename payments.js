const { dbHelpers, executeSQL } = require('./database');
const { calculateLoanDetails } = require('./loans');

// Make a payment
// Make a payment (submit for approval)
async function makePayment(req, res) {
    try {
        const { loanId, paymentAmount, proofImage } = req.body;
        const userId = req.user.userId;

        // Validate input
        if (!loanId || !paymentAmount || paymentAmount <= 0) {
            return res.status(400).json({ error: 'Valid loan ID and payment amount are required' });
        }

        if (!proofImage) {
            return res.status(400).json({ error: 'Payment proof screenshot is required' });
        }

        // Get loan
        const loan = await dbHelpers.getLoanById(loanId);

        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        if (loan.user_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Create payment record with 'pending' status
        await dbHelpers.createPayment(userId, loanId, paymentAmount, 'loan_payment', 'pending', proofImage);

        res.json({
            success: true,
            message: 'Payment submitted for approval',
            payment: {
                amount: paymentAmount,
                status: 'pending',
                proofImage
            }
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get payment history
async function getPaymentHistory(req, res) {
    try {
        const userId = req.user.userId;

        const { rows } = await executeSQL(
            'SELECT * FROM payments WHERE user_id = ? ORDER BY payment_date DESC',
            [userId]
        );

        res.json({
            success: true,
            payments: rows
        });
    } catch (error) {
        console.error('Payment history error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get pending payments (loans with outstanding balance)
async function getPendingPayments(req, res) {
    try {
        const userId = req.user.userId;
        const loans = await dbHelpers.getUserLoans(userId);

        // Filter active loans and calculate details
        const pendingLoans = loans
            .filter(loan => loan.outstanding_balance > 0 && loan.loan_status !== 'paid' && loan.loan_status !== 'rejected')
            .map(loan => {
                const details = calculateLoanDetails(loan);
                return {
                    loanId: loan.id,
                    loanAmount: loan.loan_amount,
                    loanPurpose: loan.loan_purpose,
                    outstandingBalance: details.outstandingBalance,
                    penaltyAmount: details.penaltyAmount,
                    totalDue: details.totalDue,
                    daysOverdue: details.daysOverdue,
                    dueDate: loan.due_date,
                    monthlyPayment: loan.monthly_payment,
                    isOverdue: details.daysOverdue > 0
                };
            });

        res.json({
            success: true,
            pendingPayments: pendingLoans,
            totalPending: pendingLoans.reduce((sum, loan) => sum + parseFloat(loan.totalDue || 0), 0)
        });
    } catch (error) {
        console.error('Pending payments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    makePayment,
    getPaymentHistory,
    getPendingPayments
};
