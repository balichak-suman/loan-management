const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbHelpers } = require('./database');

const JWT_SECRET = 'nova-credit-secret-key-2024'; // In production, use environment variable
const JWT_EXPIRY = '7d';

// Register new user
async function register(req, res) {
    try {
        const { username, email, password, fullName, phone, panCard, cardNumber, expiryDate, cvv } = req.body;

        // Validate input
        if (!username || !email || !password || !fullName || !panCard || !cardNumber || !expiryDate || !cvv) {
            return res.status(400).json({ error: 'All fields including PAN and Credit Card details are required' });
        }

        // Check if user already exists
        const existingUser = await dbHelpers.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this username' });
        }

        const existingEmail = await dbHelpers.getUserByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = await dbHelpers.createUser(username, email, hashedPassword, fullName, phone, panCard);

        // Generate JWT token
        const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

        // Create credit card for the user
        await dbHelpers.createCreditCard(
            userId,
            cardNumber,
            fullName,
            expiryDate,
            cvv,
            'VISA' // Defaulting to VISA for now, could be inferred
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: userId,
                username,
                email,
                fullName,
                phone
            }
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

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, username: user.username, isAdmin: user.is_admin === 1 }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

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
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
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

module.exports = { register, login, authenticateToken };
