import React, { useEffect } from "react";
import "./Notification.css";

const Notification = ({ message, type, onClear }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClear();
    }, 5000); // Notification will disappear after 5 seconds

    return () => clearTimeout(timer);
  }, [onClear]);

  return (
    <div 
      className={`notification ${type}`}
      style={message.includes("OTP") ? {color: "white"} : {}}
    >
      <div className="notification-content">
        <span>{message}</span>
      </div>
      <button className="clear-notification" onClick={onClear}>
        &times;
      </button>
    </div>
  );
};

export default Notification;
