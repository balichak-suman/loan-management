const { dbHelpers, executeSQL } = require('./database');

// Calculate interest and penalties for a loan
function calculateLoanDetails(loan) {
    const now = new Date();
    const dueDate = new Date(loan.due_date);

    // Interest is already included in outstanding_balance upon approval
    // We only calculate penalties for overdue payments

    let currentBalance = loan.outstanding_balance;
    let daysOverdue = 0;
    let penaltyAmount = 0;
    let interestAmount = 0;

    // Heuristic: If outstanding_balance is exactly equal to loan_amount (and status is approved/active),
    // it likely means interest wasn't added to the DB record.
    // We should add it for display/calculation purposes.
    // We assume 1 month simple interest for consistency with the user's view.
    if (Math.abs(currentBalance - loan.loan_amount) < 1 && (loan.loan_status === 'approved' || loan.loan_status === 'active')) {
        const rate = loan.interest_rate || 6.8;
        // Rate is percentage (e.g. 6.8)
        let rateDecimal = parseFloat(rate);
        if (rateDecimal > 1) rateDecimal = rateDecimal / 100;

        interestAmount = loan.loan_amount * rateDecimal;
        currentBalance += interestAmount;
    }

    if (now > dueDate && loan.outstanding_balance > 0) {
        daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
        // Ensure non-negative
        if (daysOverdue < 0) daysOverdue = 0;

        // Penalty: ₹1,300 per ₹10,000 per day
        const penaltyRate = 1300 / 10000; // 0.13 per rupee per day
        // Penalty should be based on the Principal amount usually, or the Outstanding? 
        // User prompt implies: Penalty 7800. 
        // If Principal 20000. 20000 * 0.13 * 3 = 7800. 
        // So Penalty is based on PRINCIPAL (loan_amount), not outstanding balance.
        // My previous code used loan.outstanding_balance.
        // If outstanding_balance was 20000, it worked.
        // If outstanding_balance includes interest (21200), penalty would be higher.
        // Let's fix penalty to be based on loan_amount to match user's 7800 expectation.

        penaltyAmount = loan.loan_amount * penaltyRate * daysOverdue;
    }

    const totalDue = currentBalance + penaltyAmount;

    return {
        outstandingBalance: totalDue, // P + I + Penalty
        interestAccrued: interestAmount,
        daysOverdue,
        penaltyAmount,
        totalDue
    };
}

// Helper to get system params
async function getSystemParams() {
    const { get: row } = await executeSQL('SELECT * FROM system_parameters WHERE id = 1');
    return row || { interest_rate: 6.8 };
}

