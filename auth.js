const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbHelpers, executeSQL } = require('./database');
const { sendOTP } = require('./email');

// In-memory OTP store (In production, use Redis or DB with expiry)
const otpStore = new Map();

const JWT_SECRET = 'nova-credit-secret-key-2024'; // In production, use environment variable
const JWT_EXPIRY = '7d';

// Step 1: Request Registration OTP
async function requestRegistrationOTP(req, res) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        // Check if user already exists
        const existingEmail = await dbHelpers.getUserByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(email, { otp, timestamp: Date.now() });

        console.log('Verification OTP for', email, ':', otp);
        await sendOTP(email, otp);
        res.json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
        console.error('OTP request error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
}

// Step 2: Verify Registration OTP (to proceed in UI)
async function verifyRegistrationOTP(req, res) {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

        const stored = otpStore.get(email);
        if (!stored || stored.otp !== otp || (Date.now() - stored.timestamp) > 600000) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        res.json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        console.error('OTP verify error:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
}

// Register new user with OTP verification
async function register(req, res) {
    try {
        const { username, email, password, fullName, phone, panCard, otp } = req.body;

        // Validate input
        if (!username || !email || !password || !fullName || !panCard || !otp) {
            return res.status(400).json({ error: 'All fields including OTP are required' });
        }

        // Verify OTP
        const stored = otpStore.get(email);
        if (!stored || stored.otp !== otp || (Date.now() - stored.timestamp) > 600000) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Check if user already exists
        const existingUser = await dbHelpers.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this username' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = await dbHelpers.createUser(username, email, hashedPassword, fullName, phone, panCard);

        // Generate JWT token
        const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

        // Create credit card for the user (auto-generated)
        const cardNumber = generateCardNumber();
        const expiryDate = generateExpiryDate();
        const cvv = generateCVV();

        await dbHelpers.createCreditCard(
            userId,
            cardNumber,
            fullName,
            expiryDate,
            cvv,
            'VISA'
        );

        // Clear OTP
        otpStore.delete(email);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: { id: userId, username, email, fullName, phone }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Login user
async function login(req, res) {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Get user
        const user = await dbHelpers.getUserByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Instead of issuing token, send OTP for login verification
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(user.email, { otp, timestamp: Date.now(), userId: user.id, username: user.username, isAdmin: user.is_admin === 1 });

        console.log('Login OTP for', user.email, ':', otp);
        await sendOTP(user.email, otp);

        res.json({
            success: true,
            otpRequired: true,
            email: user.email,
            message: 'OTP sent to your email for login'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Step 2: Verify Login OTP
async function verifyLoginOTP(req, res) {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

        const stored = otpStore.get(email);
        if (!stored || stored.otp !== otp || (Date.now() - stored.timestamp) > 600000) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: stored.userId, username: stored.username, isAdmin: stored.isAdmin }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

        // Get full user data for frontend
        const user = await dbHelpers.getUserById(stored.userId);

        // Clear OTP
        otpStore.delete(email);

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
        console.error('Login OTP verify error:', error);
        res.status(500).json({ error: 'Failed to verify login OTP' });
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
    verifyLoginOTP,
    authenticateToken,
    requestRegistrationOTP,
    verifyRegistrationOTP,
    requestPasswordResetOTP,
    verifyPasswordResetOTP,
    resetPassword
};
