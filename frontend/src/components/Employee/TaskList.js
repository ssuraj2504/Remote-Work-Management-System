import React, { useState, useEffect } from 'react';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import { taskAPI } from '../../services/api';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await taskAPI.getAllTasks();
            setTasks(response.data.tasks);
        } catch (err) {
            setError('Failed to fetch tasks');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            setError('');
            await taskAPI.updateTaskStatus(taskId, newStatus);
            setSuccess('Task status updated successfully');
            fetchTasks();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Navbar />
                <div className="dashboard-content">
                    <Sidebar role="employee" />
                    <main className="main-content">
                        <div className="loading">Loading tasks...</div>
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
                        <h1>My Tasks</h1>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    {tasks.length === 0 ? (
                        <p>No tasks assigned yet.</p>
                    ) : (
                        <div className="task-grid">
                            {tasks.map((task) => (
                                <div key={task.id} className="task-card">
                                    <div className="task-card-header">
                                        <h3>{task.title}</h3>
                                        <span className={`priority-badge priority-${task.priority}`}>
                                            {task.priority}
                                        </span>
                                    </div>

                                    <p className="task-description">{task.description}</p>

                                    <div className="task-meta">
                                        {task.due_date && (
                                            <div>
                                                <strong>Due:</strong> {new Date(task.due_date).toLocaleString()}
                                            </div>
                                        )}
                                        <div>
                                            <strong>Created by:</strong> {task.created_by_name}
                                        </div>
                                    </div>

                                    <div className="task-status-update">
                                        <label htmlFor={`status-${task.id}`}>Status:</label>
                                        <select
                                            id={`status-${task.id}`}
                                            value={task.status}
                                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                            className={`status-select status-${task.status}`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default TaskList;
