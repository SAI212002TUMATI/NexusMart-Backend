import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'CUSTOMER',
        shopName: '',
        shopAddress: '',
        pincode: '',
        phone: '',
        latitude: '',   
        longitude: ''   
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (formData.role === 'MERCHANT') {
                await authService.registerMerchant(formData);
            } else {
                await authService.register(formData);
            }

            navigate('/verify-otp', { state: { email: formData.email } });
        } catch (err) {
            setError(err.response?.data || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid #7F6091',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '14px',
        boxSizing: 'border-box',
        outline: 'none'
    };

    const labelStyle = {
        display: 'block',
        color: '#D8CFE2',
        fontSize: '13px',
        marginBottom: '6px',
        fontWeight: 'bold'
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
                maxWidth: '450px',
                boxShadow: '0 8px 32px rgba(76, 35, 101, 0.4)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ color: '#D8CFE2', margin: '0 0 8px 0', fontSize: '26px' }}>Register for NexusMart</h2>
                    <p style={{ color: '#B5A4C3', fontSize: '14px', margin: 0 }}>Create your account to get started</p>
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

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                        <label style={labelStyle}>Full Name</label>
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                            placeholder="Enter your full name"
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Email Address</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            placeholder="Enter your email"
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Password</label>
                        <input 
                            type="password" 
                            name="password"
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            placeholder="Create a password"
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Register As</label>
                        <select 
                            name="role" 
                            value={formData.role} 
                            onChange={handleChange}
                            style={{ ...inputStyle, background: '#1e122a', cursor: 'pointer' }}
                        >
                            <option value="CUSTOMER">Customer</option>
                            <option value="MERCHANT">Merchant / Store Owner</option>
                        </select>
                    </div>

                    {/* Conditional Merchant Fields */}
                    {formData.role === 'MERCHANT' && (
                        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '15px', borderRadius: '8px', border: '1px solid #7F6091', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <h4 style={{ margin: '0 0 5px 0', color: '#D8CFE2', fontSize: '14px' }}>Store Details & Location</h4>
                            
                            <div>
                                <label style={labelStyle}>Phone Number</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Phone number" style={inputStyle} />
                            </div>

                            <div>
                                <label style={labelStyle}>Shop Name</label>
                                <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} required placeholder="Shop name" style={inputStyle} />
                            </div>

                            <div>
                                <label style={labelStyle}>Shop Address</label>
                                <input type="text" name="shopAddress" value={formData.shopAddress} onChange={handleChange} required placeholder="Shop address" style={inputStyle} />
                            </div>

                            <div>
                                <label style={labelStyle}>Pincode</label>
                                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required placeholder="Pincode" style={inputStyle} />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Latitude</label>
                                    <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="e.g. 17.3850" style={inputStyle} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Longitude</label>
                                    <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="e.g. 78.4867" style={inputStyle} />
                                </div>
                            </div>

                            <button 
                                type="button" 
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(
                                            (position) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    latitude: position.coords.latitude,
                                                    longitude: position.coords.longitude
                                                }));
                                            },
                                            (error) => {
                                                alert("Unable to retrieve location: " + error.message);
                                            }
                                        );
                                    } else {
                                        alert("Geolocation is not supported by your browser");
                                    }
                                }}
                                style={{ width: '100%', padding: '8px', backgroundColor: '#7F6091', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                            >
                                📍 Detect My Current Location
                            </button>
                        </div>
                    )}

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
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#B5A4C3' }}>
                    Already have an account? <Link to="/login" style={{ color: '#D8CFE2', fontWeight: 'bold' }}>Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;