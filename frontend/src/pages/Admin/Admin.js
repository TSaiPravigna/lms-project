import React from 'react';
import { useNavigate } from 'react-router-dom';
import ManageInstructor from './ManageInstructor';
import './Admin.css';

const Admin = () => {
    const navigate = useNavigate();

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            
            <div className="dashboard-sections">
                <ManageInstructor />

                <section className="dashboard-section">
                    <h2>Course Management</h2>
                    <div className="action-buttons">
                        <button 
                            className="action-button"
                            onClick={() => navigate("/courses")}
                        >
                            Manage Courses
                        </button>
                    </div>
                </section>

                <section className="dashboard-section">
                    <h2>System Settings</h2>
                    <div className="action-buttons">
                        <button 
                            className="action-button"
                            onClick={() => navigate("/settings")}
                        >
                            System Configuration
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Admin; 