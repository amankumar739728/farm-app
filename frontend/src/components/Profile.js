import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaBuilding, FaTimes  } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import api from "../api/api";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    domain: '',
    location: ''
  });
  const [notification, setNotification] = useState({ show: false, message: '', isError: false });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        const data = response.data;
        setProfile(data);
        setFormData({
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          phone: data.phone,
          domain: data.domain,
          location: data.location
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/profile', formData);
      
    if (response.status === 200) {
      // Re-fetch profile to ensure updated data is retrieved from server
      const refreshed = await api.get('/profile');
      const updatedProfile = refreshed.data;
      setProfile(updatedProfile);
      setFormData({
        firstname: updatedProfile.firstname,
        lastname: updatedProfile.lastname,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        domain: updatedProfile.domain,
        location: updatedProfile.location
      });
      setEditMode(false);
      showNotification('Profile updated successfully!', false);
    } else {
      const errorData = await response.json();
      showNotification(errorData.message || 'Failed to save the updates', true);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    showNotification('Error saving the data. Please try again.', true);
  }
};

  const showNotification = (message, isError) => {
    setNotification({ show: true, message, isError });
    setTimeout(() => {
      setNotification({ show: false, message: '', isError: false });
    }, 5000);
  };

  const closeNotification = () => {
    setNotification({ show: false, message: '', isError: false });
  };

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (!profile) return <div className="profile-error">Error loading profile</div>;

  return (
    <div className="profile-container">
        <div className="back-button" onClick={() => navigate("/dashboard")}>
          <FiArrowLeft /> <span>Back to Dashboard</span>
        </div>
      <h2>User Profile</h2>
      
      {notification.show && (
        <div className={`notification ${notification.isError ? 'error' : 'success'}`}>
          {notification.message}
          <button className="notification-close" onClick={closeNotification}>
            <FaTimes />
          </button>
        </div>
      )}
      
      {!editMode ? (
        <div className="profile-view">
          <div className="profile-field">
            <FaUser className="profile-icon" />
            <div>
              <label>Name</label>
              <p>{profile.firstname} {profile.lastname}</p>
            </div>
          </div>
          
          <div className="profile-field">
            <FaEnvelope className="profile-icon" />
            <div>
              <label>Email</label>
              <p>{profile.email}</p>
            </div>
          </div>
          
          <div className="profile-field">
            <FaPhone className="profile-icon" />
            <div>
              <label>Phone</label>
              <p>{profile.phone}</p>
            </div>
          </div>
          
          <div className="profile-field">
            <FaIdCard className="profile-icon" />
            <div>
              <label>Employee ID</label>
              <p>{profile.empid}</p>
            </div>
          </div>
          
          <div className="profile-field">
            <FaBuilding className="profile-icon" />
            <div>
              <label>Domain</label>
              <p>{profile.domain}</p>
            </div>
          </div>
          
          <div className="profile-field">
            <FaMapMarkerAlt className="profile-icon" />
            <div>
              <label>Location</label>
              <p>{profile.location}</p>
            </div>
          </div>
          
          <button 
            onClick={() => setEditMode(true)}
            className="edit-button"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <div className="form-container">
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Domain</label>
              <input
                type="text"
                name="domain"
                value={formData.domain}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={() => setEditMode(false)}>
                Cancel
              </button>
              <button type="submit">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;