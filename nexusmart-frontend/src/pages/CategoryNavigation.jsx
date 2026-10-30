import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryNavigation = ({ onSelectCategory }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            // Adjust endpoint if your root categories endpoint differs
            const response = await axios.get('http://localhost:2121/api/categories');
            // Assuming top-level categories or structured list is returned
            setCategories(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (catId) => {
        setSelectedCategoryId(catId);
        onSelectCategory(catId); // Pass selected category to parent product fetcher
    };

    if (loading) return <p style={{ fontSize: '14px', color: '#666' }}>Loading departments...</p>;

    return (
        <div style={{ background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>Departments & Categories 🛍️</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => handleCategoryClick(null)}
                    style={{
                        padding: '6px 14px',
                        background: selectedCategoryId === null ? '#007BFF' : '#f1f3f5',
                        color: selectedCategoryId === null ? '#fff' : '#333',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 'bold'
                    }}
                >
                    All Products
                </button>

                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        style={{
                            padding: '6px 14px',
                            background: selectedCategoryId === cat.id ? '#007BFF' : '#f1f3f5',
                            color: selectedCategoryId === cat.id ? '#fff' : '#333',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 'bold'
                        }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryNavigation;