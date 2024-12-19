import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Sales.css'; // Custom CSS

const Sales = () => {
    const [salesRecords, setSalesRecords] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [selectedSeller, setSelectedSeller] = useState('');
    const [expandedRow, setExpandedRow] = useState(null);
    const [loading, setLoading] = useState(false);
    const [deleteSaleId, setDeleteSaleId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const navigate = useNavigate();

    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user'));

    // Fetch all sellers for admin only
    useEffect(() => {
        if (user.role === 'admin') {
            const fetchSellers = async () => {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users`, {
                        headers: { 'x-auth-token': token },
                    });
                    setSellers(response.data.filter(u => u.role === 'employee' || u.role === 'admin'));
                } catch (error) {
                    console.error('Error fetching sellers', error);
                }
            };
            fetchSellers();
        }
    }, [token, user.role]);

    // Fetch sales records
    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true);
            try {
                const endpoint = user.role === 'admin' && selectedSeller
                    ? `${process.env.REACT_APP_BACKEND_URL}/api/vehiclesales?seller=${selectedSeller}`
                    : `${process.env.REACT_APP_BACKEND_URL}/api/vehiclesales`;

                const response = await axios.get(endpoint, {
                    headers: { 'x-auth-token': token },
                });
                setSalesRecords(response.data);
            } catch (error) {
                console.error('Error fetching sales records', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, [token, selectedSeller, user.role]);

    useEffect(() => {
        document.body.classList.toggle('scroll-lock', showDeleteModal);
    }, [showDeleteModal]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };

    const handleRowClick = (rowIndex) => {
        setExpandedRow(expandedRow === rowIndex ? null : rowIndex);
    };

    const handleDeleteClick = (saleId) => {
        setDeleteSaleId(saleId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/vehiclesales/${deleteSaleId}`, {
                headers: { 'x-auth-token': token },
            });
            setSalesRecords(salesRecords.filter(sale => sale._id !== deleteSaleId));
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error deleting sale', error);
            setShowDeleteModal(false);
        }
    };


    return (
        <div className={`sales ${showDeleteModal ? 'blur-background' : ''}`}>
            <div className="sales_top">
                <div className="sales_heading">SALE RECORDS</div>
                <div className="sales_controls">
                    {user.role === 'admin' && (
                        <>
                            <select
                                className="seller-filter"
                                value={selectedSeller}
                                onChange={(e) => setSelectedSeller(e.target.value)}
                            >
                                <option value="">All Sellers</option>
                                {sellers.map((seller) => (
                                    <option key={seller._id} value={seller._id}>
                                        {seller.name}
                                    </option>
                                ))}
                            </select>

                        </>
                    )}
                    <button className="btn btn-primary" onClick={() => navigate('/admin-dashboard/create-sale')}>
                        Create New Sale
                    </button>
                </div>
            </div>

            {loading && <div className="loading">Loading...</div>}

            {!loading && (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Sale Date</th>
                            <th>Customer</th>
                            {user.role === 'admin' ? <th>Seller</th> : <th>Customer Email</th>}
                            <th>Vehicle</th>
                            <th>Vehicle Price</th>
                            <th>Amount Paid</th>
                            <th>Amount Due</th>
                            <th>Estimated Delivery</th>
                            <th>Payment Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salesRecords.map((sale, index) => (
                            <React.Fragment key={sale._id}>
                                <tr onClick={() => handleRowClick(index)} style={{ cursor: 'pointer' }}>
                                    <td>{formatDate(sale.saleDate)}</td>
                                    <td>{sale.customer.name}</td>
                                    {user.role === 'admin' ? (
                                        <td>{sale.seller.name}</td>
                                    )
                                        :
                                        (
                                            <td>{sale.customer.email}</td>
                                        )

                                    }
                                    <td>{sale.vehicleDetails.make} {sale.vehicleDetails.model} ({sale.vehicleDetails.year})</td>
                                    <td>{sale.paymentDetails.currency} {sale.vehicleDetails.price}</td>
                                    <td>{sale.paymentDetails.currency} {sale.paymentDetails.amountPaid}</td>
                                    <td>{sale.paymentDetails.currency} {sale.paymentDetails.amountDue}</td>
                                    <td>{formatDate(sale.estimatedDelivery)}</td>
                                    <td>{sale.paymentDetails.paymentStatus}</td>
                                    <td>
                                        <button className="btn btn-warning" onClick={(e) => e.stopPropagation()}>Edit</button>
                                        {user.role === 'admin' && (
                                            <button className="btn btn-danger" onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(sale._id);
                                            }}>Delete</button>
                                        )}
                                    </td>
                                </tr>

                                {expandedRow === index && (
                                    <tr className="expanded-row">
                                        <td colSpan="10">
                                            <div className="expanded-details">
                                                <div className="expanded-details-heading">Sale Details</div>
                                                <div className="expanded-content">
                                                    <div>
                                                        <p><strong>Customer Name:</strong> {sale.customer.name}</p>
                                                        <p><strong>Customer Email:</strong> {sale.customer.email}</p>
                                                        <p><strong>Customer Phone:</strong> {sale.customer.phone}</p>
                                                    </div>
                                                    {user.role === 'admin' && (
                                                        <div>
                                                            <p><strong>Seller Name:</strong> {sale.seller.name}</p>
                                                            <p><strong>Seller Email:</strong> {sale.seller.email}</p>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p><strong>VIN:</strong> {sale.vehicleDetails.vin}</p>
                                                        <p><strong>Vehicle Make:</strong> {sale.vehicleDetails.make}</p>
                                                        <p><strong>Vehicle Model:</strong> {sale.vehicleDetails.model}</p>
                                                        <p><strong>Vehicle Year:</strong> {sale.vehicleDetails.year}</p>
                                                    </div>
                                                    <div>
                                                        <p><strong>Total Price:</strong> {sale.paymentDetails.currency} {sale.vehicleDetails.price}</p>
                                                        <p><strong>Payment Due:</strong> {sale.paymentDetails.currency} {sale.paymentDetails.amountDue}</p>
                                                        <p><strong>Payment Made:</strong> {sale.paymentDetails.currency} {sale.paymentDetails.amountPaid}</p>
                                                        <p><strong>Payment Status:</strong> {sale.paymentDetails.paymentStatus}</p>
                                                    </div>
                                                    <div>
                                                        <p><strong>Status:</strong> {sale.status}</p>
                                                        <p><strong>Sale Date:</strong> {formatDate(sale.saleDate)}</p>
                                                        <p><strong>Estimated Delivery Date:</strong> {formatDate(sale.estimatedDelivery)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <>
                    {/* Modal Background Blur */}
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className='modal-heading'>DELETE</div>
                            <h3>Are you sure you want to delete this sale?</h3>
                            <div className="modal-actions">
                                <button className="btn modal-actions-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                <button className="btn modal-actions-btn-danger" onClick={confirmDelete}>Delete</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Sales;
