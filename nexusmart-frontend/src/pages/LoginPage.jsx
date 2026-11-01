import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:2121/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                
                localStorage.setItem('token', data.token || data.accessToken);
                const role = data.role || data.user?.role || data.authorities?.[0]?.authority || 'CUSTOMER';
                localStorage.setItem('role', role);
                localStorage.setItem('user', JSON.stringify(data.user || data));

                const cleanRole = role.replace('ROLE_', '').toUpperCase();

                // 🌟 ROUTE DIRECTLY BASED ON ROLE
                if (cleanRole === 'ADMIN') {
                    navigate('/admin/dashboard');
                } else if (cleanRole === 'MERCHANT') {
                    navigate('/merchant/dashboard');
                } else {
                    navigate('/customer/dashboard');
                }
            } else {
                const errData = await response.json().catch(() => ({}));
                setError(errData.message || 'Invalid email or password. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Server connection failed. Make sure your backend is running on port 2121.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1e122a 0%, #0f0817 100%)',
            color: '#fff',
            padding: '20px'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(216, 207, 226, 0.15)',
                borderRadius: '16px',
                padding: '40px',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 8px 32px rgba(76, 35, 101, 0.4)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: '#D8CFE2', margin: '0 0 8px 0', fontSize: '26px' }}>Welcome to NexusMart</h2>
                    <p style={{ color: '#B5A4C3', fontSize: '14px', margin: 0 }}>Log in to access your dashboard</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', color: '#D8CFE2', fontSize: '13px', marginBottom: '6px', fontWeight: 'bold' }}>
                            Email Address
                        </label>
                        <input 
                            type="email" 
                            required
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid #7F6091',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ color: '#D8CFE2', fontSize: '13px', fontWeight: 'bold' }}>
                                Password
                            </label>
                            <Link to="/forgot-password" style={{ color: '#b5a4c3', fontSize: '12px', textDecoration: 'none' }}>
                                Forgot Password?
                            </Link>
                        </div>
                        <input 
                            type="password" 
                            required
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid #7F6091',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '13px',
                            background: '#4C2365',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(76, 35, 101, 0.4)',
                            opacity: loading ? 0.7 : 1,
                            marginTop: '10px'
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#B5A4C3' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#D8CFE2', fontWeight: 'bold' }}>Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;