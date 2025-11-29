# Changelog

All notable changes to Nova Credit will be documented in this file.

## [2.1.0] - 2025-11-30

### Added
- **Admin Audit Logging**: Tamper-proof activity logs tracking all admin actions
  - 31-day automatic retention policy
  - Logs capture admin username, action type, before/after values, IP address, timestamp
  - Read-only access with filtering by action type, admin user, and date range
  - Automatic cleanup scheduler runs daily at midnight
- **Data Export**: Complete database backup functionality
  - Export all users, loans, payments, transactions, and system parameters
  - JSON format with metadata and statistics
  - One-click download from admin panel
- **Transaction Management**: Admin capabilities to manage transaction history
  - View all transactions across all users
  - Edit transaction type, amount, description, and date
  - Delete transactions with confirmation
  - Filter transactions by type
- **Admin-Only Interface**: Dedicated admin experience
  - Admins see only Admin and Logs sections
  - User sections (Dashboard, Loans, Payments, etc.) hidden for admins
  - Admins land directly on Admin panel
- **Filtering Enhancements**: Added filters throughout admin panel
  - Loan status filter (pending, approved, active, paid, rejected)
  - Transaction type filter
  - Log action type and admin user filters

### Changed
- **Admin Navigation**: Simplified for system management focus
- **Database Schema**: Added `admin_logs` table with foreign key constraints
- **Server Initialization**: Integrated log cleanup scheduler

### Security
- **Tamper-Proof Logs**: No API endpoints for editing or deleting logs
- **INSERT-Only Design**: Logs can only be created, never modified
- **Admin-Only Access**: All admin features require authentication and admin role verification

## [2.0.0] - 2025-11-30

### Added
- **Cloud Deployment**: Full migration to Vercel + Turso cloud infrastructure
- **Mobile Responsive Design**: Hamburger menu and optimized mobile layouts
- **Data Migration Tool**: Script to migrate local SQLite data to cloud
- **API Directory Structure**: Vercel-compatible serverless function setup
- **Cache Busting**: Version-based cache invalidation for frontend assets

### Changed
- **Database Layer**: Unified `executeSQL` helper for both SQLite and Turso
- **Authentication**: Improved JWT token handling
- **Navigation**: Mobile-first navigation with hamburger menu
- **Button Layouts**: Full-width buttons on mobile for better UX
- **Grid Layouts**: Single-column stacking on mobile devices
- **Form Inputs**: 16px font size to prevent iOS zoom

### Fixed
- **Mobile Overlapping**: Comprehensive fixes for layout issues on mobile
- **Text Overflow**: Proper word wrapping to prevent horizontal scroll
- **Table Responsiveness**: Horizontal scroll for wide tables on mobile
- **Modal Layouts**: Vertical button stacking in modals on mobile
- **Card Spacing**: Consistent spacing between cards on all devices
- **Seed Script**: Fixed missing `panCard` argument in user creation

### Deployment
- Migrated from local SQLite to Turso cloud database
- Deployed to Vercel serverless platform
- Configured environment variables for production
- Set up automatic deployments from GitHub

## [1.0.0] - 2024-11-29

### Initial Release
- User authentication and registration
- Loan application and management
- Payment processing with proof upload
- Transaction history tracking
- Admin panel for system management
- Credit card management
- Profile management
- System parameter configuration
- Local SQLite database
- Express.js backend
- Vanilla JavaScript frontend
- Responsive CSS design

---

## Version History

### Cloud Migration (v2.0.0)
The major update focused on cloud deployment and mobile optimization:
- Transitioned to serverless architecture
- Implemented cloud-native database
- Enhanced mobile user experience
- Improved deployment workflow

### Initial Development (v1.0.0)
Core features and local development setup:
- Complete loan management system
- Payment processing workflow
- Administrative controls
- User profile management
