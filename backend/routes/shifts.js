const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const {
    getAllShifts,
    getShiftById,
    getActiveShift,
    createShift,
    updateShift,
    deleteShift,
} = require('../controllers/shiftController');

/**
 * @route   GET /api/shifts
 * @desc    Get all shifts (admin: all, employee: own)
 * @access  Private
 */
router.get('/', authenticateToken, getAllShifts);

/**
 * @route   GET /api/shifts/employee/:employeeId/active
 * @desc    Get active shift for employee
 * @access  Private (own shift or admin)
 */
router.get('/employee/:employeeId/active', authenticateToken, getActiveShift);

/**
 * @route   GET /api/shifts/:id
 * @desc    Get shift by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, getShiftById);

/**
 * @route   POST /api/shifts
 * @desc    Create/assign shift
 * @access  Admin only
 */
router.post('/', authenticateToken, checkRole('admin'), createShift);

/**
 * @route   PUT /api/shifts/:id
 * @desc    Update shift
 * @access  Admin only
 */
router.put('/:id', authenticateToken, checkRole('admin'), updateShift);

/**
 * @route   DELETE /api/shifts/:id
 * @desc    Delete shift
 * @access  Admin only
 */
router.delete('/:id', authenticateToken, checkRole('admin'), deleteShift);

module.exports = router;
