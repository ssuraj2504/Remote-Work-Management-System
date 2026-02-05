const db = require('../config/database');
const { validateRequired } = require('../utils/validation');

/**
 * Get all reports (Admin sees all, Employee sees their own)
 * GET /api/reports
 */
const getAllReports = async (req, res) => {
    try {
        let query;
        let params = [];

        if (req.user.role === 'admin') {
            query = `
        SELECT dr.*, 
               u.full_name as employee_name,
               u.email as employee_email,
               t.title as task_title
        FROM daily_reports dr
        LEFT JOIN users u ON dr.employee_id = u.id
        LEFT JOIN tasks t ON dr.task_id = t.id
        ORDER BY dr.report_date DESC, dr.created_at DESC
      `;
        } else {
            query = `
        SELECT dr.*, 
               t.title as task_title
        FROM daily_reports dr
        LEFT JOIN tasks t ON dr.task_id = t.id
        WHERE dr.employee_id = $1
        ORDER BY dr.report_date DESC, dr.created_at DESC
      `;
            params = [req.user.userId];
        }

        const result = await db.query(query, params);

        res.json({
            reports: result.rows,
            count: result.rows.length,
        });
    } catch (error) {
        console.error('Get all reports error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching reports.'
        });
    }
};

/**
 * Get report by ID
 * GET /api/reports/:id
 */
const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const reportId = parseInt(id);

        if (isNaN(reportId)) {
            return res.status(400).json({ error: 'Invalid report ID.' });
        }

        const result = await db.query(
            `SELECT dr.*, 
              u.full_name as employee_name,
              u.email as employee_email,
              t.title as task_title,
              t.description as task_description
       FROM daily_reports dr
       LEFT JOIN users u ON dr.employee_id = u.id
       LEFT JOIN tasks t ON dr.task_id = t.id
       WHERE dr.id = $1`,
            [reportId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Report not found.'
            });
        }

        const report = result.rows[0];

        // Employees can only view their own reports
        if (req.user.role !== 'admin' && report.employee_id !== req.user.userId) {
            return res.status(403).json({
                error: 'Access denied.'
            });
        }

        res.json({ report });
    } catch (error) {
        console.error('Get report by ID error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching report.'
        });
    }
};

/**
 * Get reports by employee (Admin only)
 * GET /api/reports/employee/:employeeId
 */
const getReportsByEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const empId = parseInt(employeeId);

        if (isNaN(empId)) {
            return res.status(400).json({ error: 'Invalid employee ID.' });
        }

        const result = await db.query(
            `SELECT dr.*, 
              u.full_name as employee_name,
              u.email as employee_email,
              t.title as task_title
       FROM daily_reports dr
       LEFT JOIN users u ON dr.employee_id = u.id
       LEFT JOIN tasks t ON dr.task_id = t.id
       WHERE dr.employee_id = $1
       ORDER BY dr.report_date DESC`,
            [empId]
        );

        res.json({
            reports: result.rows,
            count: result.rows.length,
        });
    } catch (error) {
        console.error('Get reports by employee error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching reports.'
        });
    }
};

/**
 * Get reports by date (Admin only)
 * GET /api/reports/date/:date
 */
const getReportsByDate = async (req, res) => {
    try {
        const { date } = req.params;

        const result = await db.query(
            `SELECT dr.*, 
              u.full_name as employee_name,
              u.email as employee_email,
              t.title as task_title
       FROM daily_reports dr
       LEFT JOIN users u ON dr.employee_id = u.id
       LEFT JOIN tasks t ON dr.task_id = t.id
       WHERE dr.report_date = $1
       ORDER BY dr.created_at DESC`,
            [date]
        );

        res.json({
            reports: result.rows,
            count: result.rows.length,
        });
    } catch (error) {
        console.error('Get reports by date error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching reports.'
        });
    }
};

/**
 * Submit daily report (Employee)
 * POST /api/reports
 */
const createReport = async (req, res) => {
    try {
        const { taskId, workDescription, timeSpent, reportDate } = req.body;

        // Validate required fields
        if (!validateRequired(taskId) || !validateRequired(workDescription) || !validateRequired(timeSpent)) {
            return res.status(400).json({
                error: 'Task ID, work description, and time spent are required.'
            });
        }

        // Validate time spent is a positive number
        const timeSpentNum = parseInt(timeSpent);
        if (isNaN(timeSpentNum) || timeSpentNum <= 0) {
            return res.status(400).json({
                error: 'Time spent must be a positive number (in minutes).'
            });
        }

        // Check if task exists and is assigned to user
        const taskCheck = await db.query(
            'SELECT assigned_to FROM tasks WHERE id = $1',
            [taskId]
        );

        if (taskCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        // Employees can only submit reports for tasks assigned to them
        if (req.user.role !== 'admin' && taskCheck.rows[0].assigned_to !== req.user.userId) {
            return res.status(403).json({
                error: 'You can only submit reports for tasks assigned to you.'
            });
        }

        const employeeId = req.user.role === 'admin' ? taskCheck.rows[0].assigned_to : req.user.userId;
        const dateToUse = reportDate || new Date().toISOString().split('T')[0];

        // Check if report already exists for this task on this date
        const existingReport = await db.query(
            'SELECT id FROM daily_reports WHERE employee_id = $1 AND task_id = $2 AND report_date = $3',
            [employeeId, taskId, dateToUse]
        );

        if (existingReport.rows.length > 0) {
            return res.status(409).json({
                error: 'A report for this task on this date already exists.'
            });
        }

        // Create report
        const result = await db.query(
            `INSERT INTO daily_reports (employee_id, task_id, report_date, work_description, time_spent)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [employeeId, taskId, dateToUse, workDescription.trim(), timeSpentNum]
        );

        res.status(201).json({
            message: 'Daily report submitted successfully.',
            report: result.rows[0],
        });
    } catch (error) {
        console.error('Create report error:', error);

        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'A report for this task on this date already exists.'
            });
        }

        res.status(500).json({
            error: 'An error occurred while submitting report.'
        });
    }
};

/**
 * Get reports summary/statistics (Admin only)
 * GET /api/reports/stats
 */
const getReportsStats = async (req, res) => {
    try {
        const result = await db.query(`
      SELECT 
        COUNT(*) as total_reports,
        COUNT(DISTINCT employee_id) as active_employees,
        COUNT(DISTINCT task_id) as tasks_reported_on,
        SUM(time_spent) as total_time_spent,
        AVG(time_spent) as avg_time_spent,
        MAX(report_date) as latest_report_date
      FROM daily_reports
    `);

        res.json({
            statistics: result.rows[0],
        });
    } catch (error) {
        console.error('Get reports stats error:', error);
        res.status(500).json({
            error: 'An error occurred while fetching statistics.'
        });
    }
};

module.exports = {
    getAllReports,
    getReportById,
    getReportsByEmployee,
    getReportsByDate,
    createReport,
    getReportsStats,
};
