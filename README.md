# Nova Credit - Payment Management System

A modern, cloud-native credit card and loan management system with real-time payment processing, transaction tracking, and administrative controls.

## 🚀 Features

### User Features
- **Loan Management**: Apply for loans, track applications, view loan details
- **Payment Processing**: Submit payments with proof of payment, track payment history
- **Transaction History**: View all financial transactions with detailed breakdowns
- **Profile Management**: Update personal information, manage credit cards
- **Credit Score Tracking**: Monitor credit score and credit limit
- **Responsive Design**: Fully optimized for mobile and desktop devices

### Admin Features
- **User Management**: View and manage all user accounts
- **Loan Approval**: Review and approve/reject loan applications
- **Payment Verification**: Approve pending payments with proof verification
- **System Parameters**: Configure interest rates, loan limits, and penalty rates
- **Comprehensive Dashboard**: Monitor all system activities

## 🛠️ Technology Stack

### Frontend
- **HTML5/CSS3**: Modern, responsive UI with gradient designs
- **JavaScript (ES6+)**: Vanilla JS for optimal performance
- **CSS Grid & Flexbox**: Responsive layouts
- **Custom Components**: Reusable UI components

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **JWT**: Secure authentication
- **bcryptjs**: Password hashing

### Database
- **Turso (LibSQL)**: Cloud-native SQLite database
- **Local SQLite**: Development fallback

### Deployment
- **Vercel**: Serverless hosting platform
- **GitHub**: Version control and CI/CD

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/balichak-suman/loan-management.git
   cd loan-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # For cloud deployment (Turso)
   TURSO_DATABASE_URL=your_turso_database_url
   TURSO_AUTH_TOKEN=your_turso_auth_token
   
   # JWT Secret
   JWT_SECRET=your_secret_key
   
   # Port (optional, defaults to 3000)
   PORT=3000
   ```

4. **Run the application**
   ```bash
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## 🌐 Cloud Deployment

### Deploying to Vercel + Turso

1. **Set up Turso Database**
   ```bash
   # Install Turso CLI
   brew install tursodatabase/tap/turso
   
   # Login to Turso
   turso auth login
   
   # Create database
   turso db create nova-credit-db
   
   # Get database URL
   turso db show nova-credit-db --url
   
   # Create auth token
   turso db tokens create nova-credit-db
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel deploy --prod
   ```

3. **Configure Environment Variables in Vercel**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add:
     - `TURSO_DATABASE_URL`
     - `TURSO_AUTH_TOKEN`
     - `JWT_SECRET`

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📱 Mobile Optimization

The application is fully responsive with:
- **Hamburger Menu**: Collapsible navigation on mobile devices
- **Touch-Friendly**: Optimized button sizes and spacing
- **Adaptive Layouts**: Single-column layouts on small screens
- **No Horizontal Scroll**: All content fits within viewport
- **Fast Loading**: Optimized assets and lazy loading

## 🔐 Default Credentials

### Regular User
- **Username**: `balichaksuman`
- **Password**: `Chandana@12345`

### Admin User
- **Username**: `kali`
- **Password**: `kali`

**⚠️ Important**: Change these credentials in production!

## 📊 Database Schema

### Tables
- **users**: User accounts and authentication
- **credit_cards**: User credit card information
- **loans**: Loan applications and details
- **payments**: Payment records and history
- **transactions**: Financial transaction log
- **system_parameters**: Configurable system settings

## 🔧 Configuration

### System Parameters (Admin Only)
- **Interest Rate**: Default loan interest rate
- **Penalty Rate**: Late payment penalty per ₹10,000
- **Max Loan Amount**: Maximum loan limit
- **Min Loan Amount**: Minimum loan amount

## 📁 Project Structure

```
nova-credit/
├── public/                 # Frontend assets
│   ├── css/
│   │   ├── styles.css     # Main styles
│   │   └── components.css # Component styles
│   ├── js/
│   │   ├── main.js        # App initialization
│   │   ├── auth.js        # Authentication
│   │   ├── dashboard.js   # Dashboard logic
│   │   ├── loans.js       # Loan management
│   │   ├── payments.js    # Payment processing
│   │   ├── transactions.js# Transaction history
│   │   ├── profile.js     # User profile
│   │   ├── admin.js       # Admin panel
│   │   └── utils.js       # Utility functions
│   └── index.html         # Main HTML file
├── api/
│   └── index.js           # Vercel serverless entry
├── server.js              # Express server
├── database.js            # Database layer
├── auth.js                # Authentication logic
├── loans.js               # Loan routes
├── payments.js            # Payment routes
├── transactions.js        # Transaction routes
├── profile.js             # Profile routes
├── admin.js               # Admin routes
├── seed.js                # Database seeding
├── vercel.json            # Vercel configuration
├── package.json           # Dependencies
└── README.md              # This file
```

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Loans
- `GET /api/loans` - Get user loans
- `POST /api/loans/apply` - Apply for loan
- `GET /api/loans/:id` - Get loan details
- `POST /api/loans/:id/approve` - Approve loan (Admin)

### Payments
- `POST /api/payments` - Submit payment
- `GET /api/payments/history` - Payment history
- `GET /api/payments/pending` - Pending payments

### Transactions
- `GET /api/transactions` - Get transactions
- `GET /api/transactions/stats` - Transaction statistics

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/cards` - Get credit cards

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/loans` - Get all loans
- `GET /api/admin/payments/pending` - Pending payments
- `POST /api/admin/payments/:id/approve` - Approve payment

## 🧪 Testing

### Manual Testing
1. Register a new user
2. Apply for a loan
3. Submit a payment with proof
4. Login as admin and approve

### Database Migration
To migrate local data to cloud:
```bash
node migrate-data.js
```

## 🔄 Data Migration

The project includes a migration script to transfer data from local SQLite to Turso cloud database:

```bash
node migrate-data.js
```

This will migrate:
- All user accounts
- Credit cards
- Loans and applications
- Payment history
- Transactions
- System parameters

## 🐛 Troubleshooting

### Common Issues

**Issue**: Login fails with "Failed to fetch"
- **Solution**: Check if API_BASE_URL is correct in `main.js`

**Issue**: Database not initialized
- **Solution**: Ensure environment variables are set correctly

**Issue**: Mobile menu not showing
- **Solution**: Clear browser cache and hard refresh

**Issue**: Deployment fails on Vercel
- **Solution**: Check environment variables in Vercel dashboard

## 📝 License

MIT License - See LICENSE file for details

## 👥 Contributors

- Balichaksuman - Initial development

## 🙏 Acknowledgments

- Turso for cloud SQLite database
- Vercel for serverless hosting
- Express.js community

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/balichak-suman/loan-management/issues)
- Email: balichaksuman@novacredit.com

## 🔮 Future Enhancements

- [ ] Email notifications
- [ ] SMS alerts for payments
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support
- [ ] Automated credit score calculation
- [ ] Document upload for KYC
- [ ] Two-factor authentication
- [ ] Export reports to PDF

---

**Built with ❤️ using modern web technologies**
