import React, { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import "./UserManagement.css";
import { FiTrash2, FiUserPlus, FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  const [newAdmin, setNewAdmin] = useState({
    username: "",
    password: "",
    email: "",
    empid: "",
    firstname: "",
    lastname: "",
    phone: "",
    domain: "",
    location: "",
  });

  const navigate = useNavigate();

  const showNotification = useCallback((message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get("/users/list");
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showNotification("Failed to fetch users", "error");
    }
  }, [showNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const results = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const handleRoleChange = async (username, newRole) => {
    try {
      await api.put(`/users/${username}/role`, { new_role: newRole });
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.username === username ? { ...user, role: newRole } : user
        )
      );
      showNotification(`Role changed to ${newRole} for ${username}`, "success");
    } catch (error) {
      console.error("Error changing role:", error);
      showNotification("Failed to change role", "error");
    }
  };

  const handleDeleteUser = async (username) => {
    try {
      await api.delete(`/users/delete/${username}`);
      setUsers(prevUsers => prevUsers.filter(user => user.username !== username));
      showNotification(`User ${username} deleted successfully`, "success");
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification("Failed to delete user", "error");
    }
    setConfirmingDelete(null);
  };

  const startDeleteConfirmation = (username) => {
    setConfirmingDelete(username);
  };

  const cancelDelete = () => {
    setConfirmingDelete(null);
  };


  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post("/create-root-user", newAdmin);
      showNotification(`Admin ${newAdmin.username} created successfully`, "success");
      setIsFormOpen(false);
      setNewAdmin({
        username: "",
        password: "",
        email: "",
        empid: "",
        firstname: "",
        lastname: "",
        phone: "",
        domain: "",
        location: "",
      });
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error creating admin:", error);
      showNotification("Failed to create admin user", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin(prevAdmin => ({
      ...prevAdmin,
      [name]: value,
    }));
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "#4f46e5";
      case "team_manager":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="user-management-container">
      <div className="back-button" onClick={() => navigate("/dashboard")}>
      <FiArrowLeft /> <span>Back to Dashboard</span>
      </div>
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button onClick={() => setNotification({ ...notification, show: false })}>
            <FiX />
          </button>
        </div>
      )}

      <div className="header-section">
        <h1 className="user-class-heading">User Management</h1>
        <div className="user-search-bar">
          <FiSearch className="user-search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          className="add-user-btn"
          onClick={() => setIsFormOpen(!isFormOpen)}
        >
          <FiUserPlus /> {isFormOpen ? 'Cancel' : 'Add New User'}
        </button>
      </div>

      {isFormOpen && (
          <div className="create-admin-form-container">
            <form onSubmit={handleCreateAdmin} className="create-admin-form">
              <button 
                type="button" 
                className="close-form-btn"
                onClick={() => setIsFormOpen(false)}
              >
                <FiX />
              </button>
              <h2>Create New Admin</h2>
            <div className="form-grid">
              <div className="form-group-admin">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter username"
                  value={newAdmin.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group-admin">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={newAdmin.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group-admin">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={newAdmin.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group-admin">
                <label>Employee ID</label>
                <input
                  type="text"
                  name="empid"
                  placeholder="Enter employee ID"
                  value={newAdmin.empid}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group-admin">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstname"
                  placeholder="Enter first name"
                  value={newAdmin.firstname}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group-admin">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastname"
                  placeholder="Enter last name"
                  value={newAdmin.lastname}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group-admin">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={newAdmin.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group-admin">
                <label>Domain</label>
                <input
                  type="text"
                  name="domain"
                  placeholder="Enter domain"
                  value={newAdmin.domain}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group-admin">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter location"
                  value={newAdmin.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <button type="submit" className="submit-btn">
              Create Admin
            </button>
          </form>
        </div>
      )}

      <div className="users-table-container">
        {filteredUsers.length === 0 ? (
          <div className="no-results">
            {searchTerm ? (
              <>
                <p>No users found matching "{searchTerm}"</p>
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </button>
              </>
            ) : (
              <p>No users available</p>
            )}
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.username}>
                  <td>
                    <div className="user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    {user.username}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <div className="role-select">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.username, e.target.value)}
                        style={{ color: getRoleColor(user.role) }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="team_manager">Team Manager</option>
                      </select>
                      <FiChevronDown className="dropdown-icon" />
                    </div>
                  </td>
                  <td>
                    <div className="delete-action-container">
                      {confirmingDelete === user.username ? (
                        <div className="delete-confirmation">
                          <span>Delete {user.username}?</span>
                          <button 
                            className="confirm-btn"
                            onClick={() => handleDeleteUser(user.username)}
                          >
                            Yes
                          </button>
                          <button 
                            className="cancel-btn"
                            onClick={cancelDelete}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => startDeleteConfirmation(user.username)}
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
