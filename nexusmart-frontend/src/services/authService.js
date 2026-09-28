import api from './api';

const authService = {
    register: async (userData) => {
        const response = await api.post('/api/auth/register', userData);
        return response.data;
    },
    registerMerchant: async (merchantData) => {
        const response = await api.post('/api/auth/register/merchant', merchantData);
        return response.data;
    },
    login: async (credentials) => {
        const response = await api.post('/api/auth/login', credentials);
        return response.data;
    },
    verifyOtp: async (email, otp) => {
        const response = await api.post('/api/auth/verify-otp', { email, otp });
        return response.data;
    },
    resendOtp: async (email) => {
        // Fixed encodeURIComponent (capital 'C')
        const response = await api.post(`/api/auth/resend-otp?email=${encodeURIComponent(email)}`, {});
        return response.data;
    },
    requestOtp: async (email) => {
        const response = await api.post('/api/auth/forgot-password', { email });
        return response.data;
    },
    resetPassword: async (resetData) => {
        const response = await api.post('/api/auth/reset-password', resetData);
        return response.data;
    }
};

export default authService;