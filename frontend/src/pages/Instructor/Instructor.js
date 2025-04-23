import React, { useState, useEffect } from 'react';
import CourseCard from '../../components/CourseCard/CourseCard';
import CourseDetail from '../../components/CourseDetail/CourseDetail';
import './Instructor.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Instructor = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        level: 'Beginner',
        category: 'Programming',
        thumbnail: null,
        thumbnailUrl: '',
        videoUrl: '',
        status: 'Published',
        isUpcoming: false,
        publishDate: ''
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [showStudents, setShowStudents] = useState(false);
    const [courseStudents, setCourseStudents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchInstructorCourses();
    }, [navigate]);

    const fetchInstructorCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get(`${API_URL}/api/courses/instructor`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch courses. Please try again later.');
            setLoading(false);
        }
    };

    const handleFileUpload = async (file, type) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(`${API_URL}/api/upload/${type}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload file');
            }

            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Error uploading file:', error);
            setError(error.message || 'Failed to upload file. Please try again.');
            throw error;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'videoUrl' && value && videoFile) {
            setError('Please choose either a video URL or upload a video file, not both');
            setVideoFile(null);
            const fileInput = document.getElementById('video');
            if (fileInput) fileInput.value = '';
        }
        if (name === 'thumbnailUrl' && value && thumbnailFile) {
            setError('Please choose either a thumbnail URL or upload a thumbnail file, not both');
            setThumbnailFile(null);
            const fileInput = document.getElementById('thumbnail');
            if (fileInput) fileInput.value = '';
        }
        setNewCourse(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'thumbnail') {
                if (newCourse.thumbnailUrl) {
                    setError('Please choose either a thumbnail URL or upload a thumbnail file, not both');
                    setNewCourse(prev => ({ ...prev, thumbnailUrl: '' }));
                }
                setThumbnailFile(file);
            } else if (type === 'video') {
                if (newCourse.videoUrl) {
                    setError('Please choose either a video URL or upload a video file, not both');
                    setNewCourse(prev => ({ ...prev, videoUrl: '' }));
                }
                setVideoFile(file);
            }
        }
    };

    const resetForm = () => {
        setNewCourse({
            title: '',
            description: '',
            level: 'Beginner',
            category: 'Programming',
            thumbnail: null,
            thumbnailUrl: '',
            videoUrl: '',
            status: 'Published',
            isUpcoming: false,
            publishDate: ''
        });
        setThumbnailFile(null);
        setVideoFile(null);
        setEditingCourse(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate required fields
        if (!newCourse.title.trim()) {
            setError('Course title is required');
            setLoading(false);
            return;
        }

        if (!newCourse.description.trim()) {
            setError('Course description is required');
            setLoading(false);
            return;
        }

        if (!newCourse.level) {
            setError('Course level is required');
            setLoading(false);
            return;
        }

        if (!newCourse.category.trim()) {
            setError('Course category is required');
            setLoading(false);
            return;
        }

        // Validate that either video URL or video file is provided
        if (!newCourse.videoUrl && !videoFile) {
            setError('Please provide either a video URL or upload a video file');
            setLoading(false);
            return;
        }

        // Validate that either thumbnail URL or thumbnail file is provided
        if (!newCourse.thumbnailUrl && !thumbnailFile) {
            setError('Please provide either a thumbnail URL or upload a thumbnail image');
            setLoading(false);
            return;
        }

        // Validate publish date for upcoming courses
        if (newCourse.isUpcoming && !newCourse.publishDate) {
            setError('Publish date is required for upcoming courses');
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', newCourse.title);
            formData.append('description', newCourse.description);
            formData.append('level', newCourse.level);
            formData.append('category', newCourse.category);
            formData.append('videoUrl', newCourse.videoUrl);
            formData.append('thumbnailUrl', newCourse.thumbnailUrl);
            formData.append('status', newCourse.isUpcoming ? 'Upcoming' : newCourse.status);
            formData.append('isUpcoming', newCourse.isUpcoming);
            if (newCourse.isUpcoming) {
                formData.append('publishDate', newCourse.publishDate);
            }
            if (videoFile) {
                formData.append('video', videoFile);
            }
            if (thumbnailFile) {
                formData.append('thumbnail', thumbnailFile);
            }

            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (editingCourse) {
                await axios.put(`${API_URL}/api/courses/${editingCourse._id}`, formData, config);
            } else {
                await axios.post(`${API_URL}/api/courses`, formData, config);
            }

            setShowCreateForm(false);
            resetForm();
            fetchInstructorCourses();
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating course');
        } finally {
            setLoading(false);
        }
    };

    const handleEditCourse = (course) => {
        setEditingCourse(course);
        setNewCourse({
            title: course.title,
            description: course.description,
            level: course.level,
            category: course.category,
            thumbnail: null,
            thumbnailUrl: '',
            videoUrl: '',
            status: course.status,
            startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '',
            isUpcoming: course.status === 'Upcoming',
            publishDate: course.publishDate ? new Date(course.publishDate).toISOString().split('T')[0] : ''
        });
        setShowCreateForm(true);
    };

    const handleToggleStatus = async (courseId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            let newStatus;
            
            if (currentStatus === 'Draft') {
                newStatus = 'Published';
            } else if (currentStatus === 'Published') {
                newStatus = 'Draft';
            } else if (currentStatus === 'Upcoming') {
                newStatus = 'Published';
            }
            
            await axios.put(`${API_URL}/api/courses/${courseId}`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            fetchInstructorCourses();
        } catch (err) {
            setError('Failed to update course status. Please try again.');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchInstructorCourses();
        } catch (err) {
            setError('Failed to delete course. Please try again.');
        }
    };

    const handleViewStudents = async (courseId) => {
        try {
            const token = localStorage.getItem('token');
            const course = courses.find(c => c._id === courseId);
            
            if (!course) {
                setError('Course not found');
                return;
            }

            // Fetch student details for enrolled students
            const studentPromises = course.enrolledStudents.map(studentId => 
                axios.get(`${API_URL}/api/users/${studentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            );
            
            const studentResponses = await Promise.all(studentPromises);
            const students = studentResponses.map(response => response.data);
            
            setCourseStudents(students);
            setSelectedCourse(course);
            setShowStudents(true);
        } catch (err) {
            setError('Failed to fetch students. Please try again.');
        }
    };

    const handleRemoveStudent = async (courseId, studentId) => {
        if (!window.confirm('Are you sure you want to remove this student from the course?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/courses/${courseId}/students/${studentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update the local state
            setCourseStudents(prevStudents => 
                prevStudents.filter(student => student._id !== studentId)
            );
            
            // Update the courses state
            setCourses(prevCourses => 
                prevCourses.map(course => {
                    if (course._id === courseId) {
                        return {
                            ...course,
                            enrolledStudents: course.enrolledStudents.filter(id => id !== studentId)
                        };
                    }
                    return course;
                })
            );
        } catch (err) {
            setError('Failed to remove student. Please try again.');
        }
    };

    if (loading) return <div className="loading">Loading courses...</div>;
    if (error) return <div className="error">{error}</div>;

    const activeCourses = courses.filter(course => course.status === 'Published');
    const upcomingCourses = courses.filter(course => course.status === 'Upcoming');
    const draftCourses = courses.filter(course => course.status === 'Draft');

    if (showStudents && selectedCourse) {
        return (
            <div className="instructor-container">
                <div className="course-detail-header">
                    <button 
                        className="back-button"
                        onClick={() => {
                            setShowStudents(false);
                            setSelectedCourse(null);
                        }}
                    >
                        ← Back to Courses
                    </button>
                    <h2>Students in {selectedCourse.title}</h2>
                </div>
                
                <div className="students-list">
                    {courseStudents.length > 0 ? (
                        courseStudents.map(student => (
                            <div key={student._id} className="student-card">
                                <div className="student-info">
                                    <h3>{student.firstName} {student.lastName}</h3>
                                    <p>{student.email}</p>
                                </div>
                                <button 
                                    className="remove-btn"
                                    onClick={() => handleRemoveStudent(selectedCourse._id, student._id)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="no-students">No students enrolled in this course.</div>
                    )}
                </div>
            </div>
        );
    }

    if (selectedCourse) {
        return (
            <div className="instructor-container">
                <div className="course-detail-header">
                    <button 
                        className="back-button"
                        onClick={() => setSelectedCourse(null)}
                    >
                        ← Back to Courses
                    </button>
                    <button 
                        className="delete-course-btn standalone"
                        onClick={() => {
                            handleDeleteCourse(selectedCourse._id);
                            setSelectedCourse(null);
                        }}
                    >
                        Delete Course
                    </button>
                </div>
                <CourseDetail course={selectedCourse} />
            </div>
        );
    }

    return (
        <div className="instructor-container">
            <h1>Instructor Dashboard</h1>
            
            <div className="dashboard-header">
            <button 
                className="create-course-btn"
                    onClick={() => {
                        setShowCreateForm(!showCreateForm);
                        if (!showCreateForm) {
                            resetForm();
                        }
                    }}
                >
                    {showCreateForm ? 'Cancel' : 'Create New Course'}
            </button>

                <div className="dashboard-stats">
                    <div className="stat-card">
                        <h3>{activeCourses.length}</h3>
                        <p>Active Courses</p>
                    </div>
                    <div className="stat-card">
                        <h3>{upcomingCourses.length}</h3>
                        <p>Upcoming Courses</p>
                    </div>
                    <div className="stat-card">
                        <h3>{draftCourses.length}</h3>
                        <p>Draft Courses</p>
                    </div>
                </div>
            </div>

            {showCreateForm && (
                <div className="create-course-form">
                    <h3>{editingCourse ? 'Edit Course' : 'Create New Course'}</h3>
                    <form onSubmit={handleSubmit}>
                    <div className="form-group">
                            <label htmlFor="title">Course Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={newCourse.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                            <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={newCourse.description}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                            <label htmlFor="level">Level</label>
                        <select
                            id="level"
                            name="level"
                            value={newCourse.level}
                            onChange={handleInputChange}
                            required
                        >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                    <div className="form-group">
                            <label htmlFor="category">Category</label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={newCourse.category}
                            onChange={handleInputChange}
                                required
                            />
                        </div>
                    <div className="form-group">
                            <label htmlFor="videoUrl">Course Video URL</label>
                        <input
                            type="url"
                            id="videoUrl"
                            name="videoUrl"
                            value={newCourse.videoUrl}
                            onChange={handleInputChange}
                                placeholder="https://example.com/video"
                        />
                            <small className="field-hint">Required if not uploading a video file</small>
                    </div>
                    <div className="form-group">
                            <label htmlFor="video">Or Upload Course Video</label>
                            <input
                                type="file"
                                id="video"
                                accept="video/*"
                                onChange={(e) => handleFileChange(e, 'video')}
                            />
                            {videoFile && <p className="file-name">Selected: {videoFile.name}</p>}
                            <small className="field-hint">Required if not providing a video URL</small>
                                </div>
                        <div className="form-group">
                            <label htmlFor="thumbnailUrl">Course Thumbnail URL</label>
                            <input
                                type="url"
                                id="thumbnailUrl"
                                name="thumbnailUrl"
                                value={newCourse.thumbnailUrl}
                                onChange={handleInputChange}
                                placeholder="https://example.com/thumbnail.jpg"
                            />
                            <small className="field-hint">Required if not uploading a thumbnail image</small>
                        </div>
                        <div className="form-group">
                            <label htmlFor="thumbnail">Or Upload Course Thumbnail</label>
                            <input
                                type="file"
                                id="thumbnail"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'thumbnail')}
                            />
                            {thumbnailFile && <p className="file-name">Selected: {thumbnailFile.name}</p>}
                            <small className="field-hint">Required if not providing a thumbnail URL</small>
                        </div>
                        <div className="form-group">
                            <label htmlFor="isUpcoming">Course Type</label>
                            <select
                                id="isUpcoming"
                                name="isUpcoming"
                                value={newCourse.isUpcoming}
                                onChange={(e) => setNewCourse({
                                    ...newCourse,
                                    isUpcoming: e.target.value === 'true',
                                    status: e.target.value === 'true' ? 'Upcoming' : 'Published'
                                })}
                                required
                            >
                                <option value="false">Regular Course</option>
                                <option value="true">Upcoming Course</option>
                            </select>
                        </div>
                        {newCourse.isUpcoming && (
                            <div className="form-group">
                                <label htmlFor="publishDate">Publish Date</label>
                                <input
                                    type="datetime-local"
                                    id="publishDate"
                                    name="publishDate"
                                    value={newCourse.publishDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        )}
                        {error && <div className="error-message">{error}</div>}
                        <div className="form-actions">
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                            </button>
                            <button type="button" className="cancel-btn" onClick={() => {
                                setShowCreateForm(false);
                                resetForm();
                            }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="courses-section">
                <h2>Active Courses</h2>
                {activeCourses.length > 0 ? (
                    <div className="courses-grid">
                        {activeCourses.map(course => (
                            <div key={course._id} className="course-card-container">
                                <CourseCard course={course} />
                                <div className="course-actions">
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEditCourse(course)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="status-btn"
                                        onClick={() => handleToggleStatus(course._id, course.status)}
                                    >
                                        Set as Draft
                                    </button>
                                    <button
                                        className="students-btn"
                                        onClick={() => handleViewStudents(course._id)}
                                    >
                                        Students ({course.enrolledStudents.length})
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteCourse(course._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-courses">No active courses yet.</div>
                )}
            </div>

            <div className="courses-section">
                <h2>Upcoming Courses</h2>
                {upcomingCourses.length > 0 ? (
                    <div className="courses-grid upcoming-courses">
                        {upcomingCourses.map(course => (
                            <div key={course._id} className="course-card-container">
                                <CourseCard course={course} />
                                <div className="course-actions">
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEditCourse(course)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="status-btn"
                                        onClick={() => handleToggleStatus(course._id, course.status)}
                                    >
                                        Publish Now
                                    </button>
                                    <button
                                        className="students-btn"
                                        onClick={() => handleViewStudents(course._id)}
                                    >
                                        Students ({course.enrolledStudents.length})
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteCourse(course._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-courses">No upcoming courses yet.</div>
                )}
            </div>

            <div className="courses-section">
                <h2>Draft Courses</h2>
                {draftCourses.length > 0 ? (
                    <div className="courses-grid">
                        {draftCourses.map(course => (
                            <div key={course._id} className="course-card-container">
                                <CourseCard course={course} />
                                <div className="course-actions">
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEditCourse(course)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="status-btn"
                                        onClick={() => handleToggleStatus(course._id, course.status)}
                                    >
                                        Publish
                                    </button>
                                    <button
                                        className="students-btn"
                                        onClick={() => handleViewStudents(course._id)}
                                    >
                                        Students ({course.enrolledStudents.length})
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteCourse(course._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-courses">No draft courses yet.</div>
                )}
            </div>
        </div>
    );
};

export default Instructor; 