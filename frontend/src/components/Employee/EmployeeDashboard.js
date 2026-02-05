import React, { useState, useEffect } from 'react';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import { taskAPI, shiftAPI, reportAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [shift, setShift] = useState(null);
    const [recentReports, setRecentReports] = useState([]);
    const [stats, setStats] = useState({
        totalTasks: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [tasksRes, reportsRes] = await Promise.all([
                taskAPI.getAllTasks(),
                reportAPI.getAllReports(),
            ]);

            const taskData = tasksRes.data.tasks;
            setTasks(taskData);

            setStats({
                totalTasks: taskData.length,
                pending: taskData.filter(t => t.status === 'pending').length,
                inProgress: taskData.filter(t => t.status === 'in_progress').length,
                completed: taskData.filter(t => t.status === 'completed').length,
            });

            setRecentReports(reportsRes.data.reports.slice(0, 3));

            // Fetch shift
            try {
                const shiftRes = await shiftAPI.getActiveShift(user.id);
                setShift(shiftRes.data.shift);
            } catch (shiftErr) {
                // No active shift, that's okay
                console.log('No active shift found');
            }
        } catch (err) {
            setError('Failed to fetch dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Navbar />
                <div className="dashboard-content">
                    <Sidebar role="employee" />
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
                <Sidebar role="employee" />
                <main className="main-content">
                    <div className="page-header">
                        <h1>Employee Dashboard</h1>
                        <p>Welcome back, {user.fullName}!</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="stats-grid">
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
                                <h3>Pending</h3>
                                <p className="stat-value">{stats.pending}</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">⚡</div>
                            <div className="stat-info">
                                <h3>In Progress</h3>
                                <p className="stat-value">{stats.inProgress}</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <h3>Completed</h3>
                                <p className="stat-value">{stats.completed}</p>
                            </div>
                        </div>
                    </div>

                    {shift && (
                        <div className="shift-section">
                            <h2>My Current Shift</h2>
                            <div className="shift-card">
                                <div className="shift-info">
                                    <span className="shift-time">
                                        {formatTime(shift.shift_start)} - {formatTime(shift.shift_end)}
                                    </span>
                                    <span className="shift-timezone">{shift.timezone}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="recent-section">
                        <h2>Recent Tasks</h2>
                        {tasks.length === 0 ? (
                            <p>No tasks assigned yet.</p>
                        ) : (
                            <div className="task-list">
                                {tasks.slice(0, 5).map((task) => (
                                    <div key={task.id} className="task-item">
                                        <div className="task-header">
                                            <h3>{task.title}</h3>
                                            <span className={`status-badge status-${task.status}`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="task-description">{task.description}</p>
                                        <div className="task-meta">
                                            <span className={`priority-badge priority-${task.priority}`}>
                                                {task.priority}
                                            </span>
                                            {task.due_date && (
                                                <span className="task-due">
                                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
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

export default EmployeeDashboard;
