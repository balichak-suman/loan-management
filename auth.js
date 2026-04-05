const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbHelpers, executeSQL } = require('./database');
const { sendOTP } = require('./email');

// In-memory OTP store (In production, use Redis or DB with expiry)
const otpStore = new Map();

const JWT_SECRET = process.env.JWT_SECRET || 'nova-credit-secret-key-2024';
const JWT_EXPIRY = '7d';

// ... (requestRegistrationOTP and verifyRegistrationOTP remain the same)

// Login user
async function login(req, res) {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Get user
        let user;
        try {
            user = await dbHelpers.getUserByUsername(username);
        } catch (dbError) {
            console.error('Database error during login:', dbError.message);
            return res.status(500).json({ error: 'Database connection failed' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Verify password
        let isValidPassword = false;
        try {
            isValidPassword = await bcrypt.compare(password, user.password);
        } catch (bcryptError) {
            console.error('Bcrypt error during login:', bcryptError.message);
            return res.status(500).json({ error: 'Password verification failed' });
        }

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username, isAdmin: user.is_admin === 1 },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                phone: user.phone,
                creditScore: user.credit_score,
                isAdmin: user.is_admin === 1
            }
        });
    } catch (error) {
        console.error('Fatal Login error:', error.message, error.stack);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
}


// Forgot Password Step 1: Request Reset OTP
async function requestPasswordResetOTP(req, res) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const user = await dbHelpers.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found with this email' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(`reset_${email}`, { otp, timestamp: Date.now() });

        console.log('Password Reset OTP for', email, ':', otp);
        await sendOTP(email, otp);

        res.json({ success: true, message: 'Reset OTP sent to your email' });
    } catch (error) {
        console.error('Reset OTP request error:', error);
        res.status(500).json({ error: 'Failed to send reset OTP' });
    }
}

// Forgot Password Step 2: Verify Reset OTP
async function verifyPasswordResetOTP(req, res) {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

        const stored = otpStore.get(`reset_${email}`);
        if (!stored || stored.otp !== otp || (Date.now() - stored.timestamp) > 600000) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        res.json({ success: true, message: 'OTP verified, you can now reset your password' });
    } catch (error) {
        console.error('Reset OTP verify error:', error);
        res.status(500).json({ error: 'Failed to verify reset OTP' });
    }
}

// Forgot Password Step 3: Reset Password
async function resetPassword(req, res) {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const stored = otpStore.get(`reset_${email}`);
        if (!stored || stored.otp !== otp || (Date.now() - stored.timestamp) > 600000) {
            return res.status(400).json({ error: 'Session expired or invalid. Please start over.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await executeSQL('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

        otpStore.delete(`reset_${email}`);

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Helper functions
function generateCardNumber() {
    // Generate a random 16-digit card number
    const prefix = '4532'; // VISA prefix
    let cardNumber = prefix;
    for (let i = 0; i < 12; i++) {
        cardNumber += Math.floor(Math.random() * 10);
    }
    return cardNumber;
}

function generateExpiryDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 3);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${year}`;
}

function generateCVV() {
    return String(Math.floor(Math.random() * 900) + 100);
}

module.exports = {
    register,
    login,
    authenticateToken,
    requestRegistrationOTP,
    verifyRegistrationOTP,
    requestPasswordResetOTP,
    verifyPasswordResetOTP,
    resetPassword
};
