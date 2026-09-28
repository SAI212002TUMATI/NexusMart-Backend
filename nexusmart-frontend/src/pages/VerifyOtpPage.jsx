import React, {useState} from 'react';
import {useNavigate,useLocation,Link} from 'react-router-dom';
import authService from '../services/authService';

const VerifyOtpPage = () =>{
    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState(location.state?.email ||'');
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) =>{
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try{
            const responseMessage = await authService.verifyOtp(email,otp);
            setMessage(responseMessage || 'Account verified successfully!');

            setTimeout(()=>{
                navigate('/login');
            },2000);

        }catch (err){
            setError(err.response?.data || 'verification failed. Please check your OTP code');

        }finally{
            setLoading(false);
        }
    };
    const handleResendOtp = async () =>{
        if(!email){
            setError('Please enter your email address first.');
            return ;
        }
        try{
            setError('');
            const res= await authService.resendOtp(email);
            setMessage(res || 'A Fresh OTP has been sent to your email.');

        }catch (err){
            setError(err.response?.data || 'Failed to resend OTP.');
        }
    };
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div style={{ width: '400px', padding: '30px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <h2>Verify Your Account</h2>
                <p style={{ fontSize: '14px', color: '#666' }}>
                    Enter the 6-digit OTP code sent to your email address.
                </p>

                {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
                {message && <div style={{ color: 'green', marginBottom: '15px' }}>{message}</div>}

                <form onSubmit={handleVerify}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>6-Digit OTP Code</label>
                        <input 
                            type="text" 
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)} 
                            maxLength={6}
                            placeholder="123456"
                            required 
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', letterSpacing: '2px', fontSize: '16px' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>

                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <button 
                        type="button" 
                        onClick={handleResendOtp}
                        style={{ background: 'none', border: 'none', color: '#007BFF', cursor: 'pointer', padding: 0 }}
                    >
                        Resend OTP
                    </button>
                    <Link to="/login">Back to Login</Link>
                </div>
            </div>
        </div>
    );

};

export default VerifyOtpPage;