import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageUsers.css";

const ManageInstructors = () => {
  const [users, setUsers] = useState({
    instructors: [],
    students: [],
    admins: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [userType, setUserType] = useState("instructor"); // Default to instructor
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    expertise: "",
    bio: "",
  });

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Fetch all user types in parallel
      const [instructorsRes, studentsRes, adminsRes] = await Promise.all([
        axios.get("/api/admin/instructors", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("/api/admin/students", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("/api/admin/admins", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setUsers({
        instructors: instructorsRes.data,
        students: studentsRes.data,
        admins: adminsRes.data
      });
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch users");
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const endpoint = `/api/admin/${userType}s`;
      
      await axios.post(endpoint, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowAddForm(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        expertise: "",
        bio: "",
      });
      fetchAllUsers();
    } catch (err) {
      setError(`Failed to add ${userType}`);
    }
  };

  const handleDeleteUser = async (id, type) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/${type}s/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAllUsers();
    } catch (err) {
      setError(`Failed to delete ${type}`);
    }
  };

  const filteredUsers = (type) => {
    return users[type].filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderUserForm = () => {
    return (
      <div className="form-container">
        <h3>Add New {userType.charAt(0).toUpperCase() + userType.slice(1)}</h3>
        <form onSubmit={handleAddUser}>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                required
              />
            </div>
            {userType === "instructor" && (
              <div className="form-group">
                <label>Expertise</label>
                <input
                  type="text"
                  value={newUser.expertise}
                  onChange={(e) =>
                    setNewUser({ ...newUser, expertise: e.target.value })
                  }
                  required
                />
              </div>
            )}
          </div>
          {userType === "instructor" && (
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={newUser.bio}
                onChange={(e) =>
                  setNewUser({ ...newUser, bio: e.target.value })
                }
                required
              />
            </div>
          )}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Add {userType.charAt(0).toUpperCase() + userType.slice(1)}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderUserList = (type) => {
    const users = filteredUsers(type);
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    
    return (
      <div className="users-section">
        <h2>{typeLabel}s</h2>
        <div className="users-list">
          {users.length === 0 ? (
            <div className="no-items">No {type}s found</div>
          ) : (
            users.map((user) => (
              <div key={user._id} className="user-card">
                <div className="user-info">
                  <div className="info-row">
                    <span className="info-label">Name:</span>
                    <span className="info-value">{user.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{user.email}</span>
                  </div>
                  {type === "instructor" && (
                    <div className="info-row">
                      <span className="info-label">Expertise:</span>
                      <span className="info-value">{user.expertise}</span>
                    </div>
                  )}
                </div>
                <button
                  className="delete-action"
                  onClick={() => handleDeleteUser(user._id, type)}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="manage-users">
      <h1>Manage Users</h1>
      
      <div className="section-actions">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="user-type-selector">
          <select 
            value={userType} 
            onChange={(e) => setUserType(e.target.value)}
            className="user-type-select"
          >
            <option value="instructor">Instructor</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
          <button className="add-btn" onClick={() => setShowAddForm(true)}>
            Add {userType.charAt(0).toUpperCase() + userType.slice(1)}
          </button>
        </div>
      </div>

      {showAddForm && renderUserForm()}

      <div className="users-container">
        {renderUserList("instructor")}
        {renderUserList("student")}
        {renderUserList("admin")}
      </div>
    </div>
  );
};

export default ManageInstructors; 