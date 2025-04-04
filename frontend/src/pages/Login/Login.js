import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Redirect after login
import "./Login.css";

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
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userRole", data.user.role);
                localStorage.setItem("userId", data.user.id);
                localStorage.setItem("userName", `${data.user.firstName} ${data.user.lastName}`);
                
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
                setError(data.message || "Invalid credentials");
            }
        } catch (error) {
            console.error("Error:", error);
            setError("An error occurred during login. Please try again.");
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
