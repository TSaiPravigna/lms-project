import React, { useState } from 'react';
import AddInstructor from '../../components/AddInstructor/AddInstructor';
import ViewInstructors from '../../components/ViewInstructors/ViewInstructors';
import './ManageInstructor.css';

const ManageInstructor = () => {
    const [showAddInstructor, setShowAddInstructor] = useState(false);
    const [showViewInstructors, setShowViewInstructors] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleAddInstructorSuccess = () => {
        setShowAddInstructor(false);
        setSuccessMessage('Instructor added successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    return (
        <div className="manage-instructor">
            <h2>Manage Instructors</h2>
            
            {successMessage && (
                <div className="success-message">
                    {successMessage}
                </div>
            )}

            <div className="instructor-actions">
                <button 
                    className="action-button"
                    onClick={() => setShowAddInstructor(true)}
                >
                    Add Instructor
                </button>
                <button 
                    className="action-button"
                    onClick={() => setShowViewInstructors(!showViewInstructors)}
                >
                    {showViewInstructors ? "Hide Instructors" : "View Instructors"}
                </button>
            </div>

            {showViewInstructors && <ViewInstructors />}

            {showAddInstructor && (
                <AddInstructor
                    onClose={() => setShowAddInstructor(false)}
                    onSuccess={handleAddInstructorSuccess}
                />
            )}
        </div>
    );
};

export default ManageInstructor; 