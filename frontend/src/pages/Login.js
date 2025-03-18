import { Eye, EyeOff } from "lucide-react"; // Import eye icons
import { useState, useContext, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import "./Login.css";
import lightLogo from "../assets/company-logo-light.png";
import darkLogo from "../assets/company-logo-dark.png";

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState(""); // Allow username or email
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [otp, setOtp] = useState(""); // New state for OTP
  const [isOtpSent, setIsOtpSent] = useState(false); // Track if OTP is sent
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);

  // Load saved username or email from localStorage
  useEffect(() => {
    const savedUsernameOrEmail = localStorage.getItem("rememberedUsernameOrEmail");
    if (savedUsernameOrEmail) {
      setUsernameOrEmail(savedUsernameOrEmail);
      setRememberMe(true);
    }
  }, []);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!usernameOrEmail) newErrors.usernameOrEmail = "Username or Email is required";
    if (!password && !isOtpSent) newErrors.password = "Password is required";
    if (isOtpSent && !otp) newErrors.otp = "OTP is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("https://farm-app-t7hi.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameOrEmail,
          password: isOtpSent ? undefined : password,
          otp: isOtpSent ? otp : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message === "OTP sent successfully") {
          setIsOtpSent(true); // Set OTP sent state
          setPassword(""); // Clear password field
          setIsLoading(false);
          return; // Exit early to wait for OTP
        }

        login(data);

        // Save username/email if "Remember Me" is checked
        if (rememberMe) {
          localStorage.setItem("rememberedUsernameOrEmail", usernameOrEmail);
        } else {
          localStorage.removeItem("rememberedUsernameOrEmail");
        }

        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Login failed! Please check your username/email and password.");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP resend
  const handleResendOtp = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("https://farm-app-t7hi.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameOrEmail,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message === "OTP sent successfully") {
          alert("OTP resent successfully");
        }
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      alert("An error occurred while resending OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="login-container"
      style={{
        backgroundImage: isDarkMode
          ? `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/assets/dashboard4-bg.jpg')`
          : `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url('/assets/dashboard4-bg.jpg')`,
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Animated Border Container */}
        <div className="animated-border">
          <div className="bar top"></div>
          <div className="bar right"></div>
          <div className="bar bottom"></div>
          <div className="bar left"></div>
        </div>

        {/* Centered Logo */}
        <div className="login-logo">
          <img
            src={isDarkMode ? darkLogo : lightLogo}
            alt="Company Logo"
            className="company-logo"
          />
        </div>

        <h2>Login Page</h2>

        {/* Username or Email Field */}
        <div className="input-group">
          <input
            type="text"
            placeholder="Username or Email"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            autoComplete="username"
            required
          />
          {errors.usernameOrEmail && <span className="error">{errors.usernameOrEmail}</span>}
        </div>

        {/* Password Field */}
        {!isOtpSent && (
          <div className="input-group password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required={!isOtpSent}
            />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff /> : <Eye />}
            </span>
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
        )}

        {/* OTP Field */}
        {isOtpSent && (
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            {errors.otp && <span className="error">{errors.otp}</span>}
          </div>
        )}

        {/* Remember Me & Forgot Password */}
        <div className="remember-container">
          <div className="remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>
          <a href="/forgot-password" className="forgot-password">Forgot Password?</a>
        </div>

        {/* Login Button */}
        <button type="submit" disabled={isLoading || (isOtpSent && !otp)}>
          {isLoading ? "Logging in..." : "Log in to your account"}
        </button>

        {/* Resend OTP Button */}
        {isOtpSent && (
          <button type="button" onClick={handleResendOtp} disabled={isLoading}>
            {isLoading ? "Resending OTP..." : "Resend OTP"}
          </button>
        )}

        {/* Footer */}
        <div className="login-footer">
          <a href="/signup">Don't have an account?</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
