import React, { useState, useEffect } from 'react';
import './ViewInstructors.css';

const ViewInstructors = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/admin/instructors', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch instructors');
                }

                const data = await response.json();
                setInstructors(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInstructors();
    }, []);

    if (loading) {
        return <div className="loading">Loading instructors...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="view-instructors">
            <h2>Instructors List</h2>
            <div className="instructors-grid">
                {instructors.map((instructor) => (
                    <div key={instructor._id} className="instructor-card">
                        <div className="instructor-info">
                            <h3>{instructor.firstName} {instructor.lastName}</h3>
                            <p className="email">{instructor.email}</p>
                            <p className="specialization">
                                <strong>Specialization:</strong> {instructor.specialization || 'Not specified'}
                            </p>
                            <p className="qualifications">
                                <strong>Qualifications:</strong> {instructor.qualifications || 'Not specified'}
                            </p>
                            <p className="courses-count">
                                <strong>Courses:</strong> {instructor.courses?.length || 0}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ViewInstructors; 