// src/components/GetEndpoint.js
import React, { useState } from "react";
import { FaSearch, FaHome, FaInfoCircle, FaCheckCircle } from "react-icons/fa";
import "./GetEndpoint.css";

const GetEndpoint = ({ isLoading, handleDetailsClick, sampleResponse, onBackToDashboard }) => {
  const [fullname, setFullname] = useState("");

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleDetailsClick(fullname);
    }
  };

  return (
    <div className="endpoint-container">
      <h2 style={{ textAlign: "center" }}>GET Endpoint</h2>
      
      {/* Input Field */}
      <input
        type="text"
        value={fullname}
        onChange={(e) => setFullname(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter fullname"
        aria-label="Enter fullname"
      />

      {/* Buttons Section */}
      <div className="button-container">
        <button type="button" className="details-button" onClick={() => handleDetailsClick(fullname)}>
          <FaSearch /> Details
        </button>
        <button type="button" className="back-button" onClick={onBackToDashboard}>
          <FaHome /> Back to Dashboard
        </button>
      </div>

      {/* Response Section */}
      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        sampleResponse && (
          <div className="response-card">
            <div className="card-header">
              <h3>API Response</h3>
            </div>
            <div className="card-body">
              <div className="detail-row">
                <FaInfoCircle className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Message:</span>
                  <span className="detail-value">{sampleResponse.message}</span>
                </div>
              </div>
              
              <div className="detail-row">
                <FaCheckCircle className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value" style={{ 
                    color: sampleResponse.status === 'success' ? 'green' : 'red',
                    textTransform: 'capitalize'
                  }}>
                    {sampleResponse.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default GetEndpoint;