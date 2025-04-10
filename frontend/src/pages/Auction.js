import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import "./Auction.css";
import { FaHome, FaSearch, FaTimes } from "react-icons/fa";
import Select from "react-select";
import apiWrapper from "../api/apiWrapper";
import { jwtDecode } from "jwt-decode";

const Auction = () => {
  const [activeTab, setActiveTab] = useState("createTeam");
  const [teamName, setTeamName] = useState("");
  const [teamOwner, setTeamOwner] = useState("");
  const [teamLogo, setTeamLogo] = useState("");

  const [playerName, setPlayerName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [pointsSpent, setPointsSpent] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [teamDetails, setTeamDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [teamCreationError, setTeamCreationError] = useState("");
  const [accessError, setAccessError] = useState(""); // New state for access error messages

  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const clearAllInputs = () => {
    if (activeTab === "createTeam") {
      setTeamName("");
      setTeamOwner("");
      setTeamLogo("");
    } else if (activeTab === "addPlayer") {
      setPlayerName("");
      setEmployeeId("");
      setPointsSpent("");
      setSelectedTeam(null);
    }
    // Clear team details regardless of tab
    setTeamDetails(null);
  };

  const clearAccessError = () => {
    setAccessError("");
    clearAllInputs();
  };


  const clearTeamCreationError = () => {
    setTeamCreationError("");
    clearAllInputs();
  };

  // Function to decode JWT token and get user role
  const getUserRole = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.role; // Adjust this based on your token structure
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Function to get access token from storage or context
  const getAccessToken = () => {
    // Retrieve the access token from local storage or context
    return localStorage.getItem("token"); // Replace with actual token retrieval logic
  };

  useEffect(() => {
    const fetchTeams = async () => {
      console.log("Fetching teams...");
      try {
        const response = await apiWrapper("get", "/auction/team_list");
        console.log("Teams fetched successfully:", response.data);
        setTeams(response.data);
      } catch (error) {
        console.error("Error fetching teams:", error);
        navigate("/");
      }
    };
    fetchTeams();
  }, [navigate, successMessage]); // Added successMessage as dependency to refresh team list after creation

  const onBackToDashboard = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    // Reset selected team and team details when switching tabs
    setSelectedTeam(null);
    setTeamDetails(null);
  }, [activeTab]);

  const handleCreateTeam = async () => {
    const token = getAccessToken();
    const role = getUserRole(token);

    if (role !== "admin") {
      setAccessError("Admin access required to create a team.");
      return;
    }

    if (!teamName || !teamOwner || !teamLogo) {
      alert("Please fill all fields: team name, team owner, and team logo");
      return;
    }

    setIsLoading(true);
    setTeamCreationError("");
    setAccessError(""); // Clear any previous access error
    try {
      const response = await apiWrapper("post", "/auction/team/", {
        team_name: teamName,
        team_owner: teamOwner,
        team_logo: teamLogo,
      });
      setSuccessMessage(`Team ${teamName} created successfully!`);
      setTeamName("");
      setTeamOwner("");
      setTeamLogo("");
      console.log("Team creation response:", response);
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      if (err.response?.status === 400 && err.response?.data?.detail === "Team already exists") {
        setTeamCreationError("A team with this name already exists!");
      } else {
        setTeamCreationError("Failed to create team. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlayer = async () => {
    const token = getAccessToken();
    const role = getUserRole(token);

    if (role !== "admin") {
      setAccessError("Admin access required to add a player to a team.");
      return;
    }

    if (!selectedTeam || !playerName || !employeeId || !pointsSpent) {
      alert("Please fill all fields: team, player name, employee ID, and points spent");
      return;
    }

    setIsLoading(true);
    setAccessError("");
    try {
      await apiWrapper("post", `/auction/team/${selectedTeam.value}/player/`, {
        player_name: playerName,
        employee_id: employeeId,
        points_spent: parseInt(pointsSpent),
      });
      setSuccessMessage(`Player ${playerName} sold to ${selectedTeam.label} with ${pointsSpent} points!`);
      setPlayerName("");
      setEmployeeId("");
      setPointsSpent("");
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      setSearchError(err.response?.data?.detail || "Failed to add player. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetTeamDetails = async () => {
    console.log(`Fetching details for team: ${selectedTeam?.value}`);

    if (!selectedTeam) {
      alert("Please select a team");
      setTeamDetails(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiWrapper("get", `/auction/team_details/${selectedTeam.value}`);
      setTeamDetails(response.data);
      console.log("Fetched team details:", response.data);
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      setTeamDetails(null);
      setSearchError("Failed to fetch team details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      setSearchError("Please enter a Player Name or Employee ID");
      return;
    }

    setSearchLoading(true);
    setSearchError("");
    setSearchResult(null);

    try {
      let response;
      if (/^\d+$/.test(searchTerm)) {
        response = await apiWrapper("get", `/auction/playerdetails/${searchTerm}`);
        if (!response.data) {
          throw new Error("Player not found");
        }
        setSearchResult(response.data);
      } else {
        response = await apiWrapper("get", `/auction/player/${searchTerm}`);
        if (Array.isArray(response.data) && response.data.length === 0) {
          throw new Error("Player not found");
        }
        setSearchResult(response.data);
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchError(err.response?.data?.detail || err.message || "Player not found");
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResult(null);
    setSearchError("");
  };

  return (
    <div className={`auction-container ${isDarkMode ? "dark-mode" : ""}`}>
      <div className={`auction-content ${isDarkMode ? "dark-mode" : ""}`}>
        <div className="header-container">
          <button className="back-button-auction" onClick={onBackToDashboard}>
            <FaHome /> Back to Dashboard
          </button>
          <h1 className="auction-heading">Auction Management</h1>
        </div>

        {accessError && (
          <div className="error-message">
            <div className="error-box">
              <p>{accessError}</p>
              <FaTimes
                className="close-icon"
                onClick={clearAccessError}
              />
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <div className="success-box">
              <p>{successMessage}</p>
              <FaTimes
                className="close-icon"
                onClick={() => setSuccessMessage("")}
              />
            </div>
          </div>
        )}

        {/* Global Search Bar */}
        <div className="search-bar">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search by Player Name or Employee ID"
              className="search-input"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value === "") {
                  setSearchResult(null);
                  setSearchError("");
                }
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {searchTerm && (
              <FaTimes className="clear-icon" onClick={clearSearch} />
            )}
            <FaSearch className="search-icon" onClick={handleSearch} />
          </div>
        </div>

        {searchLoading && <p>Loading...</p>}
        {searchError && (
          <div className="error-message">
            <p>{searchError}</p>
          </div>
        )}
        {searchResult && (
          <div className={`search-result-box ${searchResult.length === 1 ? "single-card" : ""}`}>
            <h2 className="search-result-heading">Search Results</h2>
            <div className="card-container">
              {Array.isArray(searchResult) ? (
                searchResult.map((result, index) => (
                  <div key={index} className="card">
                    <h3>{result.player_name}</h3>
                    <p>Team: {result.team_name}</p>
                    <p>Employee ID: {result.employee_id}</p>
                    <p>Points Spent: {result.points_spent}</p>
                  </div>
                ))
              ) : (
                <div className="card">
                  <h3>{searchResult.player_name}</h3>
                  <p>Team: {searchResult.team_name}</p>
                  <p>Employee ID: {searchResult.employee_id}</p>
                  <p>Points Spent: {searchResult.points_spent}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === "createTeam" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("createTeam");
              setTeamCreationError("");
            }}
          >
            Create Team
          </button>
          <button
            className={`tab-button ${activeTab === "addPlayer" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("addPlayer");
            }}
          >
            Add Player
          </button>
          <button
      className={`tab-button ${activeTab === "teamDetails" ? "active" : ""}`}
      onClick={() => {
        setActiveTab("teamDetails");
      }}
    >
            Team Details
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "createTeam" ? (
            <div className="create-team">
              <h2>Create a New Team</h2>
              <input
                type="text"
                placeholder="Team Name"
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  setTeamCreationError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
              />
              <input
                type="text"
                placeholder="Team Owner"
                value={teamOwner}
                onChange={(e) => setTeamOwner(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
              />
              <input
                type="text"
                placeholder="Team Logo URL"
                value={teamLogo}
                onChange={(e) => setTeamLogo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
              />
              {teamCreationError && (
                <div className="error-message">
                  <div className="error-box">
                    <p>{teamCreationError}</p>
                    <FaTimes
                      className="close-icon"
                      onClick={clearTeamCreationError}
                    />
                  </div>
                </div>
              )}
              <button onClick={handleCreateTeam} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Team"}
              </button>
            </div>
          ) : activeTab === "addPlayer" ? (
            <div className="add-player">
              <h2>Add Player to Team</h2>

              <div className="input-with-clear">
                <Select
                  options={teams.map((team) => ({ value: team, label: team }))}
                  value={selectedTeam}
                  onChange={(selectedOption) => setSelectedTeam(selectedOption)}
                  placeholder="Select or Type Team Name"
                  isClearable={true}
                />
              </div>

              <input
                type="text"
                placeholder="Player Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
              />
              <input
                type="text"
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
              />
              <input
                type="number"
                placeholder="Points Spent"
                value={pointsSpent}
                onChange={(e) => setPointsSpent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
              />
              <button onClick={handleAddPlayer} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Player"}
              </button>
            </div>
          ) : (
            <div className="team-details">
              <h2>Team Details</h2>

              <div className="input-with-clear">
                <Select
                  options={teams.map((team) => ({ value: team, label: team }))}
                  value={selectedTeam}
                  onChange={(selectedOption) => setSelectedTeam(selectedOption)}
                  placeholder="Select or Type Team Name"
                  isClearable={true}
                />
              </div>
              <button onClick={handleGetTeamDetails} disabled={isLoading}>
                {isLoading ? "Fetching..." : "Get Team Details"}
              </button>

              {teamDetails && selectedTeam && (
                <div className="team-info">
                  {teamDetails.team_logo && (
                    <div className="team-logo-container">
                      <img
                        src={teamDetails.team_logo}
                        alt={`${teamDetails.team_name} Logo`}
                        className="team-logo"
                      />
                    </div>
                  )}
                  <h3>{teamDetails.team_name}</h3>
                  <p><strong>Owner:</strong> {teamDetails.team_owner}</p>
                  <p><strong>Remaining Budget:</strong> {teamDetails.remaining_budget}</p>
                  <p><strong>Used Budget:</strong> {teamDetails.used_budget}</p>
                  <p><strong>Player Count:</strong> {teamDetails.players.length}</p>
                  {teamDetails.players.length > 0 && (
                    <p>
                      <strong>Highest Points Spent:</strong>{" "}
                      {teamDetails.players.reduce((maxPlayer, player) =>
                        player.points_spent > maxPlayer.points_spent ? player : maxPlayer
                      ).player_name}{" "}
                      (Points:{" "}
                      {teamDetails.players.reduce((maxPlayer, player) =>
                        player.points_spent > maxPlayer.points_spent ? player : maxPlayer
                      ).points_spent})
                    </p>
                  )}
                  <h4>Players:</h4>
                  <ul className="player-list">
                    {teamDetails.players.map((player, idx) => (
                      <li key={idx} className="player-item">
                        <strong>{player.player_name}</strong> (ID: {player.employee_id}) - Points: {player.points_spent}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auction;