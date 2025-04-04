import React from 'react';
import './CourseCard.css';

const CourseCard = ({ course, onEnroll, onClick }) => {
    const handleEnrollClick = (e) => {
        e.stopPropagation();
        if (onEnroll) {
            onEnroll(course._id);
        }
    };

    const getInstructorName = (instructor) => {
        if (!instructor) return 'Unknown Instructor';
        return `${instructor.firstName} ${instructor.lastName}`;
    };

    return (
        <div className="course-card" onClick={onClick}>
            <div className="course-image">
                {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} />
                ) : (
                    <div className="course-image-placeholder">
                        <span>No Image</span>
                    </div>
                )}
            </div>
            <div className="course-content">
                <h3>{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                    <span className="course-instructor">By {getInstructorName(course.instructor)}</span>
                    <span className="course-duration">{course.duration || 'N/A'}</span>
                </div>
                {onEnroll && (
                    <button 
                        className="enroll-button"
                        onClick={handleEnrollClick}
                    >
                        Enroll Now
                    </button>
                )}
            </div>
        </div>
    );
};

export default CourseCard; 