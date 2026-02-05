const db = require('../config/database');
const { validateRequired, validateEnum, validateDate } = require('../utils/validation');

/**
 * Get all tasks (Admin sees all, Employee sees assigned tasks)
 * GET /api/tasks
 */
const getAllTasks = async (req, res) => {
    try {
        let query;
        let params = [];

        if (req.user.role === 'admin') {
            // Admin sees all tasks
            query = `
        SELECT t.*, 
               u.full_name as assigned_to_name,
               u.email as assigned_to_email,
               c.full_name as created_by_name,
               s.shift_start, s.shift_end, s.timezone
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        LEFT JOIN users c ON t.created_by = c.id
        LEFT JOIN shifts s ON t.shift_id = s.id
        ORDER BY t.created_at DESC
      `;
        } else {
            // Employee sees only assigned tasks
            query = `
        SELECT t.*, 
               c.full_name as created_by_name,
               s.shift_start, s.shift_end, s.timezone
        FROM tasks t
        LEFT JOIN users c ON t.created_by = c.id
        LEFT JOIN shifts s ON t.shift_id = s.id
        WHERE t.assigned_to = $1
        ORDER BY t.due_date ASC
      `;
            params = [req.user.userId];
        }

        const result = await db.query(query, params);

        res.json({
            tasks: result.rows,
            count: result.rows.length,
        });
    } catch (error) {
        console.error('Get all tasks error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching tasks.'
        });
    }
};

/**
 * Get task by ID
 * GET /api/tasks/:id
 */
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const taskId = parseInt(id);

        if (isNaN(taskId)) {
            return res.status(400).json({ error: 'Invalid task ID.' });
        }

        const result = await db.query(
            `SELECT t.*, 
              u.full_name as assigned_to_name,
              u.email as assigned_to_email,
              c.full_name as created_by_name,
              s.shift_start, s.shift_end, s.timezone
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN users c ON t.created_by = c.id
       LEFT JOIN shifts s ON t.shift_id = s.id
       WHERE t.id = $1`,
            [taskId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Task not found.'
            });
        }

        const task = result.rows[0];

        // Employees can only view tasks assigned to them
        if (req.user.role !== 'admin' && task.assigned_to !== req.user.userId) {
            return res.status(403).json({
                error: 'Access denied.'
            });
        }

        res.json({ task });
    } catch (error) {
        console.error('Get task by ID error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching task.'
        });
    }
};

/**
 * Create new task (Admin only)
 * POST /api/tasks
 */
const createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, priority, dueDate, shiftId } = req.body;

        // Validate required fields
        if (!validateRequired(title)) {
            return res.status(400).json({
                error: 'Task title is required.'
            });
        }

        // Validate priority if provided
        if (priority && !validateEnum(priority, ['low', 'medium', 'high'])) {
            return res.status(400).json({
                error: 'Invalid priority. Must be low, medium, or high.'
            });
        }

        // Validate due date if provided
        if (dueDate && !validateDate(dueDate)) {
            return res.status(400).json({
                error: 'Invalid due date format.'
            });
        }

        const result = await db.query(
            `INSERT INTO tasks (title, description, assigned_to, created_by, priority, due_date, shift_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [
                title.trim(),
                description ? description.trim() : null,
                assignedTo || null,
                req.user.userId,
                priority || 'medium',
                dueDate || null,
                shiftId || null,
            ]
        );

        res.status(201).json({
            message: 'Task created successfully.',
            task: result.rows[0],
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({
            error: 'An error occurred while creating task.'
        });
    }
};

/**
 * Update task (Admin can update all fields, Employee can update status only)
 * PUT /api/tasks/:id
 */
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const taskId = parseInt(id);

        if (isNaN(taskId)) {
            return res.status(400).json({ error: 'Invalid task ID.' });
        }

        // Check if task exists and user has permission
        const taskCheck = await db.query(
            'SELECT * FROM tasks WHERE id = $1',
            [taskId]
        );

        if (taskCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        const existingTask = taskCheck.rows[0];

        // Employees can only update tasks assigned to them
        if (req.user.role !== 'admin' && existingTask.assigned_to !== req.user.userId) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        const { title, description, assignedTo, priority, status, dueDate, shiftId } = req.body;

        // Build update query
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (req.user.role === 'admin') {
            // Admin can update all fields
            if (title) {
                updates.push(`title = $${paramCount}`);
                values.push(title.trim());
                paramCount++;
            }
            if (description !== undefined) {
                updates.push(`description = $${paramCount}`);
                values.push(description ? description.trim() : null);
                paramCount++;
            }
            if (assignedTo !== undefined) {
                updates.push(`assigned_to = $${paramCount}`);
                values.push(assignedTo);
                paramCount++;
            }
            if (priority && validateEnum(priority, ['low', 'medium', 'high'])) {
                updates.push(`priority = $${paramCount}`);
                values.push(priority);
                paramCount++;
            }
            if (dueDate !== undefined) {
                updates.push(`due_date = $${paramCount}`);
                values.push(dueDate);
                paramCount++;
            }
            if (shiftId !== undefined) {
                updates.push(`shift_id = $${paramCount}`);
                values.push(shiftId);
                paramCount++;
            }
        }

        // Both admin and employee can update status
        if (status && validateEnum(status, ['pending', 'in_progress', 'completed'])) {
            updates.push(`status = $${paramCount}`);
            values.push(status);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'No valid fields to update.'
            });
        }

        values.push(taskId);
        const query = `
      UPDATE tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

        const result = await db.query(query, values);

        res.json({
            message: 'Task updated successfully.',
            task: result.rows[0],
        });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({
            error: 'An error occurred while updating task.'
        });
    }
};

/**
 * Update task status (Employee friendly endpoint)
 * PATCH /api/tasks/:id/status
 */
const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const taskId = parseInt(id);

        if (isNaN(taskId)) {
            return res.status(400).json({ error: 'Invalid task ID.' });
        }

        if (!validateEnum(status, ['pending', 'in_progress', 'completed'])) {
            return res.status(400).json({
                error: 'Invalid status. Must be pending, in_progress, or completed.'
            });
        }

        // Check if task is assigned to user
        const taskCheck = await db.query(
            'SELECT assigned_to FROM tasks WHERE id = $1',
            [taskId]
        );

        if (taskCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        if (req.user.role !== 'admin' && taskCheck.rows[0].assigned_to !== req.user.userId) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        const result = await db.query(
            'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
            [status, taskId]
        );

        res.json({
            message: 'Task status updated successfully.',
            task: result.rows[0],
        });
    } catch (error) {
        console.error('Update task status error:', error);
        res.status(500).json({
            error: 'An error occurred while updating task status.'
        });
    }
};

/**
 * Delete task (Admin only)
 * DELETE /api/tasks/:id
 */
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const taskId = parseInt(id);

        if (isNaN(taskId)) {
            return res.status(400).json({ error: 'Invalid task ID.' });
        }

        const result = await db.query(
            'DELETE FROM tasks WHERE id = $1 RETURNING id',
            [taskId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Task not found.'
            });
        }

        res.json({
            message: 'Task deleted successfully.'
        });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({
            error: 'An error occurred while deleting task.'
        });
    }
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
};
