import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
    // 1. Retrieve token and user data from localStorage
    const token = localStorage.getItem('token');
    
    // Attempt to parse user object or direct role string from storage
    let userRole = localStorage.getItem('role') || '';
    try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            userRole = storedUser.role || storedUser.authorities?.[0]?.authority || userRole;
        }
    } catch (e) {
        // Fallback if role is stored as a raw string
    }

    // 2. If no token exists, redirect to login immediately
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 3. Normalize role by stripping 'ROLE_' prefix and converting to uppercase
    const cleanUserRole = userRole.replace('ROLE_', '').toUpperCase();
    const cleanRequiredRole = requiredRole ? requiredRole.replace('ROLE_', '').toUpperCase() : '';

    // 4. Validate if the user has the required role
    if (cleanRequiredRole && cleanUserRole !== cleanRequiredRole) {
        console.warn(`Access denied. User role: "${cleanUserRole}", Required: "${cleanRequiredRole}"`);
        
        // Redirect unauthorized users to their correct respective dashboard
        if (cleanUserRole === 'MERCHANT') {
            return <Navigate to="/merchant/dashboard" replace />;
        } else {
            return <Navigate to="/customer/dashboard" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;