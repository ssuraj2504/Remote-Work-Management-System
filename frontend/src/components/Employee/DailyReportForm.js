import React, { useState, useEffect } from 'react';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import { reportAPI, taskAPI } from '../../services/api';

const DailyReportForm = () => {
    const [tasks, setTasks] = useState([]);
    const [formData, setFormData] = useState({
        taskId: '',
        workDescription: '',
        timeSpent: '',
        reportDate: new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await taskAPI.getAllTasks();
            setTasks(response.data.tasks);
        } catch (err) {
            console.error('Failed to fetch tasks');
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
        setLoading(true);

        try {
            await reportAPI.createReport({
                ...formData,
                taskId: parseInt(formData.taskId),
                timeSpent: parseInt(formData.timeSpent),
            });

            setSuccess('Daily report submitted successfully!');
            setFormData({
                taskId: '',
                workDescription: '',
                timeSpent: '',
                reportDate: new Date().toISOString().split('T')[0],
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-content">
                <Sidebar role="employee" />
                <main className="main-content">
                    <div className="page-header">
                        <h1>Submit Daily Report</h1>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="form-card">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="taskId">Task *</label>
                                <select
                                    id="taskId"
                                    name="taskId"
                                    value={formData.taskId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">-- Select Task --</option>
                                    {tasks.map((task) => (
                                        <option key={task.id} value={task.id}>
                                            {task.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="reportDate">Report Date *</label>
                                <input
                                    type="date"
                                    id="reportDate"
                                    name="reportDate"
                                    value={formData.reportDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="workDescription">Work Description *</label>
                                <textarea
                                    id="workDescription"
                                    name="workDescription"
                                    value={formData.workDescription}
                                    onChange={handleChange}
                                    rows="6"
                                    required
                                    placeholder="Describe what you worked on today..."
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="timeSpent">Time Spent (minutes) *</label>
                                <input
                                    type="number"
                                    id="timeSpent"
                                    name="timeSpent"
                                    value={formData.timeSpent}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                    placeholder="e.g., 240 for 4 hours"
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DailyReportForm;
