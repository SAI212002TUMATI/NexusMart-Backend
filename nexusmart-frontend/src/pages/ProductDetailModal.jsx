import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProductDetailModal = ({ product, onClose, onAddToCart }) => {
    if (!product) return null;
    const navigate = useNavigate();

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    
    // Order Options State
    const [fulfillmentType, setFulfillmentType] = useState('HOME_DELIVERY'); 
    const [paymentType, setPaymentType] = useState('COD'); 
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');

    // Inline Payment Gateway Step State
    const [showInlinePayment, setShowInlinePayment] = useState(false);
    const [upiPin, setUpiPin] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const customerUser = JSON.parse(localStorage.getItem('user')) || {};
    const userId = localStorage.getItem('userId') || customerUser.id || customerUser.userId || null;

    const images = product.images || [];
    const mainImageUrl = images.length > 0 && images[selectedImageIndex]
        ? `http://localhost:2121${images[selectedImageIndex].imageUrl}`
        : null;

    useEffect(() => {
        fetchReviews();
        if (customerUser.address) setDeliveryAddress(customerUser.address);
        if (customerUser.mobileNumber || customerUser.phone) setMobileNumber(customerUser.mobileNumber || customerUser.phone);
    }, [product.id]);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`http://localhost:2121/api/products/${product.id}/reviews`);
            setReviews(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error fetching reviews", err);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!userId) {
            alert("Please log in to submit a review.");
            return;
        }
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            await axios.post(`http://localhost:2121/api/products/${product.id}/reviews`, {
                userId: Number(userId),
                rating: Number(newRating),
                comment: newComment
            });
            setNewComment('');
            setNewRating(5);
            fetchReviews();
            alert("Review submitted successfully! ⭐");
        } catch (err) {
            console.error("Failed to submit review", err);
            alert("Error posting review. Make sure you are logged in.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleInitialOrderClick = () => {
        if (!userId) {
            alert("Please log in to place an order.");
            navigate('/login');
            return;
        }

        if (fulfillmentType === 'HOME_DELIVERY' && !deliveryAddress.trim()) {
            alert("Please enter a delivery address.");
            return;
        }

        if (!mobileNumber.trim()) {
            alert("Please enter a mobile number.");
            return;
        }

        // If Online Payment is chosen, switch view to inline payment simulation box
        if (paymentType === 'ONLINE') {
            setShowInlinePayment(true);
        } else {
            // For COD, submit immediately
            executeOrderPlacement();
        }
    };

    const executeOrderPlacement = async () => {
        if (paymentType === 'ONLINE') {
            if (upiPin.trim().length !== 4 || isNaN(upiPin)) {
                alert("❌ Please enter a valid 4-digit UPI PIN.");
                return;
            }
        }

        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const currentUserId = localStorage.getItem('userId') || customerUser.id || customerUser.userId || userId;
            const merchantId = product.merchantId || product.storeId || product.merchant?.id || product.store?.id;

            if (!currentUserId || !merchantId) {
                alert('User or Store ID missing. Please log in again.');
                setIsProcessing(false);
                return;
            }

            // Target the direct order endpoint so it bypasses empty cart checks
            const response = await fetch(
                `http://localhost:2121/api/orders/direct?userId=${currentUserId}&merchantId=${merchantId}&productId=${product.id}&quantity=${quantity}&fulfillmentType=${fulfillmentType}&paymentType=${paymentType}`, 
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                alert('🎉 Order placed successfully!');
                onClose();
                navigate('/customer-orders');
            } else {
                const errorData = await response.text();
                alert(`Failed to place order: ${errorData || 'Server error'}`);
            }
        } catch (err) {
            console.error('Order error:', err);
            alert('Could not connect to backend order server.');
        } finally {
            setIsProcessing(false);
        }
    };

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
        : 'No ratings yet';

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 5px 25px rgba(0,0,0,0.2)', padding: '25px', position: 'relative', fontFamily: 'Arial, sans-serif' }}>
                
                {/* Close Button */}
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: '#f1f3f5', border: 'none', borderRadius: '50%', width: '35px', height: '35px', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold', color: '#1e122a' }}>✕</button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '25px' }}>
                    <div>
                        <div style={{ width: '100%', height: '280px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e9ecef', marginBottom: '15px', overflow: 'hidden' }}>
                            {mainImageUrl ? <img src={mainImageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span>No Image Available</span>}
                        </div>
                        {images.length > 1 && (
                            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
                                {images.map((img, idx) => (
                                    <img key={idx} src={`http://localhost:2121${img.imageUrl}`} alt="thumb" onClick={() => setSelectedImageIndex(idx)} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: selectedImageIndex === idx ? '2px solid #4C2365' : '1px solid #ddd' }} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#4C2365' }}>{product.name}</h2>
                        <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#28a745', marginBottom: '15px' }}>₹{product.price * quantity}</div>
                        <p style={{ color: '#495057', fontSize: '13px', lineHeight: '1.4' }}>{product.description}</p>
                        
                        {/* Quantity Selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '15px 0' }}>
                            <span style={{ fontWeight: 'bold', color: '#4C2365', fontSize: '13px' }}>Quantity:</span>
                            <div style={{ display: 'flex', border: '1px solid #7F6091', borderRadius: '6px', overflow: 'hidden', background: '#f5f2f8' }}>
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ padding: '4px 12px', background: '#e9ecef', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                                <span style={{ padding: '4px 12px', fontWeight: 'bold', color: '#1e122a', margin: 'auto' }}>{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)} style={{ padding: '4px 12px', background: '#e9ecef', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                            </div>
                        </div>

                        {/* Fulfillment Type Selector */}
                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', color: '#4C2365', fontSize: '13px', marginBottom: '5px' }}>Fulfillment Method:</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setFulfillmentType('HOME_DELIVERY')}
                                    style={{ flex: 1, padding: '8px', border: fulfillmentType === 'HOME_DELIVERY' ? '2px solid #4C2365' : '1px solid #ddd', background: fulfillmentType === 'HOME_DELIVERY' ? '#f5f2f8' : '#fff', color: '#4C2365', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                                >
                                    🚚 Home Delivery
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setFulfillmentType('SELF_PICKUP')}
                                    style={{ flex: 1, padding: '8px', border: fulfillmentType === 'SELF_PICKUP' ? '2px solid #4C2365' : '1px solid #ddd', background: fulfillmentType === 'SELF_PICKUP' ? '#f5f2f8' : '#fff', color: '#4C2365', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                                >
                                    🏃 Self Pickup
                                </button>
                            </div>
                        </div>

                        {/* Delivery Address & Mobile Number Inputs */}
                        {fulfillmentType === 'HOME_DELIVERY' && (
                            <div style={{ margin: '10px 0' }}>
                                <input 
                                    type="text" 
                                    placeholder="Delivery Address" 
                                    value={deliveryAddress} 
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #7F6091', marginBottom: '8px', fontSize: '13px', background: '#fff', color: '#333' }}
                                />
                            </div>
                        )}
                        <div style={{ margin: '10px 0' }}>
                            <input 
                                type="text" 
                                placeholder="Mobile Number" 
                                value={mobileNumber} 
                                onChange={(e) => setMobileNumber(e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #7F6091', marginBottom: '10px', fontSize: '13px', background: '#fff', color: '#333' }}
                            />
                        </div>

                        {/* Payment Method Selector */}
                        <div style={{ margin: '15px 0' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', color: '#4C2365', fontSize: '13px', marginBottom: '5px' }}>Payment Method:</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => { setPaymentType('COD'); setShowInlinePayment(false); }}
                                    style={{ flex: 1, padding: '8px', border: paymentType === 'COD' ? '2px solid #4C2365' : '1px solid #ddd', background: paymentType === 'COD' ? '#f5f2f8' : '#fff', color: '#4C2365', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                                >
                                    💵 Cash on Delivery
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setPaymentType('ONLINE')}
                                    style={{ flex: 1, padding: '8px', border: paymentType === 'ONLINE' ? '2px solid #4C2365' : '1px solid #ddd', background: paymentType === 'ONLINE' ? '#f5f2f8' : '#fff', color: '#4C2365', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                                >
                                    💳 Online Payment
                                </button>
                            </div>
                        </div>

                        {/* INLINE PAYMENT GATEWAY SIMULATION BOX */}
                        {showInlinePayment && (
                            <div style={{ background: '#f5f2f8', border: '1px solid #4C2365', padding: '12px', borderRadius: '6px', margin: '15px 0' }}>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#4C2365' }}>Secure Gateway Simulation</h4>
                                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#555' }}>Amount to Pay: <strong>₹{product.price * quantity}</strong></p>
                                <input 
                                    type="text" 
                                    maxLength="4"
                                    placeholder="Enter 4-digit UPI PIN (e.g. 1234)" 
                                    value={upiPin}
                                    onChange={(e) => setUpiPin(e.target.value)}
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #7F6091', marginBottom: '8px', fontSize: '13px', background: '#fff', color: '#333' }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowInlinePayment(false)} 
                                        style={{ flex: 1, padding: '6px', background: '#e9ecef', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', color: '#333' }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={executeOrderPlacement} 
                                        disabled={isProcessing}
                                        style={{ flex: 1, padding: '6px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        {isProcessing ? 'Processing...' : 'Pay & Order'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {!showInlinePayment && (
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button onClick={() => onAddToCart(product.id, quantity)} style={{ flex: 1, padding: '10px', background: '#ffffff', color: '#4C2365', border: '1px solid #4C2365', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🛒 Add to Cart</button>
                                <button onClick={handleInitialOrderClick} style={{ flex: 1, padding: '10px', background: '#4C2365', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(76, 35, 101, 0.4)' }}>⚡ Order Now</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ratings & Real Backend Reviews Section */}
                <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '20px' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#4C2365' }}>Customer Reviews & Ratings ⭐ ({averageRating} / 5)</h3>
                    
                    {/* Write Review Form */}
                    <form onSubmit={handleReviewSubmit} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#4C2365' }}>Leave a Review</h4>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#4C2365' }}>
                                Rating: 
                                <select value={newRating} onChange={(e) => setNewRating(e.target.value)} style={{ marginLeft: '5px', padding: '4px', background: '#fff', color: '#333', border: '1px solid #7F6091', borderRadius: '4px' }}>
                                    <option value="5">5 ⭐⭐⭐⭐⭐</option>
                                    <option value="4">4 ⭐⭐⭐⭐</option>
                                    <option value="3">3 ⭐⭐⭐</option>
                                    <option value="2">2 ⭐⭐</option>
                                    <option value="1">1 ⭐</option>
                                </select>
                            </label>
                        </div>
                        <textarea 
                            rows="2" 
                            placeholder="Write your experience with this product..." 
                            value={newComment} 
                            onChange={(e) => setNewComment(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #7F6091', marginBottom: '10px', resize: 'vertical', background: '#fff', color: '#333' }}
                        />
                        <button type="submit" disabled={submitting} style={{ padding: '6px 14px', background: '#4C2365', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                            {submitting ? 'Submitting...' : 'Post Review'}
                        </button>
                    </form>

                    {/* Display Real Reviews */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {reviews.length === 0 ? (
                            <p style={{ color: '#666', fontSize: '13px' }}>No reviews yet. Be the first to review this product!</p>
                        ) : (
                            reviews.map((rev) => (
                                <div key={rev.id} style={{ background: '#fff', border: '1px solid #e9ecef', padding: '12px', borderRadius: '6px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                        <strong style={{ fontSize: '13px', color: '#333' }}>{rev.userName || 'Customer'}</strong>
                                        <span style={{ color: '#ffc107', fontSize: '12px' }}>{'⭐'.repeat(rev.rating)}</span>
                                    </div>
                                    <p style={{ margin: '0', fontSize: '13px', color: '#555' }}>{rev.comment}</p>
                                    <span style={{ fontSize: '11px', color: '#999', marginTop: '4px', display: 'block' }}>
                                        {new Date(rev.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductDetailModal;