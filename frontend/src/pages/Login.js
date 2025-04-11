// import { Eye, EyeOff, Lock, Key } from "lucide-react"; // Import eye and lock icons
// import { useState, useContext, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import { ThemeContext } from "../context/ThemeContext";
// import "./Login.css";
// import lightLogo from "../assets/company-logo-light.png";
// import darkLogo from "../assets/company-logo-dark.png";

// const Login = () => {
//   const [usernameOrEmail, setUsernameOrEmail] = useState(""); // Allow username or email
//   const [password, setPassword] = useState("");
//   const [otp, setOtp] = useState(""); // New state for OTP
//   const [isOtpSent, setIsOtpSent] = useState(false); // Track if OTP is sent
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [authMethod, setAuthMethod] = useState(null); // No default method initially
//   const [errors, setErrors] = useState({});
//   const [rememberMe, setRememberMe] = useState(false); // Initialize rememberMe state
//   const [showAuthOptions, setShowAuthOptions] = useState(false); // New state to control visibility
//   const [successMessage, setSuccessMessage] = useState(""); // New state for success message

//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const { isDarkMode } = useContext(ThemeContext);

//   // Load saved username or email from localStorage
//   useEffect(() => {
//     const savedUsernameOrEmail = localStorage.getItem("rememberedUsernameOrEmail");
//     if (savedUsernameOrEmail) {
//       setUsernameOrEmail(savedUsernameOrEmail);
//       setRememberMe(true);
//     }
//   }, []);

//   // Clear success message after 3 seconds
//   useEffect(() => {
//     if (successMessage) {
//       const timer = setTimeout(() => {
//         setSuccessMessage("");
//       }, 3000); // Clear message after 3 seconds
//       return () => clearTimeout(timer);
//     }
//   }, [successMessage]);

