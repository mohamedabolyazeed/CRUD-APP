import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get("/api/auth/me", {
        withCredentials: true,
      });
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signin = async (email, password) => {
    try {
      const response = await axios.post(
        "/api/auth/signin",
        { email, password },
        { withCredentials: true }
      );
      setUser(response.data.user);
      toast.success("Successfully signed in!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Sign in failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await axios.post(
        "/api/auth/signup",
        { name, email, password },
        { withCredentials: true }
      );
      toast.success("Account created successfully! Please verify your email.");
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || "Sign up failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyEmail = async (email, token, otp) => {
    try {
      const response = await axios.post(
        "/api/auth/verify-email",
        { email, token, otp },
        { withCredentials: true }
      );
      setUser(response.data.user);
      toast.success("Email verified successfully!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.error || "Email verification failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resendOtp = async (email) => {
    try {
      await axios.post(
        "/api/auth/resend-otp",
        { email },
        { withCredentials: true }
      );
      toast.success("OTP resent successfully!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Failed to resend OTP";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post(
        "/api/auth/forgot-password",
        { email },
        { withCredentials: true }
      );
      toast.success("Password reset link sent to your email!");
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to send reset link";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, password, confirmPassword) => {
    try {
      await axios.post(
        "/api/auth/reset-password",
        { token, password, confirmPassword },
        { withCredentials: true }
      );
      toast.success("Password reset successfully!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Password reset failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await axios.get("/api/auth/logout", { withCredentials: true });
      setUser(null);
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    signin,
    signup,
    verifyEmail,
    resendOtp,
    forgotPassword,
    resetPassword,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
