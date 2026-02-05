import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import ErrorBoundary from './components/Common/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import './App.css';

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

// Shared Components
import MessagingCenter from './components/Messaging/MessagingCenter';

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <SocketProvider>
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
                                <Route
                                    path="/admin/messages"
                                    element={
                                        <PrivateRoute adminOnly>
                                            <MessagingCenter />
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
                                <Route
                                    path="/employee/messages"
                                    element={
                                        <PrivateRoute>
                                            <MessagingCenter />
                                        </PrivateRoute>
                                    }
                                />

                                {/* Default redirect */}
                                <Route path="/" element={<Navigate to="/login" replace />} />
                            </Routes>
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    duration: 3000,
                                    style: {
                                        background: '#333',
                                        color: '#fff',
                                    },
                                    success: {
                                        duration: 3000,
                                        iconTheme: {
                                            primary: '#10b981',
                                            secondary: '#fff',
                                        },
                                    },
                                    error: {
                                        duration: 4000,
                                        iconTheme: {
                                            primary: '#ef4444',
                                            secondary: '#fff',
                                        },
                                    },
                                }}
                            />
                        </div>
                    </Router>
                </SocketProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
