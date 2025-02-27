import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./ResetPassword.css"; // ✅ Import CSS file

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Extract token from URL
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ If no token in URL, show an error immediately
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // ✅ Check if passwords match before making the request
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Reset token is missing or invalid.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:9123/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("✅ Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.detail || "❌ Password reset failed. Try again.");
      }
    } catch (error) {
      setError("⚠️ An error occurred. Please check your connection and try again.");
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-box">
        <h2>🔑 Reset Your Password</h2>
        {error && <p className="error">{error}</p>}
        {successMessage && <p className="success">{successMessage}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={!token}>Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
