import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ITEMS_PER_PAGE = 12; // Number of items to show per page

const Admin = () => {
    // State for users
    const [students, setStudents] = useState([]);
    const [admins, setAdmins] = useState([]);
    
    // State for active tab
    const [activeTab, setActiveTab] = useState('students');
    
    // State for forms
    const [showStudentForm, setShowStudentForm] = useState(false);
    const [showAdminForm, setShowAdminForm] = useState(false);
    
    // Pagination state
    const [currentStudentPage, setCurrentStudentPage] = useState(1);
    const [currentAdminPage, setCurrentAdminPage] = useState(1);
    
    // Form data
    const [newStudent, setNewStudent] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    
    const [newAdmin, setNewAdmin] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    
    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Search state
    const [studentSearch, setStudentSearch] = useState('');
    const [adminSearch, setAdminSearch] = useState('');
    
    // User existence state
    const [userExists, setUserExists] = useState(false);
    const [userExistsMessage, setUserExistsMessage] = useState('');
    
    const navigate = useNavigate();
    
    // Fetch all data on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchAllData();
    }, [navigate]);
    
    // Function to fetch all data
    const fetchAllData = async () => {
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
            
            // Fetch students
            const studentsResponse = await axios.get(`${API_URL}/api/admin/students`, config);
            setStudents(studentsResponse.data);
            
            // Fetch admins
            const adminsResponse = await axios.get(`${API_URL}/api/admin/admins`, config);
            setAdmins(adminsResponse.data);
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to fetch data. Please try again.');
            setLoading(false);
        }
    };
    
    // Handle student form submission
    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setUserExists(false);
        
        try {
            const token = localStorage.getItem('token');
            
            // Check if user already exists
            const checkResponse = await axios.post(`${API_URL}/api/auth/check-email`, {
                email: newStudent.email
            });
            
            if (checkResponse.data.exists) {
                setUserExists(true);
                setUserExistsMessage('A user with this email already exists.');
                return;
            }
            
            // Create student
            await axios.post(`${API_URL}/api/admin/students`, newStudent, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setShowStudentForm(false);
            setNewStudent({
                firstName: '',
                lastName: '',
                email: '',
                password: ''
            });
            
            fetchAllData();
        } catch (err) {
            console.error('Error creating student:', err);
            setError('Failed to create student. Please try again.');
        }
    };
    
    // Handle admin form submission
    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setUserExists(false);
        
        try {
            const token = localStorage.getItem('token');
            
            // Check if user already exists
            const checkResponse = await axios.post(`${API_URL}/api/auth/check-email`, {
                email: newAdmin.email
            });
            
            if (checkResponse.data.exists) {
                setUserExists(true);
                setUserExistsMessage('A user with this email already exists.');
                return;
            }
            
            // Create admin
            await axios.post(`${API_URL}/api/admin/admins`, newAdmin, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setShowAdminForm(false);
            setNewAdmin({
                firstName: '',
                lastName: '',
                email: '',
                password: ''
            });
            
            fetchAllData();
        } catch (err) {
            console.error('Error creating admin:', err);
            setError('Failed to create admin. Please try again.');
        }
    };
    
    // Handle user deletion
    const handleDeleteUser = async (userId, userType) => {
        if (!window.confirm(`Are you sure you want to delete this ${userType}?`)) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/admin/${userType}s/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAllData();
        } catch (err) {
            setError(`Failed to delete ${userType}. Please try again.`);
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
    
    const renderPagination = (currentPage, totalPages, setPage) => {
        if (totalPages <= 1) return null;
        
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button 
                    key={i}
                    className={currentPage === i ? 'active' : ''}
                    onClick={() => setPage(i)}
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
    
    // Filter users based on search
    const filteredStudents = students.filter(student => 
        student.firstName.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.lastName.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.email.toLowerCase().includes(studentSearch.toLowerCase())
    );
    
    const filteredAdmins = admins.filter(admin => 
        admin.firstName.toLowerCase().includes(adminSearch.toLowerCase()) ||
        admin.lastName.toLowerCase().includes(adminSearch.toLowerCase()) ||
        admin.email.toLowerCase().includes(adminSearch.toLowerCase())
    );
    
    // Get paginated users
    const paginatedStudents = getPaginatedItems(filteredStudents, currentStudentPage);
    const paginatedAdmins = getPaginatedItems(filteredAdmins, currentAdminPage);
    
    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            
            <div className="admin-stats">
                <div className="stat-card">
                    <h3>Total Students</h3>
                    <p>{students.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Admins</h3>
                    <p>{admins.length}</p>
                </div>
            </div>
            
            <div className="tabs">
                <button 
                    className={activeTab === 'students' ? 'active' : ''} 
                    onClick={() => setActiveTab('students')}
                >
                    Students
                </button>
                <button 
                    className={activeTab === 'admins' ? 'active' : ''} 
                    onClick={() => setActiveTab('admins')}
                >
                    Admins
                </button>
            </div>
            
            <div className="tab-spacing"></div>
            
            {/* Students Tab */}
            {activeTab === 'students' && (
                <div className="tab-content">
                    <div className="section-header">
                        <h2>Manage Students</h2>
                        <button 
                            className="add-btn" 
                            onClick={() => setShowStudentForm(!showStudentForm)}
                        >
                            {showStudentForm ? 'Cancel' : 'Add Student'}
                        </button>
                    </div>
                    
                    {/* Add Student Form */}
                    {showStudentForm && (
                        <form onSubmit={handleStudentSubmit} className="form-container">
                            <h3>Add New Student</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={newStudent.firstName}
                                        onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={newStudent.lastName}
                                        onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={newStudent.email}
                                        onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
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
                                        value={newStudent.password}
                                        onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="submit-btn">Add Student</button>
                            </div>
                        </form>
                    )}
                    
                    {/* Search Students */}
                    <div className="search-container">
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search students by name or email..."
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                        />
                    </div>
                    
                    {/* Students List */}
                    <div className="users-list">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <div key={student._id} className="user-card">
                                    <div className="user-info">
                                        <div className="info-row">
                                            <span className="info-label">Name:</span>
                                            <span className="info-value">{student.firstName} {student.lastName}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Email:</span>
                                            <span className="info-value">{student.email}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Courses:</span>
                                            <span className="info-value">{student.enrolledCourses?.length || 0}</span>
                                        </div>
                                    </div>
                                    <span 
                                        className="delete-action"
                                        onClick={() => handleDeleteUser(student._id, 'student')}
                                    >
                                        ×
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="no-items">No students found</div>
                        )}
                    </div>
                    
                    {/* Pagination */}
                    {renderPagination(currentStudentPage, getTotalPages(filteredStudents), setCurrentStudentPage)}
                </div>
            )}
            
            {/* Admins Tab */}
            {activeTab === 'admins' && (
                <div className="tab-content">
                    <div className="section-header">
                        <h2>Manage Admins</h2>
                        <button 
                            className="add-btn" 
                            onClick={() => setShowAdminForm(!showAdminForm)}
                        >
                            {showAdminForm ? 'Cancel' : 'Add Admin'}
                        </button>
                    </div>
                    
                    {/* Add Admin Form */}
                    {showAdminForm && (
                        <form onSubmit={handleAdminSubmit} className="form-container">
                            <h3>Add New Admin</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={newAdmin.firstName}
                                        onChange={(e) => setNewAdmin({...newAdmin, firstName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={newAdmin.lastName}
                                        onChange={(e) => setNewAdmin({...newAdmin, lastName: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={newAdmin.email}
                                        onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
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
                                        value={newAdmin.password}
                                        onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="submit-btn">Add Admin</button>
                            </div>
                        </form>
                    )}
                    
                    {/* Search Admins */}
                    <div className="search-container">
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search admins by name or email..."
                            value={adminSearch}
                            onChange={(e) => setAdminSearch(e.target.value)}
                        />
                    </div>
                    
                    {/* Admins List */}
                    <div className="users-list">
                        {filteredAdmins.length > 0 ? (
                            filteredAdmins.map(admin => (
                                <div key={admin._id} className="user-card">
                                    <div className="user-info">
                                        <div className="info-row">
                                            <span className="info-label">Name:</span>
                                            <span className="info-value">{admin.firstName} {admin.lastName}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Email:</span>
                                            <span className="info-value">{admin.email}</span>
                                        </div>
                                    </div>
                                    <span 
                                        className="delete-action"
                                        onClick={() => handleDeleteUser(admin._id, 'admin')}
                                    >
                                        ×
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="no-items">No admins found</div>
                        )}
                    </div>
                    
                    {/* Pagination */}
                    {renderPagination(currentAdminPage, getTotalPages(filteredAdmins), setCurrentAdminPage)}
            </div>
            )}
        </div>
    );
};

export default Admin; 