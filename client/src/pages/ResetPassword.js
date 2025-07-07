import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Lock, Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  // Debug: Log to ensure component is mounting
  console.log("ResetPassword component rendered with token:", token);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    if (formData.password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    try {
      const result = await resetPassword(
        token,
        formData.password,
        formData.confirmPassword
      );
      if (result.success) {
        navigate("/auth/signin");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Password reset failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: "16px",
      backgroundColor: "#f3f4f6"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "32px",
          color: "#1f2937"
        }}>
          Reset Password
        </h2>
        
        {error && (
          <div style={{
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
            border: "1px solid #fecaca"
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="password" style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#374151"
            }}>
              New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 40px",
                  border: "2px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none"
                }}
                placeholder="Enter new password (min 6 characters)"
                minLength="6"
                required
              />
              <Lock
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af"
                }}
                size={20}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer"
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: "24px" }}>
            <label htmlFor="confirmPassword" style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#374151"
            }}>
              Confirm New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 40px",
                  border: "2px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none"
                }}
                placeholder="Confirm your new password"
                minLength="6"
                required
              />
              <Lock
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af"
                }}
                size={20}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer"
                }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              backgroundColor: submitting ? "#9ca3af" : "#3b82f6",
              color: "white",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              fontSize: "16px",
              fontWeight: "600",
              cursor: submitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            {submitting ? (
              <>
                <div style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid transparent",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
        
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <p style={{ marginBottom: "8px" }}>
            <Link
              to="/auth/signin"
              style={{
                color: "#3b82f6",
                textDecoration: "none",
                fontWeight: "600"
              }}
            >
              Back to Sign In
            </Link>
          </p>
          <p>
            <Link
              to="/auth/forgot-password"
              style={{
                color: "#3b82f6",
                textDecoration: "none",
                fontWeight: "600"
              }}
            >
              Request New Reset Link
            </Link>
          </p>
        </div>
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ResetPassword;
