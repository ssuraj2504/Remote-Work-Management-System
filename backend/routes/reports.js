const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const {
    getAllReports,
    getReportById,
    getReportsByEmployee,
    getReportsByDate,
    createReport,
    getReportsStats,
} = require('../controllers/reportController');

/**
 * @route   GET /api/reports
 * @desc    Get all reports (admin: all, employee: own)
 * @access  Private
 */
router.get('/', authenticateToken, getAllReports);

/**
 * @route   GET /api/reports/stats
 * @desc    Get reports statistics
 * @access  Admin only
 */
router.get('/stats', authenticateToken, checkRole('admin'), getReportsStats);

/**
 * @route   GET /api/reports/employee/:employeeId
 * @desc    Get reports by employee
 * @access  Admin only
 */
router.get('/employee/:employeeId', authenticateToken, checkRole('admin'), getReportsByEmployee);

/**
 * @route   GET /api/reports/date/:date
 * @desc    Get reports by date
 * @access  Admin only
 */
router.get('/date/:date', authenticateToken, checkRole('admin'), getReportsByDate);

/**
 * @route   GET /api/reports/:id
 * @desc    Get report by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, getReportById);

/**
 * @route   POST /api/reports
 * @desc    Submit daily report
 * @access  Private (employee)
 */
router.post('/', authenticateToken, createReport);

module.exports = router;
