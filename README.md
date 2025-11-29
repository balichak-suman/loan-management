# Nova Credit - Payment Management System

A modern, full-stack credit card and payment management system with loan applications, payment tracking, and transaction history.

## Features

### 🏦 Loan Management
- Apply for loans with customizable amounts and tenure
- Interactive loan calculator with real-time calculations
- View all loans with detailed status tracking
- Automatic loan approval system

### 💳 Payment Processing
- View all pending loans with amounts due
- Make payments with flexible amount options
- Automatic penalty calculation for overdue payments
- Payment history tracking

### 📊 Dashboard
- Overview of financial status
- Credit score display
- Active loans summary
- Recent transactions

### 📜 Transaction History
- Complete transaction log
- Search and filter functionality
- Export to CSV
- Transaction statistics

### 👤 User Profile
- Personal information management
- Credit card display with animated visuals
- Credit score tracking
- Loan summary statistics

## Interest & Penalty Calculations

### Interest Rate
- **6% per month** (compounded monthly)
- Formula: `Final Amount = Principal × (1 + 0.06)^months`

### Late Payment Penalty
- **₹1,300 per ₹10,000 per day**
- Formula: `Penalty = Outstanding Balance × 0.13 × Days Overdue`

> ⚠️ **Note**: These rates are for demonstration purposes only and are unrealistic for actual financial products.

## Technology Stack

### Backend
- **Node.js** with Express
- **SQLite** database
- **JWT** authentication
- **bcrypt** password hashing

### Frontend
- **Vanilla JavaScript** (no frameworks)
- **Modern CSS** with glassmorphism effects
- **Responsive design**
- **Smooth animations**

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the server**
   ```bash
   npm start
   ```

3. **Open your browser**
   ```
   http://localhost:3000
   ```

## Project Structure

```
nova-credit/
├── server.js           # Express server
├── database.js         # SQLite database setup
├── auth.js            # Authentication logic
├── loans.js           # Loan management
├── payments.js        # Payment processing
├── transactions.js    # Transaction history
├── profile.js         # User profile
├── public/
│   ├── index.html     # Main HTML
│   ├── css/
│   │   ├── styles.css      # Design system
│   │   └── components.css  # Component styles
│   └── js/
│       ├── app.js          # Main app logic
│       ├── auth.js         # Authentication UI
│       ├── dashboard.js    # Dashboard page
│       ├── loans.js        # Loans page
│       ├── payments.js     # Payments page
│       ├── transactions.js # Transactions page
│       ├── profile.js      # Profile page
│       └── utils.js        # Utility functions
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Loans
- `POST /api/loans/apply` - Apply for loan
- `GET /api/loans` - Get all user loans
- `GET /api/loans/:id` - Get loan details
- `POST /api/loans/:id/approve` - Approve loan

### Payments
- `POST /api/payments` - Make payment
- `GET /api/payments` - Get payment history
- `GET /api/payments/pending` - Get pending payments

### Transactions
- `GET /api/transactions` - Get transaction history
- `GET /api/transactions/stats` - Get transaction statistics

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/cards` - Get credit cards

## Usage

1. **Register** a new account or **login** with existing credentials
2. **Apply for a loan** from the Loans page
3. **Approve the loan** (auto-approval in demo)
4. **View pending payments** on the Payments page
5. **Make payments** to reduce outstanding balance
6. **Track transactions** in the Transactions page
7. **Manage profile** and view credit score

## Design Features

- 🎨 Premium gradient color scheme
- ✨ Glassmorphism effects
- 🌊 Smooth animations and transitions
- 📱 Fully responsive design
- 🌙 Dark mode optimized
- 💫 Interactive UI elements

## Security

- Passwords hashed with bcrypt
- JWT-based authentication
- Protected API routes
- Input validation
- SQL injection prevention

## License

MIT License - This is a demonstration project

## Author

Built with ❤️ for Nova Credit
