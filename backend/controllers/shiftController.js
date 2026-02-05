const db = require('../config/database');
const { validateRequired, validateTime } = require('../utils/validation');

/**
 * Get all shifts (Admin sees all, Employee sees their own)
 * GET /api/shifts
 */
const getAllShifts = async (req, res) => {
    try {
        let query;
        let params = [];

        if (req.user.role === 'admin') {
            query = `
        SELECT s.*, u.full_name, u.email
        FROM shifts s
        LEFT JOIN users u ON s.employee_id = u.id
        ORDER BY s.created_at DESC
      `;
        } else {
            query = `
        SELECT s.*
        FROM shifts s
        WHERE s.employee_id = $1
        ORDER BY s.is_active DESC, s.created_at DESC
      `;
            params = [req.user.userId];
        }

        const result = await db.query(query, params);

        res.json({
            shifts: result.rows,
            count: result.rows.length,
        });
    } catch (error) {
        console.error('Get all shifts error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching shifts.'
        });
    }
};

/**
 * Get shift by ID
 * GET /api/shifts/:id
 */
const getShiftById = async (req, res) => {
    try {
        const { id } = req.params;
        const shiftId = parseInt(id);

        if (isNaN(shiftId)) {
            return res.status(400).json({ error: 'Invalid shift ID.' });
        }

        const result = await db.query(
            `SELECT s.*, u.full_name, u.email
       FROM shifts s
       LEFT JOIN users u ON s.employee_id = u.id
       WHERE s.id = $1`,
            [shiftId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Shift not found.'
            });
        }

        const shift = result.rows[0];

        // Employees can only view their own shifts
        if (req.user.role !== 'admin' && shift.employee_id !== req.user.userId) {
            return res.status(403).json({
                error: 'Access denied.'
            });
        }

        res.json({ shift });
    } catch (error) {
        console.error('Get shift by ID error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching shift.'
        });
    }
};

/**
 * Get active shift for an employee
 * GET /api/shifts/employee/:employeeId/active
 */
const getActiveShift = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const empId = parseInt(employeeId);

        if (isNaN(empId)) {
            return res.status(400).json({ error: 'Invalid employee ID.' });
        }

        // Employees can only view their own shift
        if (req.user.role !== 'admin' && req.user.userId !== empId) {
            return res.status(403).json({
                error: 'Access denied.'
            });
        }

        const result = await db.query(
            `SELECT s.*, u.full_name, u.email
       FROM shifts s
       LEFT JOIN users u ON s.employee_id = u.id
       WHERE s.employee_id = $1 AND s.is_active = true
       LIMIT 1`,
            [empId]
        );

        // Return null shift if not found instead of 404
        if (result.rows.length === 0) {
            return res.json({ shift: null });
        }

        res.json({ shift: result.rows[0] });
    } catch (error) {
        console.error('Get active shift error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching active shift.'
        });
    }
};

/**
 * Create/Assign shift (Admin only)
 * POST /api/shifts
 */
const createShift = async (req, res) => {
    try {
        const { employeeId, shiftStart, shiftEnd, timezone } = req.body;

        // Validate required fields
        if (!validateRequired(employeeId) || !validateRequired(shiftStart) || !validateRequired(shiftEnd)) {
            return res.status(400).json({
                error: 'Employee ID, shift start, and shift end are required.'
            });
        }

        // Validate time format
        if (!validateTime(shiftStart) || !validateTime(shiftEnd)) {
            return res.status(400).json({
                error: 'Invalid time format. Use HH:MM or HH:MM:SS format.'
            });
        }

        // Check if employee exists
        const employeeCheck = await db.query(
            'SELECT id, role FROM users WHERE id = $1',
            [employeeId]
        );

        if (employeeCheck.rows.length === 0) {
            return res.status(404).json({
                error: 'Employee not found.'
            });
        }

        if (employeeCheck.rows[0].role !== 'employee') {
            return res.status(400).json({
                error: 'Shifts can only be assigned to employees.'
            });
        }

        // Deactivate any existing active shift for this employee
        await db.query(
            'UPDATE shifts SET is_active = false WHERE employee_id = $1 AND is_active = true',
            [employeeId]
        );

        // Create new shift
        const result = await db.query(
            `INSERT INTO shifts (employee_id, shift_start, shift_end, timezone, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
            [employeeId, shiftStart, shiftEnd, timezone || 'America/New_York']
        );

        res.status(201).json({
            message: 'Shift created successfully.',
            shift: result.rows[0],
        });
    } catch (error) {
        console.error('Create shift error:', error);
        res.status(500).json({
            error: 'An error occurred while creating shift.'
        });
    }
};

/**
 * Update shift (Admin only)
 * PUT /api/shifts/:id
 */
const updateShift = async (req, res) => {
    try {
        const { id } = req.params;
        const shiftId = parseInt(id);
        const { shiftStart, shiftEnd, timezone, isActive } = req.body;

        if (isNaN(shiftId)) {
            return res.status(400).json({ error: 'Invalid shift ID.' });
        }

        // Validate time format if provided
        if (shiftStart && !validateTime(shiftStart)) {
            return res.status(400).json({
                error: 'Invalid shift start time format.'
            });
        }

        if (shiftEnd && !validateTime(shiftEnd)) {
            return res.status(400).json({
                error: 'Invalid shift end time format.'
            });
        }

        // Build update query
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (shiftStart) {
            updates.push(`shift_start = $${paramCount}`);
            values.push(shiftStart);
            paramCount++;
        }

        if (shiftEnd) {
            updates.push(`shift_end = $${paramCount}`);
            values.push(shiftEnd);
            paramCount++;
        }

        if (timezone) {
            updates.push(`timezone = $${paramCount}`);
            values.push(timezone);
            paramCount++;
        }

        if (isActive !== undefined) {
            updates.push(`is_active = $${paramCount}`);
            values.push(isActive);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'No valid fields to update.'
            });
        }

        values.push(shiftId);
        const query = `
      UPDATE shifts 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Shift not found.'
            });
        }

        res.json({
            message: 'Shift updated successfully.',
            shift: result.rows[0],
        });
    } catch (error) {
        console.error('Update shift error:', error);
        res.status(500).json({
            error: 'An error occurred while updating shift.'
        });
    }
};

/**
 * Delete shift (Admin only)
 * DELETE /api/shifts/:id
 */
const deleteShift = async (req, res) => {
    try {
        const { id } = req.params;
        const shiftId = parseInt(id);

        if (isNaN(shiftId)) {
            return res.status(400).json({ error: 'Invalid shift ID.' });
        }

        const result = await db.query(
            'DELETE FROM shifts WHERE id = $1 RETURNING id',
            [shiftId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Shift not found.'
            });
        }

        res.json({
            message: 'Shift deleted successfully.'
        });
    } catch (error) {
        console.error('Delete shift error:', error);
        res.status(500).json({
            error: 'An error occurred while deleting shift.'
        });
    }
};

module.exports = {
    getAllShifts,
    getShiftById,
    getActiveShift,
    createShift,
    updateShift,
    deleteShift,
};
