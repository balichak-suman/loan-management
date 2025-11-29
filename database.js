const sqlite3 = require('sqlite3').verbose();
const { createClient } = require('@libsql/client');
const path = require('path');
require('dotenv').config();

// Configuration
const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;
const IS_TURSO = !!TURSO_URL;

let db;
let libsqlClient;

if (IS_TURSO) {
  console.log('🔌 Connecting to Turso Database...');
  libsqlClient = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });
} else {
  console.log('📂 Using local SQLite database');
  const dbPath = path.join(__dirname, 'nova_credit.db');
  db = new sqlite3.Database(dbPath);
}

// Unified Query Executor
async function executeSQL(sql, params = []) {
  if (IS_TURSO) {
    try {
      const result = await libsqlClient.execute({ sql, args: params });
      return {
        rows: result.rows,
        lastID: result.lastInsertRowid ? Number(result.lastInsertRowid) : null,
        changes: result.rowsAffected,
        // Helper for single row results to match sqlite3 behavior
        get: result.rows[0]
      };
    } catch (err) {
      console.error('Turso Error:', err.message);
      throw err;
    }
  } else {
    return new Promise((resolve, reject) => {
      // Determine if it's a SELECT (read) or INSERT/UPDATE/DELETE (write)
      const isSelect = sql.trim().toLowerCase().startsWith('select');

      if (isSelect) {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve({ rows, get: rows[0] });
        });
      } else {
        db.run(sql, params, function (err) {
          if (err) reject(err);
          else resolve({
            lastID: this.lastID,
            changes: this.changes,
            rows: []
          });
        });
      }
    });
  }
}

// Initialize database schema
async function initializeDatabase() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      pan_card TEXT,
      credit_score INTEGER DEFAULT 750,
      credit_limit REAL DEFAULT 10000,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS credit_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      card_number TEXT NOT NULL,
      card_holder TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      cvv TEXT NOT NULL,
      card_type TEXT DEFAULT 'VISA',
      credit_limit REAL DEFAULT 100000,
      available_credit REAL DEFAULT 100000,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      loan_amount REAL NOT NULL,
      interest_rate REAL DEFAULT 6.0,
      outstanding_balance REAL NOT NULL,
      monthly_payment REAL,
      loan_purpose TEXT,
      loan_status TEXT DEFAULT 'pending',
      application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      approval_date DATETIME,
      due_date DATETIME,
      last_payment_date DATETIME,
      days_overdue INTEGER DEFAULT 0,
      penalty_amount REAL DEFAULT 0,
      comments TEXT,
      bank_name TEXT,
      account_number TEXT,
      ifsc_code TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      loan_id INTEGER NOT NULL,
      payment_amount REAL NOT NULL,
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      payment_type TEXT DEFAULT 'loan_payment',
      payment_status TEXT DEFAULT 'completed',
      proof_image TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (loan_id) REFERENCES loans(id)
    )`,
    `CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      transaction_type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      balance_after REAL,
      transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS system_parameters (
      id INTEGER PRIMARY KEY,
      interest_rate REAL DEFAULT 6.8,
      penalty_rate_per_10k REAL DEFAULT 1300,
      max_loan_amount REAL DEFAULT 1000000,
      min_loan_amount REAL DEFAULT 1000,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  try {
    for (const sql of tables) {
      await executeSQL(sql);
    }

    // Migrations
    const migrations = [
      "ALTER TABLE users ADD COLUMN pan_card TEXT",
      "ALTER TABLE users ADD COLUMN credit_limit REAL DEFAULT 10000",
      "ALTER TABLE loans ADD COLUMN comments TEXT",
      "ALTER TABLE loans ADD COLUMN bank_name TEXT",
      "ALTER TABLE loans ADD COLUMN account_number TEXT",
      "ALTER TABLE loans ADD COLUMN ifsc_code TEXT",
      "ALTER TABLE payments ADD COLUMN proof_image TEXT"
    ];

    for (const sql of migrations) {
      try {
        await executeSQL(sql);
      } catch (err) {
        // Ignore duplicate column errors
        if (!err.message.includes('duplicate column name') && !err.message.includes('no such column')) {
          // console.log('Migration note:', err.message);
        }
      }
    }

    // Insert default parameters
    await executeSQL(`
      INSERT OR IGNORE INTO system_parameters (id, interest_rate, penalty_rate_per_10k, max_loan_amount, min_loan_amount)
      VALUES (1, 6.8, 1300, 1000000, 1000)
    `);

    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
  }
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
    const result = await executeSQL(
      'INSERT INTO users (username, email, password, full_name, phone, pan_card) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, fullName, phone, panCard]
    );
    return result.lastID;
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
  createLoan: async (userId, loanAmount, loanPurpose, monthlyPayment, interestRate, comments) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 28); // Fixed 28-day term

    const result = await executeSQL(
      `INSERT INTO loans (user_id, loan_amount, outstanding_balance, monthly_payment, loan_purpose, due_date, interest_rate, comments) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, loanAmount, loanAmount, monthlyPayment, loanPurpose, dueDate.toISOString(), interestRate, comments]
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
      'INSERT INTO payments (user_id, loan_id, payment_amount, payment_type, payment_status, proof_image) VALUES (?, ?, ?, ?, ?, ?)',
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
      'INSERT INTO transactions (user_id, transaction_type, amount, description, balance_after) VALUES (?, ?, ?, ?, ?)',
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
      'INSERT INTO credit_cards (user_id, card_number, card_holder, expiry_date, cvv, card_type) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, cardNumber, cardHolder, expiryDate, cvv, cardType]
    );
    return result.lastID;
  }
};

module.exports = { db, initializeDatabase, dbHelpers, executeSQL };
