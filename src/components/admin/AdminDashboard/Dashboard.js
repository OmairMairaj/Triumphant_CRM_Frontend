import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppNavbar from '../../AppNavbar/AppNavbar';
import Sales from '../Sales/Sales';
import Users from '../Users/Users';
import CreateSale from '../CreateSale/CreateSale';
import CreateUser from '../CreateUser/CreateUser';

const Dashboard = () => {
    return (
        <div>
            <AppNavbar />
            <div className="admin-content">
                <Routes>
                    {/* Default route for the dashboard */}
                    <Route path="/" element={<Sales />} />
                    {/* Users page */}
                    <Route path="users" element={<Users />} />
                    <Route path="create-sale" element={<CreateSale />} />
                    <Route path="users/create" element={<CreateUser />} />
                    {/* Redirect any unknown path to /admin-dashboard */}
                    <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
                </Routes>
            </div>
        </div>
    );
};

export default Dashboard;
