import { useState } from "react";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setResetLink("");

    try {
      const response = await fetch("http://127.0.0.1:9123/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Password reset link sent to your email: ${email}`);

        // ✅ Use reset_link from API response
        if (data.reset_link) {
          setResetLink(data.reset_link);
        } else {
          setError("Token not received. Please check your email.");
        }
      } else {
        setError(data.detail || "Failed to send reset link.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <p>Enter your email to receive a password reset link.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      {/* ✅ Show Success/Error Messages */}
      {message && <p className="success">{message}</p>}
      {resetLink && <p className="or-text">OR</p>}
      {resetLink && (
        <p className="success">
          Click here to reset your password:{" "}
          <a href={resetLink} target="_blank" rel="noopener noreferrer">
            Reset Password
          </a>
        </p>
      )}
      {error && <p className="error">{error}</p>}

      {/* ✅ Home Button */}
      <Link to="/login" className="home-button">
        <FaHome /> Home
      </Link>
    </div>
  );
};

export default ForgotPassword;
