import React, { useState, useEffect } from 'react';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import { shiftAPI, userAPI } from '../../services/api';

const ShiftManager = () => {
    const [shifts, setShifts] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '',
        shiftStart: '',
        shiftEnd: '',
        timezone: 'America/New_York',
    });
    const [editingShift, setEditingShift] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const timezones = [
        { value: 'America/New_York', label: 'Eastern Time (EST)' },
        { value: 'America/Chicago', label: 'Central Time (CST)' },
        { value: 'America/Denver', label: 'Mountain Time (MST)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (PST)' },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [shiftsRes, employeesRes] = await Promise.all([
                shiftAPI.getAllShifts(),
                userAPI.getAllEmployees(),
            ]);

            setShifts(shiftsRes.data.shifts);
            setEmployees(employeesRes.data.employees);
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
            if (editingShift) {
                await shiftAPI.updateShift(editingShift.id, formData);
                setSuccess('Shift updated successfully');
            } else {
                await shiftAPI.createShift(formData);
                setSuccess('Shift created successfully');
            }

            setShowForm(false);
            setEditingShift(null);
            setFormData({
                employeeId: '',
                shiftStart: '',
                shiftEnd: '',
                timezone: 'America/New_York',
            });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save shift');
        }
    };

    const handleEdit = (shift) => {
        setEditingShift(shift);
        setFormData({
            employeeId: shift.employee_id,
            shiftStart: shift.shift_start,
            shiftEnd: shift.shift_end,
            timezone: shift.timezone,
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this shift?')) return;

        try {
            await shiftAPI.deleteShift(id);
            setSuccess('Shift deleted successfully');
            fetchData();
        } catch (err) {
            setError('Failed to delete shift');
        }
    };

    return (
        <div className="dashboard-layout">
            <Navbar />
            <div className="dashboard-content">
                <Sidebar role="admin" />
                <main className="main-content">
                    <div className="page-header">
                        <h1>Shift Management</h1>
                        {!showForm && (
                            <button onClick={() => setShowForm(true)} className="btn btn-primary">
                                Create New Shift
                            </button>
                        )}
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    {showForm && (
                        <div className="form-card">
                            <h2>{editingShift ? 'Edit Shift' : 'Create New Shift'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="employeeId">Employee *</label>
                                    <select
                                        id="employeeId"
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">-- Select Employee --</option>
                                        {employees.map((emp) => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.full_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="shiftStart">Shift Start *</label>
                                        <input
                                            type="time"
                                            id="shiftStart"
                                            name="shiftStart"
                                            value={formData.shiftStart}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="shiftEnd">Shift End *</label>
                                        <input
                                            type="time"
                                            id="shiftEnd"
                                            name="shiftEnd"
                                            value={formData.shiftEnd}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="timezone">Timezone *</label>
                                    <select
                                        id="timezone"
                                        name="timezone"
                                        value={formData.timezone}
                                        onChange={handleChange}
                                        required
                                    >
                                        {timezones.map((tz) => (
                                            <option key={tz.value} value={tz.value}>
                                                {tz.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary">
                                        {editingShift ? 'Update Shift' : 'Create Shift'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingShift(null);
                                        }}
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Shift Start</th>
                                    <th>Shift End</th>
                                    <th>Timezone</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shifts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center' }}>
                                            No shifts created yet
                                        </td>
                                    </tr>
                                ) : (
                                    shifts.map((shift) => (
                                        <tr key={shift.id}>
                                            <td>{shift.full_name}</td>
                                            <td>{shift.shift_start}</td>
                                            <td>{shift.shift_end}</td>
                                            <td>{shift.timezone}</td>
                                            <td>
                                                <span className={`status-badge ${shift.is_active ? 'status-active' : 'status-inactive'}`}>
                                                    {shift.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <button onClick={() => handleEdit(shift)} className="btn btn-small btn-secondary">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDelete(shift.id)} className="btn btn-small btn-danger">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ShiftManager;
