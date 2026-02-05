import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
};

// User API
export const userAPI = {
    getAllUsers: () => api.get('/users'),
    getAllEmployees: () => api.get('/users/employees'),
    getUserById: (id) => api.get(`/users/${id}`),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    deleteUser: (id) => api.delete(`/users/${id}`),
};

// Task API
export const taskAPI = {
    getAllTasks: () => api.get('/tasks'),
    getTaskById: (id) => api.get(`/tasks/${id}`),
    createTask: (data) => api.post('/tasks', data),
    updateTask: (id, data) => api.put(`/tasks/${id}`, data),
    updateTaskStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
    deleteTask: (id) => api.delete(`/tasks/${id}`),
};

// Shift API
export const shiftAPI = {
    getAllShifts: () => api.get('/shifts'),
    getShiftById: (id) => api.get(`/shifts/${id}`),
    getActiveShift: (employeeId) => api.get(`/shifts/employee/${employeeId}/active`),
    createShift: (data) => api.post('/shifts', data),
    updateShift: (id, data) => api.put(`/shifts/${id}`, data),
    deleteShift: (id) => api.delete(`/shifts/${id}`),
};

// Report API
export const reportAPI = {
    getAllReports: () => api.get('/reports'),
    getReportById: (id) => api.get(`/reports/${id}`),
    getReportsByEmployee: (employeeId) => api.get(`/reports/employee/${employeeId}`),
    getReportsByDate: (date) => api.get(`/reports/date/${date}`),
    createReport: (data) => api.post('/reports', data),
    getReportsStats: () => api.get('/reports/stats'),
};

export default api;
