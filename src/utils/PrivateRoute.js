import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, roles = [] }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    console.log("Token:", token);
    console.log("User Role:", userRole);

    if (!token) {
        return <Navigate to="/" />;
    }

    if (roles.length && !roles.includes(userRole)) {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;
