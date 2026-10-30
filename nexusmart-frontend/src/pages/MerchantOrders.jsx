import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MerchantOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('PLACED');

    const merchantUser = JSON.parse(localStorage.getItem('user')) || {};

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in as a merchant to view store orders.");
            navigate('/login');
            return;
        }
        fetchMerchantOrders(selectedStatus);
    }, [selectedStatus]);

    const fetchMerchantOrders = async (status) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:2121/api/merchant/orders`, {
                params: { status },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setOrders(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Error fetching merchant orders:", err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:2121/api/merchant/orders/${orderId}/status`, null, {
                params: { status: newStatus },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            alert(`Order #${orderId} status updated to ${newStatus}! 📦`);
            fetchMerchantOrders(selectedStatus);
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Could not update order status.");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PLACED': return '#ffc107';
            case 'PROCESSING': return '#17a2b8';
            case 'OUT_FOR_DELIVERY': return '#007bff';
            case 'DELIVERED': return '#28a745';
            case 'CANCELLED': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const storeDisplayName = merchantUser.shopName || merchantUser.storeName || merchantUser.name || 'My Store';

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '1100px', margin: '0 auto', background: '#f5f7fa', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ddd', paddingBottom: '15px', marginBottom: '20px', background: 'white', padding: '20px', borderRadius: '8px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#333' }}>Merchant Orders Dashboard 🏪</h1>
                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                        Store: <strong>{storeDisplayName}</strong> {merchantUser.shopAddress ? `(${merchantUser.shopAddress})` : ''}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => navigate('/merchant/dashboard')} 
                        style={{ padding: '8px 15px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        ← Store Dashboard
                    </button>
                    <button 
                        onClick={handleLogout} 
                        style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {['PLACED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED'].map(st => (
                    <button 
                        key={st}
                        onClick={() => setSelectedStatus(st)}
                        style={{
                            padding: '8px 16px',
                            background: selectedStatus === st ? '#2b8a3e' : '#fff',
                            color: selectedStatus === st ? '#fff' : '#333',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {st.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            {loading ? (
                <p>Loading incoming orders...</p>
            ) : orders.length === 0 ? (
                <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <p style={{ color: '#666', fontSize: '18px' }}>No orders found with status '{selectedStatus}'.</p>
                </div>
            ) : (
                orders.map(order => {
                    const customerName = order.customer?.name || order.customerName || order.userName || 'Customer';
                    const customerPhone = order.customer?.phone || order.phone || 'Not provided';
                    const fulfillmentText = order.fulfillmentType === 'SELF_PICKUP' ? '🏃 Self-Pickup at Store' : '🛵 Home Delivery';
                    const paymentText = order.paymentType === 'ONLINE' ? '💳 Online Payment (Paid)' : '💵 Cash on Delivery (COD)';
                    const orderTotal = order.totalPrice || order.totalAmount || order.price || 0;

                    return (
                        <div key={order.id} style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>Order #{order.id}</h3>
                                    <span style={{ fontSize: '13px', color: '#666' }}>Customer: <strong>{customerName}</strong> ({customerPhone})</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ 
                                        padding: '5px 12px', 
                                        background: getStatusColor(order.status), 
                                        color: 'white', 
                                        borderRadius: '20px', 
                                        fontSize: '12px', 
                                        fontWeight: 'bold' 
                                    }}>
                                        {order.status}
                                    </span>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#888' }}>
                                        {order.orderDate ? new Date(order.orderDate).toLocaleString() : ''}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px', color: '#444', marginBottom: '15px' }}>
                                <div>
                                    <p style={{ margin: '5px 0' }}><strong>Fulfillment:</strong> {fulfillmentText}</p>
                                    <p style={{ margin: '5px 0' }}><strong>Payment:</strong> {paymentText}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                                        Total: ₹{orderTotal}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f3f5', paddingTop: '15px', marginTop: '10px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Update Fulfillment Status:</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        disabled={order.status === 'PROCESSING'}
                                        onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}
                                        style={{ padding: '6px 12px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                                    >
                                        Mark Processing
                                    </button>
                                    <button 
                                        disabled={order.status === 'OUT_FOR_DELIVERY'}
                                        onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                                        style={{ padding: '6px 12px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                                    >
                                        Out for Delivery 🛵
                                    </button>
                                    <button 
                                        disabled={order.status === 'DELIVERED'}
                                        onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                                        style={{ padding: '6px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                                    >
                                        Mark Delivered ✔️
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default MerchantOrders;