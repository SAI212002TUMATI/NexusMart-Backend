import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1); // Step 1: Request code, Step 2: Reset password
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:2121/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                setMessage('Password reset code has been sent to your email.');
                setStep(2); // Move to enter token and new password
            } else {
                const errText = await response.text();
                setError(errText || 'Failed to send reset code.');
            }
        } catch (err) {
            setError('Server connection failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmReset = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:2121/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword })
            });

            if (response.ok) {
                setMessage('Password reset successfully! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                const errText = await response.text();
                setError(errText || 'Invalid or expired reset token.');
            }
        } catch (err) {
            setError('Server connection failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #1e122a 0%, #0f0817 100%)', color: '#fff', padding: '20px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(216, 207, 226, 0.15)', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(76, 35, 101, 0.4)' }}>
                <h2 style={{ color: '#D8CFE2', textAlign: 'center', marginBottom: '8px' }}>Password Recovery</h2>
                <p style={{ color: '#B5A4C3', fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>
                    {step === 1 ? 'Enter your registered email to receive a reset code.' : 'Enter the 6-digit code sent to your email and your new password.'}
                </p>

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px', borderRadius: '6px', fontSize: '12px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
                {message && <div style={{ background: 'rgba(40, 167, 69, 0.1)', border: '1px solid rgba(40, 167, 69, 0.3)', color: '#4ade80', padding: '10px', borderRadius: '6px', fontSize: '12px', marginBottom: '15px', textAlign: 'center' }}>{message}</div>}

                {step === 1 ? (
                    <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', color: '#D8CFE2', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>Email Address</label>
                            <input 
                                type="email" 
                                required 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #7F6091', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }}
                            />
                        </div>
                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#4C2365', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                            {loading ? 'Sending Code...' : 'Send Reset Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleConfirmReset} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', color: '#D8CFE2', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>6-Digit Reset Code</label>
                            <input 
                                type="text" 
                                required 
                                maxLength={6}
                                value={token} 
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="123456"
                                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #7F6091', borderRadius: '6px', color: '#fff', boxSizing: 'border-box', letterSpacing: '2px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#D8CFE2', fontSize: '13px', marginBottom: '5px', fontWeight: 'bold' }}>New Password</label>
                            <input 
                                type="password" 
                                required 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #7F6091', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' }}
                            />
                        </div>
                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#4C2365', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px' }}>
                    <Link to="/login" style={{ color: '#D8CFE2', textDecoration: 'none' }}>Back to Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;