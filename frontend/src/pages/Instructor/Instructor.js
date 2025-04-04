import React, { useState, useEffect } from 'react';
import CourseCard from '../../components/CourseCard/CourseCard';
import CourseDetail from '../../components/CourseDetail/CourseDetail';
import './Instructor.css';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

const Instructor = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        level: 'beginner',
        videoUrl: '',
        category: 'General',
        thumbnail: ''
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
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
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${API_URL}/api/courses/instructor`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            
            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }
            
            const data = await response.json();
            setCourses(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError(err.message);
            setCourses([]);
        } finally {
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

            const response = await fetch(`${API_URL}/api/upload/${type}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
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

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Validate required fields
            if (!newCourse.title || !newCourse.description) {
                setError('Please fill in all required fields');
                return;
            }

            // Validate video input - only one option should be selected
            if ((newCourse.videoUrl && videoFile) || (!newCourse.videoUrl && !videoFile)) {
                setError('Please choose either a video URL or upload a video file, not both or neither');
                return;
            }

            let thumbnailUrl = newCourse.thumbnail;
            let videoUrl = newCourse.videoUrl;

            // Upload files if they exist
            if (thumbnailFile) {
                thumbnailUrl = await handleFileUpload(thumbnailFile, 'thumbnail');
            }
            if (videoFile) {
                videoUrl = await handleFileUpload(videoFile, 'video');
            }

            const courseData = {
                ...newCourse,
                thumbnail: thumbnailUrl,
                videoUrl: videoUrl
            };

            const response = await fetch(`${API_URL}/api/courses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(courseData)
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create course');
            }

            // Refresh the courses list
            await fetchInstructorCourses();
            
            setShowCourseForm(false);
            setNewCourse({
                title: '',
                description: '',
                level: 'beginner',
                videoUrl: '',
                category: 'General',
                thumbnail: ''
            });
            setThumbnailFile(null);
            setVideoFile(null);
            setError(null);
        } catch (err) {
            console.error('Error creating course:', err);
            setError(err.message || 'Failed to create course. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'videoUrl' && value && videoFile) {
            setError('Please choose either a video URL or upload a video file, not both');
            setVideoFile(null); // Clear the uploaded file if URL is entered
            const fileInput = document.getElementById('video');
            if (fileInput) fileInput.value = ''; // Clear the file input
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
                setThumbnailFile(file);
                // Create a preview URL for the thumbnail
                const previewUrl = URL.createObjectURL(file);
                setNewCourse(prev => ({ ...prev, thumbnail: previewUrl }));
            } else if (type === 'video') {
                if (newCourse.videoUrl) {
                    setError('Please choose either a video URL or upload a video file, not both');
                    e.target.value = ''; // Clear the file input
                    return;
                }
                setVideoFile(file);
            }
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            console.log('Attempting to delete course:', courseId);
            const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Delete response status:', response.status);

            if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            }

            if (!response.ok) {
                console.error('Delete failed:', data);
                throw new Error(data?.message || 'Failed to delete course');
            }

            // Remove the course from the local state
            setCourses(courses.filter(course => course._id !== courseId));
            setError(null);

            // If we're in course detail view, go back to the course list
            if (selectedCourse && selectedCourse._id === courseId) {
                setSelectedCourse(null);
            }

            // Show success message
            alert('Course deleted successfully');
        } catch (err) {
            console.error('Error deleting course:', err);
            setError(err.message || 'Failed to delete course. Please try again.');
            alert(err.message || 'Failed to delete course. Please try again.');
        }
    };

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
            
            <button 
                className="create-course-btn"
                onClick={() => setShowCourseForm(!showCourseForm)}
            >
                {showCourseForm ? 'Cancel' : 'Create New Course'}
            </button>

            {showCourseForm && (
                <form className="course-form" onSubmit={handleCreateCourse}>
                    <div className="form-group">
                        <label htmlFor="title">Course Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="Enter course title"
                            value={newCourse.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Course Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Enter course description"
                            value={newCourse.description}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="level">Course Level *</label>
                        <select
                            id="level"
                            name="level"
                            value={newCourse.level}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Course Category</label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            placeholder="Enter course category"
                            value={newCourse.category}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="thumbnail">Course Thumbnail</label>
                        <div className="file-upload-container">
                            <input
                                type="file"
                                id="thumbnail"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'thumbnail')}
                            />
                            {newCourse.thumbnail && (
                                <div className="thumbnail-preview">
                                    <img src={newCourse.thumbnail} alt="Thumbnail preview" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="videoUrl">Video URL (YouTube or Vimeo)</label>
                        <input
                            type="url"
                            id="videoUrl"
                            name="videoUrl"
                            placeholder="Enter video URL (YouTube or Vimeo)"
                            value={newCourse.videoUrl}
                            onChange={handleInputChange}
                        />
                        <small className="input-help">Choose either URL or file upload below</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="video">Or Upload Video File</label>
                        <div className="file-upload-container">
                            <input
                                type="file"
                                id="video"
                                accept="video/*"
                                onChange={(e) => handleFileChange(e, 'video')}
                            />
                            {videoFile && (
                                <div className="video-preview">
                                    <p>Selected: {videoFile.name}</p>
                                </div>
                            )}
                        </div>
                        <small className="input-help">Choose either file upload or URL above</small>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="submit-btn">Create Course</button>
                </form>
            )}

            {loading ? (
                <div className="loading">Loading courses...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : courses.length === 0 ? (
                <div className="no-courses">No courses found. Create your first course!</div>
            ) : (
                <div className="courses-grid">
                    {courses.map(course => (
                        <div key={course._id} className="course-card-container">
                            <CourseCard
                                course={course}
                                onClick={() => setSelectedCourse(course)}
                            />
                            <button 
                                className="delete-course-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCourse(course._id);
                                }}
                            >
                                Delete Course
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Instructor; 