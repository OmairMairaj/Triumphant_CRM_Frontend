import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Users.css';
import { useNavigate } from 'react-router-dom';

const Users = () => {
    const currentUser = JSON.parse(sessionStorage.getItem("user"));
    const [users, setUsers] = useState([]);
    const [createdByFilter, setCreatedByFilter] = useState('');
    const [employees, setEmployees] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userSales, setUserSales] = useState({});
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const navigate = useNavigate();

    // Get the token from sessionStorage
    const token = sessionStorage.getItem('token');

    // Fetch Users and Employees for Dropdown
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users`, {
                    headers: { 'x-auth-token': token },
                });
                setUsers(response.data);

                if (currentUser.role === 'admin') {
                    const employeesList = response.data.filter(user => user.role === 'employee' || user.role === 'admin');
                    setEmployees(employeesList);
                }
            } catch (error) {
                console.error('Error fetching users', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [token, currentUser.role, refresh]);

    // Handle Row Click for Expanded Details
    const handleRowClick = async (rowIndex, customerId) => {
        setExpandedRow(expandedRow === rowIndex ? null : rowIndex);
        if (expandedRow !== rowIndex) {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/vehiclesales/${customerId}`, {
                    headers: { 'x-auth-token': token },
                });
                setUserSales((prevUserSales) => ({
                    ...prevUserSales,
                    [customerId]: response.data,
                }));
            } catch (error) {
                console.error('Error fetching user sales data', error);
            }
        }
    };

    const handleEditClick = (user) => {
        setEditUser(user);
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        if (name === 'createdBy') {
            const selectedUser = employees.find(user => user._id === value);
            setEditUser({
                ...editUser,
                createdBy: selectedUser ? { _id: selectedUser._id, name: selectedUser.name } : editUser.createdBy
            });
        } else {
            setEditUser({
                ...editUser,
                [name]: value
            });
        }
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/users/${editUser._id}`, editUser, {
                headers: { 'x-auth-token': token },
            });
            setUsers(users.map(user => user._id === editUser._id ? editUser : user));
            setShowEditModal(false);
            setRefresh(!refresh);
        } catch (error) {
            console.error('Error saving user changes', error);
        }
    };

    useEffect(() => {
        document.body.classList.toggle('scroll-lock', showDeleteModal);
    }, [showDeleteModal]);

    const handleDeleteClick = (userId) => {
        setDeleteUserId(userId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/users/${deleteUserId}`, {
                headers: { 'x-auth-token': token },
            });
            setUsers(users.filter(user => user._id !== deleteUserId));
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error deleting user', error);
            setShowDeleteModal(false);
        }
    };

    // Calculate Cumulative Stats
    const calculateCumulativeStats = (sales) => {
        const totalPurchases = sales.length;
        const cumulativePrice = sales.reduce((acc, sale) => acc + sale.vehicleDetails.price, 0);
        const totalPaid = sales.reduce((acc, sale) => acc + sale.paymentDetails.amountPaid, 0);
        const totalDue = sales.reduce((acc, sale) => acc + sale.paymentDetails.amountDue, 0);

        return { totalPurchases, cumulativePrice, totalPaid, totalDue };
    };

    // Filter Users Based on Created By
    const filteredUsers = createdByFilter
        ? users.filter(user => user.createdBy && user.createdBy._id === createdByFilter)
        : users;

    return (
        <div className={`users ${showDeleteModal || showEditModal ? 'blur-background' : ''}`}>
            <div className="users_top">
                <div className="users_heading">USERS LIST</div>

                {/* Admin Only - Created By Filter */}
                <div className="filter-container">
                    {currentUser.role === 'admin' && (
                        <select
                            className="created-by-filter"
                            value={createdByFilter}
                            onChange={(e) => setCreatedByFilter(e.target.value)}
                        >
                            <option value="">All Created By</option>
                            {employees.map((employee) => (
                                <option key={employee._id} value={employee._id}>
                                    {employee.name}
                                </option>
                            ))}
                        </select>

                    )}
                    <button className="btn btn-primary" onClick={() => navigate('/admin-dashboard/users/create')}>
                        Create New User
                    </button>
                </div>
            </div>

            {loading && <div className="loading">Loading...</div>}

            {!loading && (
                <table className="table">
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Email</th>
                            {currentUser.role === 'admin' && <th>Created By</th>}
                            <th>Role</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers
                            .filter(user => user.name.toLowerCase() !== 'admin')
                            .map((user, index) => {
                                const sales = userSales[user._id] || [];
                                const { totalPurchases, cumulativePrice, totalPaid, totalDue } = calculateCumulativeStats(sales);

                                return (
                                    <React.Fragment key={user._id}>
                                        <tr onClick={() => handleRowClick(index, user._id)} style={{ cursor: 'pointer' }}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            {currentUser.role === 'admin' && (
                                                <td>{user.createdBy?.name || "Self"}</td>
                                            )}
                                            <td>{user.role}</td>
                                            <td>{user.phone || 'N/A'}</td>
                                            <td>{user.status}</td>
                                            <td>
                                                <button className="btn btn-warning" onClick={(e) => {
                                                    // e.stopPropagation();
                                                    handleEditClick(user);
                                                }}>
                                                    Edit
                                                </button>
                                                {currentUser.role === 'admin' && (
                                                    <button className="btn btn-danger" onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(user._id);
                                                    }}>
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>

                                        {expandedRow === index && (
                                            <tr className="expanded-row">
                                                <td colSpan={currentUser.role === 'admin' ? "7" : "6"}>
                                                    <div className="expanded-details">
                                                        <div className="expanded-details-heading">User Details</div>
                                                        <div className="expanded-content">
                                                            <div>
                                                                <p><strong>Full Name:</strong> {user.name}</p>
                                                                <p><strong>Email:</strong> {user.email}</p>
                                                                <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                                                                <p><strong>Role:</strong> {user.role}</p>
                                                                {currentUser.role === 'admin' && (
                                                                    <p><strong>Created By:</strong> {user.createdBy?.name || 'Self'}</p>
                                                                )}
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
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className='modal-heading'>DELETE</div>
                        <h3>Are you sure you want to delete this user?</h3>
                        <div className="modal-actions">
                            <button className="btn modal-actions-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="btn modal-actions-btn-danger" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && editUser && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content edit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className='modal-heading'>Edit User</div>
                        <form className="edit-form">
                            <div className='edit-form-group'>
                                <label>Name</label>
                                <input type="text" name="name" value={editUser.name} onChange={handleEditChange} />
                            </div>

                            <div className='edit-form-group'>
                                <label>Email (Read-Only)</label>
                                <input type="email" name="email" value={editUser.email} readOnly disabled />
                            </div>

                            <div className='edit-form-group'>
                                <label>Phone</label>
                                <input type="text" name="phone" value={editUser.phone} onChange={handleEditChange} />
                            </div>

                            {currentUser.role === 'admin' && (
                                <div className='edit-form-group'>
                                    <label>Role</label>
                                    <select name="role" value={editUser.role} onChange={handleEditChange}>
                                        <option value="customer">Customer</option>
                                        <option value="employee">Employee</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            )}

                            <div className='edit-form-group'>
                                <label>Status</label>
                                <select name="status" value={editUser.status} onChange={handleEditChange}>
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>

                            {currentUser.role === 'admin' && (
                                <div className='edit-form-group'>
                                    <label>Created By</label>
                                    <select
                                        name="createdBy"
                                        value={editUser.createdBy?._id || ''}
                                        onChange={handleEditChange} // Correctly invoking the function
                                    >
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>
                                                {emp.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="modal-actions edit-modal-actions">
                                <button type="button" className="btn modal-actions-btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="button" className="btn modal-actions-btn-danger" onClick={saveEdit}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
