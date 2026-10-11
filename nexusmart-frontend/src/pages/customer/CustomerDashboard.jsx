import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Safely parse user session and check all possible ID property names from login
    const customerUser = JSON.parse(localStorage.getItem('user')) || {};
    const rawUserId = localStorage.getItem('userId') || 
                      customerUser.id || 
                      customerUser.userId || 
                      customerUser.customerId || 
                      customerUser.sub;
    const userId = (rawUserId && rawUserId !== 'undefined') ? rawUserId : null;

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:2121/api/stores`);
            setStores(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Error fetching stores", err);
            setStores([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProductsForStore = async (merchantId, storeName) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:2121/api/stores/${merchantId}/products`);
            setProducts(Array.isArray(response.data) ? response.data : []);
            setSelectedStore({ id: merchantId, name: storeName });
        } catch (err) {
            console.error("Error fetching store products", err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId) => {
        if (!userId) {
            alert("Please log in as a customer first.");
            navigate('/login');
            return;
        }

        try {
            // Since /api/cart/** is permitted in SecurityConfig, sending without an expired token header prevents 403 blocks
            await axios.post(`http://localhost:2121/api/cart/add`, null, {
                params: { 
                    userId: userId, 
                    productId: productId, 
                    quantity: 1 
                }
            });

            alert("Product added to cart successfully! 🛒");
        } catch (err) {
            console.error("Failed to add product to cart", err);
            alert("Could not add item to cart.");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', background: '#f5f7fa', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ddd', paddingBottom: '15px', marginBottom: '20px', background: 'white', padding: '20px', borderRadius: '8px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#333' }}>Welcome, {customerUser.name || customerUser.username || 'Customer'}! 🛍️</h1>
                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                        {selectedStore ? `Browsing store: ${selectedStore.name}` : 'Select a local store/merchant to start shopping'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={() => navigate('/customer-orders')} 
                        style={{ padding: '8px 15px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        📦 My Orders
                    </button>
                    <button 
                        onClick={() => navigate('/cart')} 
                        style={{ padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        🛒 View Cart
                    </button>
                    <button 
                        onClick={handleLogout} 
                        style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {selectedStore ? (
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0 }}>Products from {selectedStore.name}</h3>
                        <button 
                            onClick={() => setSelectedStore(null)}
                            style={{ padding: '6px 12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            ← Back to Stores
                        </button>
                    </div>

                    {loading ? (
                        <p>Loading products...</p>
                    ) : products.length === 0 ? (
                        <p style={{ color: '#666' }}>No products available in this store currently.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                            {products.map(product => (
                                <div key={product.id} style={{ background: '#fdfdfd', padding: '15px', borderRadius: '6px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        {product.images && product.images.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '5px', overflowX: 'auto', marginBottom: '8px', paddingBottom: '4px' }}>
                                                {product.images.map((img, idx) => (
                                                    <img 
                                                        key={idx}
                                                        src={`http://localhost:2121${img.imageUrl}`} 
                                                        alt={`${product.name} - ${idx + 1}`} 
                                                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd', background: '#fff', flexShrink: 0 }} 
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ width: '100%', height: '140px', background: '#e9ecef', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', marginBottom: '10px' }}>
                                                No Image Available
                                            </div>
                                        )}
                                        <h4 style={{ margin: '0 0 5px 0' }}>{product.name}</h4>
                                        <p style={{ fontSize: '13px', color: '#666', margin: '5px 0' }}>{product.description}</p>
                                    </div>
                                    <div style={{ marginTop: '15px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <span style={{ fontWeight: 'bold', color: '#28a745', fontSize: '16px' }}>₹{product.price}</span>
                                            <span style={{ fontSize: '12px', background: '#e9ecef', padding: '2px 6px', borderRadius: '4px' }}>Stock: {product.stockQuantity}</span>
                                        </div>
                                        <button 
                                            style={{ width: '100%', padding: '8px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                            onClick={() => handleAddToCart(product.id)}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <h3 style={{ marginTop: 0 }}>Available Local Stores</h3>

                    {loading ? (
                        <p>Loading stores...</p>
                    ) : stores.length === 0 ? (
                        <p style={{ color: '#666' }}>No active merchant stores found.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {stores.map(store => (
                                <div key={store.id} style={{ background: '#fdfdfd', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#007BFF' }}>🏪 {store.shopName || store.name || 'Local Store'}</h3>
                                        <p style={{ fontSize: '13px', color: '#666', margin: '5px 0' }}>Owner: {store.name}</p>
                                        <p style={{ fontSize: '13px', color: '#666', margin: '5px 0' }}>Email: {store.email}</p>
                                    </div>
                                    <button 
                                        style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                        onClick={() => fetchProductsForStore(store.id, store.shopName || store.name)}
                                    >
                                        Visit Store
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;