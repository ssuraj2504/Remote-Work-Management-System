const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { validateEmail, validatePassword, validateRequired, sanitizeInput } = require('../utils/validation');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { email, password, fullName, role } = req.body;

        // Validate inputs
        if (!validateRequired(email) || !validateRequired(password) || !validateRequired(fullName)) {
            return res.status(400).json({
                error: 'Email, password, and full name are required.'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                error: 'Invalid email format.'
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long.'
            });
        }

        // Sanitize inputs
        const sanitizedEmail = sanitizeInput(email).toLowerCase();
        const sanitizedFullName = sanitizeInput(fullName);
        const userRole = role && ['admin', 'employee'].includes(role) ? role : 'employee';

        // Check if user already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [sanitizedEmail]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: 'User with this email already exists.'
            });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await db.query(
            `INSERT INTO users (email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, full_name, role, created_at`,
            [sanitizedEmail, passwordHash, sanitizedFullName, userRole]
        );

        const newUser = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: newUser.id,
                email: newUser.email,
                role: newUser.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully.',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                fullName: newUser.full_name,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            error: 'An error occurred during registration.'
        });
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate inputs
        if (!validateRequired(email) || !validateRequired(password)) {
            return res.status(400).json({
                error: 'Email and password are required.'
            });
        }

        if (!validateEmail(email)) {
            return res.status(400).json({
                error: 'Invalid email format.'
            });
        }

        // Sanitize email
        const sanitizedEmail = sanitizeInput(email).toLowerCase();

        // Find user
        const result = await db.query(
            'SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1',
            [sanitizedEmail]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid email or password.'
            });
        }

        const user = result.rows[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid email or password.'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'An error occurred during login.'
        });
    }
};

module.exports = {
    register,
    login,
};
