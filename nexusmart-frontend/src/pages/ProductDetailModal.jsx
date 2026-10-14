import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductDetailModal = ({ product, onClose, onAddToCart }) => {
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Buy Now Direct Checkout Modal States
    const [showBuyNowModal, setShowBuyNowModal] = useState(false);
    const [fulfillmentType, setFulfillmentType] = useState('HOME_DELIVERY');
    const [paymentType, setPaymentType] = useState('COD');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [paymentStep, setPaymentStep] = useState('DETAILS'); // 'DETAILS', 'PAYMENT', 'PROCESSING'
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    if (!product) return null;

    const customerUser = JSON.parse(localStorage.getItem('user')) || {};
    const rawUserId = localStorage.getItem('userId') || 
                      customerUser.id || 
                      customerUser.userId || 
                      customerUser.customerId || 
                      customerUser.sub;
    const userId = (rawUserId && rawUserId !== 'undefined') ? rawUserId : null;

    const rawImages = product.images || [];
    const images = rawImages.map(img => {
        const url = typeof img === 'string' ? img : (img?.imageUrl || '');
        return url.startsWith('http') ? url : `http://localhost:2121${url}`;
    });
    const mainImage = images.length > 0 ? images[activeImageIndex] : null;

    const merchant = product.merchant || {};
    const merchantId = merchant.id || product.merchantId || 1;
    const merchantName = merchant.shopName || merchant.name || product.merchantName || 'Local Store';
    const isOutOfStock = product.stockQuantity <= 0;

    const handleOpenBuyNow = () => {
        if (!userId) {
            alert("Please log in as a customer first.");
            navigate('/login');
            return;
        }
        if (customerUser.address) setDeliveryAddress(customerUser.address);
        if (customerUser.phone) setPhoneNumber(customerUser.phone);

        setFulfillmentType('HOME_DELIVERY');
        setPaymentType('COD');
        setPaymentStep('DETAILS');
        setShowBuyNowModal(true);
    };

    const handleProceedNext = () => {
        if (fulfillmentType === 'HOME_DELIVERY' && !deliveryAddress.trim()) {
            alert("Please provide a delivery address for Home Delivery.");
            return;
        }

        if (paymentType === 'ONLINE') {
            setPaymentStep('PAYMENT');
        } else {
            handleConfirmBuyNowCheckout();
        }
    };

    const handleConfirmBuyNowCheckout = async () => {
        if (paymentType === 'ONLINE' && paymentStep === 'PAYMENT') {
            if (!upiId.trim() && !cardNumber.trim()) {
                alert("Please enter a UPI ID or Card Number to simulate online payment.");
                return;
            }
            setPaymentStep('PROCESSING');
            await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        setIsPlacingOrder(true);
        try {
            const token = localStorage.getItem('token');

            // 1. First add the item to cart
            await axios.post(`http://localhost:2121/api/cart/add`, null, {
                params: { userId, productId: product.id, quantity }
            });

            // 2. Immediately checkout this merchant's order
            await axios.post(`http://localhost:2121/api/orders/place`, null, {
                params: { 
                    userId, 
                    merchantId: merchantId,
                    fulfillmentType,
                    paymentType
                },
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            alert(`Order placed successfully from ${merchantName}! 🎉\nThe merchant has been notified.`);
            setShowBuyNowModal(false);
            onClose();
            navigate('/customer-orders');
        } catch (err) {
            console.error("Buy Now Checkout failed", err);
            alert("Failed to place order. Please check stock or backend console.");
            setPaymentStep('DETAILS');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            justify: 'center',
            alignItems: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(3px)'
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '12px',
                width: '750px',
                maxWidth: '92%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Close Main Popup */}
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: '#f1f3f5',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        color: '#555',
                        zIndex: 10
                    }}
                >
                    ✕
                </button>

                <div style={{ display: 'flex', flexWrap: 'wrap', padding: '25px', gap: '25px' }}>
                    {/* Image Preview */}
                    <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                            width: '100%',
                            height: '280px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justify: 'center',
                            overflow: 'hidden',
                            border: '1px solid #eee'
                        }}>
                            {mainImage ? (
                                <img 
                                    src={mainImage} 
                                    alt={product.name} 
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                                />
                            ) : (
                                <span style={{ color: '#aaa', fontSize: '14px' }}>No Image Available</span>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', overflowX: 'auto', maxWidth: '100%' }}>
                                {images.map((img, idx) => (
                                    <img 
                                        key={idx}
                                        src={img} 
                                        alt="" 
                                        onClick={() => setActiveImageIndex(idx)}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '4px',
                                            objectFit: 'cover',
                                            border: activeImageIndex === idx ? '2px solid #007BFF' : '1px solid #ddd',
                                            cursor: 'pointer'
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Specs & Action */}
                    <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <span style={{ fontSize: '12px', background: '#e7f5ff', color: '#1c7ed6', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                🏪 {merchantName}
                            </span>
                            <h2 style={{ margin: '10px 0 6px 0', color: '#212529', fontSize: '22px' }}>{product.name}</h2>
                            
                            <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px', lineHeight: '1.4' }}>
                                {product.description || 'Fresh local product straight from neighboring stores.'}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '15px' }}>
                                <span style={{ fontSize: '26px', fontWeight: 'bold', color: '#2b8a3e' }}>₹{product.price}</span>
                                <span style={{ fontSize: '13px', color: isOutOfStock ? '#e03131' : '#2f9e44', fontWeight: 'bold' }}>
                                    {isOutOfStock ? '❌ Out of Stock' : `In Stock (${product.stockQuantity} available)`}
                                </span>
                            </div>

                            {!isOutOfStock && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#495057' }}>Quantity:</span>
                                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ced4da', borderRadius: '6px', overflow: 'hidden', background: '#f8f9fa' }}>
                                        <button 
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            style={{ padding: '8px 16px', background: '#e9ecef', color: '#212529', border: 'none', borderRight: '1px solid #ced4da', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                                        >
                                            -
                                        </button>
                                        <span style={{ padding: '8px 20px', fontWeight: 'bold', minWidth: '20px', textAlign: 'center', color: '#212529', background: '#fff' }}>{quantity}</span>
                                        <button 
                                            onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                                            style={{ padding: '8px 16px', background: '#e9ecef', color: '#212529', border: 'none', borderLeft: '1px solid #ced4da', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
                            <button 
                                disabled={isOutOfStock}
                                onClick={() => {
                                    onAddToCart(product.id, quantity);
                                    onClose();
                                }}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: isOutOfStock ? '#adb5bd' : '#ff922b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    fontSize: '15px',
                                    cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                                }}
                            >
                                🛒 Add to Cart
                            </button>
                            <button 
                                disabled={isOutOfStock}
                                onClick={handleOpenBuyNow}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: isOutOfStock ? '#adb5bd' : '#2b8a3e',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    fontSize: '15px',
                                    cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                                }}
                            >
                                ⚡ Buy Now
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f3f5', padding: '20px 25px', background: '#fafbfc' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#343a40' }}>Customer Reviews ⭐</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fcc419', fontSize: '18px', fontWeight: 'bold' }}>
                        ★ ★ ★ ★ ☆ <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>(4.2 / 5 based on local customer feedback)</span>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#868e96' }}>
                        "Great quality and delivered fast from {merchantName}!" — Verified Local Customer
                    </p>
                </div>
            </div>

            {/* DIRECT BUY NOW CHECKOUT MODAL */}
            {showBuyNowModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '480px', maxWidth: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                        
                        {paymentStep === 'DETAILS' && (
                            <>
                                <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>Instant Checkout ⚡</h2>
                                <p style={{ margin: '0 0 5px 0', color: '#2b8a3e', fontWeight: 'bold', fontSize: '15px' }}>
                                    {product.name} (Qty: {quantity}) — Total: ₹{product.price * quantity}
                                </p>
                                <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '13px' }}>
                                    Store: <strong>{merchantName}</strong>
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
                                        <option value="SELF_PICKUP">🏃 Self-Pickup (Pick up directly at store)</option>
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
                                            placeholder="Enter your street address, landmark, pincode"
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
                                        disabled={isPlacingOrder}
                                        onClick={() => setShowBuyNowModal(false)}
                                        style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        disabled={isPlacingOrder}
                                        onClick={handleProceedNext}
                                        style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        {paymentType === 'ONLINE' ? 'Proceed to Payment 💳' : 'Place Order 🚀'}
                                    </button>
                                </div>
                            </>
                        )}

                        {paymentStep === 'PAYMENT' && (
                            <>
                                <h2 style={{ margin: '0 0 10px 0', color: '#007BFF' }}>Payment Gateway Simulator 💳</h2>
                                <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                                    Paying <strong>₹{product.price * quantity}</strong> to <strong>{merchantName}</strong>
                                </p>

                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#444' }}>
                                        Enter UPI ID:
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
                                        onClick={handleConfirmBuyNowCheckout}
                                        style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Pay & Place Order 🚀
                                    </button>
                                </div>
                            </>
                        )}

                        {paymentStep === 'PROCESSING' && (
                            <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                <h3 style={{ color: '#007BFF', margin: '0 0 10px 0' }}>Processing Instant Order...</h3>
                                <p style={{ color: '#666' }}>Confirming order with {merchantName}</p>
                                <div style={{ marginTop: '20px', fontSize: '24px' }}>⏳ 💳 🚀</div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailModal;