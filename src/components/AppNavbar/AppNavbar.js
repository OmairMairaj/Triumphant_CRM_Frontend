import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AppNavbar.css';

const AppNavbar = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Load user info from sessionStorage
    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const logout = () => {
        sessionStorage.clear();
        navigate('/');
    };

    if (!user) {
        return null; // Show nothing if user data isn't loaded
    }

    return (
        <nav className="navbar">
            <div className="navbar-logo" onClick={() => navigate('/')}>
                <img src='/logo.png' alt='Site Logo' className='nav-site-logo' />
            </div>
            {(user.role === 'admin' || user.role === 'employee') && (
                <div className='navbar-links'>
                    <Link to="/admin-dashboard" className="navbar-link">
                        DASHBOARD
                    </Link>
                    <Link to="/admin-dashboard/users" className="navbar-link">
                        USERS
                    </Link>
                </div>
            )}
            <div className="navbar-menu">
                <div className='user-info'>
                    Hello, {user.name}
                </div>
                {user.role === 'admin' ? (

                    <button className="navbar-button" onClick={logout}>
                        Logout
                    </button>

                ) : (
                    <button className="navbar-button" onClick={logout}>
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
};

export default AppNavbar;
