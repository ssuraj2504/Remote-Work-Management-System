import React, { useState, useEffect } from 'react';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import { taskAPI, userAPI, shiftAPI } from '../../services/api';

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: '',
        shiftId: '',
    });
    const [editingTask, setEditingTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tasksRes, employeesRes, shiftsRes] = await Promise.all([
                taskAPI.getAllTasks(),
                userAPI.getAllEmployees(),
                shiftAPI.getAllShifts(),
            ]);

            setTasks(tasksRes.data.tasks);
            setEmployees(employeesRes.data.employees);
            setShifts(shiftsRes.data.shifts);
        } catch (err) {
            setError('Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const taskData = {
                title: formData.title,
                description: formData.description,
                assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : null,
                priority: formData.priority,
                dueDate: formData.dueDate || null,
                shiftId: formData.shiftId ? parseInt(formData.shiftId) : null,
            };

            if (editingTask) {
                await taskAPI.updateTask(editingTask.id, taskData);
                setSuccess('Task updated successfully');
            } else {
                await taskAPI.createTask(taskData);
                setSuccess('Task created successfully');
            }

            setShowForm(false);
            setEditingTask(null);
            setFormData({
                title: '',
                description: '',
                assignedTo: '',
                priority: 'medium',
                dueDate: '',
                shiftId: '',
            });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save task');
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description || '',
            assignedTo: task.assigned_to || '',
            priority: task.priority,
            dueDate: task.due_date ? task.due_date.split('T')[0] : '',
            shiftId: task.shift_id || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            await taskAPI.deleteTask(id);
            setSuccess('Task deleted successfully');
            fetchData();
        } catch (err) {
            setError('Failed to delete task');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingTask(null);
        setFormData({
            title: '',
            description: '',
            assignedTo: '',
            priority: 'medium',
            dueDate: '',
            shiftId: '',
        });
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Navbar />
                <div className="dashboard-content">
                    <Sidebar role="admin" />
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
                <Sidebar role="admin" />
                <main className="main-content">
                    <div className="page-header">
                        <h1>Task Management</h1>
                        {!showForm && (
                            <button onClick={() => setShowForm(true)} className="btn btn-primary">
                                Create New Task
                            </button>
                        )}
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    {showForm && (
                        <div className="form-card">
                            <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="title">Task Title *</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="4"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="assignedTo">Assign to Employee</label>
                                        <select
                                            id="assignedTo"
                                            name="assignedTo"
                                            value={formData.assignedTo}
                                            onChange={handleChange}
                                        >
                                            <option value="">-- Select Employee --</option>
                                            {employees.map((emp) => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.full_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="priority">Priority</label>
                                        <select
                                            id="priority"
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="dueDate">Due Date</label>
                                        <input
                                            type="datetime-local"
                                            id="dueDate"
                                            name="dueDate"
                                            value={formData.dueDate}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="shiftId">Shift</label>
                                        <select
                                            id="shiftId"
                                            name="shiftId"
                                            value={formData.shiftId}
                                            onChange={handleChange}
                                        >
                                            <option value="">-- Select Shift --</option>
                                            {shifts.map((shift) => (
                                                <option key={shift.id} value={shift.id}>
                                                    {shift.full_name} - {shift.shift_start} to {shift.shift_end}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary">
                                        {editingTask ? 'Update Task' : 'Create Task'}
                                    </button>
                                    <button type="button" onClick={handleCancel} className="btn btn-secondary">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="task-grid">
                        {tasks.length === 0 ? (
                            <p>No tasks created yet.</p>
                        ) : (
                            tasks.map((task) => (
                                <div key={task.id} className="task-card">
                                    <div className="task-card-header">
                                        <h3>{task.title}</h3>
                                        <div className="task-badges">
                                            <span className={`status-badge status-${task.status}`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                            <span className={`priority-badge priority-${task.priority}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="task-description">{task.description}</p>

                                    <div className="task-meta">
                                        <div>
                                            <strong>Assigned to:</strong> {task.assigned_to_name || 'Unassigned'}
                                        </div>
                                        {task.due_date && (
                                            <div>
                                                <strong>Due:</strong> {new Date(task.due_date).toLocaleString()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="task-actions">
                                        <button onClick={() => handleEdit(task)} className="btn btn-small btn-secondary">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(task.id)} className="btn btn-small btn-danger">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TaskManager;
