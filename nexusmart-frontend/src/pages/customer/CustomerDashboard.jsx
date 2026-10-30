import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductDetailModal from '../ProductDetailModal';
import CategoryNavigation from '../CategoryNavigation';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [allStoreProducts, setAllStoreProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedModalProduct, setSelectedModalProduct] = useState(null);

    // Dual-Toggle State: 'all' vs 'nearby'
    const [viewMode, setViewMode] = useState('all');

    // Safely parse user session
    const customerUser = JSON.parse(localStorage.getItem('user')) || {};
    const rawUserId = localStorage.getItem('userId') || 
                      customerUser.id || 
                      customerUser.userId || 
                      customerUser.customerId || 
                      customerUser.sub;
    const userId = (rawUserId && rawUserId !== 'undefined') ? rawUserId : null;

    useEffect(() => {
        fetchStores();
    }, [viewMode]);

    const fetchStores = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:2121/api/stores`);
            let fetchedStores = Array.isArray(response.data) ? response.data : [];

            if (viewMode === 'nearby') {
                const userLat = customerUser.latitude;
                const userLon = customerUser.longitude;
                const userPincode = customerUser.pincode;

                fetchedStores = fetchedStores.filter(store => {
                    if (userPincode && store.pincode === userPincode) return true;
                    if (userLat && userLon && store.latitude && store.longitude) {
                        const distance = calculateHaversineDistance(userLat, userLon, store.latitude, store.longitude);
                        return distance <= 15;
                    }
                    return true; 
                });
            }

            setStores(fetchedStores);
        } catch (err) {
            console.error("Error fetching stores", err);
            setStores([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const fetchProductsForStore = async (merchantId, storeName) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:2121/api/stores/${merchantId}/products`);
            const storeProducts = Array.isArray(response.data) ? response.data : [];
            setAllStoreProducts(storeProducts);
            setProducts(storeProducts);
            setSelectedStore({ id: merchantId, name: storeName });
        } catch (err) {
            console.error("Error fetching store products", err);
            setAllStoreProducts([]);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCategory = (categoryId) => {
        if (!categoryId) {
            setProducts(allStoreProducts);
        } else {
            const filtered = allStoreProducts.filter(p => p.categoryId === categoryId || p.category?.id === categoryId);
            setProducts(filtered);
        }
    };

    const handleAddToCart = async (productId, quantity = 1) => {
        if (!userId) {
            alert("Please log in as a customer first.");
            navigate('/login');
            return;
        }

        try {
            await axios.post(`http://localhost:2121/api/cart/add`, null, {
                params: { userId, productId, quantity }
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
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', background: '#f8f7fa', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #4C2365', paddingBottom: '15px', marginBottom: '20px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(76,35,101,0.06)' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#4C2365' }}>Welcome, {customerUser.name || customerUser.username || 'Customer'}! 🛍️</h1>
                    <p style={{ margin: '5px 0 0 0', color: '#7F6091' }}>
                        {selectedStore ? `Browsing store: ${selectedStore.name}` : 'Discover hyper-local stores near you'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate('/customer-orders')} style={{ padding: '8px 15px', background: '#7F6091', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>📦 My Orders</button>
                    <button onClick={() => navigate('/cart')} style={{ padding: '8px 15px', background: '#4C2365', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🛒 View Cart</button>
                    <button onClick={handleLogout} style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
                </div>
            </div>

            {/* DUAL TOGGLE BAR */}
            {!selectedStore && (
                <div style={{ display: 'flex', background: 'white', padding: '10px 20px', borderRadius: '8px', marginBottom: '20px', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #D8CFE2' }}>
                    <span style={{ fontWeight: 'bold', color: '#4C2365', fontSize: '14px' }}>Store Discovery Mode:</span>
                    <div style={{ display: 'flex', gap: '5px', background: '#f5f2f8', padding: '4px', borderRadius: '6px' }}>
                        <button 
                            onClick={() => setViewMode('all')}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '13px',
                                background: viewMode === 'all' ? '#4C2365' : 'transparent',
                                color: viewMode === 'all' ? '#white' : '#7F6091',
                                transition: 'all 0.2s'
                            }}
                        >
                            🌐 All Stores (Global)
                        </button>
                        <button 
                            onClick={() => setViewMode('nearby')}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '13px',
                                background: viewMode === 'nearby' ? '#4C2365' : 'transparent',
                                color: viewMode === 'nearby' ? '#white' : '#7F6091',
                                transition: 'all 0.2s'
                            }}
                        >
                            📍 Nearby Stores (10-15km)
                        </button>
                    </div>
                </div>
            )}

            {/* Store Products View vs Store List View */}
            {selectedStore ? (
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #D8CFE2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#4C2365' }}>Products from {selectedStore.name}</h3>
                        <button 
                            onClick={() => { setSelectedStore(null); setProducts([]); setAllStoreProducts([]); }}
                            style={{ padding: '6px 12px', background: '#7F6091', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            ← Back to Stores
                        </button>
                    </div>

                    <CategoryNavigation onSelectCategory={handleSelectCategory} />

                    {loading ? (
                        <p>Loading products...</p>
                    ) : products.length === 0 ? (
                        <p style={{ color: '#666' }}>No products available in this category or store currently.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                            {products.map(product => (
                                <div 
                                    key={product.id} 
                                    onClick={() => setSelectedModalProduct(product)}
                                    style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #D8CFE2', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
                                >
                                    <div>
                                        {product.images && product.images.length > 0 ? (
                                            <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', marginBottom: '8px', paddingBottom: '4px' }}>
                                                {product.images.map((img, idx) => (
                                                    <img key={idx} src={`http://localhost:2121${img.imageUrl}`} alt={product.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #D8CFE2' }} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ width: '100%', height: '140px', background: '#f5f2f8', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7F6091', marginBottom: '10px' }}>No Image</div>
                                        )}
                                        <h4 style={{ margin: '0 0 5px 0', color: '#4C2365' }}>{product.name}</h4>
                                        <p style={{ fontSize: '13px', color: '#666', margin: '5px 0' }}>{product.description}</p>
                                    </div>
                                    <div style={{ marginTop: '15px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <span style={{ fontWeight: 'bold', color: '#28a745', fontSize: '16px' }}>₹{product.price}</span>
                                            <span style={{ fontSize: '12px', background: '#f5f2f8', color: '#4C2365', padding: '2px 6px', borderRadius: '4px' }}>Stock: {product.stockQuantity}</span>
                                        </div>
                                        <button 
                                            style={{ width: '100%', padding: '8px', background: '#4C2365', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                            onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id, 1); }}
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
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #D8CFE2' }}>
                    <h3 style={{ marginTop: 0, color: '#4C2365' }}>
                        {viewMode === 'nearby' ? '📍 Nearby Stores (Within 10-15km)' : '🌐 All Available Stores'}
                    </h3>

                    {loading ? (
                        <p>Loading stores...</p>
                    ) : stores.length === 0 ? (
                        <p style={{ color: '#666' }}>No active merchant stores found in this view mode.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {stores.map(store => (
                                <div key={store.id} style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #D8CFE2', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#4C2365' }}>🏪 {store.shopName || store.name || 'Local Store'}</h3>
                                        <p style={{ fontSize: '13px', color: '#666', margin: '5px 0' }}>Owner: {store.name}</p>
                                        <p style={{ fontSize: '13px', color: '#666', margin: '5px 0' }}>Address: {store.shopAddress || 'Local Area'}</p>
                                    </div>
                                    <button 
                                        style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#4C2365', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
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

            {/* PRODUCT DETAIL MODAL */}
            {selectedModalProduct && (
                <ProductDetailModal 
                    product={selectedModalProduct} 
                    onClose={() => setSelectedModalProduct(null)} 
                    onAddToCart={(productId, qty) => handleAddToCart(productId, qty)} 
                />
            )}
        </div>
    );
};

export default CustomerDashboard;