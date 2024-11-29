import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateSale.css';
import { FaChevronLeft } from 'react-icons/fa';

const CreateSale = () => {
    const [formData, setFormData] = useState({
        vehicleDetails: {
            make: '',
            model: '',
            year: '',
            vin: '',
            price: ''
        },
        customer: '',
        paymentDetails: {
            amountPaid: '',
            amountDue: '',
            paymentStatus: 'Pending'
        },
        status: 'in progress',
        estimatedDelivery: ''
    });
    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const token = localStorage.getItem('token');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
            } catch (error) {
                console.error('Error fetching users', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [token]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('vehicleDetails.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                vehicleDetails: { ...formData.vehicleDetails, [field]: value }
            });
        } else if (name.startsWith('paymentDetails.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                paymentDetails: { ...formData.paymentDetails, [field]: value }
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Handle customer selection
    const handleCustomerSelect = (e) => {
        const selectedCustomerId = e.target.value;
        const customer = users.find(user => user._id === selectedCustomerId);
        if (customer) {
            setFormData({ ...formData, customer: customer._id });
            setSelectedCustomer(customer);
        }
    };

    // Validate the form before submission
    const validateForm = () => {
        const formErrors = {};
        if (!formData.vehicleDetails.make) formErrors.make = 'Vehicle make is required';
        if (!formData.vehicleDetails.model) formErrors.model = 'Vehicle model is required';
        if (!formData.vehicleDetails.year || isNaN(formData.vehicleDetails.year))
            formErrors.year = 'Valid vehicle year is required';
        if (!formData.vehicleDetails.vin) formErrors.vin = 'Vehicle VIN is required';
        if (!formData.vehicleDetails.price || isNaN(formData.vehicleDetails.price))
            formErrors.price = 'Valid vehicle price is required';
        if (!formData.customer) formErrors.customer = 'Customer is required';
        if (!formData.paymentDetails.amountPaid || isNaN(formData.paymentDetails.amountPaid))
            formErrors.amountPaid = 'Valid amount paid is required';
        if (!formData.paymentDetails.amountDue || isNaN(formData.paymentDetails.amountDue))
            formErrors.amountDue = 'Valid amount due is required';
        if (!formData.estimatedDelivery) formErrors.estimatedDelivery = 'Estimated delivery date is required';

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    // Submit the form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/vehiclesales/create`, formData, {
                headers: {
                    'x-auth-token': token
                }
            });
            navigate('/admin-dashboard'); // Navigate back to the sales page on success
        } catch (error) {
            console.error('Error creating sale record', error);
            setErrors({ submitError: 'Failed to create sale. Please try again.' });
        }
    };

    return (
        <div className="create-sale">
            {/* Back button */}
            <button className="back-button" onClick={() => navigate('/admin-dashboard')}>
                <FaChevronLeft /> Back to Sales
            </button>

            <h2>Create New Sale</h2>

            {loading ? (
                // Loading spinner or text
                <div className="loading">Loading customer data...</div>
            ) : (
                <form onSubmit={handleSubmit} className="create-sale-form">
                    {/* Vehicle Details */}
                    <div className='sale-form'>
                        <div className='sale-form-section'>
                            <h3>Vehicle Details</h3>
                            <div className="sale-form-group">
                                <label>Make</label>
                                <input
                                    type="text"
                                    name="vehicleDetails.make"
                                    value={formData.vehicleDetails.make}
                                    onChange={handleInputChange}
                                    placeholder='Enter Vehicle Make'
                                />
                                {errors.make && <span className="error">{errors.make}</span>}
                            </div>
                            <div className="sale-form-group">
                                <label>Model</label>
                                <input
                                    type="text"
                                    name="vehicleDetails.model"
                                    value={formData.vehicleDetails.model}
                                    onChange={handleInputChange}
                                    placeholder='Enter Vehicle Model'
                                />
                                {errors.model && <span className="error">{errors.model}</span>}
                            </div>
                            <div className="sale-form-group">
                                <label>Year</label>
                                <input
                                    type="number"
                                    name="vehicleDetails.year"
                                    value={formData.vehicleDetails.year}
                                    onChange={handleInputChange}
                                    placeholder='Enter Vehicle Year'
                                />
                                {errors.year && <span className="error">{errors.year}</span>}
                            </div>
                            <div className="sale-form-group">
                                <label>VIN</label>
                                <input
                                    type="text"
                                    name="vehicleDetails.vin"
                                    value={formData.vehicleDetails.vin}
                                    onChange={handleInputChange}
                                    placeholder='Enter Vehicle VIN Number'
                                />
                                {errors.vin && <span className="error">{errors.vin}</span>}
                            </div>
                            <div className="sale-form-group">
                                <label>Price</label>
                                <input
                                    type="number"
                                    name="vehicleDetails.price"
                                    value={formData.vehicleDetails.price}
                                    onChange={handleInputChange}
                                    placeholder='Enter Vehicle Price'
                                />
                                {errors.price && <span className="error">{errors.price}</span>}
                            </div>
                        </div>

                        {/* Customer Selection */}
                        <div className='sale-form-section'>
                            <h3>Customer</h3>
                            <div className="sale-form-group">
                                <label>Customer</label>
                                <select
                                    name="customer"
                                    value={formData.customer}
                                    onChange={handleCustomerSelect}
                                >
                                    <option value="">Select Customer</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.customer && <span className="error">{errors.customer}</span>}
                            </div>
                            {selectedCustomer && (
                                <div className="customer-details">
                                    <div className="sale-form-group" >
                                        <label>Customer Email</label>
                                        <input type="text" style={{ backgroundColor: "#efefef" }} value={selectedCustomer.email} readOnly />
                                    </div>
                                    <div className="sale-form-group">
                                        <label>Customer Phone</label>
                                        <input type="text" style={{ backgroundColor: "#efefef" }} value={selectedCustomer.phone} readOnly />
                                    </div>
                                    <div className="sale-form-group">
                                        <label>Customer Status</label>
                                        <input type="text" style={{ backgroundColor: "#efefef" }} value={selectedCustomer.status} readOnly />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment Details */}
                        <div className='sale-form-section'>
                            <h3>Payment Details</h3>
                            <div className="sale-form-group">
                                <label>Amount Paid</label>
                                <input
                                    type="number"
                                    name="paymentDetails.amountPaid"
                                    value={formData.paymentDetails.amountPaid}
                                    onChange={handleInputChange}
                                />
                                {errors.amountPaid && <span className="error">{errors.amountPaid}</span>}
                            </div>
                            <div className="sale-form-group">
                                <label>Amount Due</label>
                                <input
                                    type="number"
                                    name="paymentDetails.amountDue"
                                    value={formData.paymentDetails.amountDue}
                                    onChange={handleInputChange}
                                />
                                {errors.amountDue && <span className="error">{errors.amountDue}</span>}
                            </div>
                            <div className="sale-form-group">
                                <label>Payment Status</label>
                                <select
                                    name="paymentDetails.paymentStatus"
                                    value={formData.paymentDetails.paymentStatus}
                                    onChange={handleInputChange}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>
                        </div>

                        {/* Sale Details */}
                        <div className='sale-form-section'>
                            <h3>Sale Details</h3>
                            <div className="sale-form-group">
                                <label>Estimated Delivery</label>
                                <input
                                    type="date"
                                    name="estimatedDelivery"
                                    value={formData.estimatedDelivery}
                                    onChange={handleInputChange}
                                />
                                {errors.estimatedDelivery && <span className="error">{errors.estimatedDelivery}</span>}
                            </div>
                            <div className="sale-form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="in progress">In Progress</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="btn create-sale-btn-primary">Submit</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default CreateSale;
