import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateUser.css';
import { FaChevronLeft } from 'react-icons/fa';

const CreateUser = () => {
    const currentUser = JSON.parse(sessionStorage.getItem('user'));
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer',
        phone: '',
    });
    const roles = ['customer', 'employee', 'admin']; // Default roles
    const [errors, setErrors] = useState({});
    const token = sessionStorage.getItem('token');
    const navigate = useNavigate();

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Validate the form before submission
    const validateForm = () => {
        const formErrors = {};
        if (!formData.name) formErrors.name = 'Name is required';
        if (!formData.email) formErrors.email = 'Email is required';
        if (!formData.password) formErrors.password = 'Password is required';
        if (formData.password && formData.password.length < 6)
            formErrors.password = 'Password must be at least 6 characters';
        if (!formData.phone) formErrors.phone = 'Phone is required';

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    // Submit the form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/users/create`, formData, {
                headers: {
                    'x-auth-token': token,
                },
            });
            navigate('/admin-dashboard/users'); // Navigate back to the users list page on success
        } catch (error) {
            console.error('Error creating user', error);
            setErrors({ submitError: 'Failed to create user. Please try again.' });
        }
    };

    return (
        <div className="create-user">
            {/* Back button */}
            <button className="back-button" onClick={() => navigate('/admin-dashboard/users')}>
                <FaChevronLeft /> Back to Users List
            </button>

            <h2 className="create-user-heading">Create New User</h2>
            <form onSubmit={handleSubmit} className="create-user-form">
                <div className="form-grid">
                    {/* Name */}
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                        {errors.email && <span className="error">{errors.email}</span>}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                        {errors.password && <span className="error">{errors.password}</span>}
                    </div>

                    {/* Role */}
                    {currentUser.role === "admin" && (
                        <div className="form-group">
                            <label>Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                            >
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Phone */}
                    <div className="form-group">
                        <label>Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                        {errors.phone && <span className="error">{errors.phone}</span>}
                    </div>
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn create-user-btn-primary">Submit</button>
            </form>
        </div>
    );
};

export default CreateUser;
