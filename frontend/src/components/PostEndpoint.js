import React from "react";
import { FaExternalLinkAlt, FaHome } from "react-icons/fa";

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
            <h3>POST Response</h3>
            <pre>{JSON.stringify(dynamicResponse, null, 2)}</pre>
          </div>
        )
      )}
    </div>
  );
};

export default PostEndpoint;