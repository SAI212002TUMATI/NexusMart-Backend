import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CustomerOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user')) || {};
    const rawUserId = localStorage.getItem('userId') ||
                        currentUser.id ||
                        currentUser.userId ||
                        currentUser.customerId ||
                        currentUser.sub;
    const userId = (rawUserId && rawUserId !== 'undefined') ? rawUserId : null;

    useEffect(() => {
        if (userId) {
            fetchOrders();
        }
    }, [userId]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:2121/api/orders/user/${userId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setOrders(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Error fetching orders", err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PLACED': return '#ffc107';
            case 'PROCESSING': return '#17a2b8';
            case 'OUT_FOR_DELIVERY': return '#007bff';
            case 'DELIVERED': return '#28a745';
            default: return '#6c757d';
        }
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto', background: '#f5f7fa', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ddd', paddingBottom: '15px', marginBottom: '20px', background: 'white', padding: '20px', borderRadius: '8px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#333' }}>My Orders History 📦</h1>
                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>Track your active store orders and fulfillment statuses</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => navigate('/customer/dashboard')} 
                        style={{ padding: '8px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        ← Back to Dashboard
                    </button>
                    <button 
                        onClick={() => navigate('/cart')} 
                        style={{ padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        🛒 View Cart
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Loading your orders...</p>
            ) : orders.length === 0 ? (
                <div style={{ background: 'white', padding: '30px', textAlign: 'center', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <p style={{ color: '#666', fontSize: '16px' }}>You haven't placed any orders yet.</p>
                </div>
            ) : (
                orders.map(order => (
                    <div key={order.id} style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>Order #{order.id}</h3>
                                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                                    Store: <strong>{order.merchant?.shopName || order.merchant?.name || 'Local Store'}</strong>
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ 
                                    padding: '5px 10px', 
                                    borderRadius: '4px', 
                                    color: 'white', 
                                    fontWeight: 'bold', 
                                    fontSize: '12px',
                                    background: getStatusColor(order.status) 
                                }}>
                                    {order.status}
                                </span>
                                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#888' }}>
                                    {order.orderDate ? new Date(order.orderDate).toLocaleString() : ''}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                Total Amount: <span style={{ color: '#28a745' }}>₹{order.totalPrice}</span>
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default CustomerOrders;