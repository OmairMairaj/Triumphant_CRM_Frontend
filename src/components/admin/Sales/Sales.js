import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Sales.css'; // Import custom CSS

const Sales = () => {
    const [salesRecords, setSalesRecords] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Get the token from localStorage
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/vehiclesales`, {
                    headers: {
                        'x-auth-token': token,
                    },
                });
                setSalesRecords(response.data);
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching sales records', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, [token]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };

    const handleRowClick = (rowIndex) => {
        // Toggle the expanded row
        setExpandedRow(expandedRow === rowIndex ? null : rowIndex);
    };

    return (
        <div className="sales">
            <div className="sales_top">
                <div className="sales_heading">SALE RECORDS</div>
                <button className="btn btn-primary" onClick={() => navigate('/admin-dashboard/create-sale')}>
                    Create New Sale
                </button>
            </div>

            {/* Loading Spinner */}
            {loading && <div className="loading">Loading...</div>}

            {!loading && (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Sale Date</th>
                            <th>Customer</th>
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
                                    <td>{sale.vehicleDetails.make} {sale.vehicleDetails.model} ({sale.vehicleDetails.year})</td>
                                    <td>${sale.vehicleDetails.price}</td>
                                    <td>${sale.paymentDetails.amountPaid}</td>
                                    <td>${sale.paymentDetails.amountDue}</td>
                                    <td>{formatDate(sale.estimatedDelivery)}</td>
                                    <td>{sale.paymentDetails.paymentStatus}</td>
                                    <td>
                                        <button className="btn btn-warning" onClick={(e) => e.stopPropagation()}>Edit</button>
                                        <button className="btn btn-danger" onClick={(e) => e.stopPropagation()}>Delete</button>
                                    </td>
                                </tr>

                                {expandedRow === index && (
                                    <tr className="expanded-row">
                                        <td colSpan="9">
                                            <div className="expanded-details">
                                                <div className='expanded-details-heading'>Sale Details</div>
                                                <div className="expanded-content">
                                                    <div>
                                                        <p><strong>Customer Name:</strong> {sale.customer.name}</p>
                                                        <p><strong>Customer Email:</strong> {sale.customer.email}</p>
                                                    </div>
                                                    <div>
                                                        <p><strong>VIN:</strong> {sale.vehicleDetails.vin}</p>
                                                        <p><strong>Vehicle Make:</strong> {sale.vehicleDetails.make}</p>
                                                        <p><strong>Vehicle Model:</strong> {sale.vehicleDetails.model}</p>
                                                        <p><strong>Vehicle Year:</strong> {sale.vehicleDetails.year}</p>

                                                    </div>
                                                    <div>
                                                        <p><strong>Total Price:</strong> ${sale.vehicleDetails.price}</p>
                                                        <p><strong>Payment Due:</strong> ${sale.paymentDetails.amountDue}</p>
                                                        <p><strong>Payment Made:</strong> ${sale.paymentDetails.amountPaid}</p>
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
        </div>
    );
};

export default Sales;
