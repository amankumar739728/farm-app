// src/components/GetEndpoint.js
import React, { useState } from "react";
import { FaSearch, FaHome } from "react-icons/fa";

const GetEndpoint = ({ isLoading, handleDetailsClick, sampleResponse, onBackToDashboard }) => {
  const [fullname, setFullname] = useState("");

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleDetailsClick(fullname);
    }
  };

  return (
    <div className="endpoint-container">
      <h2>GET Endpoint</h2>
      
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
            <h3>GET Response</h3>
            <pre>{JSON.stringify(sampleResponse, null, 2)}</pre>
          </div>
        )
      )}
    </div>
  );
};

export default GetEndpoint;