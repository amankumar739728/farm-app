// import React from "react";
// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;


// import React, { useState } from "react";
// import { getTeamDetails, createTeam } from "./api/api";

// function App() {
//   const [teamName, setTeamName] = useState("");
//   const [teamDetails, setTeamDetails] = useState(null);
//   const [error, setError] = useState(null);
//   const [newTeam, setNewTeam] = useState({ team_name: "", team_owner: "" });

//   // Function to fetch team details
//   const handleFetchTeam = async () => {
//     try {
//       setError(null);
//       const data = await getTeamDetails(teamName);
//       setTeamDetails(data);
//     } catch (err) {
//       setError(err.response?.data?.detail || "An error occurred");
//       setTeamDetails(null);
//     }
//   };

//   // Function to create a new team
//   const handleCreateTeam = async () => {
//     try {
//       setError(null);
//       const response = await createTeam(newTeam);
//       alert(response.message);
//     } catch (err) {
//       setError(err.response?.data?.detail || "An error occurred");
//     }
//   };

//   return (
//     <div style={{ padding: "20px", fontFamily: "Arial" }}>
//       <h2>Auction Tracker</h2>

//       {/* Fetch Team Details */}
//       <div>
//         <h3>Get Team Details</h3>
//         <input
//           type="text"
//           placeholder="Enter team name"
//           value={teamName}
//           onChange={(e) => setTeamName(e.target.value)}
//         />
//         <button onClick={handleFetchTeam}>Fetch Team</button>
//         {error && <p style={{ color: "red" }}>{error}</p>}
//         {teamDetails && (
//           <div>
//             <h4>Team Details:</h4>
//             <pre>{JSON.stringify(teamDetails, null, 2)}</pre>
//           </div>
//         )}
//       </div>

//       <hr />

//       {/* Create a New Team */}
//       <div>
//         <h3>Create a New Team</h3>
//         <input
//           type="text"
//           placeholder="Team Name"
//           value={newTeam.team_name}
//           onChange={(e) => setNewTeam({ ...newTeam, team_name: e.target.value })}
//         />
//         <input
//           type="text"
//           placeholder="Team Owner"
//           value={newTeam.team_owner}
//           onChange={(e) => setNewTeam({ ...newTeam, team_owner: e.target.value })}
//         />
//         <button onClick={handleCreateTeam}>Create Team</button>
//       </div>
//     </div>
//   );
// }

// export default App;



import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword"; // ✅ Import Reset Password Page
import ForgotPassword from "./pages/ForgotPassword"; // ✅ Import Forgot Password Page
import Signup from "./pages/Signup";
import PrivateRoute from "./components/PrivateRoute";
import Header from "./components/Header"; // ✅ Include Header
import Auction from "./pages/Auction";
import { AuthProvider } from "./context/AuthContext";
import UserManagement from "./components/UserManagement";
import RoleBasedRoute from "./components/RoleBasedRoute";
import Profile from './components/Profile';
import ChangePassword from './pages/ChangePassword';

function App() {
  return (
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* ✅ Add Forgot Password Route */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} /> {/* ✅ Add Reset Password Route */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/auction" element={<Auction />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/user-management" element={ <RoleBasedRoute allowedRoles={["admin"]}>
                <UserManagement />
              </RoleBasedRoute>
            }
/>
      </Routes>
    </AuthProvider>
  );
}

export default App;