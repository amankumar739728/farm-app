import React, { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft,FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "./ChangePassword.css";

const ChangePassword = () => {
  const { username } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/change-password", {
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword
      });

      const data = response.data;
      if (response.status === 200) {
        setSuccess("Password changed successfully");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        setError(data.message || "Failed to change password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <button 
        onClick={() => navigate("/dashboard")}
        className="back-button-change-password"
      >
        <FaArrowLeft /> Back to Dashboard
      </button>

      <h2>Change Password</h2>
      <p>Changing password for: {username || "Current User"}</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group-change-password">
          <label>Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group-change-password">
          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group-change-password">
          <label>Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {error && (
            <div className="message error">
              {error}
              <button onClick={() => setError("")} className="clear-message">
                <FaTimes />
              </button>
            </div>
              )}
        {success && (
          <div className="message success">
            {success}
            <button onClick={() => setSuccess("")} className="clear-message">
              <FaTimes />
            </button>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
