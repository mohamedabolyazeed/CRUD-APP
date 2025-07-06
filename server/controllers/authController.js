const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "2R4pvUGbc7HbZdcpWKPV9XYqkUfUDq2zVtyM7Qa52vVPPVAqMtSRwpABjVwbegr7txgczLJDFYWyGwJCUA9ycm6PkCXyPhTyqTbqQqJTsYsQWZGxvzL7DTCjD9EA79CzFAJ7Rhy8xCHEdWLepUWBrwenpcLTQU83Hvt5cXkautw9QYynPngrhhKZest4ZtgK76dbZrQFzNBqTdnh5Gsmkex7FLLBDvrFDa5CZ93SShYftfTBkZB9AGe32gSxhhhBy9GBDeQhLmDQKQkMuGnqA64VL9gnDzRc4E3R9Qe3FpWVPKBMVk5qShshFfNkzcstAgRsS8EGum5s8UgEjbKEAv6UgNp5ePetGJCLbkgNH3sXPJrV2KBmAYqwRFSGHEAnFs4W2h4GUtDpPX5BAGHuS84BnBP8fM6hZEGG8ryryvqdNnvrsbFCzrdhA7Tz7W9TP8CamBsvEBJLvwsqQ49xgar5HrBXGbSvkZ5YRmgSH7WddvdKeehGwPVqN4TkrHY4MsRcaTT2LseSPnHhnkqVRGg8wJTREWREJHVDrJngFUTjNHYe7WJP29hfWPkJQ34BwaN9xb5BUXnM93CKwpdPj83B5RUMjCB4dGw26E8TxkgwfLfSqmhKCrrUHknj9s3WzQKESty4cHvuwgyR4VcrWejesVHxxwMntUYan3y7pfrub6T8X4SpPqbtXy5tz8zK";

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || "smtp.mailtrap.io",
  port: process.env.MAILTRAP_PORT || 587,
  auth: {
    user: process.env.MAILTRAP_USER || process.env.EMAIL_USER,
    pass: process.env.MAILTRAP_PASS || process.env.EMAIL_PASS,
  },
});

// Sign Up
exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error_msg", errors.array()[0].msg);
      return res.redirect("/auth/signup");
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error_msg", "Email is already registered");
      return res.redirect("/auth/signup");
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    // Create new user (inactive until email verified)
    const newUser = new User({
      name,
      email,
      password,
      emailVerificationToken: crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex"),
      emailVerificationExpires: Date.now() + 600000, // 10 minutes
      isActive: false,
      isEmailVerified: false,
    });
    await newUser.save();

    // Check if email configuration is available
    if (!process.env.MAILTRAP_USER || !process.env.MAILTRAP_PASS) {
      console.log(
        "Mailtrap configuration not found. Using console output for development."
      );
      console.log("   To configure Mailtrap, update your .env file with:");
      console.log("   MAILTRAP_USER=your-mailtrap-username");
      console.log("   MAILTRAP_PASS=your-mailtrap-password");
      console.log(`\n EMAIL VERIFICATION OTP for ${email}:`);
      console.log(` Verification Code: ${otp}`);
      console.log(` Expires in: 10 minutes\n`);
      req.flash(
        "success_msg",
        "Registration initiated! Check console for the verification code."
      );
    } else {
      // Send verification email
      const mailOptions = {
        from: process.env.MAILTRAP_USER || process.env.EMAIL_USER,
        to: email,
        subject: "Email Verification - CRUD App",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Email Verification</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Thank you for registering with our CRUD App. To complete your registration, please use the verification code below:</p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
              <h1 style="margin: 0; font-size: 2.5rem; letter-spacing: 5px;">${otp}</h1>
            </div>
            
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>If you didn't create an account with us, please ignore this email.</p>
            <p>Best regards,<br>CRUD App Team</p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(" Email verification OTP sent successfully");
        req.flash(
          "success_msg",
          "Registration initiated! Please check your email for verification code."
        );
      } catch (emailError) {
        console.error(" Email sending failed:", emailError);
        req.flash(
          "error_msg",
          "Failed to send verification email. Please try again later."
        );
        return res.redirect("/auth/signup");
      }
    }

    // Store email in session for verification page
    req.session.pendingVerification = {
      email: email,
      token: emailVerificationToken,
    };

    req.flash(
      "success_msg",
      "Registration initiated! Please check your email for verification code."
    );
    res.redirect("/auth/verify-email");
  } catch (error) {
    console.error("Signup error:", error);
    req.flash("error_msg", "Server error during registration");
    res.redirect("/auth/signup");
  }
};

