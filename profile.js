const { dbHelpers, executeSQL } = require('./database');

// Get user profile
async function getProfile(req, res) {
    try {
        const userId = req.user.userId;
        const user = await dbHelpers.getUserById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get credit cards
        const creditCards = await dbHelpers.getUserCreditCards(userId);

        // Get loan summary
        const loans = await dbHelpers.getUserLoans(userId);
        const { calculateLoanDetails } = require('./loans');

        const activeLoans = loans.filter(l => l.outstanding_balance > 0 && l.loan_status === 'approved');
        const totalDebt = activeLoans.reduce((sum, l) => {
            const details = calculateLoanDetails(l);
            return sum + details.totalDue;
        }, 0);

        res.json({
            success: true,
            profile: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                phone: user.phone,
                creditScore: user.credit_score,
                creditLimit: parseFloat(user.credit_limit || 10000),
                createdAt: user.created_at,
                creditCards: creditCards.map(card => ({
                    ...card,
                    cardNumber: maskCardNumber(card.card_number)
                })),
                loanSummary: {
                    totalLoans: loans.length,
                    activeLoans: activeLoans.length,
                    totalDebt: totalDebt.toFixed(2)
                }
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Update user profile
async function updateProfile(req, res) {
    try {
        const userId = req.user.userId;
        const { fullName, phone } = req.body;

        const updates = [];
        const values = [];

        if (fullName) {
            updates.push('full_name = ?');
            values.push(fullName);
        }

        if (phone) {
            updates.push('phone = ?');
            values.push(phone);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(userId);

        await executeSQL(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get credit cards
async function getCreditCards(req, res) {
    try {
        const userId = req.user.userId;
        const creditCards = await dbHelpers.getUserCreditCards(userId);

        res.json({
            success: true,
            creditCards: creditCards.map(card => ({
                ...card,
                cardNumber: maskCardNumber(card.card_number),
                cvv: '***' // Hide CVV
            }))
        });
    } catch (error) {
        console.error('Get credit cards error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Helper function to mask card number
function maskCardNumber(cardNumber) {
    if (!cardNumber || cardNumber.length < 4) return '****';
    return '**** **** **** ' + cardNumber.slice(-4);
}

// Update credit card
async function updateCard(req, res) {
    try {
        const userId = req.user.userId;
        const { cardId } = req.params;
        const { cardHolder, expiryDate, cardType, cardNumber } = req.body;

        // Verify card belongs to user
        const { get: card } = await executeSQL('SELECT * FROM credit_cards WHERE id = ? AND user_id = ?', [cardId, userId]);

        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        const updates = [];
        const values = [];

        if (cardHolder) {
            updates.push('card_holder = ?');
            values.push(cardHolder);
        }
        if (expiryDate) {
            updates.push('expiry_date = ?');
            values.push(expiryDate);
        }
        if (cardType) {
            updates.push('card_type = ?');
            values.push(cardType);
        }
        if (cardNumber) {
            updates.push('card_number = ?');
            values.push(cardNumber);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(cardId);

        await executeSQL(
            `UPDATE credit_cards SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.json({
            success: true,
            message: 'Card updated successfully'
        });
    } catch (error) {
        console.error('Update card error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getProfile,
    updateProfile,
    getCreditCards,
    updateCard
};
