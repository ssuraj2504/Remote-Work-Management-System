const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
} = require('../controllers/taskController');

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks (admin: all, employee: assigned)
 * @access  Private
 */
router.get('/', authenticateToken, getAllTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, getTaskById);

/**
 * @route   POST /api/tasks
 * @desc    Create new task
 * @access  Admin only
 */
router.post('/', authenticateToken, checkRole('admin'), createTask);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Private (admin: all fields, employee: status only)
 */
router.put('/:id', authenticateToken, updateTask);

/**
 * @route   PATCH /api/tasks/:id/status
 * @desc    Update task status
 * @access  Private (assigned employee or admin)
 */
router.patch('/:id/status', authenticateToken, updateTaskStatus);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Admin only
 */
router.delete('/:id', authenticateToken, checkRole('admin'), deleteTask);

module.exports = router;
