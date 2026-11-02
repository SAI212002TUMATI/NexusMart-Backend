import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MerchantDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'orders'
    const [orderSubTab, setOrderSubTab] = useState('active'); // 'active' or 'delivered'
    const [inventory, setInventory] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // Add Product Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productStock, setProductStock] = useState('');
    const [productCategoryId, setProductCategoryId] = useState('');
    const [imageFiles, setImageFiles] = useState([]);

    // Category Creation Toggle State
    const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const merchantUser = JSON.parse(localStorage.getItem('user')) || {};
    const merchantId = 5;

    useEffect(() => {
        if (activeTab === 'inventory') {
            fetchInventory();
        } else {
            fetchMerchantOrders(orderSubTab);
        }
        fetchCategories();
    }, [activeTab, orderSubTab]);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:2121/api/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Error fetching categories", err);
        }
    };

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:2121/api/stores/${merchantId}/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInventory(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Error fetching inventory", err);
            setInventory([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMerchantOrders = async (subTab) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:2121/api/merchant/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const allOrders = Array.isArray(response.data) ? response.data : [];
            
            if (subTab === 'delivered') {
                setOrders(allOrders.filter(o => o.status === 'DELIVERED'));
            } else {
                setOrders(allOrders.filter(o => o.status !== 'DELIVERED'));
            }
        } catch (err) {
            console.error("Error fetching merchant orders", err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:2121/api/merchant/orders/${orderId}/status`, null, {
                params: { status: newStatus },
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMerchantOrders(orderSubTab);
        } catch (err) {
            console.error("Failed to update order status", err);
            alert("Could not update order status.");
        }
    };

    const handleFileChange = (e) => {
        setImageFiles(e.target.files);
    };

    const handleAddProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            let categoryIdToUse = productCategoryId;

            // If merchant chose to add a brand-new category inline, create it first via POST /api/categories
            if (isCreatingNewCategory && newCategoryName.trim() !== '') {
                const catResponse = await axios.post(`http://localhost:2121/api/categories`, 
                    { name: newCategoryName.trim() },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                categoryIdToUse = catResponse.data.id;
            }

            const formData = new FormData();
            formData.append('name', productName);
            formData.append('description', productDescription);
            formData.append('price', productPrice);
            formData.append('stockQuantity', productStock);
            formData.append('merchantId', merchantId);
            formData.append('categoryId', categoryIdToUse);

            if (imageFiles.length > 0) {
                for (let i = 0; i < imageFiles.length; i++) {
                    formData.append('images', imageFiles[i]);
                }
            }

            await axios.post(`http://localhost:2121/api/products`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Product added successfully with local images!');
            setShowAddModal(false);
            setProductName('');
            setProductDescription('');
            setProductPrice('');
            setProductStock('');
            setProductCategoryId('');
            setNewCategoryName('');
            setIsCreatingNewCategory(false);
            setImageFiles([]);
            fetchCategories(); // Refresh categories list
            fetchInventory();
        } catch (err) {
            console.error("Failed to add product", err);
            alert("Error adding product. Check console details.");
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
                    <h1 style={{ margin: 0, color: '#333' }}>Merchant Store Dashboard: {merchantUser.shopName || merchantUser.name} 🏪</h1>
                    <p style={{ margin: '5px 0 0 0', color: '#666' }}>Manage your local store inventory and customer orders</p>
                </div>
                <button 
                    onClick={handleLogout} 
                    style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Logout
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                    onClick={() => setActiveTab('inventory')}
                    style={{ padding: '10px 20px', background: activeTab === 'inventory' ? '#007BFF' : '#f1f1f1', color: activeTab === 'inventory' ? 'white' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    📦 Store Inventory
                </button>
                <button 
                    onClick={() => setActiveTab('orders')}
                    style={{ padding: '10px 20px', background: activeTab === 'orders' ? '#007BFF' : '#f1f1f1', color: activeTab === 'orders' ? 'white' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    📋 Customer Orders
                </button>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                {activeTab === 'inventory' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Your Product Inventory</h3>
                            <button 
                                onClick={() => setShowAddModal(true)}
                                style={{ padding: '10px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                + Add New Product
                            </button>
                        </div>

                        {showAddModal && (
                            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '25px' }}>
                                <h3 style={{ marginTop: 0, color: '#007BFF' }}>Add New Product (Local File Uploads)</h3>
                                <form onSubmit={handleAddProductSubmit} style={{ display: 'grid', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: '#333' }}>Product Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g., Aashirvaad Atta 5KG" 
                                            value={productName} 
                                            onChange={(e) => setProductName(e.target.value)} 
                                            required 
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', color: '#333' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: '#333' }}>Description</label>
                                        <textarea 
                                            placeholder="Product details..." 
                                            value={productDescription} 
                                            onChange={(e) => setProductDescription(e.target.value)} 
                                            required 
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', height: '60px', background: 'white', color: '#333' }}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: '#333' }}>Price (₹)</label>
                                            <input 
                                                type="number" 
                                                placeholder="340" 
                                                value={productPrice} 
                                                onChange={(e) => setProductPrice(e.target.value)} 
                                                required 
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', color: '#333' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: '#333' }}>Stock Quantity</label>
                                            <input 
                                                type="number" 
                                                placeholder="50" 
                                                value={productStock} 
                                                onChange={(e) => setProductStock(e.target.value)} 
                                                required 
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', color: '#333' }}
                                            />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <label style={{ fontWeight: 'bold', fontSize: '13px', margin: 0, color: '#333' }}>Category</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsCreatingNewCategory(!isCreatingNewCategory);
                                                        setProductCategoryId('');
                                                        setNewCategoryName('');
                                                    }}
                                                    style={{ background: 'none', border: 'none', color: '#007BFF', fontSize: '11px', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                                                >
                                                    {isCreatingNewCategory ? "← Select Existing" : "+ Add New Category"}
                                                </button>
                                            </div>

                                            {!isCreatingNewCategory ? (
                                                <select 
                                                    value={productCategoryId} 
                                                    onChange={(e) => setProductCategoryId(e.target.value)} 
                                                    required 
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', color: '#333' }}
                                                >
                                                    <option value="" style={{ color: '#666' }}>-- Select Category --</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.id} style={{ color: '#333', background: 'white' }}>
                                                            {cat.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input 
                                                    type="text"
                                                    placeholder="Enter new category name"
                                                    value={newCategoryName}
                                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                                    required
                                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', color: '#333' }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: '#333' }}>Select Product Images (Multi-angle from computer)</label>
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*"
                                            onChange={handleFileChange} 
                                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', color: '#333' }}
                                        />
                                        <small style={{ color: '#666' }}>You can hold Ctrl/Cmd to select multiple image files at once.</small>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <button type="submit" style={{ padding: '8px 20px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            Save Product
                                        </button>
                                        <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {loading ? (
                            <p>Loading inventory...</p>
                        ) : inventory.length === 0 ? (
                            <p style={{ color: '#666' }}>No products listed in your store yet.</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' }}>
                                {inventory.map(product => (
                                    <div key={product.id} style={{ background: '#fdfdfd', padding: '15px', borderRadius: '6px', border: '1px solid #ddd' }}>
                                        {product.images && product.images.length > 0 ? (
                                            <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', marginBottom: '8px' }}>
                                                {product.images.map((img, idx) => (
                                                    <img 
                                                        key={idx}
                                                        src={`http://localhost:2121${img.imageUrl}`} 
                                                        alt={`${product.name} ${idx + 1}`} 
                                                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} 
                                                    />
                                                ))}
                                            </div>
                                        ) : null}
                                        <h4 style={{ margin: '0 0 5px 0' }}>{product.name}</h4>
                                        <p style={{ fontSize: '13px', color: '#666', margin: '5px 0' }}>{product.description}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                            <span style={{ fontWeight: 'bold', color: '#28a745' }}>₹{product.price}</span>
                                            <span style={{ fontSize: '12px', background: '#e9ecef', padding: '2px 6px', borderRadius: '4px' }}>Stock: {product.stockQuantity}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>Customer Orders</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={() => setOrderSubTab('active')}
                                    style={{ padding: '6px 14px', background: orderSubTab === 'active' ? '#4C2365' : '#f1f1f1', color: orderSubTab === 'active' ? 'white' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                                >
                                    📥 Active Orders
                                </button>
                                <button 
                                    onClick={() => setOrderSubTab('delivered')}
                                    style={{ padding: '6px 14px', background: orderSubTab === 'delivered' ? '#28a745' : '#f1f1f1', color: orderSubTab === 'delivered' ? 'white' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                                >
                                    📦 Delivered History
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <p>Loading orders...</p>
                        ) : orders.length === 0 ? (
                            <p style={{ color: '#666' }}>
                                {orderSubTab === 'delivered' ? 'No delivered order history found yet.' : 'No active orders right now.'}
                            </p>
                        ) : (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {orders.map(order => (
                                    <div key={order.id} style={{ background: '#fdfdfd', padding: '15px', borderRadius: '6px', border: '1px solid #ddd' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '10px' }}>
                                            <h4 style={{ margin: 0, color: '#007BFF' }}>Order #{order.id}</h4>
                                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', background: order.status === 'DELIVERED' ? '#d4edda' : '#fff3cd', color: order.status === 'DELIVERED' ? '#155724' : '#856404' }}>
                                                {order.status || 'PLACED'}
                                            </span>
                                        </div>
                                        <ul style={{ margin: '0 0 10px 0', paddingLeft: '20px', fontSize: '14px', color: '#444' }}>
                                            {order.items && order.items.map((item, idx) => (
                                                <li key={idx}>
                                                    {item.productName || item.name || 'Product'} × {item.quantity} (₹{item.price * item.quantity})
                                                </li>
                                            ))}
                                        </ul>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                            <span style={{ fontWeight: 'bold' }}>Total: <span style={{ color: '#28a745' }}>₹{order.totalAmount}</span></span>
                                            {order.status !== 'DELIVERED' ? (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => handleUpdateStatus(order.id, 'PROCESSING')} style={{ padding: '5px 10px', background: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Processing</button>
                                                    <button onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')} style={{ padding: '5px 10px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Out for Delivery</button>
                                                    <button onClick={() => handleUpdateStatus(order.id, 'DELIVERED')} style={{ padding: '5px 10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Delivered</button>
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: '#28a745', fontWeight: 'bold' }}>✔️ Successfully Fulfilled</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MerchantDashboard;