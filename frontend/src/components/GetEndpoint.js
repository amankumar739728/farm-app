// src/components/GetEndpoint.js
import React, { useState } from "react"; // Import useState
import { FaSearch, FaHome } from "react-icons/fa";

const GetEndpoint = ({ isLoading, handleDetailsClick, sampleResponse, onBackToDashboard }) => {
  const [fullname, setFullname] = useState(""); // Use useState

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleDetailsClick(fullname);
    }
  };

  return (
    <div className="endpoint-container">
      <h2>GET Endpoint</h2>
      <input
        type="text"
        value={fullname}
        onChange={(e) => setFullname(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter fullname"
      />
      <button className="details-button" onClick={() => handleDetailsClick(fullname)}>
        <FaSearch /> Details
      </button>

      {/* Back to Dashboard Button */}
      <button className="back-button" onClick={onBackToDashboard}>
        <FaHome /> Back to Dashboard
      </button>

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