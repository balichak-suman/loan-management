const bcrypt = require('bcryptjs');
const { dbHelpers, executeSQL } = require('./database');

// Seed initial users
async function seedUsers() {
    try {
        // Check if users already exist
        const existingUser = await dbHelpers.getUserByUsername('balichaksuman');
        const existingAdmin = await dbHelpers.getUserByUsername('kali');

        if (existingUser && existingAdmin) {
            console.log('✅ Seed users already exist');
            return;
        }

        // Create regular user: balichaksuman
        if (!existingUser) {
            const hashedPassword = await bcrypt.hash('Chandana@12345', 10);
            const userId = await dbHelpers.createUser(
                'balichaksuman',
                'balichaksuman@novacredit.com',
                hashedPassword,
                'Balichaksuman',
                '9876543210',
                null // panCard
            );

            // Create credit card for user
            await dbHelpers.createCreditCard(
                userId,
                '4532123456789012',
                'Balichaksuman',
                '12/28',
                '123',
                'VISA'
            );

            console.log('✅ Created user: balichaksuman');
        }

        // Create admin user: kali
        if (!existingAdmin) {
            const hashedAdminPassword = await bcrypt.hash('kali', 10);
            const adminId = await dbHelpers.createUser(
                'kali',
                'admin@novacredit.com',
                hashedAdminPassword,
                'Kali Admin',
                '9999999999',
                null // panCard
            );

            // Mark as admin
            await executeSQL('UPDATE users SET is_admin = 1 WHERE id = ?', [adminId]);

            // Create credit card for admin
            await dbHelpers.createCreditCard(
                adminId,
                '4532999999999999',
                'Kali Admin',
                '12/29',
                '999',
                'VISA'
            );

            console.log('✅ Created admin user: kali');
        }

    } catch (error) {
        console.error('Error seeding users:', error);
    }
}

async function seedHistory() {
    try {
        const { get: user } = await executeSQL('SELECT id FROM users WHERE username = ?', ['balichaksuman']);
        if (!user) return;
        
        const userId = user.id;

        console.log('🧹 Cleaning up previous history seed data...');
        await executeSQL("DELETE FROM transactions WHERE user_id = ? AND (description LIKE 'Loan #10%' OR description LIKE 'Repayment for Loan #10%')", [userId]);

        const transactions = [];
        const months = [1, 2, 3]; // Feb, March, April
        const year = 2026;

        for (const month of months) {
            for (let i = 1; i <= 5; i++) {
                const amount = Math.floor(Math.random() * 45000) + 5000;
                const payDay = Math.floor(Math.random() * 20) + 5;
                const paymentDate = new Date(year, month, payDay);
                const approvalDate = new Date(paymentDate);
                approvalDate.setDate(approvalDate.getDate() - 28);

                transactions.push({
                    user_id: userId,
                    transaction_type: 'loan_approval',
                    amount: amount,
                    description: `Loan #${1000 + month * 10 + i} Approved & Disbursed`,
                    transaction_date: approvalDate.toISOString()
                });

                transactions.push({
                    user_id: userId,
                    transaction_type: 'payment',
                    amount: amount,
                    description: `Repayment for Loan #${1000 + month * 10 + i}`,
                    transaction_date: paymentDate.toISOString()
                });
            }
        }

        console.log(`🚀 Seeding ${transactions.length} historical transactions...`);
        for (const t of transactions) {
            await executeSQL(
                'INSERT INTO transactions (user_id, transaction_type, amount, description, transaction_date) VALUES (?, ?, ?, ?, ?)',
                [t.user_id, t.transaction_type, t.amount, t.description, t.transaction_date]
            );
        }
        console.log('✅ History seeding complete');
    } catch (error) {
        console.error('Error seeding history:', error);
    }
}

module.exports = { seedUsers, seedHistory };