// Sign In
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Signin attempt for email:", email);

    // Check if user exists
    const user = await User.findOne({ email });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("User not found");
      req.flash("error_msg", "Invalid credentials");
      return res.redirect("/auth/signin");
    }

    if (!user.isEmailVerified) {
      console.log("Email not verified");
      req.flash(
        "error_msg",
        "Please verify your email first. Check your inbox for verification code."
      );
      return res.redirect("/auth/signin");
    }

    if (!user.isActive) {
      console.log("User inactive");
      req.flash("error_msg", "Account is inactive. Please contact support.");
      return res.redirect("/auth/signin");
    }

    // Check password
    console.log("Comparing passwords...");
    const isMatch = await user.comparePassword(password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      console.log("Password mismatch");
      req.flash("error_msg", "Invalid credentials");
      return res.redirect("/auth/signin");
    }

    // Update last login
    await user.updateLastLogin();

    // Set user in session
    req.session.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto,
      role: user.role,
    };

    console.log("Signin successful, setting session:", req.session.user);
    req.flash("success_msg", "Welcome back!");
    res.redirect("/");
  } catch (error) {
    console.error("Signin error:", error);
    req.flash("error_msg", "Server error during sign in");
    res.redirect("/auth/signin");
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/auth/signin");
  });
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Forgot password request for email:", email);

    // Check if email is provided
    if (!email) {
      req.flash("error_msg", "Email is required");
      return res.redirect("/auth/forgot-password");
    }

    const user = await User.findOne({ email });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      req.flash("error_msg", "No account found with this email address");
      return res.redirect("/auth/forgot-password");
    }

    // Check if user is active and email verified
    if (!user.isActive || !user.isEmailVerified) {
      req.flash(
        "error_msg",
        "Account is not active. Please verify your email first."
      );
      return res.redirect("/auth/forgot-password");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();
    console.log("Reset token generated and saved for user:", user.email);

    // For development/testing: Log reset link to console instead of sending email
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/auth/reset-password/${resetToken}`;

    console.log(`\n PASSWORD RESET LINK for ${email}:`);
    console.log(` Reset URL: ${resetUrl}`);
    console.log(` Expires in: 1 hour\n`);

    // Check if email configuration is available
    if (!process.env.MAILTRAP_USER || !process.env.MAILTRAP_PASS) {
      console.log(
        "  Mailtrap configuration not found. Using console output for development."
      );
      console.log("   To configure Mailtrap, update your .env file with:");
      console.log("   MAILTRAP_USER=your-mailtrap-username");
      console.log("   MAILTRAP_PASS=your-mailtrap-password");
      req.flash(
        "success_msg",
        "Password reset link generated! Check console for the reset link."
      );
      return res.redirect("/auth/signin");
    }

    // Send reset email
    const mailOptions = {
      from: process.env.MAILTRAP_USER || process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request - CRUD App",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Password Reset Request</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>You requested a password reset for your CRUD App account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>CRUD App Team</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(" Password reset email sent successfully");
      req.flash("success_msg", "Password reset email sent! Check your inbox.");
    } catch (emailError) {
      console.error(" Email sending failed:", emailError);
      req.flash("error_msg", "Failed to send email. Please try again later.");
      return res.redirect("/auth/forgot-password");
    }

    res.redirect("/auth/signin");
  } catch (error) {
    console.error(" Forgot password error:", error);
    req.flash(
      "error_msg",
      "Server error during password reset. Please try again."
    );
    res.redirect("/auth/forgot-password");
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error_msg", "User not found");
      return res.redirect("/auth/signup");
    }

    // Check if OTP is valid and not expired
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    if (
      user.emailVerificationToken !== hashedOtp ||
      user.emailVerificationExpires < Date.now()
    ) {
      req.flash("error_msg", "Invalid or expired verification code");
      return res.redirect("/auth/verify-email");
    }

    // Activate user account
    user.isEmailVerified = true;
    user.isActive = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Set user in session
    req.session.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto,
      role: user.role,
    };

    // Clear pending verification
    delete req.session.pendingVerification;

    req.flash(
      "success_msg",
      "Email verified successfully! Welcome to your account."
    );
    res.redirect("/");
  } catch (error) {
    console.error("Email verification error:", error);
    req.flash("error_msg", "Server error during email verification");
    res.redirect("/auth/verify-email");
  }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error_msg", "User not found");
      return res.redirect("/auth/signup");
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      req.flash("error_msg", "Email is already verified");
      return res.redirect("/auth/signin");
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationToken = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");
    user.emailVerificationExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    // Check if email configuration is available
    if (!process.env.MAILTRAP_USER || !process.env.MAILTRAP_PASS) {
      console.log(
        "  Mailtrap configuration not found. Using console output for development."
      );
      console.log("   To configure Mailtrap, update your .env file with:");
      console.log("   MAILTRAP_USER=your-mailtrap-username");
      console.log("   MAILTRAP_PASS=your-mailtrap-password");
      console.log(`\n RESEND OTP for ${email}:`);
      console.log(` New Verification Code: ${otp}`);
      console.log(` Expires in: 10 minutes\n`);
      req.flash(
        "success_msg",
        "New verification code sent! Check console for the code."
      );
    } else {
      // Send new verification email
      const mailOptions = {
        from: process.env.MAILTRAP_USER || process.env.EMAIL_USER,
        to: email,
        subject: "Email Verification Code - CRUD App",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">New Verification Code</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Here's your new verification code:</p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
              <h1 style="margin: 0; font-size: 2.5rem; letter-spacing: 5px;">${otp}</h1>
            </div>
            
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>Best regards,<br>CRUD App Team</p>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(" Resend OTP email sent successfully");
        req.flash("success_msg", "New verification code sent to your email!");
      } catch (emailError) {
        console.error(" Email sending failed:", emailError);
        req.flash(
          "error_msg",
          "Failed to send verification email. Please try again later."
        );
        return res.redirect("/auth/verify-email");
      }
    }
    res.redirect("/auth/verify-email");
  } catch (error) {
    console.error("Resend OTP error:", error);
    req.flash("error_msg", "Server error while sending verification code");
    res.redirect("/auth/verify-email");
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    console.log("Reset password request received");

    // Validate input
    if (!token) {
      req.flash("error_msg", "Reset token is missing");
      return res.redirect("/auth/forgot-password");
    }

    if (!password || password.length < 6) {
      req.flash("error_msg", "Password must be at least 6 characters long");
      return res.redirect(`/auth/reset-password/${token}`);
    }

    if (password !== confirmPassword) {
      req.flash("error_msg", "Passwords do not match");
      return res.redirect(`/auth/reset-password/${token}`);
    }

    // Hash token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    console.log("Looking for user with reset token...");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log("No user found with valid reset token");
      req.flash(
        "error_msg",
        "Invalid or expired reset token. Please request a new password reset."
      );
      return res.redirect("/auth/forgot-password");
    }

    console.log("User found, updating password for:", user.email);

    // Update password and clear reset token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log("Password updated successfully");
    req.flash(
      "success_msg",
      "Password has been reset successfully! You can now sign in with your new password."
    );
    res.redirect("/auth/signin");
  } catch (error) {
    console.error(" Reset password error:", error);
    req.flash(
      "error_msg",
      "Server error during password reset. Please try again."
    );
    res.redirect("/auth/forgot-password");
  }
};
