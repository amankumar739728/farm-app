import React from "react";
import { FaExternalLinkAlt, FaHome,FaCheckCircle, FaInfoCircle, FaFont, FaCity } from "react-icons/fa";
import "./PostEndpoint.css";
const PostEndpoint = ({
  isLoading,
  handleDynamicResponseClick,
  dynamicResponse,
  name,
  setName,
  age,
  setAge,
  city,
  setCity,
  onBackToDashboard,
}) => {
  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent page reload
    handleDynamicResponseClick({ name, age, city });
  };

  return (
    <div className="endpoint-container">
      <h2 style={{ textAlign: "center" }}>POST Endpoint</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          required
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
        />
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Enter age"
          required
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
        />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
          required
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
        />
      </form>

      {/* Buttons aligned to the right */}
      <div className="button-container">
        <button type="submit" className="details-button" onClick={handleSubmit}>
          <FaExternalLinkAlt /> Get Dynamic Response
        </button>
        <button className="back-button" onClick={onBackToDashboard}>
          <FaHome /> Back to Dashboard
        </button>
      </div>

      {/* Response Section Below */}
      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        dynamicResponse && (
          <div className="response-card">
            <div className="card-header">
              <h3>API Response</h3>
            </div>
            <div className="card-body">
              <div className="detail-row">
                <FaInfoCircle className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Message:</span>
                  <span className="detail-value">{dynamicResponse.message}</span>
                </div>
              </div>
              
              <div className="detail-row">
                <FaCheckCircle className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value" style={{ 
                    color: dynamicResponse.status === 'success' ? 'green' : 'red',
                    textTransform: 'capitalize'
                  }}>
                    {dynamicResponse.status}
                  </span>
                </div>
              </div>
              
              <div className="detail-row">
                <FaFont className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Uppercase Name:</span>
                  <span className="detail-value">{dynamicResponse.uppercase_name}</span>
                </div>
              </div>
              
              <div className="detail-row">
                <FaCity className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Reversed City:</span>
                  <span className="detail-value">{dynamicResponse.reversed_city}</span>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default PostEndpoint;