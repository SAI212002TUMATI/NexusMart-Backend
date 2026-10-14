import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [fulfillmentType, setFulfillmentType] = useState('HOME_DELIVERY');
    const [paymentType, setPaymentType] = useState('COD');
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    
    // Delivery & Payment Details State
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [paymentStep, setPaymentStep] = useState('DETAILS'); // 'DETAILS', 'PAYMENT', 'PROCESSING'

    // User session parsing
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
        if (currentUser.address) setDeliveryAddress(currentUser.address);
        if (currentUser.phone) setPhoneNumber(currentUser.phone);

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
            let items = Array.isArray(rawData) ? rawData : (rawData?.items || []);
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
            let items = Array.isArray(rawData) ? rawData : (rawData?.items || []);
            setCartItems(items);
        } catch (err) {
            console.error("Failed to remove item", err);
            alert("Could not remove item from cart.");
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

        // If online payment is selected and we are at the payment input step
        if (paymentType === 'ONLINE' && paymentStep === 'PAYMENT') {
            if (!upiId.trim() && !cardNumber.trim()) {
                alert("Please enter a UPI ID or Card Number to simulate online payment.");
                return;
            }
            setPaymentStep('PROCESSING');
            // Simulate 1.5 second payment network verification delay
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

            alert(`Order placed successfully from ${selectedGroup.merchantName}! 🎉\nThe merchant has been notified to prepare your items.`);
            setIsCheckingOut(false);
            setSelectedGroup(null);
            fetchCart(); 
            navigate('/customer-orders');
        } catch (err) {
            console.error("Checkout failed", err);
            alert("Failed to place order. Check backend console or stock availability.");
            setPaymentStep('DETAILS');
        }
    };

    // Safely group cart items by merchant store
    const groupedByMerchant = cartItems.reduce((acc, item) => {
        if (!item) return acc;
        const product = item.product || {};
        const merchant = product.merchant || {};
        
        const merchantId = merchant.id || product.merchantId || item.merchantId || product.merchant_id || 1;
        const merchantName = merchant.shopName || merchant.name || product.merchantName || 'Local Store';

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
                                    onClick={() => handleOpenCheckoutModal(group)}
                                    style={{ padding: '10px 25px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Proceed to Checkout 🛍️
                                </button>
                            </div>
                        </div>
                    );
                })
            )}

            {/* CHECKOUT & PAYMENT MODAL */}
            {isCheckingOut && selectedGroup && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '480px', maxWidth: '90%', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                        
                        {/* STEP 1: DETAILS & FULFILLMENT */}
                        {paymentStep === 'DETAILS' && (
                            <>
                                <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>Checkout Order</h2>
                                <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                                    Store: <strong>{selectedGroup.merchantName}</strong>
                                </p>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#444' }}>
                                        Fulfillment Option:
                                    </label>
                                    <select 
                                        value={fulfillmentType} 
                                        onChange={(e) => setFulfillmentType(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                                    >
                                        <option value="HOME_DELIVERY">🛵 Home Delivery (10-15km hyperlocal radius)</option>
                                        <option value="SELF_PICKUP">🏃 Self-Pickup (Pick up directly at the store)</option>
                                    </select>
                                </div>

                                {fulfillmentType === 'HOME_DELIVERY' && (
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#444' }}>
                                            Delivery Address:
                                        </label>
                                        <textarea 
                                            rows="2"
                                            value={deliveryAddress}
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            placeholder="Enter your full street address, landmark, pincode"
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', resize: 'none' }}
                                        />
                                    </div>
                                )}

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#444' }}>
                                        Contact Phone Number:
                                    </label>
                                    <input 
                                        type="text"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="Enter 10-digit mobile number"
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#444' }}>
                                        Payment Method:
                                    </label>
                                    <select 
                                        value={paymentType} 
                                        onChange={(e) => setPaymentType(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                                    >
                                        <option value="COD">💵 Cash on Delivery (COD)</option>
                                        <option value="ONLINE">💳 Online Payment (UPI / Credit Card Simulator)</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button 
                                        onClick={() => setIsCheckingOut(false)}
                                        style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleProceedNext}
                                        style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        {paymentType === 'ONLINE' ? 'Proceed to Payment 💳' : 'Place Order 🚀'}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* STEP 2: ONLINE PAYMENT SIMULATOR */}
                        {paymentStep === 'PAYMENT' && (
                            <>
                                <h2 style={{ margin: '0 0 10px 0', color: '#007BFF' }}>Payment Gateway Simulator 💳</h2>
                                <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                                    Simulating secure payment to <strong>{selectedGroup.merchantName}</strong>
                                </p>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#444' }}>
                                        Enter UPI ID (e.g., user@upi):
                                    </label>
                                    <input 
                                        type="text"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="username@okaxis or username@paytm"
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                                    />
                                </div>

                                <p style={{ textAlign: 'center', color: '#888', margin: '10px 0', fontWeight: 'bold' }}>— OR —</p>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#444' }}>
                                        Card Number (Simulation):
                                    </label>
                                    <input 
                                        type="text"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        placeholder="4000 0000 0000 0000"
                                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button 
                                        onClick={() => setPaymentStep('DETAILS')}
                                        style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        ← Back
                                    </button>
                                    <button 
                                        onClick={handleConfirmCheckout}
                                        style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Pay & Place Order 🚀
                                    </button>
                                </div>
                            </>
                        )}

                        {/* STEP 3: PROCESSING SPINNER */}
                        {paymentStep === 'PROCESSING' && (
                            <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                <h3 style={{ color: '#007BFF', margin: '0 0 10px 0' }}>Processing Payment...</h3>
                                <p style={{ color: '#666' }}>Connecting to bank & confirming order with {selectedGroup.merchantName}</p>
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