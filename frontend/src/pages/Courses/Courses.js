import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Courses.css';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ITEMS_PER_PAGE = 12;

const Courses = () => {
    // State for courses
    const [courses, setCourses] = useState([]);
    
    // State for forms
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    
    // Form data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        level: 'beginner',
        price: '',
        instructor: ''
    });
    
    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Search state
    const [search, setSearch] = useState('');
    
    // Course viewing state
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showCourseModal, setShowCourseModal] = useState(false);
    
    const navigate = useNavigate();
    
    // Fetch courses on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchCourses();
    }, [navigate]);
    
    // Function to fetch courses
    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Authentication token not found. Please login again.');
                navigate('/login');
                return;
            }
            
            const config = {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            
            const response = await axios.get(`${API_URL}/api/courses`, config);
            setCourses(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to fetch courses. Please try again.');
            setLoading(false);
        }
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            
            await axios.post(`${API_URL}/api/courses`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setShowAddForm(false);
            setFormData({
                title: '',
                description: '',
                category: '',
                level: 'beginner',
                price: '',
                instructor: ''
            });
            
            fetchCourses();
        } catch (err) {
            console.error('Error creating course:', err);
            setError('Failed to create course. Please try again.');
        }
    };
    
    // Handle course deletion
    const handleDelete = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCourses();
        } catch (err) {
            setError('Failed to delete course. Please try again.');
        }
    };
    
    // Pagination helpers
    const getPaginatedItems = (items) => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    };
    
    const getTotalPages = (items) => {
        return Math.ceil(items.length / ITEMS_PER_PAGE);
    };
    
    const renderPagination = () => {
        const totalPages = getTotalPages(filteredCourses);
        if (totalPages <= 1) return null;
        
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button 
                    key={i}
                    className={currentPage === i ? 'active' : ''}
                    onClick={() => setCurrentPage(i)}
                >
                    {i}
                </button>
            );
        }
        
        return (
            <div className="pagination">
                {pages}
            </div>
        );
    };
    
    // Handle course viewing
    const handleViewCourse = (course) => {
        setSelectedCourse(course);
        setShowCourseModal(true);
    };
    
    const handleCloseCourseModal = () => {
        setSelectedCourse(null);
        setShowCourseModal(false);
    };
    
    // Filter courses based on search
    const filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase()) ||
        course.category.toLowerCase().includes(search.toLowerCase())
    );
    
    // Get paginated courses
    const paginatedCourses = getPaginatedItems(filteredCourses);
    
    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    
    return (
        <div className="manage-courses">
            <h1>Manage Courses</h1>
            
            {/* Stats Section */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Total Courses</h3>
                    <p>{courses.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Active Courses</h3>
                    <p>{courses.filter(c => c.status === 'active').length}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Students</h3>
                    <p>{courses.reduce((total, course) => total + (course.enrolledStudents?.length || 0), 0)}</p>
                </div>
            </div>

            {/* Search and Add Section */}
            <div className="section-actions">
                <div className="search-container">
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Search courses by title, description, or category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button 
                    className="add-btn" 
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Cancel' : 'Add Course'}
                </button>
            </div>
            
            {/* Add Course Form */}
            {showAddForm && (
                <form onSubmit={handleSubmit} className="add-course-form">
                    <h3>Add New Course</h3>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Programming">Programming</option>
                                <option value="Design">Design</option>
                                <option value="Business">Business</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Language">Language</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Level</label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData({...formData, level: e.target.value})}
                                required
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Price</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Instructor</label>
                            <input
                                type="text"
                                value={formData.instructor}
                                onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn">Add Course</button>
                        <button 
                            type="button" 
                            className="cancel-btn"
                            onClick={() => setShowAddForm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
            
            {/* Courses List */}
            <div className="courses-grid">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map(course => (
                        <div key={course._id} className="course-card" onClick={() => handleViewCourse(course)}>
                            <div className="course-info">
                                <h3>{course.title}</h3>
                                <p className="course-description">{course.description}</p>
                                <div className="course-meta">
                                    <span className="course-category">{course.category}</span>
                                    <span className="course-level">{course.level}</span>
                                    <span className="course-price">${course.price}</span>
                                </div>
                                <div className="course-stats">
                                    <span>{course.enrolledStudents?.length || 0} students enrolled</span>
                                </div>
                            </div>
                            <span 
                                className="delete-action"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(course._id);
                                }}
                            >
                                ×
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="no-items">No courses found</div>
                )}
            </div>
            
            {/* Pagination */}
            {renderPagination()}
            
            {/* Course Modal */}
            {showCourseModal && selectedCourse && (
                <div className="modal-overlay" onClick={handleCloseCourseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="course-modal">
                            <div className="modal-header">
                                <h2>{selectedCourse.title}</h2>
                                <button className="close-btn" onClick={handleCloseCourseModal}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <div className="course-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Category</span>
                                        <span className="detail-value">{selectedCourse.category}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Level</span>
                                        <span className="detail-value">{selectedCourse.level}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Price</span>
                                        <span className="detail-value">${selectedCourse.price}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Status</span>
                                        <span className="detail-value">{selectedCourse.status}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Enrolled Students</span>
                                        <span className="detail-value">{selectedCourse.enrolledStudents?.length || 0}</span>
                                    </div>
                                </div>
                                
                                <div className="course-description">
                                    <h3>Description</h3>
                                    <p>{selectedCourse.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Courses; 