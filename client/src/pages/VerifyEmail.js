import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Mail, RefreshCw } from "lucide-react";

const VerifyEmail = () => {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const { verifyEmail, resendOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Get email and token from location state or URL params
    if (location.state?.email) {
      setEmail(location.state.email);
      setToken(location.state.token || "");
    }
  }, [location]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);

    // Auto-submit when 6 digits are entered
    if (value.length === 6) {
      handleSubmit();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) return;

    setSubmitting(true);
    setError("");

    try {
      const result = await verifyEmail(email, token, otp);
      if (result.success) {
        navigate("/");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Email verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError("");

    try {
      const result = await resendOtp(email);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-10 w-full max-w-md animate-fade-in">
        <h2 className="text-3xl font-bold text-center mb-8 text-gradient">
          Verify Your Email
        </h2>

        {error && <div className="alert alert-danger mb-6">{error}</div>}

        <div className="bg-primary-50 border-l-4 border-primary-500 rounded-xl p-6 mb-6">
          <p className="text-center mb-4">
            We've sent a verification code to{" "}
            <strong className="text-primary-600">{email}</strong>
          </p>
          <p className="text-center text-gray-600 mb-4">
            Please check your email and enter the 6-digit code below
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-center mb-2">
              <strong>🔧 Development Mode:</strong> Check your server console
              for the OTP code
            </p>
            <p className="text-center text-sm text-gray-600">
              The verification code is logged to the terminal/console where you
              started the server
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp" className="form-label">
              Verification Code
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={handleOtpChange}
                className="form-input pl-12 text-center text-2xl font-mono tracking-widest"
                placeholder="Enter 6-digit code"
                maxLength="6"
                pattern="[0-9]{6}"
                required
                autoComplete="off"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || otp.length !== 6}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </button>
        </form>

        <div className="text-center mt-6 space-y-4">
          <p className="mb-2">Didn't receive the code?</p>
          <button
            onClick={handleResendOtp}
            disabled={resending}
            className="text-primary-600 hover:text-primary-700 font-semibold transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            {resending ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Resending...
              </>
            ) : (
              "Resend Code"
            )}
          </button>
          <p className="mt-4">
            <Link
              to="/auth/signin"
              className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
