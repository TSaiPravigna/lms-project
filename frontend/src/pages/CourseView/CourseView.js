import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CourseDetail from '../../components/CourseDetail/CourseDetail';
import './CourseView.css';

const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

const CourseView = () => {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { courseId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (courseId) {
            fetchCourseDetails();
        }
    }, [courseId]);

    const fetchCourseDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            setLoading(true);
            setError(null);
            console.log('Fetching course details for ID:', courseId);
            
            const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }
                
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch course details');
            }

            const data = await response.json();
            console.log('Received course data:', data);
            
            if (!data) {
                throw new Error('No course data received');
            }
            
            setCourse(data);
        } catch (error) {
            console.error('Error fetching course details:', error);
            setError(error.message || 'Failed to fetch course details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="course-view-loading">
                <p>Loading course...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="course-view-error">
                <p>{error}</p>
                <button onClick={fetchCourseDetails}>Retry</button>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="course-view-error">
                <p>Course not found</p>
                <button onClick={() => navigate('/student')}>Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="course-view">
            <button 
                className="back-button" 
                onClick={() => navigate('/student')}
            >
                ← Back to Dashboard
            </button>
            <CourseDetail course={course} />
        </div>
    );
};

export default CourseView; 