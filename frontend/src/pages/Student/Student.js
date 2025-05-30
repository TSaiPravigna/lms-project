import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../../components/CourseCard/CourseCard';
import './Student.css';

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

const Student = () => {
    const [allCourses, setAllCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchAllCourses();
        fetchEnrolledCourses();
    }, [navigate]);

    const fetchAllCourses = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/courses`);
            if (!response.ok) {
                throw new Error('Failed to fetch available courses');
            }
            const data = await response.json();
            setAllCourses(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchEnrolledCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await fetch(`${API_URL}/api/courses/enrolled`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch enrolled courses');
            }

            const data = await response.json();
            setEnrolledCourses(data);
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            setError(error.message);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/courses/${courseId}/enroll`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to enroll in course');
            }
            
            await fetchEnrolledCourses();
            alert('Successfully enrolled in course!');
        } catch (error) {
            console.error('Error enrolling in course:', error);
            alert(error.message);
        }
    };

    // Filter out enrolled courses from available courses
    const availableCourses = allCourses.filter(course => 
        !enrolledCourses.some(enrolled => enrolled._id === course._id)
    );

    return (
        <div className="student-container">
            <h1>Available Courses</h1>

            {loading ? (
                <div className="loading">Loading courses...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : availableCourses.length === 0 ? (
                <div className="no-courses">
                    <p>No courses available at the moment.</p>
                    <button 
                        className="view-my-courses-btn"
                        onClick={() => navigate('/my-courses')}
                    >
                        View My Courses
                    </button>
                </div>
            ) : (
                <div className="courses-grid">
                    {availableCourses.map(course => (
                        <CourseCard 
                            key={course._id} 
                            course={course} 
                            onEnroll={handleEnroll}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Student; 