//   // Form validation
//   const validateForm = () => {
//     const newErrors = {};
//     if (!usernameOrEmail) newErrors.usernameOrEmail = "Username or Email is required";
//     if (authMethod === "password" && !password) newErrors.password = "Password is required";
//     if (authMethod === "otp" && !otp && isOtpSent) newErrors.otp = "OTP is required";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Handle OTP sending
//   const handleSendOtp = async () => {
//     if (!usernameOrEmail) {
//       setErrors({ usernameOrEmail: "Username or Email is required" });
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const response = await fetch("http://localhost:9123/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: usernameOrEmail,
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.message === "OTP sent successfully") {
//           setIsOtpSent(true); // Enable OTP input field
//           setSuccessMessage("✅ OTP sent successfully!"); // Set success message
//         }
//       } else {
//         const errorData = await response.json();
//         setErrors({ server: errorData.detail || "Failed to send OTP. Please try again." });
//       }
//     } catch (error) {
//       setErrors({ server: "An error occurred. Please try again." });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setIsLoading(true);

//     try {
//       const response = await fetch("http://localhost:9123/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: usernameOrEmail,
//           password: authMethod === "password" ? password : undefined,
//           otp: authMethod === "otp" ? otp : undefined,
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.message === "OTP sent successfully") {
//           setIsOtpSent(true); // Set OTP sent state
//           setPassword(""); // Clear password field
//           setIsLoading(false);
//           return; // Exit early to wait for OTP
//         }

//         login(data);

//         // Save username/email if "Remember Me" is checked
//         if (rememberMe) {
//           localStorage.setItem("rememberedUsernameOrEmail", usernameOrEmail);
//         } else {
//           localStorage.removeItem("rememberedUsernameOrEmail");
//         }

//         setSuccessMessage("✅ Login successful! Redirecting to dashboard..."); // Set success message
//         setTimeout(() => navigate("/dashboard"), 3000); // Redirect after 3 seconds
//       } else {
//         const errorData = await response.json();
//         setErrors({ server: errorData.detail || "Login failed! Please check your username/email and password." });
//       }
//     } catch (error) {
//       setErrors({ server: "An error occurred. Please try again." });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle OTP resend
//   const handleResendOtp = async () => {
//     setIsLoading(true);

//     try {
//       const response = await fetch("http://localhost:9123/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: usernameOrEmail,
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.message === "OTP sent successfully") {
//           setSuccessMessage("✅ OTP resent successfully!"); // Set success message
//           setIsOtpSent(true); // Ensure OTP sent state is set
//         }
//       } else {
//         const errorData = await response.json();
//         setErrors({ server: errorData.detail || "Failed to resend OTP. Please try again." });
//       }
//     } catch (error) {
//       setErrors({ server: "An error occurred while resending OTP. Please try again." });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div
//       className="login-container"
//       style={{
//         backgroundImage: isDarkMode
//           ? `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/assets/dashboard4-bg.jpg')`
//           : `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url('/assets/dashboard4-bg.jpg')`,
//       }}
//     >
//       <form onSubmit={handleSubmit}>
//         {/* Animated Border Container */}
//         <div className="animated-border">
//           <div className="bar top"></div>
//           <div className="bar right"></div>
//           <div className="bar bottom"></div>
//           <div className="bar left"></div>
//         </div>

//         {/* Centered Logo */}
//         <div className="login-logo">
//           <img
//             src={isDarkMode ? darkLogo : lightLogo}
//             alt="Company Logo"
//             className="company-logo"
//           />
//         </div>

//         <h2>Login Page</h2>

//         {/* Success Message */}
//         {successMessage && (
//           <div className="success-message">
//             {successMessage}
//           </div>
//         )}

//         {/* Username or Email Field */}
//         <div className="input-group">
//           <input
//             type="text"
//             placeholder="Username or Email"
//             value={usernameOrEmail}
//             onChange={(e) => setUsernameOrEmail(e.target.value)}
//             autoComplete="username"
//             required
//           />
//           {errors.usernameOrEmail && <span className="error">{errors.usernameOrEmail}</span>}
//         </div>

//         {/* Password or OTP Field (Conditional Rendering) */}
//         {authMethod && (
//           <div className="input-group">
//             {authMethod === "password" ? (
//               <div className="password-input-container">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   autoComplete="current-password"
//                   required
//                 />
//                 <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
//                   {showPassword ? <EyeOff /> : <Eye />}
//                 </span>
//                 {errors.password && <span className="error">{errors.password}</span>}
//               </div>
//             ) : (
//               <>
//                 {!isOtpSent && (
//                   <button
//                     type="button"
//                     onClick={handleSendOtp}
//                     disabled={isLoading || !usernameOrEmail}
//                   >
//                     {isLoading ? "Sending OTP..." : "Send OTP"}
//                   </button>
//                 )}
//                 {isOtpSent && (
//                   <input
//                     type="text"
//                     placeholder="Enter OTP"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value)}
//                     required
//                   />
//                 )}
//               </>
//             )}
//           </div>
//         )}

//         {/* Sign-in Option Text */}
//         <div className="sign-in-option" onClick={() => setShowAuthOptions(!showAuthOptions)}>
//           Sign-in Option
//         </div>

//         {/* Auth Method Selection (Conditional Rendering) */}
//         {showAuthOptions && (
//           <div className="auth-method-selection">
//             <span
//               className={`auth-method ${authMethod === "password" ? "selected" : ""}`}
//               onClick={() => setAuthMethod("password")}
//             >
//               <Key className="auth-icon" /> Password
//             </span>
//             <span
//               className={`auth-method ${authMethod === "otp" ? "selected" : ""}`}
//               onClick={() => setAuthMethod("otp")}
//             >
//               <Lock className="auth-icon" /> OTP
//             </span>
//           </div>
//         )}

//         {/* Remember Me & Forgot Password (Conditional Rendering) */}
//         {authMethod === "password" && (
//           <div className="remember-container">
//             <div className="remember-me">
//               <input
//                 type="checkbox"
//                 id="rememberMe"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//               />
//               <label htmlFor="rememberMe">Remember me</label>
//             </div>
//             <a href="/forgot-password" className="forgot-password" style={{ marginTop: "-20px" }}>Forgot Password?</a>
//           </div>
//         )}

//         {/* Login Button */}
//         <button
//           type="submit"
//           disabled={isLoading || (authMethod === "otp" && !otp)}
//           style={{
//             marginTop: authMethod === "otp" ? "-10px" : "10px", // Adjust margin dynamically
//           }}
//           className="login-button" // Apply default button styles
//         >
//           {isLoading ? "Logging in..." : "Log in to your account"}
//         </button>

//         {/* Resend OTP Button */}
//         {authMethod === "otp" && isOtpSent && (
//           <button type="button" onClick={handleResendOtp} disabled={isLoading}>
//             {isLoading ? "Resending OTP..." : "Resend OTP"}
//           </button>
//         )}

//         {/* Footer */}
//         <div className="login-footer">
//           <a href="/signup">Don't have an account?</a>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default Login;



// import React, { useState, useContext, useEffect } from "react";
// import { Eye, EyeOff, Lock, Key } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import { ThemeContext } from "../context/ThemeContext";
// import "./Login.css";
// import lightLogo from "../assets/company-logo-light.png";
// import darkLogo from "../assets/company-logo-dark.png";
// import Notification from "../components/Notification"; // Import the Notification component

// const Login = () => {
//   const [usernameOrEmail, setUsernameOrEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [otp, setOtp] = useState("");
//   const [isOtpSent, setIsOtpSent] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [authMethod, setAuthMethod] = useState(null);
//   const [errors, setErrors] = useState({});
//   const [rememberMe, setRememberMe] = useState(false);
//   const [showAuthOptions, setShowAuthOptions] = useState(false);
//   const [notification, setNotification] = useState(null);

//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const { isDarkMode } = useContext(ThemeContext);

//   useEffect(() => {
//     const savedUsernameOrEmail = localStorage.getItem("rememberedUsernameOrEmail");
//     if (savedUsernameOrEmail) {
//       setUsernameOrEmail(savedUsernameOrEmail);
//       setRememberMe(true);
//     }
//   }, []);

//   const validateForm = () => {
//     const newErrors = {};
//     if (!usernameOrEmail) newErrors.usernameOrEmail = "Username or Email is required";
//     if (authMethod === "password" && !password) newErrors.password = "Password is required";
//     if (authMethod === "otp" && !otp && isOtpSent) newErrors.otp = "OTP is required";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSendOtp = async () => {
//     if (!usernameOrEmail) {
//       setErrors({ usernameOrEmail: "Username or Email is required" });
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const response = await fetch("http://localhost:9123/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username: usernameOrEmail }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.message === "OTP sent successfully") {
//           setIsOtpSent(true);
//           setNotification({ message: "OTP sent successfully", type: "success" });
//         }
//       } else {
//         const errorData = await response.json();
//         setErrors({ server: errorData.detail || "Failed to send OTP. Please try again." });
//       }
//     } catch (error) {
//       setErrors({ server: "An error occurred. Please try again." });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setIsLoading(true);

//     try {
//       const response = await fetch("http://localhost:9123/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           username: usernameOrEmail,
//           password: authMethod === "password" ? password : undefined,
//           otp: authMethod === "otp" ? otp : undefined,
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.message === "OTP sent successfully") {
//           setIsOtpSent(true);
//           setPassword("");
//           setIsLoading(false);
//           return;
//         }

//         login(data);

//         if (rememberMe) {
//           localStorage.setItem("rememberedUsernameOrEmail", usernameOrEmail);
//         } else {
//           localStorage.removeItem("rememberedUsernameOrEmail");
//         }

//         setNotification({ message: `Logged in successfully as ${usernameOrEmail}`, type: "success" });
//         setTimeout(() => navigate("/dashboard"), 3000);
//       } else {
//         const errorData = await response.json();
//         setErrors({ server: errorData.detail || "Failed to login. Please try again." });
//         setNotification({ message: "Login failed! Please check your username/email and password.", type: "error" });
//       }
//     } catch (error) {
//       setNotification({ message: "An error occurred. Please try again.", type: "error" });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleResendOtp = async () => {
//     setIsLoading(true);

//     try {
//       const response = await fetch("http://localhost:9123/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username: usernameOrEmail }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         if (data.message === "OTP sent successfully") {
//           setNotification({ message: "OTP resent successfully", type: "success" });
//           setIsOtpSent(true);
//         }
//       } else {
//         const errorData = await response.json();
//         setErrors({ server: errorData.detail || "Failed to resend OTP. Please try again." });
//       }
//     } catch (error) {
//       setErrors({ server: "An error occurred while resending OTP. Please try again." });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const clearNotification = () => {
//     setNotification(null);
//   };

//   return (
//     <div
//       className="login-container"
//       style={{
//         backgroundImage: isDarkMode
//           ? `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/assets/dashboard4-bg.jpg')`
//           : `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url('/assets/dashboard4-bg.jpg')`,
//       }}
//     >
//       {notification && (
//         <Notification
//           message={notification.message}
//           type={notification.type}
//           onClear={clearNotification}
//         />
//       )}
//       <form onSubmit={handleSubmit}>
//         <div className="animated-border">
//           <div className="bar top"></div>
//           <div className="bar right"></div>
//           <div className="bar bottom"></div>
//           <div className="bar left"></div>
//         </div>

//         <div className="login-logo">
//           <img
//             src={isDarkMode ? darkLogo : lightLogo}
//             alt="Company Logo"
//             className="company-logo"
//           />
//         </div>

//         <h2>Login Page</h2>

//         <div className="input-group">
//           <input
//             type="text"
//             placeholder="Username or Email"
//             value={usernameOrEmail}
//             onChange={(e) => setUsernameOrEmail(e.target.value)}
//             autoComplete="username"
//             required
//           />
//           {errors.usernameOrEmail && <span className="error">{errors.usernameOrEmail}</span>}
//         </div>

//         {authMethod && (
//           <div className="input-group">
//             {authMethod === "password" ? (
//               <div className="password-input-container">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   autoComplete="current-password"
//                   required
//                 />
//                 <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
//                   {showPassword ? <EyeOff /> : <Eye />}
//                 </span>
//                 {errors.password && <span className="error">{errors.password}</span>}
//               </div>
//             ) : (
//               <>
//                 {!isOtpSent && (
//                   <button
//                     type="button"
//                     onClick={handleSendOtp}
//                     disabled={isLoading || !usernameOrEmail}
//                   >
//                     {isLoading ? "Sending OTP..." : "Send OTP"}
//                   </button>
//                 )}
//                 {isOtpSent && (
//                   <input
//                     type="text"
//                     placeholder="Enter OTP"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value)}
//                     required
//                   />
//                 )}
//               </>
//             )}
//           </div>
//         )}

//         <div className="sign-in-option" onClick={() => setShowAuthOptions(!showAuthOptions)}>
//           Sign-in Option
//         </div>

//         {showAuthOptions && (
//           <div className="auth-method-selection">
//             <span
//               className={`auth-method ${authMethod === "password" ? "selected" : ""}`}
//               onClick={() => setAuthMethod("password")}
//             >
//               <Key className="auth-icon" /> Password
//             </span>
//             <span
//               className={`auth-method ${authMethod === "otp" ? "selected" : ""}`}
//               onClick={() => setAuthMethod("otp")}
//             >
//               <Lock className="auth-icon" /> OTP
//             </span>
//           </div>
//         )}

//         {authMethod === "password" && (
//           <div className="remember-container">
//             <div className="remember-me">
//               <input
//                 type="checkbox"
//                 id="rememberMe"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//               />
//               <label htmlFor="rememberMe">Remember me</label>
//             </div>
//             <a href="/forgot-password" className="forgot-password" style={{ marginTop: "-20px" }}>Forgot Password?</a>
//           </div>
//         )}

//         <button
//           type="submit"
//           disabled={isLoading || (authMethod === "otp" && !otp)}
//           style={{
//             marginTop: authMethod === "otp" ? "-10px" : "10px",
//           }}
//           className="login-button"
//         >
//           {isLoading ? "Logging in..." : "Log in to your account"}
//         </button>

//         {authMethod === "otp" && isOtpSent && (
//           <button type="button" onClick={handleResendOtp} disabled={isLoading}>
//             {isLoading ? "Resending OTP..." : "Resend OTP"}
//           </button>
//         )}

//         <div className="login-footer">
//           <a href="/signup">Don't have an account?</a>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default Login;




import React, { useState, useContext, useEffect } from "react";
import { Eye, EyeOff, Lock, Key } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import "./Login.css";
import lightLogo from "../assets/company-logo-light.png";
import darkLogo from "../assets/company-logo-dark.png";
import Notification from "../components/Notification";

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState(null);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const [notification, setNotification] = useState(null);
  const [otpSentMessage, setOtpSentMessage] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const savedUsernameOrEmail = localStorage.getItem("rememberedUsernameOrEmail");
    if (savedUsernameOrEmail) {
      setUsernameOrEmail(savedUsernameOrEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (otpSentMessage) {
      const timer = setTimeout(() => {
        setOtpSentMessage(null);
      }, 6000); // Clear message after 6 seconds
      return () => clearTimeout(timer);
    }
  }, [otpSentMessage]);

  const validateForm = () => {
    const newErrors = {};
    if (!usernameOrEmail) newErrors.usernameOrEmail = "Username or Email is required";
    if (authMethod === "password" && !password) newErrors.password = "Password is required";
    if (authMethod === "otp" && !otp && isOtpSent) newErrors.otp = "OTP is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!usernameOrEmail) {
      setErrors({ usernameOrEmail: "Username or Email is required" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://farm-app-t7hi.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameOrEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message === "OTP sent successfully") {
          setIsOtpSent(true);
          setOtpSentMessage("OTP sent successfully");
          setNotification({ message: "OTP sent successfully", type: "success" });
        }
      } else {
        const errorData = await response.json();
        setErrors({ server: errorData.detail || "Failed to send OTP. Please try again." });
      }
    } catch (error) {
      setErrors({ server: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

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
          password: authMethod === "password" ? password : undefined,
          otp: authMethod === "otp" ? otp : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message === "OTP sent successfully") {
          setIsOtpSent(true);
          setPassword("");
          setIsLoading(false);
          return;
        }

        login({ ...data, username: usernameOrEmail });

        if (rememberMe) {
          localStorage.setItem("rememberedUsernameOrEmail", usernameOrEmail);
        } else {
          localStorage.removeItem("rememberedUsernameOrEmail");
        }

        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        setNotification({ message: errorData.detail || "Login failed! Please check your username/email and password.", type: "error" });
      }
    } catch (error) {
      setNotification({ message: "An error occurred. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("https://farm-app-t7hi.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameOrEmail }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message === "OTP sent successfully") {
          setNotification({ message: "OTP resent successfully", type: "success" });
          setIsOtpSent(true);
        }
      } else {
        const errorData = await response.json();
        setErrors({ server: errorData.detail || "Failed to resend OTP. Please try again." });
      }
    } catch (error) {
      setErrors({ server: "An error occurred while resending OTP. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const clearNotification = () => {
    setNotification(null);
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
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClear={clearNotification}
        />
      )}
      {otpSentMessage && <div className="success-message">{otpSentMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div className="animated-border">
          <div className="bar top"></div>
          <div className="bar right"></div>
          <div className="bar bottom"></div>
          <div className="bar left"></div>
        </div>

        <div className="login-logo">
          <img
            src={isDarkMode ? darkLogo : lightLogo}
            alt="Company Logo"
            className="company-logo"
          />
        </div>

        <h2>Login Page</h2>

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

        {authMethod && (
          <div className="input-group">
            {authMethod === "password" ? (
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </span>
                {errors.password && <span className="error">{errors.password}</span>}
              </div>
            ) : (
              <>
                {!isOtpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading || !usernameOrEmail}
                  >
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </button>
                )}
                {isOtpSent && (
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                )}
              </>
            )}
          </div>
        )}

        <div className="sign-in-option" onClick={() => setShowAuthOptions(!showAuthOptions)}>
          Sign-in Option
        </div>

        {showAuthOptions && (
          <div className="auth-method-selection">
            <span
              className={`auth-method ${authMethod === "password" ? "selected" : ""}`}
              onClick={() => setAuthMethod("password")}
            >
              <Key className="auth-icon" /> Password
            </span>
            <span
              className={`auth-method ${authMethod === "otp" ? "selected" : ""}`}
              onClick={() => setAuthMethod("otp")}
            >
              <Lock className="auth-icon" /> OTP
            </span>
          </div>
        )}

        {authMethod === "password" && (
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
            <a href="/forgot-password" className="forgot-password" style={{ marginTop: "-20px" }}>Forgot Password?</a>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (authMethod === "otp" && !otp)}
          style={{
            marginTop: authMethod === "otp" ? "-10px" : "10px",
          }}
          className="login-button"
        >
          {isLoading ? "Logging in..." : "Log in to your account"}
        </button>

        {authMethod === "otp" && isOtpSent && (
          <button type="button" onClick={handleResendOtp} disabled={isLoading}>
            {isLoading ? "Resending OTP..." : "Resend OTP"}
          </button>
        )}

        <div className="login-footer">
          <a href="/signup">Don't have an account?</a>
        </div>
      </form>
    </div>
  );
};

export default Login;