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
                '9876543210'
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
                '9999999999'
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

module.exports = { seedUsers };
