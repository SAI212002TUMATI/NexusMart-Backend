import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductDetailModal = ({ product, onClose, onAddToCart }) => {
    if (!product) return null;

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    
    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Get current logged-in customer ID
    const customerUser = JSON.parse(localStorage.getItem('user')) || {};
    const userId = localStorage.getItem('userId') || customerUser.id || customerUser.userId || null;

    const images = product.images || [];
    const mainImageUrl = images.length > 0 && images[selectedImageIndex]
        ? `http://localhost:2121${images[selectedImageIndex].imageUrl}`
        : null;

    useEffect(() => {
        fetchReviews();
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
            // Matches your ReviewRequestDto fields (userId, rating, comment)
            await axios.post(`http://localhost:2121/api/products/${product.id}/reviews`, {
                userId: Number(userId),
                rating: Number(newRating),
                comment: newComment
            });
            setNewComment('');
            setNewRating(5);
            fetchReviews(); // Refresh review list
            alert("Review submitted successfully! ⭐");
        } catch (err) {
            console.error("Failed to submit review", err);
            alert("Error posting review. Make sure you are logged in.");
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate average rating dynamically
    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
        : 'No ratings yet';

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 5px 25px rgba(0,0,0,0.2)', padding: '25px', position: 'relative', fontFamily: 'Arial, sans-serif' }}>
                
                {/* Close Button */}
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: '#f1f3f5', border: 'none', borderRadius: '50%', width: '35px', height: '35px', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '25px' }}>
                    <div>
                        <div style={{ width: '100%', height: '280px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e9ecef', marginBottom: '15px', overflow: 'hidden' }}>
                            {mainImageUrl ? <img src={mainImageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span>No Image Available</span>}
                        </div>
                        {images.length > 1 && (
                            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
                                {images.map((img, idx) => (
                                    <img key={idx} src={`http://localhost:2121${img.imageUrl}`} alt="thumb" onClick={() => setSelectedImageIndex(idx)} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: selectedImageIndex === idx ? '2px solid #007BFF' : '1px solid #ddd' }} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 style={{ margin: '0 0 10px 0', fontSize: '22px' }}>{product.name}</h2>
                        <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#28a745', marginBottom: '15px' }}>₹{product.price}</div>
                        <p style={{ color: '#495057', fontSize: '14px', lineHeight: '1.5' }}>{product.description}</p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '20px 0' }}>
                            <span>Quantity:</span>
                            <div style={{ display: 'flex', border: '1px solid #ced4da', borderRadius: '4px' }}>
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ padding: '5px 10px', background: '#e9ecef', border: 'none', cursor: 'pointer' }}>-</button>
                                <span style={{ padding: '5px 15px', fontWeight: 'bold' }}>{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)} style={{ padding: '5px 10px', background: '#e9ecef', border: 'none', cursor: 'pointer' }}>+</button>
                            </div>
                        </div>

                        <button onClick={() => onAddToCart(product.id, quantity)} style={{ width: '100%', padding: '12px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🛒 Add to Cart</button>
                    </div>
                </div>

                {/* Ratings & Real Backend Reviews Section */}
                <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '20px' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Customer Reviews & Ratings ⭐ ({averageRating} / 5)</h3>
                    
                    {/* Write Review Form */}
                    <form onSubmit={handleReviewSubmit} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Leave a Review</h4>
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                            <label style={{ fontSize: '13px' }}>
                                Rating: 
                                <select value={newRating} onChange={(e) => setNewRating(e.target.value)} style={{ marginLeft: '5px', padding: '4px' }}>
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
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', marginBottom: '10px', resize: 'vertical' }}
                        />
                        <button type="submit" disabled={submitting} style={{ padding: '6px 14px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                            {submitting ? 'Submitting...' : 'Post Review'}
                        </button>
                    </form>

                    {/* Display Real Reviews mapping to ReviewResponseDto */}
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