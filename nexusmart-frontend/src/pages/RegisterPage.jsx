import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'CUSTOMER', // Default role
        shopName: '',
        shopAddress: '',
        pincode: '',
        phone: ''
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
                // Call merchant registration endpoint
                await authService.registerMerchant(formData);
            } else {
                // Call standard user registration endpoint
                await authService.register(formData);
            }

            // Redirect to OTP verification page carrying the email
            navigate('/verify-otp', { state: { email: formData.email } });
        } catch (err) {
            setError(err.response?.data || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
            <div style={{ width: '450px', padding: '30px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <h2>Register for NexusMart</h2>

                {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Full Name</label>
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Email Address</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                        <input 
                            type="password" 
                            name="password"
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Register As</label>
                        <select 
                            name="role" 
                            value={formData.role} 
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        >
                            <option value="CUSTOMER">Customer</option>
                            <option value="MERCHANT">Merchant / Store Owner</option>
                        </select>
                    </div>

                    {/* Conditional Merchant Fields */}
                    {formData.role === 'MERCHANT' && (
                        <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #eee' }}>
                            <h4 style={{ margin: '0  0 10px 0', color: '#333' }}>Store Details</h4>
                            
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '3px', fontSize: '13px' }}>Phone Number</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '3px', fontSize: '13px' }}>Shop Name</label>
                                <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', marginBottom: '3px', fontSize: '13px' }}>Shop Address</label>
                                <input type="text" name="shopAddress" value={formData.shopAddress} onChange={handleChange} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '3px', fontSize: '13px' }}>Pincode</label>
                                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ width: '100%', padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p style={{ marginTop: '15px', textAlign: 'center' }}>
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;