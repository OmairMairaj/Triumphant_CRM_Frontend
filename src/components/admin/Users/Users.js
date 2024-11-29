import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Users.css';
import { useNavigate } from 'react-router-dom';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userSales, setUserSales] = useState({});
    const navigate = useNavigate();

    // Get the token from localStorage
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users`, {
                    headers: {
                        'x-auth-token': token,
                    },
                });
                setUsers(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching users', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [token]);

    const handleRowClick = async (rowIndex, customerId) => {
        // Toggle the expanded row
        setExpandedRow(expandedRow === rowIndex ? null : rowIndex);

        if (expandedRow !== rowIndex) {
            // Fetch the sales data only if the row is being expanded
            setLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/vehiclesales/${customerId}`, {
                    headers: {
                        'x-auth-token': token,
                    },
                });
                setUserSales((prevUserSales) => ({
                    ...prevUserSales,
                    [customerId]: response.data,
                }));
            } catch (error) {
                console.error('Error fetching user sales data', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const calculateCumulativeStats = (sales) => {
        const totalPurchases = sales.length;
        const cumulativePrice = sales.reduce((acc, sale) => acc + sale.vehicleDetails.price, 0);
        const totalPaid = sales.reduce((acc, sale) => acc + sale.paymentDetails.amountPaid, 0);
        const totalDue = sales.reduce((acc, sale) => acc + sale.paymentDetails.amountDue, 0);

        return { totalPurchases, cumulativePrice, totalPaid, totalDue };
    };

    return (
        <div className="users">
            <div className="users_top">
                <div className="users_heading">USERS LIST</div>
                <button className="btn btn-primary" onClick={() => navigate('/admin-dashboard/users/create')}>
                    Create New User
                </button>
            </div>

            {/* Loading Spinner */}
            {loading && <div className="loading">Loading...</div>}

            {!loading && (
                <table className="table">
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users
                            .filter(user => user.name.toLowerCase() !== 'admin') // Filter out "Admin" user
                            .map((user, index) => {
                                const sales = userSales[user._id] || [];
                                const { totalPurchases, cumulativePrice, totalPaid, totalDue } = calculateCumulativeStats(sales);

                                return (
                                    <React.Fragment key={user._id}>
                                        <tr onClick={() => handleRowClick(index, user._id)} style={{ cursor: 'pointer' }}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.role}</td>
                                            <td>{user.phone || 'N/A'}</td>
                                            <td>{user.status}</td>
                                            <td>
                                                <button className="btn btn-warning" onClick={(e) => e.stopPropagation()}>Edit</button>
                                                <button className="btn btn-danger" onClick={(e) => e.stopPropagation()}>Delete</button>
                                            </td>
                                        </tr>

                                        {expandedRow === index && (
                                            <tr className="expanded-row">
                                                <td colSpan="6">
                                                    <div className="expanded-details">
                                                        <div className="expanded-details-heading">User Details</div>
                                                        <div className="expanded-content">
                                                            <div>
                                                                <p><strong>Full Name:</strong> {user.name}</p>
                                                                <p><strong>Email:</strong> {user.email}</p>
                                                                <p><strong>Role:</strong> {user.role}</p>
                                                            </div>
                                                            <div>
                                                                <p><strong>Address:</strong> {user.address || 'N/A'}</p>
                                                                <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                                                            </div>
                                                            <div className="sales-summary">
                                                                <h4>Sales Summary</h4>
                                                                <p><strong>Total Purchases:</strong> {totalPurchases}</p>
                                                                <p><strong>Cumulative Price of Vehicles:</strong> ${cumulativePrice}</p>
                                                                <p><strong>Total Amount Paid:</strong> ${totalPaid}</p>
                                                                <p><strong>Total Amount Due:</strong> ${totalDue}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Users;
