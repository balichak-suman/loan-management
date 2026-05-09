const { executeSQL } = require('../database');

async function fixSchema() {
  console.log('Fixing schema types (with CASCADE)...');
  try {
    // 1. Drop Foreign Key Constraints
    console.log('Dropping constraints...');
    await executeSQL('ALTER TABLE credit_cards DROP CONSTRAINT IF EXISTS credit_cards_user_id_fkey');
    await executeSQL('ALTER TABLE loans DROP CONSTRAINT IF EXISTS loans_user_id_fkey');
    await executeSQL('ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_user_id_fkey');
    await executeSQL('ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey');
    await executeSQL('ALTER TABLE admin_logs DROP CONSTRAINT IF EXISTS admin_logs_admin_id_fkey');

    // 2. Alter Column Types
    console.log('Converting columns to TEXT...');
    await executeSQL('ALTER TABLE users ALTER COLUMN id TYPE TEXT USING id::TEXT');
    await executeSQL('ALTER TABLE credit_cards ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT');
    await executeSQL('ALTER TABLE loans ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT');
    await executeSQL('ALTER TABLE payments ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT');
    await executeSQL('ALTER TABLE transactions ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT');
    await executeSQL('ALTER TABLE admin_logs ALTER COLUMN admin_id TYPE TEXT USING admin_id::TEXT');

    // 3. Recreate Foreign Key Constraints with CASCADE
    console.log('Recreating constraints with ON UPDATE CASCADE...');
    await executeSQL('ALTER TABLE credit_cards ADD CONSTRAINT credit_cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE');
    await executeSQL('ALTER TABLE loans ADD CONSTRAINT loans_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE');
    await executeSQL('ALTER TABLE payments ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE');
    await executeSQL('ALTER TABLE transactions ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE');
    await executeSQL('ALTER TABLE admin_logs ADD CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES users(id) ON UPDATE CASCADE');

    console.log('✅ Schema fix COMPLETE with CASCADE!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Schema fix failed:', err.message);
    process.exit(1);
  }
}

fixSchema();
