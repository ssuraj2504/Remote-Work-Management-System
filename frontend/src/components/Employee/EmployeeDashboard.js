import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import { DashboardSkeleton } from '../Common/LoadingSkeleton';
import { taskAPI, shiftAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
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

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [shift, setShift] = useState(null);
    const [stats, setStats] = useState({
        totalTasks: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashboardData = useCallback(async () => {
        if (!user || !user.id) return;

        try {
            setLoading(true);
            setError('');

            const tasksRes = await taskAPI.getAllTasks();
            const taskData = tasksRes.data.tasks || [];
            setTasks(taskData);

            setStats({
                totalTasks: taskData.length,
                pending: taskData.filter(t => t.status === 'pending').length,
                inProgress: taskData.filter(t => t.status === 'in_progress').length,
                completed: taskData.filter(t => t.status === 'completed').length,
            });

            // Fetch shift
            try {
                const shiftRes = await shiftAPI.getActiveShift(user.id);
                setShift(shiftRes.data.shift);
            } catch (shiftErr) {
                setShift(null);
            }
        } catch (err) {
            setError('Failed to fetch dashboard data');
            console.error('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

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
                        <DashboardSkeleton />
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
                <motion.main
                    className="main-content"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.div className="page-header" variants={itemVariants}>
                        <div>
                            <h1>Employee Dashboard</h1>
                            <p>Welcome back, {user?.fullName || 'User'}!</p>
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
                            whileHover={{ scale: 1.03 }}
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
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="stat-icon">⏳</div>
                            <div className="stat-info">
                                <h3>Pending</h3>
                                <p className="stat-value">{stats.pending}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="stat-card"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="stat-icon">⚡</div>
                            <div className="stat-info">
                                <h3>In Progress</h3>
                                <p className="stat-value">{stats.inProgress}</p>
                            </div>
                        </motion.div>

                        <motion.div
                            className="stat-card"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="stat-icon">✅</div>
                            <div className="stat-info">
                                <h3>Completed</h3>
                                <p className="stat-value">{stats.completed}</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div className="shift-section" variants={itemVariants}>
                        <h2>My Current Shift</h2>
                        {shift ? (
                            <motion.div
                                className="shift-card"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <div className="shift-info">
                                    <div>
                                        <div className="shift-time">
                                            {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                        </div>
                                        <div className="shift-timezone">{shift.timezone}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="shift-card" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                                <p>No shift assigned yet. Please contact your administrator.</p>
                            </div>
                        )}
                    </motion.div>

                    <motion.div className="recent-section" variants={itemVariants}>
                        <h2>Recent Tasks</h2>
                        {tasks.length === 0 ? (
                            <p>No tasks assigned yet.</p>
                        ) : (
                            <div className="task-list">
                                {tasks.slice(0, 5).map((task, index) => (
                                    <motion.div
                                        key={task.id}
                                        className="task-item"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ x: 8 }}
                                    >
                                        <h3>{task.title}</h3>
                                        <p>{task.description}</p>
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                            <span className={`status-badge status-${task.status}`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                            <span className={`priority-badge priority-${task.priority}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        {task.due_date && (
                                            <div className="task-due">
                                                Due: {new Date(task.due_date).toLocaleDateString()}
                                            </div>
                                        )}
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

export default EmployeeDashboard;
