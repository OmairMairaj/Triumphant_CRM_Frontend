import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CustomerDashboard from './components/customer/CustomerDashboard';
import AdminDashboard from './components/admin/AdminDashboard/Dashboard';
import PrivateRoute from './utils/PrivateRoute';
import './App.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/customer-dashboard"
          element={
            <PrivateRoute roles={['customer']}>
              <CustomerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-dashboard/*"  // Add '*' here for nested routes
          element={
            <PrivateRoute roles={['admin', 'employee']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
