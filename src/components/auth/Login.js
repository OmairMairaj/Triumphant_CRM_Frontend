import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';  // Custom CSS file

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, { email, password });

            const { token, user } = res.data;
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('userRole', user.role);
            sessionStorage.setItem('user', JSON.stringify(user));

            // Redirect based on role
            if (user.role === 'admin' || user.role === 'employee') {
                navigate('/admin-dashboard');
            } else if (user.role === 'customer') {
                navigate('/customer-dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.log(err)
            setError(err.response?.data?.msg || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="login">
            <div className="logo-container">
                <img src="/logo.png" alt="Logo" className="login-site-logo" />
            </div>
            <div className="login-container">
                <div className="login-box">
                    <h2 className="login_heading">LOGIN</h2>

                    <div onSubmit={handleLogin}>

                        <input
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="inputfield"
                        />

                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="inputfield"
                        />
                        {error && <div className="alert">{error}</div>}
                        <button onClick={handleLogin} className="btn-submit">Login</button>
                    </div>
                    <div className="signup-container">
                        <span>Don't have an account? </span>
                        <button className="btn-signup" onClick={() => navigate('/register')}>Sign Up</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
