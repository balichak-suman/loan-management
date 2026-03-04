const { executeSQL, dbHelpers } = require('./database');
const { logAdminAction } = require('./admin-logger');
const { calculateLoanDetails } = require('./loans');
const { sendLoanConfirmation } = require('./email');

// Get system parameters (public/user access)
async function getPublicSystemParameters(req, res) {
    try {
        const { get: row } = await executeSQL('SELECT interest_rate, max_loan_amount, min_loan_amount FROM system_parameters WHERE id = 1');

        res.json({
            success: true,
            parameters: row || {
                interest_rate: 6.8,
                max_loan_amount: 1000000,
                min_loan_amount: 1000
            }
        });
    } catch (error) {
        console.error('Get parameters error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get system parameters (admin access - full details)
async function getSystemParameters(req, res) {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { get: row } = await executeSQL('SELECT * FROM system_parameters WHERE id = 1');

        res.json({
            success: true,
            parameters: row || {
                interest_rate: 6.0,
                penalty_rate_per_10k: 1300,
                max_loan_amount: 1000000,
                min_loan_amount: 1000
            }
        });
    } catch (error) {
        console.error('Get parameters error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Update system parameters
async function updateSystemParameters(req, res) {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { interestRate, penaltyRate, maxLoanAmount, minLoanAmount } = req.body;

        // Validate inputs
        if (interestRate !== undefined && (interestRate < 0 || interestRate > 100)) {
            return res.status(400).json({ error: 'Interest rate must be between 0 and 100' });
        }

        if (penaltyRate !== undefined && penaltyRate < 0) {
            return res.status(400).json({ error: 'Penalty rate must be positive' });
        }

        if (maxLoanAmount !== undefined && maxLoanAmount < 1000) {
            return res.status(400).json({ error: 'Max loan amount must be at least 1000' });
        }

        if (minLoanAmount !== undefined && minLoanAmount < 0) {
            return res.status(400).json({ error: 'Min loan amount must be positive' });
        }

        // Update parameters using PostgreSQL ON CONFLICT syntax
        await executeSQL(
            `INSERT INTO system_parameters (id, interest_rate, penalty_rate_per_10k, max_loan_amount, min_loan_amount, updated_at)
             VALUES (1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT (id) DO UPDATE SET
             interest_rate = EXCLUDED.interest_rate,
             penalty_rate_per_10k = EXCLUDED.penalty_rate_per_10k,
             max_loan_amount = EXCLUDED.max_loan_amount,
             min_loan_amount = EXCLUDED.min_loan_amount,
             updated_at = EXCLUDED.updated_at`,
            [
                interestRate || 6.0,
                penaltyRate || 1300,
                maxLoanAmount || 1000000,
                minLoanAmount || 1000
            ]
        );

        res.json({
            success: true,
            message: 'System parameters updated successfully'
        });
    } catch (error) {
        console.error('Update parameters error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get all users (admin only)
async function getAllUsers(req, res) {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { rows } = await executeSQL('SELECT id, username, email, full_name, phone, credit_score, credit_limit, is_admin, created_at FROM users');

        res.json({
            success: true,
            users: rows
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Update user (admin only)
async function updateUser(req, res) {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { userId } = req.params;
        const { fullName, email, phone, creditScore, creditLimit } = req.body;

        console.log(`Updating user ${userId}:`, { fullName, email, phone, creditScore, creditLimit });

        // Get old values for logging
        const { get: oldUser } = await executeSQL('SELECT full_name, email, phone, credit_score, credit_limit FROM users WHERE id = ?', [userId]);

        const updates = [];
        const values = [];

        if (fullName) {
            updates.push('full_name = ?');
            values.push(fullName);
        }
        if (email) {
            updates.push('email = ?');
            values.push(email);
        }
        if (phone) {
            updates.push('phone = ?');
            values.push(phone);
        }
        if (creditScore !== undefined) {
            updates.push('credit_score = ?');
            values.push(creditScore);
        }
        if (creditLimit !== undefined) {
            updates.push('credit_limit = ?');
            values.push(creditLimit);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(userId);

        await executeSQL(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // Log admin action
        await logAdminAction(req, 'UPDATE_USER', 'user', userId, oldUser, { fullName, email, phone, creditScore, creditLimit });

        res.json({
            success: true,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get all loans (admin only)
async function getAllLoans(req, res) {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { rows } = await executeSQL(
            `SELECT l.*, u.full_name, u.email, u.username 
       FROM loans l 
       JOIN users u ON l.user_id = u.id 
       ORDER BY l.application_date DESC`
        );

        // Import calculateLoanDetails from loans.js (need to require it at top)
        const { calculateLoanDetails } = require('./loans');

        const loansWithDetails = rows.map(loan => {
            const details = calculateLoanDetails(loan);
            return {
                ...loan,
                ...details,
                // Override outstanding_balance with the calculated one (which includes penalty)
                outstanding_balance: details.outstandingBalance
            };
        });

        res.json({
            success: true,
            loans: loansWithDetails
        });
    } catch (error) {
        console.error('Get all loans error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Update loan (admin only)
async function updateLoan(req, res) {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { loanId } = req.params;
        const {
            loanAmount,
            outstandingBalance,
            interestRate,
            monthlyPayment,
            loanPurpose,
            loanStatus,
            applicationDate,
            approvalDate,
            dueDate,
            penaltyAmount,
            daysOverdue
        } = req.body;

        // Fetch current loan details to check for status change
        const currentLoan = await dbHelpers.getLoanById(loanId);

        if (!currentLoan) {
            return res.status(404).json({ error: 'Loan not found' });
        }

        // Check credit limit if status is changing to approved
        if (loanStatus === 'approved' && currentLoan.loan_status !== 'approved') {
            const user = await dbHelpers.getUserById(currentLoan.user_id);
            const userLoans = await dbHelpers.getUserLoans(currentLoan.user_id);

            const activeLoans = userLoans.filter(l => l.outstanding_balance > 0 && l.id !== parseInt(loanId) && l.loan_status !== 'rejected');
            let currentDebt = 0;
            activeLoans.forEach(l => {
                const details = calculateLoanDetails(l);
                currentDebt += details.outstandingBalance;
            });

            const creditLimit = parseFloat(user.credit_limit || 10000);
            const newLoanAmount = loanAmount !== undefined ? parseFloat(loanAmount) : parseFloat(currentLoan.loan_amount);

            if (currentDebt + newLoanAmount > creditLimit) {
                return res.status(400).json({
                    error: `Cannot approve loan. Total debt (₹${(currentDebt + newLoanAmount).toFixed(2)}) would exceed credit limit (₹${creditLimit}).`
                });
            }
        }

        const updates = [];
        const values = [];

        let finalOutstandingBalance = outstandingBalance;
        let finalApprovalDate = approvalDate;
        let finalMonthlyPayment = monthlyPayment;

        const isApproved = (loanStatus === 'approved') || (currentLoan.loan_status === 'approved' && loanStatus !== 'pending' && loanStatus !== 'rejected');

        if (isApproved) {
            // Recalculate interest and base outstanding balance
            const rate = interestRate !== undefined ? interestRate : (currentLoan.interest_rate || 6.8);
            const amount = loanAmount !== undefined ? loanAmount : currentLoan.loan_amount;

            // Rate is percentage (e.g. 6.8)
            let rateDecimal = parseFloat(rate);
            if (rateDecimal > 1) rateDecimal = rateDecimal / 100;

            // Calculate Interest (Simple 1 month interest to match 'Monthly Payment' expectation)
            const interestAmount = amount * rateDecimal;
            const baseTotalWithInterest = parseFloat(amount) + interestAmount;

            console.log(`Recalculating Approved Loan #${loanId}: Principal ${amount}, Rate ${rateDecimal}, Base Total ${baseTotalWithInterest}`);

            // Update outstanding balance to be the Base Total (Principal + Interest).
            finalOutstandingBalance = baseTotalWithInterest;

            // ALSO update monthly_payment to match the new total (assuming 1 month term)
            finalMonthlyPayment = baseTotalWithInterest;

            // Set approval date if not provided and it was just approved
            if (!finalApprovalDate && currentLoan.loan_status !== 'approved') {
                finalApprovalDate = new Date().toISOString();
            }
        }

        if (loanAmount !== undefined) {
            updates.push('loan_amount = ?');
            values.push(loanAmount);
        }

        if (finalOutstandingBalance !== undefined) {
            updates.push('outstanding_balance = ?');
            values.push(finalOutstandingBalance);
        }

        if (interestRate !== undefined) {
            updates.push('interest_rate = ?');
            values.push(interestRate);
        }

        if (finalMonthlyPayment !== undefined) {
            updates.push('monthly_payment = ?');
            values.push(finalMonthlyPayment);
        }

        if (loanPurpose) {
            updates.push('loan_purpose = ?');
            values.push(loanPurpose);
        }
        if (loanStatus) {
            updates.push('loan_status = ?');
            values.push(loanStatus);
        }
        if (applicationDate) {
            updates.push('application_date = ?');
            values.push(applicationDate);
        }

        if (finalApprovalDate) {
            updates.push('approval_date = ?');
            values.push(finalApprovalDate);
        }

        if (dueDate) {
            updates.push('due_date = ?');
            values.push(dueDate);
        }
        if (penaltyAmount !== undefined) {
            updates.push('penalty_amount = ?');
            values.push(penaltyAmount);
        }
        if (daysOverdue !== undefined) {
            updates.push('days_overdue = ?');
            values.push(daysOverdue);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(loanId);

        await executeSQL(
            `UPDATE loans SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // If status changed to approved, create transaction
        if (currentLoan.loan_status !== 'approved' && loanStatus === 'approved') {
            await dbHelpers.createTransaction(
                currentLoan.user_id,
                'loan_approved',
                finalOutstandingBalance, // Use the new balance (Principal + Interest)
                `Loan #${loanId} Approved`,
                finalOutstandingBalance
            );
        }

        res.json({
            success: true,
            message: 'Loan updated successfully'
        });

    } catch (error) {
        console.error('Update loan error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Create loan for user (admin only)
async function createLoanForUser(req, res) {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { userId } = req.params;
        const { loanAmount, loanPurpose, comments } = req.body;

        if (!loanAmount || loanAmount <= 0) {
            return res.status(400).json({ error: 'Valid loan amount is required' });
        }

        // Check credit limit before creating loan
        const user = await dbHelpers.getUserById(userId);
        const userLoans = await dbHelpers.getUserLoans(userId);

        const activeLoans = userLoans.filter(l => l.outstanding_balance > 0 && l.loan_status !== 'rejected');
        let currentDebt = 0;
        activeLoans.forEach(l => {
            const details = calculateLoanDetails(l);
            currentDebt += details.outstandingBalance;
        });

        const creditLimit = user.credit_limit || 10000;

        if (currentDebt + parseFloat(loanAmount) > creditLimit) {
            return res.status(400).json({
                error: `Cannot create loan. Total debt (₹${(currentDebt + parseFloat(loanAmount)).toFixed(2)}) would exceed credit limit (₹${creditLimit}).`
            });
        }

        // Get interest rate from system parameters
        const { get: params } = await executeSQL('SELECT * FROM system_parameters WHERE id = 1');
        const safeParams = params || {};

        const interestRatePercent = safeParams.interest_rate || 6.8;
        const interestRateDecimal = interestRatePercent / 100;

        // Fixed 28-day term (1 period)
        const totalWithInterest = parseFloat(loanAmount) * (1 + interestRateDecimal);
        const monthlyPayment = totalWithInterest; // No EMI, full amount due

        const loanId = await dbHelpers.createLoan(userId, loanAmount, loanPurpose, monthlyPayment, interestRatePercent, comments);

        // Fetch loan for full details (like due date) to send in email
        const newLoan = await dbHelpers.getLoanById(loanId);

        // Send confirmation email
        try {
            await sendLoanConfirmation(user.email, {
                amount: loanAmount,
                purpose: loanPurpose,
                dueDate: new Date(newLoan.due_date).toLocaleDateString(),
                comments: comments
            });
        } catch (mailError) {
            console.error('Failed to send loan confirmation email:', mailError);
            // Don't fail the request if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Loan created successfully',
            loanId
        });
    } catch (error) {
        console.error('Create loan error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Delete loan (admin only)
async function deleteLoan(req, res) {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { loanId } = req.params;

        await executeSQL('DELETE FROM loans WHERE id = ?', [loanId]);

        res.json({
            success: true,
            message: 'Loan deleted successfully'
        });
    } catch (error) {
        console.error('Delete loan error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get pending payments (admin only)
async function getPendingPayments(req, res) {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { rows } = await executeSQL(
            `SELECT p.*, u.username, u.full_name, l.loan_amount 
             FROM payments p 
             JOIN users u ON p.user_id = u.id 
             LEFT JOIN loans l ON p.loan_id = l.id 
             WHERE p.payment_status = 'pending' 
             ORDER BY p.payment_date DESC`
        );

        res.json({
            success: true,
            payments: rows
        });
    } catch (error) {
        console.error('Get pending payments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Approve payment (admin only)
async function approvePayment(req, res) {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { paymentId } = req.params;
        const { action } = req.body; // 'approve' or 'reject'

        if (action === 'reject') {
            await executeSQL("UPDATE payments SET payment_status = 'rejected' WHERE id = ?", [paymentId]);
            return res.json({ success: true, message: 'Payment rejected' });
        }

        // If approve
        // Get payment details
        const { get: payment } = await executeSQL('SELECT * FROM payments WHERE id = ?', [paymentId]);

        if (!payment) return res.status(404).json({ error: 'Payment not found' });

        if (payment.payment_status === 'completed') {
            return res.status(400).json({ error: 'Payment already completed' });
        }

        // Update payment status
        await executeSQL("UPDATE payments SET payment_status = 'completed' WHERE id = ?", [paymentId]);

        // Update loan balance
        if (payment.loan_id) {
            const loan = await dbHelpers.getLoanById(payment.loan_id);
            if (loan) {
                const newBalance = Math.max(0, loan.outstanding_balance - payment.payment_amount);
                const newStatus = newBalance <= 0 ? 'paid' : loan.loan_status;

                await dbHelpers.updateLoan(payment.loan_id, {
                    outstanding_balance: newBalance,
                    loan_status: newStatus,
                    last_payment_date: new Date().toISOString()
                });

                // Create transaction record
                await dbHelpers.createTransaction(
                    payment.user_id,
                    'payment',
                    payment.payment_amount,
                    `Payment for loan #${payment.loan_id}`,
                    newBalance
                );
            }
        }

        res.json({ success: true, message: 'Payment approved and processed' });

    } catch (error) {
        console.error('Approve payment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getSystemParameters,
    getPublicSystemParameters,
    updateSystemParameters,
    getAllUsers,
    updateUser,
    getAllLoans,
    updateLoan,
    createLoanForUser,
    deleteLoan,
    getPendingPayments,
    approvePayment
};
