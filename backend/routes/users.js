const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllEmployees,
} = require('../controllers/userController');

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Admin only
 */
router.get('/', authenticateToken, checkRole('admin'), getAllUsers);

/**
 * @route   GET /api/users/employees
 * @desc    Get all employees with their statistics
 * @access  Admin only
 */
router.get('/employees', authenticateToken, checkRole('admin'), getAllEmployees);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (own profile or admin)
 */
router.get('/:id', authenticateToken, getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private (own profile or admin)
 */
router.put('/:id', authenticateToken, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Admin only
 */
router.delete('/:id', authenticateToken, checkRole('admin'), deleteUser);

module.exports = router;