// Apply for a loan
async function applyForLoan(req, res) {
    try {
        const { loanAmount, loanPurpose, comments, bankName, accountNumber, ifscCode } = req.body; // Removed tenure, added comments and bank details
        const userId = req.user.userId;

        // Validate input
        if (!loanAmount || loanAmount <= 0) {
            return res.status(400).json({ error: 'Valid loan amount is required' });
        }

        // Fetch system parameters
        const params = await getSystemParams();
        const maxLoan = params.max_loan_amount || 1000000;

        if (loanAmount > maxLoan) {
            return res.status(400).json({ error: `Maximum loan amount is ₹${maxLoan}` });
        }

        // Check user's credit limit
        const user = await dbHelpers.getUserById(userId);
        const userLoans = await dbHelpers.getUserLoans(userId);

        // Calculate total outstanding debt
        // We use calculateLoanDetails to get the accurate outstanding balance including interest/penalties
        const activeLoans = userLoans.filter(l => l.outstanding_balance > 0 && l.loan_status !== 'rejected');
        let totalDebt = 0;

        // We need to calculate details for each loan to get current total due
        // But calculateLoanDetails is synchronous and we have the data
        activeLoans.forEach(loan => {
            // Use the stored outstanding_balance which is updated on approval/payment
            // Or should we recalculate? Stored balance is safer for "current state"
            totalDebt += loan.outstanding_balance;
        });

        const creditLimit = user.credit_limit || 10000;
        const availableCredit = creditLimit - totalDebt;

        if (loanAmount > availableCredit) {
            return res.status(400).json({
                error: `Loan amount exceeds available credit limit. Available: ₹${availableCredit.toFixed(2)}`
            });
        }

        // Fixed 28-day term (1 period)
        const tenureMonths = 1;

        // Get interest rate from system parameters
        const interestRatePercent = params.interest_rate || 6.8;
        const interestRateDecimal = interestRatePercent / 100;

        // Simple interest for 1 period (28 days treated as 1 month unit for rate application)
        // Or should it be compounded? User said "28 days a month".
        // Let's assume the rate applies to this 28-day period.
        const totalWithInterest = loanAmount * (1 + interestRateDecimal);

        // No EMI, so "monthlyPayment" is just the full amount due at the end
        const monthlyPayment = totalWithInterest;

        // Create loan with the fetched interest rate and comments
        const loanId = await dbHelpers.createLoan(userId, loanAmount, loanPurpose, monthlyPayment, interestRatePercent, comments, bankName, accountNumber, ifscCode);

        // Create transaction record
        await dbHelpers.createTransaction(
            userId,
            'loan_application',
            loanAmount,
            `Loan application for ${loanPurpose}`,
            loanAmount
        );

        res.status(201).json({
            success: true,
            message: 'Loan application submitted successfully',
            loan: {
                id: loanId,
                loanAmount,
                monthlyPayment: monthlyPayment.toFixed(2),
                tenure: '28 Days',
                interestRate: interestRatePercent,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Loan application error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get all loans for user
async function getUserLoans(req, res) {
    try {
        const userId = req.user.userId;
        const loans = await dbHelpers.getUserLoans(userId);

        // Calculate current details for each loan
        const loansWithDetails = loans.map(loan => {
            const details = calculateLoanDetails(loan);
            return {
                ...loan,
                ...details
            };
        });

        res.json({
            success: true,
            loans: loansWithDetails
        });
    } catch (error) {
        console.error('Get loans error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get loan by ID
async function getLoanById(req, res) {
    try {
        const { loanId } = req.params;
        const userId = req.user.userId;

        const loan = await dbHelpers.getLoanById(loanId);

        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        if (loan.user_id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const details = calculateLoanDetails(loan);

        res.json({
            success: true,
            loan: {
                ...loan,
                ...details
            }
        });
    } catch (error) {
        console.error('Get loan error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Approve loan (admin function - auto-approve for demo)
async function approveLoan(req, res) {
    try {
        const { loanId } = req.params;
        const userId = req.user.userId;

        const loan = await dbHelpers.getLoanById(loanId);

        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required to approve loans' });
        }

        // Check credit limit before approving
        const user = await dbHelpers.getUserById(loan.user_id);
        const userLoans = await dbHelpers.getUserLoans(loan.user_id);

        // Calculate current total debt (excluding the loan being approved if it's already in the list but pending)
        // Actually, pending loans have 0 outstanding balance usually until approved? 
        // No, createLoan sets outstanding_balance = loanAmount initially? 
        // Let's check createLoan. It sets outstanding_balance = loanAmount.
        // So if we sum all active loans, we include this one.

        const activeLoans = userLoans.filter(l => l.outstanding_balance > 0 && l.id !== parseInt(loanId) && l.loan_status !== 'rejected');
        let currentDebt = 0;
        activeLoans.forEach(l => currentDebt += l.outstanding_balance);

        const creditLimit = user.credit_limit || 10000;
        const newLoanAmount = loan.loan_amount;

        // Check if approving this loan exceeds the limit
        // We compare (currentDebt + newLoanAmount) vs Credit Limit
        if (currentDebt + newLoanAmount > creditLimit) {
            return res.status(400).json({
                error: `Cannot approve loan. Total debt (₹${(currentDebt + newLoanAmount).toFixed(2)}) would exceed credit limit (₹${creditLimit}).`
            });
        }

        // Calculate total amount with interest (Principal + Interest)
        // This applies the full interest immediately upon approval
        // Fixed 28-day term (1 period)

        // Use the interest rate stored on the loan (which came from system params at creation)
        const interestRatePercent = loan.interest_rate || 6.8;
        const interestRateDecimal = interestRatePercent / 100;

        // Simple interest for 1 period
        const totalWithInterest = loan.loan_amount * (1 + interestRateDecimal);

        // Update loan status AND outstanding balance to include full interest
        await dbHelpers.updateLoan(loanId, {
            loan_status: 'approved',
            approval_date: new Date().toISOString(),
            outstanding_balance: totalWithInterest
        });

        // Create transaction record for loan disbursement
        await dbHelpers.createTransaction(
            loan.user_id,
            'loan_approved',
            loan.loan_amount,
            `Loan #${loanId} Approved`,
            totalWithInterest
        );

        res.json({
            success: true,
            message: 'Loan approved successfully. Interest has been fully applied.'
        });
    } catch (error) {
        console.error('Approve loan error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    applyForLoan,
    getUserLoans,
    getLoanById,
    approveLoan,
    calculateLoanDetails
};
