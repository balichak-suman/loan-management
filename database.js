const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

// Configuration
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL is not defined in environment variables');
}

console.log('🔌 Connecting to Supabase PostgreSQL Database...');
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL && DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

// Unified Query Executor
async function executeSQL(sql, params = []) {
  // Convert ? to $1, $2, etc. for PostgreSQL
  let count = 1;
  const pgSql = sql.replace(/\?/g, () => `$${count++}`);

  try {
    const result = await pool.query(pgSql, params);
    return {
      rows: result.rows,
      lastID: result.rows[0]?.id || null, // Standardized for RETURNING id
      changes: result.rowCount,
      get: result.rows[0]
    };
  } catch (err) {
    console.error('PostgreSQL Error:', err.message);
    throw err;
  }
}

// Initialize database schema
async function initializeDatabase() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      pan_card TEXT,
      credit_score INTEGER DEFAULT 750,
      credit_limit DECIMAL DEFAULT 10000,
      is_admin INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS credit_cards (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      card_number TEXT NOT NULL,
      card_holder TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      cvv TEXT NOT NULL,
      card_type TEXT DEFAULT 'VISA',
      credit_limit DECIMAL DEFAULT 100000,
      available_credit DECIMAL DEFAULT 100000,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS loans (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      loan_amount DECIMAL NOT NULL,
      interest_rate DECIMAL DEFAULT 6.0,
      outstanding_balance DECIMAL NOT NULL,
      monthly_payment DECIMAL,
      loan_purpose TEXT,
      loan_status TEXT DEFAULT 'pending',
      application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      approval_date TIMESTAMP,
      due_date TIMESTAMP,
      last_payment_date TIMESTAMP,
      days_overdue INTEGER DEFAULT 0,
      penalty_amount DECIMAL DEFAULT 0,
      comments TEXT,
      bank_name TEXT,
      account_number TEXT,
      ifsc_code TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      loan_id INTEGER NOT NULL,
      payment_amount DECIMAL NOT NULL,
      payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      payment_type TEXT DEFAULT 'loan_payment',
      payment_status TEXT DEFAULT 'completed',
      proof_image TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE,
      FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      amount DECIMAL NOT NULL,
      description TEXT,
      balance_after DECIMAL,
      transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS system_parameters (
      id INTEGER PRIMARY KEY,
      interest_rate DECIMAL DEFAULT 6.8,
      penalty_rate_per_10k DECIMAL DEFAULT 1300,
      max_loan_amount DECIMAL DEFAULT 1000000,
      min_loan_amount DECIMAL DEFAULT 1000,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS admin_logs (
      id SERIAL PRIMARY KEY,
      admin_id TEXT NOT NULL,
      admin_username TEXT NOT NULL,
      action_type TEXT NOT NULL,
      target_entity TEXT,
      target_id INTEGER,
      old_values TEXT,
      new_values TEXT,
      ip_address TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES users(id) ON UPDATE CASCADE
    )`
  ];

  try {
    for (const sql of tables) {
      await executeSQL(sql);
    }

    // Migrations
    const migrations = [
      "ALTER TABLE users ALTER COLUMN id TYPE TEXT",
      "ALTER TABLE credit_cards ALTER COLUMN user_id TYPE TEXT",
      "ALTER TABLE loans ALTER COLUMN user_id TYPE TEXT",
      "ALTER TABLE payments ALTER COLUMN user_id TYPE TEXT",
      "ALTER TABLE transactions ALTER COLUMN user_id TYPE TEXT",
      "ALTER TABLE admin_logs ALTER COLUMN admin_id TYPE TEXT"
    ];

    for (const sql of migrations) {
      try {
        await executeSQL(sql);
      } catch (err) {
        // console.log('Migration note:', err.message);
      }
    }

    // Insert default parameters
    await executeSQL(`
      INSERT INTO system_parameters (id, interest_rate, penalty_rate_per_10k, max_loan_amount, min_loan_amount)
      VALUES (1, 6.8, 1300, 1000000, 1000)
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ Database initialized successfully');

    // MIGRATION: Convert existing numeric IDs to random strings
    try {
      const { rows: numericUsers } = await executeSQL("SELECT id FROM users WHERE id ~ '^[0-9]+$'");
      if (numericUsers.length > 0) {
        console.log(`🔄 Migrating ${numericUsers.length} users with numeric IDs to random strings...`);
        for (const user of numericUsers) {
          const oldId = user.id;
          const newId = generateUserId();
          
          // Update all references first (Foreign Keys)
          await executeSQL('UPDATE credit_cards SET user_id = ? WHERE user_id = ?', [newId, oldId]);
          await executeSQL('UPDATE loans SET user_id = ? WHERE user_id = ?', [newId, oldId]);
          await executeSQL('UPDATE payments SET user_id = ? WHERE user_id = ?', [newId, oldId]);
          await executeSQL('UPDATE transactions SET user_id = ? WHERE user_id = ?', [newId, oldId]);
          await executeSQL('UPDATE admin_logs SET admin_id = ? WHERE admin_id = ?', [newId, oldId]);
          
          // Finally update the user itself
          await executeSQL('UPDATE users SET id = ? WHERE id = ?', [newId, oldId]);
          console.log(`✅ Migrated User ${oldId} -> ${newId}`);
        }
      }
    } catch (migErr) {
      console.error('Migration warning:', migErr.message);
    }

  } catch (err) {
    console.error('❌ Database initialization failed:', err);
  }
}

// Helper to generate random User ID
function generateUserId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, 0, I, 1 to avoid confusion
  let result = 'NC';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper functions
const dbHelpers = {
  // Get user by username
  getUserByUsername: async (username) => {
    const result = await executeSQL('SELECT * FROM users WHERE username = ?', [username]);
    return result.get; // Use .get for single row
  },

  // Get user by email
  getUserByEmail: async (email) => {
    const result = await executeSQL('SELECT * FROM users WHERE email = ?', [email]);
    return result.get;
  },

  // Get user by ID
  getUserById: async (id) => {
    const result = await executeSQL('SELECT * FROM users WHERE id = ?', [id]);
    return result.get;
  },

  // Create user
  createUser: async (username, email, hashedPassword, fullName, phone, panCard) => {
    const userId = generateUserId();
    await executeSQL(
      'INSERT INTO users (id, username, email, password, full_name, phone, pan_card) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, username, email, hashedPassword, fullName, phone, panCard]
    );
    return userId;
  },

  // Get all loans for user
  getUserLoans: async (userId) => {
    const result = await executeSQL('SELECT * FROM loans WHERE user_id = ? ORDER BY application_date DESC', [userId]);
    return result.rows;
  },

  // Get loan by ID
  getLoanById: async (loanId) => {
    const result = await executeSQL('SELECT * FROM loans WHERE id = ?', [loanId]);
    return result.get;
  },

  // Create loan
  createLoan: async (userId, loanAmount, loanPurpose, monthlyPayment, interestRate, comments, bankName = null, accountNumber = null, ifscCode = null) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 28); // Fixed 28-day term

    const result = await executeSQL(
      `INSERT INTO loans (user_id, loan_amount, outstanding_balance, monthly_payment, loan_purpose, due_date, interest_rate, comments, bank_name, account_number, ifsc_code) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [userId, loanAmount, loanAmount, monthlyPayment, loanPurpose, dueDate.toISOString(), interestRate, comments, bankName, accountNumber, ifscCode]
    );
    return result.lastID;
  },

  // Update loan
  updateLoan: async (loanId, updates) => {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(loanId);

    const result = await executeSQL(
      `UPDATE loans SET ${fields} WHERE id = ?`,
      values
    );
    return result.changes;
  },

  // Create payment
  createPayment: async (userId, loanId, paymentAmount, paymentType, status = 'pending', proofImage = null) => {
    const result = await executeSQL(
      'INSERT INTO payments (user_id, loan_id, payment_amount, payment_type, payment_status, proof_image) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
      [userId, loanId, paymentAmount, paymentType, status, proofImage]
    );
    return result.lastID;
  },

  // Get user transactions
  getUserTransactions: async (userId, limit = 50) => {
    const result = await executeSQL(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC LIMIT ?',
      [userId, limit]
    );
    return result.rows;
  },

  // Create transaction
  createTransaction: async (userId, transactionType, amount, description, balanceAfter) => {
    const result = await executeSQL(
      'INSERT INTO transactions (user_id, transaction_type, amount, description, balance_after) VALUES (?, ?, ?, ?, ?) RETURNING id',
      [userId, transactionType, amount, description, balanceAfter]
    );
    return result.lastID;
  },

  // Get user credit cards
  getUserCreditCards: async (userId) => {
    const result = await executeSQL('SELECT * FROM credit_cards WHERE user_id = ?', [userId]);
    return result.rows;
  },

  // Create credit card
  createCreditCard: async (userId, cardNumber, cardHolder, expiryDate, cvv, cardType) => {
    const result = await executeSQL(
      'INSERT INTO credit_cards (user_id, card_number, card_holder, expiry_date, cvv, card_type) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
      [userId, cardNumber, cardHolder, expiryDate, cvv, cardType]
    );
    return result.lastID;
  },

  // Create admin log (INSERT ONLY - tamper-proof)
  createAdminLog: async (adminId, adminUsername, actionType, targetEntity, targetId, oldValues, newValues, ipAddress) => {
    const result = await executeSQL(
      'INSERT INTO admin_logs (admin_id, admin_username, action_type, target_entity, target_id, old_values, new_values, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id',
      [
        adminId,
        adminUsername,
        actionType,
        targetEntity || null,
        targetId || null,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress || null
      ]
    );
    return result.lastID;
  }
};

module.exports = { pool, initializeDatabase, dbHelpers, executeSQL };
