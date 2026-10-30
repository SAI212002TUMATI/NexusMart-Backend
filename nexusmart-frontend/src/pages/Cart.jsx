import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedGroup, setSelectedGroup] = useState(null);
    const [fulfillmentType, setFulfillmentType] = useState('HOME_DELIVERY');
    const [paymentType, setPaymentType] = useState('COD');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [paymentStep, setPaymentStep] = useState('DETAILS');

    const getUserId = () => {
        try {
            const directId = localStorage.getItem('userId');
            if (directId && directId !== 'undefined' && directId !== 'null') {
                return directId;
            }
            const userStr = localStorage.getItem('user');
            if (userStr && userStr !== 'undefined' && userStr !== 'null') {
                const userObj = JSON.parse(userStr);
                return userObj.userId || userObj.id || userObj.customerId || userObj.sub;
            }
        } catch (e) {
            console.error("Error parsing user session", e);
        }
        return null;
    };

    const userId = getUserId();

    useEffect(() => {
        if (!userId) {
            alert("Please log in as a customer first.");
            navigate('/login');
            return;
        }

        try {
            const userObj = JSON.parse(localStorage.getItem('user')) || {};
            if (userObj.address) setDeliveryAddress(userObj.address);
            if (userObj.phone) setPhoneNumber(userObj.phone);
        } catch (e) {
            // Ignore
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
            let items = Array.isArray(rawData) ? rawData : (rawData?.items || []);
            setCartItems(items);
        } catch (err) {
            console.error("Error fetching cart from backend, falling back to local cart", err);
            const localCart = JSON.parse(localStorage.getItem('nexusmart_cart') || '[]');
            setCartItems(localCart);
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
            await axios.put(`http://localhost:2121/api/cart/update`, null, {
                params: { userId, productId, quantity: newQuantity },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            fetchCart();
        } catch (err) {
            // Fallback for local storage cart
            const localCart = JSON.parse(localStorage.getItem('nexusmart_cart') || '[]');
            const updated = localCart.map(item => ((item.id || item.productId) === productId ? { ...item, quantity: newQuantity } : item));
            localStorage.setItem('nexusmart_cart', JSON.stringify(updated));
            setCartItems(updated);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:2121/api/cart/remove`, {
                params: { userId, productId },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            fetchCart();
        } catch (err) {
            const localCart = JSON.parse(localStorage.getItem('nexusmart_cart') || '[]');
            const updated = localCart.filter(item => (item.id || item.productId) !== productId);
            localStorage.setItem('nexusmart_cart', JSON.stringify(updated));
            setCartItems(updated);
        }
    };

    const handleOpenCheckoutModal = (group) => {
        if (!userId) {
            alert("User session not found. Please log in again.");
            navigate('/login');
            return;
        }

        setSelectedGroup(group);
        setFulfillmentType('HOME_DELIVERY');
        setPaymentType('COD');
        setPaymentStep('DETAILS');
        setIsCheckingOut(true);
    };

    const handleProceedNext = () => {
        if (fulfillmentType === 'HOME_DELIVERY' && !deliveryAddress.trim()) {
            alert("Please provide a delivery address for Home Delivery.");
            return;
        }

        if (paymentType === 'ONLINE') {
            setPaymentStep('PAYMENT');
        } else {
            handleConfirmCheckout();
        }
    };

    const handleConfirmCheckout = async () => {
        if (!selectedGroup) return;

        if (paymentType === 'ONLINE' && paymentStep === 'PAYMENT') {
            if (!upiId.trim() && !cardNumber.trim()) {
                alert("Please enter a UPI ID or Card Number to simulate online payment.");
                return;
            }
            setPaymentStep('PROCESSING');
            await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:2121/api/orders/place`, null, {
                params: { 
                    userId, 
                    merchantId: selectedGroup.merchantId,
                    fulfillmentType,
                    paymentType
                },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            alert(`Order placed successfully from ${selectedGroup.merchantName}! 🎉`);
            setIsCheckingOut(false);
            setSelectedGroup(null);
            
            // Clear items from this store in local storage cart
            const localCart = JSON.parse(localStorage.getItem('nexusmart_cart') || '[]');
            const remaining = localCart.filter(item => (item.merchantName || item.shopName || item.storeName) !== selectedGroup.merchantName);
            localStorage.setItem('nexusmart_cart', JSON.stringify(remaining));

            fetchCart(); 
            navigate('/customer/orders');
        } catch (err) {
            console.error("Checkout failed", err);
            alert("Failed to place order. Check backend console or stock availability.");
            setPaymentStep('DETAILS');
        }
    };

    const groupedByMerchant = cartItems.reduce((acc, item) => {
        if (!item) return acc;
        
        const merchantId = item.merchantId || item.storeId || (item.product && item.product.merchantId) || 1;
        const merchantName = item.merchantName || item.shopName || item.storeName || (item.product && item.product.storeName) || 'Local Store';

        if (!acc[merchantName]) {
            acc[merchantName] = {
                merchantId,
                merchantName,
                items: []
            };
        }
        acc[merchantName].items.push(item);
        return acc;
    }, {});

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>Loading your cart...</div>;
    }

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto', background: '#1e122a', color: '#fff', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(216,207,226,0.15)', paddingBottom: '15px', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#fff' }}>Your Shopping Cart 🛒</h1>
                    <p style={{ margin: '5px 0 0 0', color: '#B5A4C3' }}>Review items, update quantities, or proceed to checkout</p>
                </div>
                <button 
                    onClick={() => navigate('/customer/dashboard')} 
                    style={{ padding: '8px 15px', background: 'rgba(255,255,255,0.05)', border: '1px solid #7F6091', color: '#D8CFE2', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    ← Back to Dashboard
                </button>
            </div>

            {Object.keys(groupedByMerchant).length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '40px', textAlign: 'center', borderRadius: '12px', border: '1px solid rgba(216,207,226,0.1)' }}>
                    <p style={{ color: '#B5A4C3', fontSize: '18px' }}>Your cart is currently empty.</p>
                    <button 
                        onClick={() => navigate('/customer/dashboard')}
                        style={{ marginTop: '15px', padding: '10px 20px', background: '#4C2365', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                Object.values(groupedByMerchant).map(group => {
                    const storeSubtotal = group.items.reduce((sum, item) => sum + ((item?.price || item?.product?.price || 0) * (item?.quantity || 1)), 0);

                    return (
                        <div key={group.merchantName} style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(216,207,226,0.1)', marginBottom: '20px' }}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#D8CFE2', borderBottom: '1px solid rgba(216,207,226,0.1)', paddingBottom: '8px' }}>
                                🏪 Store: {group.merchantName}
                            </h3>

                            {group.items.map((item, idx) => {
                                const prodId = item?.id || item?.productId || item?.product?.id;
                                const prodName = item?.name || item?.productName || item?.product?.name || 'Product';
                                const prodPrice = item?.price || item?.product?.price || 0;
                                const quantity = item?.quantity || 1;
                                const rawImg = item?.imageUrl || item?.product?.imageUrl;
                                const imageUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `http://localhost:2121${rawImg}`) : null;

                                return (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={prodName} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #7F6091' }} />
                                            ) : (
                                                <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#B5A4C3' }}>No Img</div>
                                            )}
                                            <div>
                                                <h4 style={{ margin: '0 0 4px 0', color: '#fff' }}>{prodName}</h4>
                                                <p style={{ margin: 0, fontSize: '13px', color: '#B5A4C3' }}>₹{prodPrice} each</p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #7F6091', borderRadius: '6px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                                                <button onClick={() => handleUpdateQuantity(prodId, quantity - 1)} style={{ padding: '6px 12px', background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                                                <span style={{ padding: '6px 12px', fontWeight: 'bold', color: '#fff' }}>{quantity}</span>
                                                <button onClick={() => handleUpdateQuantity(prodId, quantity + 1)} style={{ padding: '6px 12px', background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                                            </div>

                                            <span style={{ fontWeight: 'bold', color: '#4ade80', minWidth: '80px', textAlign: 'right' }}>
                                                ₹{prodPrice * quantity}
                                            </span>

                                            <button onClick={() => handleRemoveItem(prodId)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid rgba(216,207,226,0.1)' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#D8CFE2' }}>
                                    Store Subtotal: <span style={{ color: '#4ade80' }}>₹{storeSubtotal}</span>
                                </span>
                                <button onClick={() => handleOpenCheckoutModal(group)} style={{ padding: '10px 20px', background: '#4C2365', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Proceed to Checkout 🛍️
                                </button>
                            </div>
                        </div>
                    );
                })
            )}

            {/* CHECKOUT MODAL */}
            {isCheckingOut && selectedGroup && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15,8,23,0.85)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#1e122a', border: '1px solid #7F6091', padding: '30px', borderRadius: '12px', width: '480px', maxWidth: '90%', color: '#fff' }}>
                        {paymentStep === 'DETAILS' && (
                            <>
                                <h2 style={{ margin: '0 0 10px 0', color: '#fff' }}>Checkout Order</h2>
                                <p style={{ margin: '0 0 15px 0', color: '#B5A4C3', fontSize: '14px' }}>Store: <strong>{selectedGroup.merchantName}</strong></p>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px' }}>Fulfillment Option:</label>
                                    <select value={fulfillmentType} onChange={(e) => setFulfillmentType(e.target.value)} style={{ width: '100%', padding: '10px', background: '#1e122a', color: '#fff', border: '1px solid #7F6091', borderRadius: '6px' }}>
                                        <option value="HOME_DELIVERY">🛵 Home Delivery</option>
                                        <option value="SELF_PICKUP">🏃 Self-Pickup</option>
                                    </select>
                                </div>

                                {fulfillmentType === 'HOME_DELIVERY' && (
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px' }}>Delivery Address:</label>
                                        <textarea rows="2" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Full street address, pincode" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid #7F6091', borderRadius: '6px', color: '#fff' }} />
                                    </div>
                                )}

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px' }}>Contact Phone:</label>
                                    <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Mobile number" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid #7F6091', borderRadius: '6px', color: '#fff' }} />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px' }}>Payment Method:</label>
                                    <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)} style={{ width: '100%', padding: '10px', background: '#1e122a', color: '#fff', border: '1px solid #7F6091', borderRadius: '6px' }}>
                                        <option value="COD">💵 Cash on Delivery (COD)</option>
                                        <option value="ONLINE">💳 Online Payment (UPI / Card)</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button onClick={() => setIsCheckingOut(false)} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #7F6091', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                                    <button onClick={handleProceedNext} style={{ padding: '10px 20px', background: '#4C2365', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{paymentType === 'ONLINE' ? 'Proceed to Payment 💳' : 'Place Order 🚀'}</button>
                                </div>
                            </>
                        )}

                        {paymentStep === 'PAYMENT' && (
                            <>
                                <h2 style={{ margin: '0 0 10px 0', color: '#fff' }}>Payment Simulator 💳</h2>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '13px' }}>Enter UPI ID / Card:</label>
                                    <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="user@upi" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid #7F6091', borderRadius: '6px', color: '#fff' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button onClick={() => setPaymentStep('DETAILS')} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #7F6091', borderRadius: '6px', cursor: 'pointer' }}>← Back</button>
                                    <button onClick={handleConfirmCheckout} style={{ padding: '10px 20px', background: '#4C2365', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Pay & Place Order 🚀</button>
                                </div>
                            </>
                        )}

                        {paymentStep === 'PROCESSING' && (
                            <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                <h3 style={{ color: '#fff', margin: '0 0 10px 0' }}>Processing Payment...</h3>
                                <div style={{ marginTop: '20px', fontSize: '24px' }}>⏳ 💳 🚀</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;