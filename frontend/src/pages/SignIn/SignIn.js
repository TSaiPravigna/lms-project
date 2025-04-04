import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Redirect after signup
import "./SignIn.css";

const SignIn = () => {
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
        role: "student",
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Registration successful!");
                navigate("/login"); // Redirect to login page
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className="container">
            <form className="form-wrapper" onSubmit={handleSubmit}>
                <h2>Sign Up</h2>
                <div className="input-group">
                    <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <select name="role" onChange={handleChange} required>
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button type="submit">Sign Up</button>
                <p>
                    Already have an account? <a href="/login">Login here</a>
                </p>
            </form>
        </div>
    );
};

export default SignIn;
