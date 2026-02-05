import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <h1>RWMS</h1>
                    <span className="navbar-subtitle">Remote Work Management</span>
                </div>

                <div className="navbar-menu">
                    <div className="navbar-user">
                        <span className="user-name">{user.fullName}</span>
                        <span className={`user-badge badge-${user.role}`}>{user.role}</span>
                    </div>

                    <button onClick={handleLogout} className="btn btn-secondary">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
