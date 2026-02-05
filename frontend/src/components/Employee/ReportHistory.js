import React, { useState, useEffect } from 'react';
import Navbar from '../Layout/Navbar';
import Sidebar from '../Layout/Sidebar';
import { reportAPI } from '../../services/api';

const ReportHistory = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await reportAPI.getAllReports();
            setReports(response.data.reports);
        } catch (err) {
            setError('Failed to fetch reports');
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
                    <Sidebar role="employee" />
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
                <Sidebar role="employee" />
                <main className="main-content">
                    <div className="page-header">
                        <h1>Report History</h1>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {reports.length === 0 ? (
                        <p>No reports submitted yet.</p>
                    ) : (
                        <div className="report-grid">
                            {reports.map((report) => (
                                <div key={report.id} className="report-card">
                                    <div className="report-header">
                                        <h3>{report.task_title}</h3>
                                        <span className="report-date">
                                            {new Date(report.report_date).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="report-content">
                                        <p>{report.work_description}</p>
                                    </div>

                                    <div className="report-footer">
                                        <span className="time-badge">
                                            ⏱️ {report.time_spent} minutes
                                        </span>
                                        <span className="submitted-date">
                                            Submitted: {new Date(report.created_at).toLocaleString()}
                                        </span>
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

export default ReportHistory;
