const db = require('../config/database');

/**
 * Get all users (Admin only)
 * GET /api/users
 */
const getAllUsers = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, email, full_name, role, created_at 
       FROM users 
       ORDER BY created_at DESC`
        );

        res.json({
            users: result.rows,
            count: result.rows.length,
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching users.'
        });
    }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID.' });
        }

        // Users can only view their own profile unless they're admin
        if (req.user.role !== 'admin' && req.user.userId !== userId) {
            return res.status(403).json({
                error: 'Access denied.'
            });
        }

        const result = await db.query(
            `SELECT id, email, full_name, role, created_at, updated_at 
       FROM users 
       WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found.'
            });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching user.'
        });
    }
};

/**
 * Update user profile
 * PUT /api/users/:id
 */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);
        const { fullName, email } = req.body;

        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID.' });
        }

        // Users can only update their own profile unless they're admin
        if (req.user.role !== 'admin' && req.user.userId !== userId) {
            return res.status(403).json({
                error: 'Access denied.'
            });
        }

        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (fullName) {
            updates.push(`full_name = $${paramCount}`);
            values.push(fullName.trim());
            paramCount++;
        }

        if (email && req.user.role === 'admin') {
            updates.push(`email = $${paramCount}`);
            values.push(email.trim().toLowerCase());
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'No valid fields to update.'
            });
        }

        values.push(userId);
        const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, full_name, role, updated_at
    `;

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found.'
            });
        }

        res.json({
            message: 'User updated successfully.',
            user: result.rows[0],
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            error: 'An error occurred while updating user.'
        });
    }
};

/**
 * Delete user (Admin only)
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID.' });
        }

        // Prevent deleting self
        if (req.user.userId === userId) {
            return res.status(400).json({
                error: 'Cannot delete your own account.'
            });
        }

        const result = await db.query(
            'DELETE FROM users WHERE id = $1 RETURNING id',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found.'
            });
        }

        res.json({
            message: 'User deleted successfully.'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            error: 'An error occurred while deleting user.'
        });
    }
};

/**
 * Get all employees (Admin only)
 * GET /api/users/employees
 */
const getAllEmployees = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.id, u.email, u.full_name, u.created_at,
              s.shift_start, s.shift_end, s.timezone,
              COUNT(DISTINCT t.id) as total_tasks,
              COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks
       FROM users u
       LEFT JOIN shifts s ON u.id = s.employee_id AND s.is_active = true
       LEFT JOIN tasks t ON u.id = t.assigned_to
       WHERE u.role = 'employee'
       GROUP BY u.id, u.email, u.full_name, u.created_at, s.shift_start, s.shift_end, s.timezone
       ORDER BY u.full_name`
        );

        res.json({
            employees: result.rows,
            count: result.rows.length,
        });
    } catch (error) {
        console.error('Get all employees error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching employees.'
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllEmployees,
};
