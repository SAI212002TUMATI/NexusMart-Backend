import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import Cart from './pages/Cart'; // Adjust path if located elsewhere
import CustomerOrders from './pages/CustomerOrders'; // Adjust path if located elsewhere
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div>
        {/* Simple Navigation Header */}
        <nav style={{ padding: '15px 30px', backgroundColor: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>NexusMart</h2>
          <div>
            <Link to="/login" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
          </div>
        </nav>

        {/* Route definitions */}
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />

          {/* Protected Customer Dashboard */}
          <Route 
            path="/customer/dashboard" 
            element={
              <ProtectedRoute allowedRole="CUSTOMER">
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Protected Cart & Orders Routes */}
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

          {/* Protected Merchant Dashboard */}
          <Route 
            path="/merchant/dashboard" 
            element={
              <ProtectedRoute allowedRole="MERCHANT">
                <MerchantDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Public Home Route */}
          <Route path="/" element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <h1>Welcome to NexusMart Home</h1>
              <p>Your full-stack e-commerce platform is up and running!</p>
            </div>
          } />

          {/* Catch-all fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;