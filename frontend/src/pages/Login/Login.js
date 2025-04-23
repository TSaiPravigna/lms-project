import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Redirect after login
import "./Login.css";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        try {
            console.log("Attempting login with:", formData.email);
            
            const response = await axios.post(`${API_URL}/api/auth/login`, formData, {
                headers: { "Content-Type": "application/json" }
            });

            console.log("Login response:", response.data);

            if (response.data && response.data.token) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("userRole", response.data.user.role);
                localStorage.setItem("userId", response.data.user.id);
                localStorage.setItem("userName", `${response.data.user.firstName} ${response.data.user.lastName}`);
                
                // Redirect based on user role
                switch (response.data.user.role) {
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
                setError("Invalid response from server");
            }
        } catch (error) {
            console.error("Login error:", error);
            
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                setError(error.response.data.message || "Invalid credentials");
            } else if (error.request) {
                // The request was made but no response was received
                setError("No response from server. Please check if the backend is running.");
            } else {
                // Something happened in setting up the request that triggered an Error
                setError(`An error occurred: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <form className="form-wrapper" onSubmit={handleSubmit}>
                <h2>Login</h2>
                {error && <div className="error-message">{error}</div>}
                <div className="input-group">
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        value={formData.email}
                        onChange={handleChange} 
                        required 
                        disabled={loading}
                    />
                </div>
                <div className="input-group">
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        value={formData.password}
                        onChange={handleChange} 
                        required 
                        disabled={loading}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
                <p>
                    Don't have an account? <a href="/signup">Sign Up</a>
                </p>
            </form>
        </div>
    );
};

export default Login;
