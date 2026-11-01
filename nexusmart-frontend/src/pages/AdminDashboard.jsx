import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const adminUser = JSON.parse(localStorage.getItem('user')) || {};
    
    const [activeTab, setActiveTab] = useState('metrics');
    const [stats, setStats] = useState({ totalUsers: 0, totalMerchants: 0, totalOrders: 0 });
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const role = localStorage.getItem('role') || '';
        if (!token || role.replace('ROLE_', '').toUpperCase() !== 'ADMIN') {
            alert("Unauthorized: Admin access required.");
            navigate('/login');
            return;
        }
        fetchAllAdminData();
    }, [navigate]);

    const fetchAllAdminData = async () => {
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [metricsRes, usersRes, ordersRes] = await Promise.all([
                axios.get('http://localhost:2121/api/admin/metrics', { headers }),
                axios.get('http://localhost:2121/api/admin/users', { headers }),
                axios.get('http://localhost:2121/api/admin/orders', { headers })
            ]);

            setStats(metricsRes.data);
            setUsers(usersRes.data);
            setOrders(ordersRes.data);
        } catch (err) {
            console.error("Error loading admin data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyMerchant = async (userId, currentStatus) => {
        console.log("🟢 Verify button clicked for user ID:", userId, "Current status:", currentStatus);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.patch(`http://localhost:2121/api/admin/merchants/${userId}/verify?verified=${!currentStatus}`, {}, { headers });
            fetchAllAdminData(); 
        } catch (err) {
            console.error('Error updating merchant status:', err);
            alert('Failed to update merchant status.');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const merchants = users.filter(u => u.role === 'MERCHANT');

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', background: '#0f0817', minHeight: '100vh', color: '#fff' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '8px', border: '1px solid #7F6091', marginBottom: '25px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#D8CFE2' }}>Admin Command Center 🛡️</h1>
                    <p style={{ margin: '5px 0 0 0', color: '#B5A4C3' }}>
                        Welcome back, <strong>{adminUser.name || 'Administrator'}</strong> ({adminUser.email})
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate('/')} style={{ padding: '8px 15px', background: '#4a306d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Home
                    </button>
                    <button onClick={handleLogout} style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', borderBottom: '1px solid #7F6091', paddingBottom: '10px' }}>
                <button onClick={() => setActiveTab('metrics')} style={{ padding: '10px 20px', background: activeTab === 'metrics' ? '#7F6091' : 'transparent', color: '#fff', border: '1px solid #7F6091', borderRadius: '6px', cursor: 'pointer' }}>
                    Overview & Metrics
                </button>
                <button onClick={() => setActiveTab('merchants')} style={{ padding: '10px 20px', background: activeTab === 'merchants' ? '#7F6091' : 'transparent', color: '#fff', border: '1px solid #7F6091', borderRadius: '6px', cursor: 'pointer' }}>
                    Merchant Management ({merchants.length})
                </button>
                <button onClick={() => setActiveTab('orders')} style={{ padding: '10px 20px', background: activeTab === 'orders' ? '#7F6091' : 'transparent', color: '#fff', border: '1px solid #7F6091', borderRadius: '6px', cursor: 'pointer' }}>
                    Global Orders ({orders.length})
                </button>
            </div>

            {/* Tab 1: Metrics */}
            {activeTab === 'metrics' && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '8px', border: '1px solid #7F6091' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#B5A4C3', fontSize: '14px' }}>Registered Customers</h4>
                            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#D8CFE2', margin: 0 }}>{loading ? '...' : stats.totalUsers}</p>
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '8px', border: '1px solid #7F6091' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#B5A4C3', fontSize: '14px' }}>Active Merchant Stores</h4>
                            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#60a5fa', margin: 0 }}>{loading ? '...' : stats.totalMerchants}</p>
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '8px', border: '1px solid #7F6091' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#B5A4C3', fontSize: '14px' }}>Platform Orders Processed</h4>
                            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#4ade80', margin: 0 }}>{loading ? '...' : stats.totalOrders}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 2: Merchant Management */}
            {activeTab === 'merchants' && (
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '8px', border: '1px solid #7F6091' }}>
                    <h3 style={{ color: '#D8CFE2', marginTop: 0 }}>Merchant Approval & Verification</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '15px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #7F6091', color: '#B5A4C3' }}>
                                <th style={{ padding: '10px' }}>Name</th>
                                <th style={{ padding: '10px' }}>Email</th>
                                <th style={{ padding: '10px' }}>Phone</th>
                                <th style={{ padding: '10px' }}>Status</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {merchants.map(m => (
                                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px' }}>{m.name}</td>
                                    <td style={{ padding: '12px', color: '#B5A4C3' }}>{m.email}</td>
                                    <td style={{ padding: '12px', color: '#B5A4C3' }}>{m.phone || 'N/A'}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: m.verified ? '#065f46' : '#92400e', color: '#fff' }}>
                                            {m.verified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                        <button 
                                            onClick={() => handleVerifyMerchant(m.id, m.verified)}
                                            style={{ padding: '6px 12px', background: m.verified ? '#d97706' : '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            {m.verified ? 'Revoke' : 'Verify'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab 3: Global Orders */}
            {activeTab === 'orders' && (
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '8px', border: '1px solid #7F6091' }}>
                    <h3 style={{ color: '#D8CFE2', marginTop: 0 }}>Global Platform Orders</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '15px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #7F6091', color: '#B5A4C3' }}>
                                <th style={{ padding: '10px' }}>Order ID</th>
                                <th style={{ padding: '10px' }}>Customer ID</th>
                                <th style={{ padding: '10px' }}>Merchant ID</th>
                                <th style={{ padding: '10px' }}>Total Price</th>
                                <th style={{ padding: '10px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(o => (
                                <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px' }}>#{o.id}</td>
                                    <td style={{ padding: '12px', color: '#B5A4C3' }}>{o.userId}</td>
                                    <td style={{ padding: '12px', color: '#B5A4C3' }}>{o.merchantId}</td>
                                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#4ade80' }}>₹{o.totalPrice}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: '#1e3a8a', color: '#93c5fd' }}>
                                            {o.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;