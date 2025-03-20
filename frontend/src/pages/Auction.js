import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import "./Auction.css";
import { FaHome, FaSearch, FaTimes } from "react-icons/fa";
import Select from "react-select";
import apiWrapper from "../api/apiWrapper";

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

  const [successMessage, setSuccessMessage] = useState(""); // State for success message

  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

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
  }, [navigate]);

  const onBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleCreateTeam = async () => {
    if (!teamName || !teamOwner || !teamLogo) {
      alert("Please fill all fields: team name, team owner, and team logo");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiWrapper("post", "/auction/team/", {
        team_name: teamName,
        team_owner: teamOwner,
        team_logo: teamLogo,
      });
      setSuccessMessage(`Team ${teamName} created successfully!`); // Set success message
      setTeamName("");
      setTeamOwner("");
      setTeamLogo("");
      console.log("Team creation response:", response);
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlayer = async () => {
    if (!selectedTeam || !playerName || !employeeId || !pointsSpent) {
      alert("Please fill all fields: team, player name, employee ID, and points spent");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiWrapper("post", `/auction/team/${selectedTeam.value}/player/`, {
        player_name: playerName,
        employee_id: employeeId,
        points_spent: parseInt(pointsSpent),
      });
      setSuccessMessage(`Player ${playerName} sold to ${selectedTeam.label} with ${pointsSpent} points!`); // Set success message
      setPlayerName("");
      setEmployeeId("");
      setPointsSpent("");
      console.log("Player addition response:", response);
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
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
      } else {
        response = await apiWrapper("get", `/auction/player/${searchTerm}`);
      }
      setSearchResult(response.data);
    } catch (err) {
      setSearchError("No results found or an error occurred");
    }

    setSearchLoading(false);
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

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <div className="success-box">
              <p>{successMessage}</p>
              <FaTimes
                className="close-icon"
                onClick={() => setSuccessMessage("")} // Clear success message on close
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

        {/* Search Results */}
        {searchLoading && <p>Loading...</p>}
        {searchError && <p className="text-red-500">{searchError}</p>}
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
            onClick={() => setActiveTab("createTeam")}
          >
            Create Team
          </button>
          <button
            className={`tab-button ${activeTab === "addPlayer" ? "active" : ""}`}
            onClick={() => setActiveTab("addPlayer")}
          >
            Add Player
          </button>
          <button
            className={`tab-button ${activeTab === "teamDetails" ? "active" : ""}`}
            onClick={() => setActiveTab("teamDetails")}
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
                onChange={(e) => setTeamName(e.target.value)}
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