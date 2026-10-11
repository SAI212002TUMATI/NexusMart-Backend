import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Robust user session parsing
    const currentUser = JSON.parse(localStorage.getItem('user')) || {};
    const rawUserId = localStorage.getItem('userId') || 
                      currentUser.id || 
                      currentUser.userId || 
                      currentUser.customerId || 
                      currentUser.sub;
    const userId = (rawUserId && rawUserId !== 'undefined') ? rawUserId : null;

    useEffect(() => {
        if (!userId) {
            alert("Please log in as a customer first.");
            navigate('/login');
            return;
        }
        fetchCart();
    }, [userId]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:2121/api/cart/user/${userId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const rawData = response.data;
            let items = [];
            if (Array.isArray(rawData)) {
                items = rawData;
            } else if (rawData && Array.isArray(rawData.items)) {
                items = rawData.items;
            }
            setCartItems(items);
        } catch (err) {
            console.error("Error fetching cart", err);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        if (newQuantity <= 0) {
            handleRemoveItem(productId);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:2121/api/cart/update`, null, {
                params: { userId, productId, quantity: newQuantity },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const rawData = response.data;
            let items = [];
            if (Array.isArray(rawData)) {
                items = rawData;
            } else if (rawData && Array.isArray(rawData.items)) {
                items = rawData.items;
            }
            setCartItems(items);
        } catch (err) {
            console.error("Failed to update quantity", err);
            alert("Could not update item quantity.");
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`http://localhost:2121/api/cart/remove`, {
                params: { userId, productId },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            const rawData = response.data;
            let items = [];
            if (Array.isArray(rawData)) {
                items = rawData;
            } else if (rawData && Array.isArray(rawData.items)) {
                items = rawData.items;
            }
            setCartItems(items);
        } catch (err) {
            console.error("Failed to remove item", err);
            alert("Could not remove item from cart.");
        }
    };

    const handleCheckoutForMerchant = async (merchantId) => {
        if (!userId) {
            alert("User session not found. Please log in again.");
            navigate('/login');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:2121/api/orders/place`, null, {
                params: { userId, merchantId },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            alert(`Order placed successfully for this store! 🎉`);
            fetchCart(); 
            navigate('/customer-orders');
        } catch (err) {
            console.error("Checkout failed", err);
            alert("Failed to place order. Check stock or try again.");
        }
    };

    // Safely group cart items by merchant store with fallbacks
    const groupedByMerchant = cartItems.reduce((acc, item) => {
        if (!item) return acc;
        const product = item.product || {};
        const merchant = product.merchant || {};
        const merchantId = merchant.id || item.merchantId || 'unknown';
        const merchantName = merchant.shopName || merchant.name || 'Local Store';

        if (!acc[merchantId]) {
            acc[merchantId] = {
                merchantId,
                merchantName,
                items: []
            };
        }
        acc[merchantId].items.push(item);
        return acc;
    }, {});

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>Loading your cart...</div>;
    }

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto', background: '#f5f7fa', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ddd', paddingBottom: '15px', marginBottom: '20px', background: 'white', padding: '20px', borderRadius: '8px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#333' }}>Your Shopping Cart 🛒</h1>
                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>Review your items, update quantities, or check out</p>
                </div>
                <button 
                    onClick={() => navigate('/customer/dashboard')} 
                    style={{ padding: '8px 15px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    ← Back to Dashboard
                </button>
            </div>

            {Object.keys(groupedByMerchant).length === 0 ? (
                <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <p style={{ color: '#666', fontSize: '18px' }}>Your cart is currently empty.</p>
                    <button 
                        onClick={() => navigate('/customer/dashboard')}
                        style={{ marginTop: '15px', padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                Object.values(groupedByMerchant).map(group => {
                    const storeSubtotal = group.items.reduce((sum, item) => {
                        const price = item?.product?.price || item?.price || 0;
                        const qty = item?.quantity || 1;
                        return sum + (price * qty);
                    }, 0);
                    
                    return (
                        <div key={group.merchantId} style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#007BFF', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                                🏪 Store: {group.merchantName}
                            </h3>

                            {group.items.map((item, idx) => {
                                const prod = item?.product || {};
                                const prodId = prod.id || item?.productId;
                                const prodName = prod.name || item?.productName || 'Product';
                                const prodPrice = prod.price || item?.price || 0;
                                const quantity = item?.quantity || 1;

                                // Robust image resolution checking product and item image arrays
                                const prodImages = prod.images || item?.images || [];
                                const firstImage = prodImages.length > 0 ? prodImages[0] : null;
                                const rawImageUrl = typeof firstImage === 'string' ? firstImage : (firstImage?.imageUrl || item?.imageUrl);
                                const imageUrl = rawImageUrl ? (rawImageUrl.startsWith('http') ? rawImageUrl : `http://localhost:2121${rawImageUrl}`) : null;

                                return (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f9f9f9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            {imageUrl ? (
                                                <img 
                                                    src={imageUrl} 
                                                    alt={prodName} 
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} 
                                                />
                                            ) : (
                                                <div style={{ width: '60px', height: '60px', background: '#e9ecef', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#666' }}>
                                                    No Img
                                                </div>
                                            )}
                                            <div>
                                                <h4 style={{ margin: '0 0 4px 0' }}>{prodName}</h4>
                                                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>₹{prodPrice} each</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            {/* Clearly styled Increment / Decrement Controls */}
                                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden', background: '#fff' }}>
                                                <button 
                                                    onClick={() => handleUpdateQuantity(prodId, quantity - 1)}
                                                    style={{ padding: '6px 14px', background: '#e9ecef', color: '#333', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                                                >
                                                    -
                                                </button>
                                                <span style={{ padding: '6px 16px', fontWeight: 'bold', color: '#333' }}>{quantity}</span>
                                                <button 
                                                    onClick={() => handleUpdateQuantity(prodId, quantity + 1)}
                                                    style={{ padding: '6px 14px', background: '#e9ecef', color: '#333', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <span style={{ fontWeight: 'bold', color: '#28a745', minWidth: '80px', textAlign: 'right' }}>
                                                ₹{prodPrice * quantity}
                                            </span>

                                            <button 
                                                onClick={() => handleRemoveItem(prodId)}
                                                style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                                    Store Subtotal: <span style={{ color: '#28a745' }}>₹{storeSubtotal}</span>
                                </span>
                                <button 
                                    onClick={() => handleCheckoutForMerchant(group.merchantId)}
                                    style={{ padding: '10px 25px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Proceed to Checkout 🛍️
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default Cart;