// import React, { useState, useEffect } from "react";
// import { useSampleApi } from '../api/sampleApi';



// import { useAuth } from "../context/AuthContext";
// import { useApi } from "../utils/api";
// import LogoutButton from "../components/LogoutButton";
// import "./Dashboard.css"; // Import the CSS file



// const Dashboard = () => {
//   // const { getData } = useSampleApi(); // Available if needed later



//   const [apiData, setApiData] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { getData } = useSampleApi();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         const data = await getData();
//         setApiData(data);
//         setError(null);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         setError(error.message || 'Failed to fetch data');
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, [getData]);


//   const { token } = useAuth();

//   const api = useApi();
//   if (!api){
//    alert("Session expired. Please log in again.");
//   }
//   const [sampleResponse, setSampleResponse] = useState(null);
//   const [fullname, setFullname] = useState("");


//   const handleDetailsClick = () => {
//     if (!fullname) {
//       alert("Please enter a fullname");
//       return;
//     }
//     console.log("Sending request with token:", token);
//     api.get(`/v1/sample/response/${fullname}`, {
//       headers: { Authorization: `Bearer ${token}` } // Include the bearer token
//     })
//       .then((res) => {
//         console.log("API Response:", res);
//         setSampleResponse(res.data);
//       })
//       .catch((err) => {
//         console.error("Error fetching sample response:", err);
//         console.error("Error details:", err.response?.data);
//       });

//   };

//   return (
//     <div className="dashboard-container">
//       <h1>Dashboard</h1>
//       <LogoutButton />
//       <div>
//         <input
//           type="text"
//           value={fullname}
//           onChange={(e) => setFullname(e.target.value)}
//           placeholder="Enter fullname"
//         />
//         <button onClick={handleDetailsClick}>Details</button>
//       </div>

//       {sampleResponse ? <pre>{JSON.stringify(sampleResponse, null, 2)}</pre> : <p>Click "Details" to load data...</p>}
      
//       <div className="api-data-section">
//         <h2>API Data</h2>
//         {isLoading ? (
//           <div className="loading-spinner">Loading API data...</div>
//         ) : error ? (
//           <div className="error-message">Error: {error}</div>
//         ) : apiData ? (
//           <pre>{JSON.stringify(apiData, null, 2)}</pre>
//         ) : (
//           <div>No data available</div>
//         )}
//       </div>


//     </div>
//   );
// };

// export default Dashboard;







// import "./Dashboard.css";
// import React, { useState, useContext } from "react";
// import api from "../api/api";
// import { FaSearch, FaExternalLinkAlt } from "react-icons/fa";
// import { ThemeContext } from "../context/ThemeContext";

// const Dashboard = () => {
//   const [fullname, setFullname] = useState("");
//   const [sampleResponse, setSampleResponse] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   // State for the POST endpoint
//   const [name, setName] = useState("");
//   const [age, setAge] = useState("");
//   const [city, setCity] = useState("");
//   const [dynamicResponse, setDynamicResponse] = useState(null);

//   const { isDarkMode } = useContext(ThemeContext);

//   // Handle GET request
//   const handleDetailsClick = () => {
//     if (!fullname) {
//       alert("Please enter a fullname");
//       return;
//     }

//     setIsLoading(true);
//     api
//       .get(`/v1/sample/response/${fullname}`)
//       .then((res) => {
//         setSampleResponse(res.data);
//       })
//       .catch((err) => {
//         console.error("❌ API Error:", err.response?.data || err.message);
//       })
//       .finally(() => {
//         setIsLoading(false);
//       });
//   };

//   // Handle POST request
//   const handleDynamicResponseClick = async () => {
//     if (!name || !age || !city) {
//       alert("Please fill all fields: name, age, and city");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const payload = { name, age: parseInt(age), city }; // Convert age to number
//       const response = await api.post("/v1/sample/dynamic-response", payload);
//       setDynamicResponse(response.data);
//     } catch (err) {
//       console.error("❌ API Error:", err.response?.data || err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyDown = (event) => {
//     if (event.key === "Enter") {
//       handleDetailsClick();
//     }
//   };

