import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ role }) => {
    const location = useLocation();

    const adminLinks = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/admin/employees', label: 'Employees', icon: '👥' },
        { path: '/admin/tasks', label: 'Task Management', icon: '📋' },
        { path: '/admin/shifts', label: 'Shift Management', icon: '⏰' },
        { path: '/admin/reports', label: 'Reports', icon: '📝' },
        { path: '/admin/messages', label: 'Messages', icon: '💬' },
    ];

    const employeeLinks = [
        { path: '/employee/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/employee/tasks', label: 'My Tasks', icon: '📋' },
        { path: '/employee/shift', label: 'My Shift', icon: '⏰' },
        { path: '/employee/reports', label: 'Submit Report', icon: '📝' },
        { path: '/employee/history', label: 'Report History', icon: '📚' },
        { path: '/employee/messages', label: 'Messages', icon: '💬' },
    ];

    const links = role === 'admin' ? adminLinks : employeeLinks;

    return (
        <aside className="sidebar">
            <div className="sidebar-content">
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
                    >
                        <span className="sidebar-icon">{link.icon}</span>
                        <span className="sidebar-label">{link.label}</span>
                    </Link>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
