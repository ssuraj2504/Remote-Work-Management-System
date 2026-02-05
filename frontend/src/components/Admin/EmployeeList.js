import React, { useState, useEffect } from 'react';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import { userAPI } from '../../services/api';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getAllEmployees();
            setEmployees(response.data.employees);
        } catch (err) {
            setError('Failed to fetch employees');
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
                        <div className="loading">Loading employees...</div>
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
                        <h1>Employee Management</h1>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Shift Time</th>
                                    <th>Timezone</th>
                                    <th>Total Tasks</th>
                                    <th>Completed Tasks</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center' }}>
                                            No employees found
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map((emp) => (
                                        <tr key={emp.id}>
                                            <td><strong>{emp.full_name}</strong></td>
                                            <td>{emp.email}</td>
                                            <td>
                                                {emp.shift_start && emp.shift_end
                                                    ? `${emp.shift_start} - ${emp.shift_end}`
                                                    : 'No shift assigned'}
                                            </td>
                                            <td>{emp.timezone || '-'}</td>
                                            <td>{emp.total_tasks || 0}</td>
                                            <td>{emp.completed_tasks || 0}</td>
                                            <td>{new Date(emp.created_at).toLocaleDateString()}</td>
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

export default EmployeeList;
