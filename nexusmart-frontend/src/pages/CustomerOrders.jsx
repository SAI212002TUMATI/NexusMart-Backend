import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const getUserId = () => {
        try {
            const directId = localStorage.getItem('userId');
            if (directId && directId !== 'undefined' && directId !== 'null') return directId;
            const userStr = localStorage.getItem('user');
            if (userStr && userStr !== 'undefined' && userStr !== 'null') {
                const userObj = JSON.parse(userStr);
                return userObj.userId || userObj.id || userObj.customerId || userObj.sub;
            }
        } catch (e) {
            console.error("Error parsing user session", e);
        }
        return null;
    };

    useEffect(() => {
        const userId = getUserId();
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const endpoint = userId ? `http://localhost:2121/api/orders/user/${userId}` : 'http://localhost:2121/api/orders';
                const response = await fetch(endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setOrders(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Error fetching order history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#0f0817', color: '#fff', padding: '30px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ 
                    background: '#1e122a', 
                    border: '1px solid rgba(216, 207, 226, 0.15)', 
                    padding: '24px 30px', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '30px',
                    boxShadow: '0 8px 32px rgba(76, 35, 101, 0.3)'
                }}>
                    <div>
                        <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', color: '#fff' }}>My Orders History 📦</h1>
                        <p style={{ margin: 0, color: '#B5A4C3', fontSize: '13px' }}>Track your active store orders and fulfillment statuses</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={() => navigate('/customer/dashboard')} 
                            style={{ background: '#64748b', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                        >
                            ← Back to Dashboard
                        </button>
                        <button 
                            onClick={() => navigate('/customer/cart')} 
                            style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                        >
                            🛒 View Cart
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#B5A4C3' }}>Loading orders history...</div>
                ) : orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: '#1e122a', borderRadius: '12px', border: '1px solid rgba(216,207,226,0.1)' }}>
                        <p style={{ color: '#B5A4C3', fontSize: '15px' }}>No order history found.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {orders.map((order, index) => {
                            const storeName = order.merchantName || order.storeName || order.store?.shopName || order.store?.name || 'Local Store';
                            const orderStatus = order.status || 'PLACED';
                            const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleString() : (order.createdAt || 'Recent');
                            const totalAmount = order.totalPrice || order.totalAmount || order.price || 0;

                            return (
                                <div key={order.id || index} style={{ 
                                    background: '#1e122a', 
                                    border: '1px solid rgba(127, 96, 145, 0.3)', 
                                    borderRadius: '12px', 
                                    padding: '24px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#fff' }}>
                                                Order #{order.id || index + 1}
                                            </h3>
                                            <span style={{ fontSize: '13px', color: '#B5A4C3' }}>
                                                Store: <strong style={{ color: '#D8CFE2' }}>{storeName}</strong>
                                            </span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ 
                                                background: '#f59e0b', 
                                                color: '#000', 
                                                padding: '4px 12px', 
                                                borderRadius: '6px', 
                                                fontSize: '11px', 
                                                fontWeight: 'bold',
                                                letterSpacing: '0.5px',
                                                display: 'inline-block',
                                                marginBottom: '6px'
                                            }}>
                                                {orderStatus}
                                            </span>
                                            <div style={{ fontSize: '11px', color: '#B5A4C3' }}>{orderDate}</div>
                                        </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid rgba(216, 207, 226, 0.1)', paddingTop: '15px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '14px', color: '#D8CFE2', fontWeight: 'bold' }}>Total Amount:</span>
                                        <span style={{ fontSize: '18px', color: '#4ade80', fontWeight: 'bold' }}>₹{totalAmount}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerOrders;