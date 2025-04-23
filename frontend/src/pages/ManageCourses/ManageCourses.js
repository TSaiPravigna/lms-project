import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageCourses.css';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ITEMS_PER_PAGE = 12;

const ManageCourses = () => {
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
        instructor: '',
        videoUrl: '',
        videoFile: null,
        thumbnailUrl: ''
    });
    
    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Search state
    const [search, setSearch] = useState('');
    
    // Course viewing state
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [videoError, setVideoError] = useState('');
    
    const navigate = useNavigate();
    
    // Function to process video URLs
    const getEmbedUrl = (url) => {
        if (!url) {
            console.error('No video URL provided');
            setVideoError('No video URL provided');
            return '';
        }

        try {
            console.log('Processing video URL:', url);
            
            // Handle YouTube URLs
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                let videoId = '';
                
                if (url.includes('youtube.com/watch?v=')) {
                    videoId = url.split('watch?v=')[1].split('&')[0];
                } else if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1].split('?')[0];
                }
                
                if (videoId) {
                    return `https://www.youtube.com/embed/${videoId}`;
                }
            }
            
            // Handle Vimeo URLs
            if (url.includes('vimeo.com')) {
                let videoId = '';
                
                if (url.includes('vimeo.com/')) {
                    videoId = url.split('vimeo.com/')[1].split('?')[0];
                }
                
                if (videoId) {
                    return `https://player.vimeo.com/video/${videoId}`;
                }
            }
            
            // If it's a direct video URL, return it as is
            if (url.match(/\.(mp4|webm|ogg)$/i)) {
                return url;
            }
            
            // If it's an iframe embed code, extract the src
            if (url.includes('<iframe')) {
                const srcMatch = url.match(/src="([^"]+)"/);
                if (srcMatch && srcMatch[1]) {
                    return srcMatch[1];
                }
            }
            
            // If none of the above, return the original URL
            return url;
        } catch (error) {
            console.error('Error processing video URL:', error);
            setVideoError('Error processing video URL');
            return url;
        }
    };
    
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
            const userRole = localStorage.getItem('userRole');
            
            if (!token) {
                setError('Authentication token not found. Please login again.');
                navigate('/login');
                return;
            }
            
            console.log('User role:', userRole);
            
            const config = {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            
            // Use different endpoints based on user role
            let endpoint = '/api/courses';
            if (userRole === 'admin') {
                endpoint = '/api/admin/courses';
            } else if (userRole === 'instructor') {
                endpoint = '/api/courses/instructor';
            }
            
            console.log('Fetching courses from:', `${API_URL}${endpoint}`);
            
            const response = await axios.get(`${API_URL}${endpoint}`, config);
            
            console.log('Response status:', response.status);
            console.log('Response data:', response.data);
            
            if (response.data) {
                setCourses(response.data);
            } else {
                setError('No courses found');
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching courses:', err);
            console.error('Error response:', err.response);
            
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.status === 401) {
                setError('Session expired. Please login again.');
                navigate('/login');
            } else if (err.response?.status === 403) {
                setError('You do not have permission to access courses.');
            } else if (err.response?.status === 404) {
                setError('Courses endpoint not found. Please check the API configuration.');
            } else {
                setError('Failed to fetch courses. Please try again.');
            }
            setLoading(false);
        }
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            
            // Create FormData object for file upload
            const courseData = new FormData();
            
            // Append all form fields
            Object.keys(formData).forEach(key => {
                if (key === 'videoFile' && formData[key]) {
                    courseData.append('video', formData[key]);
                } else if (formData[key]) {
                    courseData.append(key, formData[key]);
                }
            });
            
            // Add status field
            courseData.append('status', 'Published');
            
            const response = await axios.post(`${API_URL}/api/courses`, courseData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data) {
                setShowAddForm(false);
                setFormData({
                    title: '',
                    description: '',
                    category: '',
                    level: 'beginner',
                    price: '',
                    instructor: '',
                    videoUrl: '',
                    videoFile: null,
                    thumbnailUrl: ''
                });
                
                fetchCourses();
            }
        } catch (err) {
            console.error('Error creating course:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to create course. Please try again.');
            }
        }
    };
    
    // Handle file input change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, videoFile: file, videoUrl: '' });
        }
    };
    
    // Handle video URL input change
    const handleVideoUrlChange = (e) => {
        const url = e.target.value;
        setFormData({ ...formData, videoUrl: url, videoFile: null });
    };
    
    // Handle course deletion
    const handleDelete = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/admin/courses/${courseId}`, {
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
            <div className="header">
                <h1>Manage Courses</h1>
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
                        <label>Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                            placeholder="Enter course title"
                        />
                    </div>
                    <div className="form-group">
                        <label>Description *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                            placeholder="Enter course description"
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Category *</label>
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
                            <label>Level *</label>
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
                                placeholder="Enter course price"
                            />
                        </div>
                        <div className="form-group">
                            <label>Instructor {localStorage.getItem('userRole') === 'admin' ? '*' : ''}</label>
                            <input
                                type="text"
                                value={formData.instructor}
                                onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                                required={localStorage.getItem('userRole') === 'admin'}
                                placeholder="Enter instructor name"
                            />
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h4>Course Media (Optional)</h4>
                        <div className="form-group">
                            <label>Video URL</label>
                            <input
                                type="url"
                                value={formData.videoUrl}
                                onChange={handleVideoUrlChange}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="media-input"
                            />
                            <small className="input-hint">Enter a YouTube, Vimeo, or direct video URL</small>
                        </div>
                        
                        <div className="form-divider">
                            <span>OR</span>
                        </div>
                        
                        <div className="form-group">
                            <label>Upload Video File</label>
                            <div className="file-upload-container">
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileChange}
                                    id="video-upload"
                                    className="file-input"
                                />
                                <label htmlFor="video-upload" className="file-upload-label">
                                    Choose Video File
                                </label>
                                {formData.videoFile && (
                                    <span className="file-name">{formData.videoFile.name}</span>
                                )}
                            </div>
                            <small className="input-hint">Supported formats: MP4, WebM, OGG (max 100MB)</small>
                        </div>
                        
                        <div className="form-group">
                            <label>Thumbnail URL</label>
                            <input
                                type="url"
                                value={formData.thumbnailUrl}
                                onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})}
                                placeholder="https://..."
                                className="media-input"
                            />
                            <small className="input-hint">Enter a URL for the course thumbnail image</small>
                        </div>
                    </div>
                    
                    {error && <div className="error-message">{error}</div>}
                    
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
            
            {/* Search Courses */}
            <div className="search-container">
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Search courses by title, description, or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
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
                                
                                {/* Video Player */}
                                {selectedCourse.videoUrl && (
                                    <div className="video-container">
                                        <h3>Course Video</h3>
                                        <div className="video-player">
                                            <iframe 
                                                src={getEmbedUrl(selectedCourse.videoUrl)}
                                                title={selectedCourse.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Thumbnail */}
                                {selectedCourse.thumbnail && (
                                    <div className="thumbnail-container">
                                        <h3>Course Thumbnail</h3>
                                        <img 
                                            src={selectedCourse.thumbnail} 
                                            alt={selectedCourse.title} 
                                            className="course-thumbnail"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCourses; 