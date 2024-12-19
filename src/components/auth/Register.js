import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
    const [user, setUser] = useState({ name: '', email: '', password: '', phone: '', role: 'customer' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, user)
                .then((response) => {
                    console.log(response.data.msg);
                    alert(response.data.msg);
                })
            navigate('/');

        } catch (err) {
            console.log(err);
            setError(err.response?.data?.errors[0].msg || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="register">
            <div className="logo-container">
                <img src="/logo.png" alt="Logo" className="login-site-logo" />
            </div>
            <div className="register-container">
                <div className="register-box">
                    <h2 className="register-heading">REGISTER</h2>

                    <form onSubmit={handleRegister}>
                        <input
                            type="text"
                            placeholder="Enter name"
                            value={user.name}
                            onChange={(e) => setUser({ ...user, name: e.target.value })}
                            required
                            className="inputfield"
                        />
                        <input
                            type="email"
                            placeholder="Enter email"
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            required
                            className="inputfield"
                        />
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={user.password}
                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                            required
                            className="inputfield"
                        />
                        <input
                            type="tel"
                            placeholder="Enter phone number"
                            value={user.phone}
                            onChange={(e) => setUser({ ...user, phone: e.target.value })}
                            required
                            className="inputfield"
                        />
                        {error && <div className="alert">{error}</div>}
                        <button type="submit" className="btn-submit">Register</button>
                    </form>
                    <div className="login-btn">
                        <span>Already have an account? </span>
                        <button className="btn-login" onClick={() => navigate('/')}>
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