//   return (
//     <div className={`dashboard-container ${isDarkMode ? "dark-mode" : ""}`}>
//       <div className="content">
//         {/* GET Endpoint Section */}
//         <h2>GET Endpoint</h2>
//         <input
//           type="text"
//           value={fullname}
//           onChange={(e) => setFullname(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="Enter fullname"
//         />
//         <button className="details-button" onClick={handleDetailsClick}>
//           <FaSearch /> Details
//         </button>

//         {/* POST Endpoint Section */}
//         <h2>POST Endpoint</h2>
//         <input
//           type="text"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="Enter name"
//         />
//         <input
//           type="number"
//           value={age}
//           onChange={(e) => setAge(e.target.value)}
//           placeholder="Enter age"
//         />
//         <input
//           type="text"
//           value={city}
//           onChange={(e) => setCity(e.target.value)}
//           placeholder="Enter city"
//         />
//         <button className="details-button" onClick={handleDynamicResponseClick}>
//           <FaExternalLinkAlt /> Get Dynamic Response
//         </button>

//         {/* Display Responses */}
//         {isLoading ? (
//           <div className="loading-spinner">Loading...</div>
//         ) : (
//           <>
//             {sampleResponse && (
//               <div className="response-card">
//                 <h3>GET Response</h3>
//                 <pre>{JSON.stringify(sampleResponse, null, 2)}</pre>
//               </div>
//             )}
//             {dynamicResponse && (
//               <div className="response-card">
//                 <h3>POST Response</h3>
//                 <pre>{JSON.stringify(dynamicResponse, null, 2)}</pre>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       <footer className="dashboard-footer">
//         <p>© 2025 Gyansys Inc. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// };

// export default Dashboard;



// src/pages/Dashboard.js
import "./Dashboard.css";
import React, { useState, useContext } from "react";
import api from "../api/api";
import { ThemeContext } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import GetEndpoint from "../components/GetEndpoint";
import PostEndpoint from "../components/PostEndpoint";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [sampleResponse, setSampleResponse] = useState(null);
  const [dynamicResponse, setDynamicResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // State for POST endpoint
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");

  const { isDarkMode } = useContext(ThemeContext);

  // Handle GET request
  const handleDetailsClick = async (fullname) => {
    if (!fullname) {
      alert("Please enter a fullname");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get(`/v1/sample/response/${fullname}`);
      setSampleResponse(response.data);
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle POST request
  const handleDynamicResponseClick = async (payload) => {
    if (!payload.name || !payload.age || !payload.city) {
      alert("Please fill all fields: name, age, and city");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/v1/sample/dynamic-response", {
        ...payload,
        age: parseInt(payload.age),
      });
      setDynamicResponse(response.data);
      setName("");
      setAge("");
      setCity("");
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    setActiveTab(null);
  };

  return (
    <div className={`dashboard-container ${isDarkMode ? "dark-mode" : ""}`}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="content">
        {activeTab === null ? (
          <div
            className="default-landing"
            style={{
              backgroundImage: `url('/assets/dashboard-bg.jpg')`, // ✅ Correct way to reference image
            }}
          >
            <h2>Welcome to the Dashboard!</h2>
            <p>
              Click <strong>Details</strong> to fetch details or{" "}
              <strong>Dynamic_Details</strong> Button to return dynamic data.
            </p>
          </div>
        ) : activeTab === "get" ? (
          <GetEndpoint
            isLoading={isLoading}
            handleDetailsClick={handleDetailsClick}
            sampleResponse={sampleResponse}
            onBackToDashboard={handleBackToDashboard}
          />
        ) : (
          <PostEndpoint
            isLoading={isLoading}
            handleDynamicResponseClick={handleDynamicResponseClick}
            dynamicResponse={dynamicResponse}
            name={name}
            setName={setName}
            age={age}
            setAge={setAge}
            city={city}
            setCity={setCity}
            onBackToDashboard={handleBackToDashboard}
          />
        )}
      </div>
      <footer className="dashboard-footer">
        <p>© 2025 Gyansys Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
