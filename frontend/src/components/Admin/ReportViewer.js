import React, { useState, useEffect } from 'react';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import { reportAPI } from '../../services/api';

const ReportViewer = () => {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [filter, setFilter] = useState({ date: '', employee: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filter, reports]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await reportAPI.getAllReports();
            setReports(response.data.reports);
            setFilteredReports(response.data.reports);
        } catch (err) {
            setError('Failed to fetch reports');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...reports];

        if (filter.date) {
            filtered = filtered.filter(r => r.report_date === filter.date);
        }

        if (filter.employee) {
            filtered = filtered.filter(r =>
                r.employee_name.toLowerCase().includes(filter.employee.toLowerCase())
            );
        }

        setFilteredReports(filtered);
    };

    const handleFilterChange = (e) => {
        setFilter({
            ...filter,
            [e.target.name]: e.target.value,
        });
    };

    const clearFilters = () => {
        setFilter({ date: '', employee: '' });
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Navbar />
                <div className="dashboard-content">
                    <Sidebar role="admin" />
                    <main className="main-content">
                        <div className="loading">Loading reports...</div>
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
                        <h1>Daily Reports</h1>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="filter-section">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="date">Filter by Date</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={filter.date}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="employee">Filter by Employee</label>
                                <input
                                    type="text"
                                    id="employee"
                                    name="employee"
                                    value={filter.employee}
                                    onChange={handleFilterChange}
                                    placeholder="Enter employee name"
                                />
                            </div>

                            <div className="form-group" style={{ alignSelf: 'flex-end' }}>
                                <button onClick={clearFilters} className="btn btn-secondary">
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="report-grid">
                        {filteredReports.length === 0 ? (
                            <p>No reports found matching the filters.</p>
                        ) : (
                            filteredReports.map((report) => (
                                <div key={report.id} className="report-card">
                                    <div className="report-header">
                                        <div>
                                            <h3>{report.task_title}</h3>
                                            <p className="report-employee">{report.employee_name}</p>
                                        </div>
                                        <span className="report-date">
                                            {new Date(report.report_date).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="report-content">
                                        <p>{report.work_description}</p>
                                    </div>

                                    <div className="report-footer">
                                        <span className="time-badge">
                                            ⏱️ {report.time_spent} minutes ({Math.floor(report.time_spent / 60)}h {report.time_spent % 60}m)
                                        </span>
                                        <span className="submitted-date">
                                            Submitted: {new Date(report.created_at).toLocaleString()}
                                        </span>
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

export default ReportViewer;
