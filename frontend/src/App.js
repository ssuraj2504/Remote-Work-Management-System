import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Auth/PrivateRoute';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Admin Components
import AdminDashboard from './components/Admin/AdminDashboard';
import EmployeeList from './components/Admin/EmployeeList';
import TaskManager from './components/Admin/TaskManager';
import ShiftManager from './components/Admin/ShiftManager';
import ReportViewer from './components/Admin/ReportViewer';

// Employee Components
import EmployeeDashboard from './components/Employee/EmployeeDashboard';
import TaskList from './components/Employee/TaskList';
import DailyReportForm from './components/Employee/DailyReportForm';
import ReportHistory from './components/Employee/ReportHistory';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Admin Routes */}
                        <Route
                            path="/admin/dashboard"
                            element={
                                <PrivateRoute adminOnly>
                                    <AdminDashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/admin/employees"
                            element={
                                <PrivateRoute adminOnly>
                                    <EmployeeList />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/admin/tasks"
                            element={
                                <PrivateRoute adminOnly>
                                    <TaskManager />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/admin/shifts"
                            element={
                                <PrivateRoute adminOnly>
                                    <ShiftManager />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/admin/reports"
                            element={
                                <PrivateRoute adminOnly>
                                    <ReportViewer />
                                </PrivateRoute>
                            }
                        />

                        {/* Employee Routes */}
                        <Route
                            path="/employee/dashboard"
                            element={
                                <PrivateRoute>
                                    <EmployeeDashboard />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/employee/tasks"
                            element={
                                <PrivateRoute>
                                    <TaskList />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/employee/reports"
                            element={
                                <PrivateRoute>
                                    <DailyReportForm />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/employee/history"
                            element={
                                <PrivateRoute>
                                    <ReportHistory />
                                </PrivateRoute>
                            }
                        />

                        {/* Default Route */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
