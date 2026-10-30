import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import Cart from './pages/Cart';
import CustomerOrders from './pages/CustomerOrders';
import ProtectedRoute from './components/ProtectedRoute';

// Helper function to robustly extract role from localStorage
const getCurrentUserRole = () => {
  const userStr = localStorage.getItem('user');
  const topLevelRole = localStorage.getItem('role');
  
  if (topLevelRole) return topLevelRole.toUpperCase();

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const r = user.role || user.roles?.[0] || user.userType || '';
      if (r) return r.toUpperCase();
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }
  }
  return '';
};

// Dynamic Navigation Header Component
const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = getCurrentUserRole();

  const handleLogout = () => {
    localStorage.clear();
    alert('Logged out successfully!');
    navigate('/login');
  };

  const handleDashboardRedirect = () => {
    if (role.includes('MERCHANT')) {
      navigate('/merchant/dashboard');
    } else {
      navigate('/customer/dashboard');
    }
  };

  return (
    <nav style={{ 
      padding: '18px 40px', 
      background: 'rgba(76, 35, 101, 0.4)', 
      backdropFilter: 'blur(10px)', 
      borderBottom: '1px solid rgba(216, 207, 226, 0.15)', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#fff', fontWeight: 'bold', letterSpacing: '1px' }}>
          Nexus<span style={{ color: '#B5A4C3' }}>Mart</span> 🛍️
        </h2>
      </Link>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        {token ? (
          <>
            <button 
              onClick={handleDashboardRedirect} 
              style={{ padding: '8px 18px', background: 'transparent', color: '#D8CFE2', border: '1px solid #7F6091', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
            >
              Dashboard 📊
            </button>
            <button 
              onClick={handleLogout} 
              style={{ padding: '8px 18px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(220,53,69,0.3)' }}
            >
              Logout 🚪
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ padding: '8px 20px', background: 'transparent', color: '#D8CFE2', border: '1px solid #7F6091', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
              Login
            </Link>
            <Link to="/register" style={{ padding: '8px 20px', background: '#4C2365', color: '#fff', border: 'none', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(76,35,101,0.4)' }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

// Smart Home Landing View Component
const HomeView = () => {
  const navigate = useNavigate();

  const handleStartShopping = () => {
    const token = localStorage.getItem('token');
    const role = getCurrentUserRole();

    if (!token) {
      navigate('/login');
      return;
    }

    if (role.includes('MERCHANT')) {
      alert("You are currently logged in as a Merchant. Switching view to Customer Dashboard.");
    }
    navigate('/customer/dashboard');
  };

  const handleMerchantPortal = () => {
    const token = localStorage.getItem('token');
    const role = getCurrentUserRole();

    if (!token) {
      navigate('/login');
      return;
    }

    if (role.includes('MERCHANT')) {
      navigate('/merchant/dashboard');
    } else {
      alert("You are logged in as a Customer. Please log out and sign in with a Merchant account to access the Merchant Portal.");
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '80px 20px 50px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <span style={{ background: 'rgba(127, 96, 145, 0.25)', color: '#D8CFE2', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Hyperlocal E-Commerce Platform
      </span>
      <h1 style={{ fontSize: '48px', margin: '20px 0 15px 0', fontWeight: 'bold', lineHeight: '1.2' }}>
        Connect directly with local stores in your neighborhood
      </h1>
      <p style={{ fontSize: '18px', color: '#B5A4C3', marginBottom: '35px', lineHeight: '1.6' }}>
        Discover real-time inventory from nearby merchants, place orders instantly, and track local delivery.
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
        <button 
          onClick={handleStartShopping} 
          style={{ padding: '14px 32px', background: '#4C2365', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 20px rgba(76, 35, 101, 0.5)' }}
        >
          Start Shopping 🛒
        </button>
        <button 
          onClick={handleMerchantPortal} 
          style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.05)', color: '#D8CFE2', border: '1px solid #7F6091', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Merchant Portal 🏪
        </button>
      </div>

      {/* Quick Feature Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '60px', textAlign: 'left' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(216, 207, 226, 0.1)', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📍</div>
          <h3 style={{ margin: '0 0 5px 0', color: '#D8CFE2', fontSize: '16px' }}>Hyperlocal Discovery</h3>
          <p style={{ margin: 0, color: '#B5A4C3', fontSize: '13px', lineHeight: '1.4' }}>Find stores within 10-15km of your exact pincode or GPS coordinates.</p>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(216, 207, 226, 0.1)', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
          <h3 style={{ margin: '0 0 5px 0', color: '#D8CFE2', fontSize: '16px' }}>Instant Order Tracking</h3>
          <p style={{ margin: 0, color: '#B5A4C3', fontSize: '13px', lineHeight: '1.4' }}>Track processing, out for delivery, and completed orders in real-time.</p>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(216, 207, 226, 0.1)', padding: '20px', borderRadius: '12px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏪</div>
          <h3 style={{ margin: '0 0 5px 0', color: '#D8CFE2', fontSize: '16px' }}>Merchant Dashboard</h3>
          <p style={{ margin: 0, color: '#B5A4C3', fontSize: '13px', lineHeight: '1.4' }}>Full inventory control, multi-image product management, and order status updates.</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e122a 0%, #0f0817 100%)', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
        
        {/* Global Navigation Header */}
        <Navbar />

        {/* Route Definitions */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />

          <Route 
            path="/customer/dashboard" 
            element={
              <ProtectedRoute allowedRole="CUSTOMER">
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/cart" 
            element={
              <ProtectedRoute allowedRole="CUSTOMER">
                <Cart />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/customer-orders" 
            element={
              <ProtectedRoute allowedRole="CUSTOMER">
                <CustomerOrders />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/merchant/dashboard" 
            element={
              <ProtectedRoute allowedRole="MERCHANT">
                <MerchantDashboard />
              </ProtectedRoute>
            } 
          />

          <Route path="/" element={<HomeView />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;