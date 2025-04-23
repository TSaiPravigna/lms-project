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
        
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        
        try {
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    password: formData.password,
                    role: formData.role
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user role in localStorage
                localStorage.setItem("token", data.token);
                localStorage.setItem("userRole", data.user.role);
                localStorage.setItem("userId", data.user.id);
                localStorage.setItem("userName", `${data.user.firstName} ${data.user.lastName}`);
                
                alert("Registration successful!");
                
                // Redirect based on user role
                switch (data.user.role) {
                    case "admin":
                        navigate("/admin");
                        break;
                    case "instructor":
                        navigate("/instructor");
                        break;
                    case "student":
                        navigate("/student");
                        break;
                    default:
                        navigate("/");
                }
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred during registration");
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
