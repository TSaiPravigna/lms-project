import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../../components/CourseCard/CourseCard';
import './MyCourse.css';

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchCourses();
    }, [navigate]);

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            console.log('Fetching courses for role:', userRole);
            let endpoint = '';
            
            // Choose the appropriate endpoint based on user role
            if (userRole === 'student') {
                endpoint = `${API_URL}/api/courses/enrolled`;
            } else if (userRole === 'instructor') {
                endpoint = `${API_URL}/api/courses/instructor`;
            } else {
                throw new Error('Invalid user role');
            }

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch courses');
            }

            const data = await response.json();
            console.log('Received courses:', data);
            setCourses(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="my-courses-container">
            <h1>My Courses</h1>

            {loading ? (
                <div className="loading">Loading courses...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : courses.length === 0 ? (
                <div className="no-courses">
                    <p>You don't have any courses yet.</p>
                    {userRole === 'student' && (
                        <button 
                            className="browse-courses-btn"
                            onClick={() => navigate('/student')}
                        >
                            Browse Available Courses
                        </button>
                    )}
                    {userRole === 'instructor' && (
                        <button 
                            className="create-course-btn"
                            onClick={() => navigate('/instructor')}
                        >
                            Create New Course
                        </button>
                    )}
                </div>
            ) : (
                <div className="courses-grid">
                    {courses.map(course => (
                        <CourseCard 
                            key={course._id} 
                            course={course}
                            onClick={() => navigate(`/course/${course._id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCourses;


