import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem("userRole");
    const isLoggedIn = localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        navigate("/login");
    };

    return (
        <header className="header">
            <div className="logo">
                <Link to="/">
                    <h2>LMS</h2>
                </Link>
            </div>
            
            {/* Grouped all links in one <nav> */}
            <nav className="nav-links">
                {isLoggedIn ? (
                    <>
                        {userRole === "admin" && (
                            <>
                                <Link to="/admin">Admin Dashboard</Link>
                                <Link to="/admin/manage-courses">Manage Courses</Link>
                                <Link to="/instructors">Manage Instructors</Link>
                            </>
                        )}
                        {userRole === "instructor" && (
                            <>
                                <Link to="/instructor">Instructor Dashboard</Link>
                                <Link to="/my-courses">My Courses</Link>
                                <Link to="/students">My Students</Link>
                            </>
                        )}
                        {userRole === "student" && (
                            <>
                                <Link to="/student">Student Dashboard</Link>
                                <Link to="/my-courses">My Courses</Link>
                                <Link to="/assignments">Assignments</Link>
                            </>
                        )}
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/courses">Courses</Link>
                        <Link to="/aboutus">About Us</Link>
                        <Link to="/contactus">Contact Us</Link>
                        <Link to="/login" className="login-btn">Login</Link>
                    </>
                )}
            </nav>

            <div className="search-bar">
                <input type="text" placeholder="Search courses..." />
            </div>
        </header>
    );
};

export default Header;
