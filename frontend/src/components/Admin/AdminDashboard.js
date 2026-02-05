import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import { userAPI, taskAPI, reportAPI } from '../../services/api';
import TaskStatusChart from '../Charts/TaskStatusChart';
import TaskPriorityChart from '../Charts/TaskPriorityChart';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100
        }
    }
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        totalReports: 0,
    });
    const [tasks, setTasks] = useState([]);
    const [recentReports, setRecentReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [employeesRes, tasksRes, reportsRes, statsRes] = await Promise.all([
                userAPI.getAllEmployees(),
                taskAPI.getAllTasks(),
                reportAPI.getAllReports(),
                reportAPI.getReportsStats(),
            ]);

            const tasks = tasksRes.data.tasks;
            const employees = employeesRes.data.employees;
            const reports = reportsRes.data.reports;

            setTasks(tasks || []);

            setStats({
                totalEmployees: employees.length,
                totalTasks: tasks.length,
                pendingTasks: tasks.filter(t => t.status === 'pending').length,
                inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
                completedTasks: tasks.filter(t => t.status === 'completed').length,
                totalReports: statsRes.data.statistics.total_reports || 0,
            });

            setRecentReports(reports.slice(0, 5));
        } catch (err) {
            setError('Failed to fetch dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Navbar />
                <div className="dashboard-content">
                    <Sidebar role="admin" />
                    <main className="main-content">
                        <div className="loading">Loading dashboard...</div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-content">
                <Sidebar role="admin" />
                <motion.main
                    className="main-content"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.div className="page-header" variants={itemVariants}>
                        <div>
                            <h1>Admin Dashboard</h1>
                            <p>Overview of all activities and metrics</p>
                        </div>
                    </motion.div>

                    {error && (
                        <motion.div
                            className="error-message"
                            variants={itemVariants}
                        >
                            {error}
                        </motion.div>
                    )}

                    <motion.div className="stats-grid" variants={itemVariants}>
                        <motion.div
                            className="stat-card"
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="stat-icon">👥</div>
                            <div className="stat-info">
                                <h3>Employees</h3>
                                <p className="stat-value">{stats.totalEmployees}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="stat-card"
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="stat-icon">📋</div>
                            <div className="stat-info">
                                <h3>Total Tasks</h3>
                                <p className="stat-value">{stats.totalTasks}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="stat-card"
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="stat-icon">⏳</div>
                            <div className="stat-info">
                                <h3>Pending</h3>
                                <p className="stat-value">{stats.pendingTasks}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="stat-card"
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="stat-icon">⚡</div>
                            <div className="stat-info">
                                <h3>In Progress</h3>
                                <p className="stat-value">{stats.inProgressTasks}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="stat-card"
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <h3>Completed</h3>
                                <p className="stat-value">{stats.completedTasks}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="stat-card"
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="stat-icon">📝</div>
                            <div className="stat-info">
                                <h3>Reports</h3>
                                <p className="stat-value">{stats.totalReports}</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Data Visualization Charts */}
                    <motion.div className="charts-grid" variants={itemVariants}>
                        <TaskStatusChart stats={{
                            pending: stats.pendingTasks,
                            inProgress: stats.inProgressTasks,
                            completed: stats.completedTasks
                        }} />
                        <TaskPriorityChart tasks={tasks} />
                    </motion.div>

                    <motion.div className="recent-section" variants={itemVariants}>
                        <h2>Recent Reports</h2>
                        {recentReports.length === 0 ? (
                            <p>No reports submitted yet.</p>
                        ) : (
                            <div className="report-list">
                                {recentReports.map((report, index) => (
                                    <motion.div
                                        key={report.id}
                                        className="report-item"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ x: 8 }}
                                    >
                                        <div className="report-header">
                                            <span className="report-employee">{report.employee_name}</span>
                                            <span className="report-date">{new Date(report.report_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="report-task">{report.task_title}</div>
                                        <div className="report-time">Time spent: {report.time_spent} minutes</div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </motion.main>
            </div>
        </div>
    );
};

export default AdminDashboard;
