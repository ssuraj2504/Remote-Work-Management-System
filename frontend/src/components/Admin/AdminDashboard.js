import React, { useState, useEffect } from 'react';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import { userAPI, taskAPI, reportAPI } from '../../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        totalReports: 0,
    });
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
                <main className="main-content">
                    <div className="page-header">
                        <h1>Admin Dashboard</h1>
                        <p>Welcome to the Remote Work Management System</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-info">
                                <h3>Total Employees</h3>
                                <p className="stat-value">{stats.totalEmployees}</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">📋</div>
                            <div className="stat-info">
                                <h3>Total Tasks</h3>
                                <p className="stat-value">{stats.totalTasks}</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-info">
                                <h3>Pending Tasks</h3>
                                <p className="stat-value">{stats.pendingTasks}</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">⚡</div>
                            <div className="stat-info">
                                <h3>In Progress</h3>
                                <p className="stat-value">{stats.inProgressTasks}</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <h3>Completed</h3>
                                <p className="stat-value">{stats.completedTasks}</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">📝</div>
                            <div className="stat-info">
                                <h3>Total Reports</h3>
                                <p className="stat-value">{stats.totalReports}</p>
                            </div>
                        </div>
                    </div>

                    <div className="recent-section">
                        <h2>Recent Reports</h2>
                        {recentReports.length === 0 ? (
                            <p>No reports submitted yet.</p>
                        ) : (
                            <div className="report-list">
                                {recentReports.map((report) => (
                                    <div key={report.id} className="report-item">
                                        <div className="report-header">
                                            <span className="report-employee">{report.employee_name}</span>
                                            <span className="report-date">{new Date(report.report_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="report-task">{report.task_title}</div>
                                        <div className="report-time">Time spent: {report.time_spent} minutes</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
