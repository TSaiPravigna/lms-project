import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageInstructors.css';
import { useNavigate } from 'react-router-dom';
import { testApiConnection, checkBackendStatus } from '../../utils/apiTest';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ITEMS_PER_PAGE = 12;

const ManageInstructors = () => {
    const [instructors, setInstructors] = useState([]);
    const [showInstructorForm, setShowInstructorForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [instructorSearch, setInstructorSearch] = useState('');
    const [userExists, setUserExists] = useState(false);
    const [userExistsMessage, setUserExistsMessage] = useState('');
    const [showInstructorModal, setShowInstructorModal] = useState(false);
    const [selectedInstructor, setSelectedInstructor] = useState(null);
    const [editingInstructor, setEditingInstructor] = useState(false);
    const [editedInstructor, setEditedInstructor] = useState({
        firstName: '',
        lastName: '',
        email: '',
        specialization: '',
        qualifications: ''
    });

    const [newInstructor, setNewInstructor] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        specialization: '',
        qualifications: ''
    });

    const [apiStatus, setApiStatus] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchInstructors();
    }, [navigate]);

    const fetchInstructors = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Authentication token not found. Please login again.');
                navigate('/login');
                return;
            }

            console.log('Fetching instructors from:', `${API_URL}/api/admin/instructors`);
            
            const config = {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            
            console.log('Request config:', config);
            
            const response = await axios.get(`${API_URL}/api/admin/instructors`, config);
            
            console.log('Response received:', response);
            
            if (response.data) {
                setInstructors(response.data);
                setError(null);
            } else {
                setError('No data received from the server.');
            }
        } catch (err) {
            console.error('Error fetching instructors:', err);
            
            // Log detailed error information
            if (err.response) {
                console.error('Error response data:', err.response.data);
                console.error('Error response status:', err.response.status);
                console.error('Error response headers:', err.response.headers);
            } else if (err.request) {
                console.error('Error request:', err.request);
            } else {
                console.error('Error message:', err.message);
            }
            
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (err.response.status === 401) {
                    setError('Your session has expired. Please login again.');
                    navigate('/login');
                } else if (err.response.status === 403) {
                    setError('You do not have permission to access this resource.');
                } else if (err.response.status === 404) {
                    setError('The requested resource was not found.');
                } else if (err.response.status === 500) {
                    setError(`Server error: ${err.response.data.message || 'Unknown error'}. Please try again later.`);
                } else {
                    setError(err.response.data.message || 'Failed to fetch instructors. Please try again later.');
                }
            } else if (err.request) {
                // The request was made but no response was received
                setError('No response from server. Please check if the backend server is running.');
            } else {
                // Something happened in setting up the request that triggered an Error
                setError(`An error occurred: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInstructorSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setUserExists(false);
        setUserExistsMessage('');
        
        try {
            const token = localStorage.getItem('token');
            
            // First check if user with this email already exists
            try {
                const checkResponse = await axios.get(`${API_URL}/api/users/check-email/${newInstructor.email}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (checkResponse.data.exists) {
                    setUserExists(true);
                    setUserExistsMessage(`An instructor with email ${newInstructor.email} already exists.`);
                    return;
                }
            } catch (checkErr) {
                console.error("Error checking email:", checkErr);
            }
            
            // If user doesn't exist, proceed with adding
            await axios.post(`${API_URL}/api/admin/instructors`, newInstructor, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowInstructorForm(false);
            setNewInstructor({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                specialization: '',
                qualifications: ''
            });
            fetchInstructors();
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setUserExists(true);
                setUserExistsMessage(`An instructor with email ${newInstructor.email} already exists.`);
            } else {
                setError('Failed to add instructor. Please try again.');
            }
        }
    };

    const handleDeleteInstructor = async (instructorId) => {
        if (!window.confirm('Are you sure you want to delete this instructor?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/admin/users/${instructorId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchInstructors();
        } catch (err) {
            setError('Failed to delete instructor. Please try again.');
        }
    };

    const handleViewInstructor = (instructor) => {
        setSelectedInstructor(instructor);
        setShowInstructorModal(true);
        setEditingInstructor(false);
        setEditedInstructor({
            firstName: instructor.firstName,
            lastName: instructor.lastName,
            email: instructor.email,
            specialization: instructor.specialization || '',
            qualifications: instructor.qualifications || ''
        });
    };

    const handleCloseInstructorModal = () => {
        setSelectedInstructor(null);
        setShowInstructorModal(false);
        setEditingInstructor(false);
    };

    const handleEditInstructor = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_URL}/api/admin/instructors/${selectedInstructor._id}`,
                editedInstructor,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            fetchInstructors();
            setEditingInstructor(false);
        } catch (err) {
            setError('Failed to update instructor. Please try again.');
        }
    };

    // Pagination helpers
    const getPaginatedItems = (items, currentPage) => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    };

    const getTotalPages = (items) => {
        return Math.ceil(items.length / ITEMS_PER_PAGE);
    };

    const renderPagination = (currentPage, totalPages, setCurrentPage) => {
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

    // Filter instructors based on search
    const filteredInstructors = instructors.filter(instructor => 
        instructor.firstName.toLowerCase().includes(instructorSearch.toLowerCase()) ||
        instructor.lastName.toLowerCase().includes(instructorSearch.toLowerCase()) ||
        instructor.email.toLowerCase().includes(instructorSearch.toLowerCase())
    );

    // Get paginated data
    const paginatedInstructors = getPaginatedItems(filteredInstructors, currentPage);

    const handleCheckApiStatus = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await checkBackendStatus();
            setApiStatus(result);
            
            if (result.success) {
                // If API is working, try to fetch instructors
                fetchInstructors();
            } else {
                setError(result.message);
            }
        } catch (err) {
            console.error('Error checking API status:', err);
            setError('Failed to check API status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return (
        <div className="error-container">
            <div className="error">{error}</div>
            <button className="retry-btn" onClick={handleCheckApiStatus}>
                Check API Connection
            </button>
        </div>
    );

    return (
        <div className="manage-instructors">
            <h1>Manage Instructors</h1>
            
            {/* Stats Section */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Total Instructors</h3>
                    <p>{instructors.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Active Instructors</h3>
                    <p>{instructors.filter(i => i.status === 'active').length}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Courses</h3>
                    <p>{instructors.reduce((total, instructor) => total + (instructor.courses?.length || 0), 0)}</p>
                </div>
            </div>

            {/* Search and Add Section */}
            <div className="section-actions">
                <div className="search-container">
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Search instructors by name or email..."
                        value={instructorSearch}
                        onChange={(e) => setInstructorSearch(e.target.value)}
                    />
                </div>
                <button 
                    className="add-btn" 
                    onClick={() => setShowInstructorForm(!showInstructorForm)}
                >
                    {showInstructorForm ? 'Cancel' : 'Add Instructor'}
                </button>
            </div>

            {/* Add Instructor Form */}
            {showInstructorForm && (
                <form onSubmit={handleInstructorSubmit} className="form-container">
                    <h3>Add New Instructor</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                value={newInstructor.firstName}
                                onChange={(e) => setNewInstructor({...newInstructor, firstName: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                value={newInstructor.lastName}
                                onChange={(e) => setNewInstructor({...newInstructor, lastName: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={newInstructor.email}
                                onChange={(e) => setNewInstructor({...newInstructor, email: e.target.value})}
                                required
                            />
                            {userExists && (
                                <div className="error-message">{userExistsMessage}</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={newInstructor.password}
                                onChange={(e) => setNewInstructor({...newInstructor, password: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Specialization</label>
                            <input
                                type="text"
                                value={newInstructor.specialization}
                                onChange={(e) => setNewInstructor({...newInstructor, specialization: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Qualifications</label>
                            <textarea
                                value={newInstructor.qualifications}
                                onChange={(e) => setNewInstructor({...newInstructor, qualifications: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn">Add Instructor</button>
                    </div>
                </form>
            )}

            {/* Instructors List */}
            <div className="users-list">
                {filteredInstructors.length > 0 ? (
                    filteredInstructors.map(instructor => (
                        <div key={instructor._id} className="user-card" onClick={() => handleViewInstructor(instructor)}>
                            <div className="user-info">
                                <div className="info-row">
                                    <span className="info-label">Name:</span>
                                    <span className="info-value">{instructor.firstName} {instructor.lastName}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">{instructor.email}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Specialization:</span>
                                    <span className="info-value">{instructor.specialization || 'Not specified'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Courses:</span>
                                    <span className="info-value">{instructor.courses ? instructor.courses.length : 0}</span>
                                </div>
                            </div>
                            <span 
                                className="delete-action"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteInstructor(instructor._id);
                                }}
                            >
                                ×
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="no-items">No instructors found</div>
                )}
            </div>

            {/* Pagination */}
            {renderPagination(currentPage, getTotalPages(filteredInstructors), setCurrentPage)}

            {/* Instructor View Modal */}
            {showInstructorModal && selectedInstructor && (
                <div className="modal-overlay" onClick={handleCloseInstructorModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="instructor-modal">
                            <div className="modal-header">
                                <h2>{editingInstructor ? 'Edit Instructor' : 'Instructor Details'}</h2>
                                <button className="close-btn" onClick={handleCloseInstructorModal}>&times;</button>
                            </div>
                            <div className="modal-body">
                                {editingInstructor ? (
                                    <form onSubmit={handleEditInstructor} className="form-container">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>First Name</label>
                                                <input
                                                    type="text"
                                                    value={editedInstructor.firstName}
                                                    onChange={(e) => setEditedInstructor({
                                                        ...editedInstructor,
                                                        firstName: e.target.value
                                                    })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Last Name</label>
                                                <input
                                                    type="text"
                                                    value={editedInstructor.lastName}
                                                    onChange={(e) => setEditedInstructor({
                                                        ...editedInstructor,
                                                        lastName: e.target.value
                                                    })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                value={editedInstructor.email}
                                                onChange={(e) => setEditedInstructor({
                                                    ...editedInstructor,
                                                    email: e.target.value
                                                })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Specialization</label>
                                            <input
                                                type="text"
                                                value={editedInstructor.specialization}
                                                onChange={(e) => setEditedInstructor({
                                                    ...editedInstructor,
                                                    specialization: e.target.value
                                                })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Qualifications</label>
                                            <textarea
                                                value={editedInstructor.qualifications}
                                                onChange={(e) => setEditedInstructor({
                                                    ...editedInstructor,
                                                    qualifications: e.target.value
                                                })}
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button type="submit" className="submit-btn">Save Changes</button>
                                            <button type="button" className="cancel-btn" onClick={() => setEditingInstructor(false)}>
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="instructor-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Name</span>
                                            <span className="detail-value">{selectedInstructor.firstName} {selectedInstructor.lastName}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Email</span>
                                            <span className="detail-value">{selectedInstructor.email}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Specialization</span>
                                            <span className="detail-value">{selectedInstructor.specialization || 'Not specified'}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Qualifications</span>
                                            <span className="detail-value">{selectedInstructor.qualifications || 'Not specified'}</span>
                                        </div>
                                        
                                        <div className="instructor-courses">
                                            <h3>Courses</h3>
                                            {selectedInstructor.courses && selectedInstructor.courses.length > 0 ? (
                                                <div className="courses-grid">
                                                    {selectedInstructor.courses.map(course => (
                                                        <div key={course._id} className="course-item">
                                                            <h4>{course.title}</h4>
                                                            <p>{course.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p>No courses created yet</p>
                                            )}
                                        </div>
                                        
                                        <div className="modal-actions">
                                            <button className="edit-btn" onClick={() => setEditingInstructor(true)}>
                                                Edit Details
                                            </button>
                                        </div>
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

export default ManageInstructors;

 