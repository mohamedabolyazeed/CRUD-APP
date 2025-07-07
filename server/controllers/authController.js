const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

// JWT Secret
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "2R4pvUGbc7HbZdcpWKPV9XYqkUfUDq2zVtyM7Qa52vVPPVAqMtSRwpABjVwbegr7txgczLJDFYWyGwJCUA9ycm6PkCXyPhTyqTbqQqJTsYsQWZGxvzL7DTCjD9EA79CzFAJ7Rhy8xCHEdWLepUWBrwenpcLTQU83Hvt5cXkautw9QYynPngrhhKZest4ZtgK76dbZrQFzNBqTdnh5Gsmkex7FLLBDvrFDa5CZ93SShYftfTBkZB9AGe32gSxhhhBy9GBDeQhLmDQKQkMuGnqA64VL9gnDzRc4E3R9Qe3FpWVPKBMVk5qShshFfNkzcstAgRsS8EGum5s8UgEjbKEAv6UgNp5ePetGJCLbkgNH3sXPJrV2KBmAYqwRFSGHEAnFs4W2h4GUtDpPX5BAGHuS84BnBP8fM6hZEGG8ryryvqdNnvrsbFCzrdhA7Tz7W9TP8CamBsvEBJLvwsqQ49xgar5HrBXGbSvkZ5YRmgSH7WddvdKeehGwPVqN4TkrHY4MsRcaTT2LseSPnHhnkqVRGg8wJTREWREJHVDrJngFUTjNHYe7WJP29hfWPkJQ34BwaN9xb5BUXnM93CKwpdPj83B5RUMjCB4dGw26E8TxkgwfLfSqmhKCrrUHknj9s3WzQKESty4cHvuwgyR4VcrWejesVHxxwMntUYan3y7pfrub6T8X4SpPqbtXy5tz8zK";

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true" || false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

// Sign Up
exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email is already registered",
      });
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
    if (!process.env.SMTP_USER && !process.env.EMAIL_USER) {
      console.log(
        "SMTP configuration not found. Using console output for development."
      );
      console.log("   To configure SMTP email, update your .env file with:");
      console.log("   SMTP_HOST=your-smtp-host (e.g., smtp.gmail.com)");
      console.log("   SMTP_PORT=587");
      console.log("   SMTP_USER=your-email@domain.com");
      console.log("   SMTP_PASS=your-app-password");
      console.log(`\n EMAIL VERIFICATION OTP:`);
      console.log(` Verification Code: ${otp}`);
      console.log(` Expires in: 10 minutes\n`);
    } else {
      // Send verification email
      const mailOptions = {
        from: process.env.SMTP_USER || process.env.EMAIL_USER,
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
      } catch (emailError) {
        console.error(" Email sending failed:", emailError);
        return res.status(500).json({
          success: false,
          error: "Failed to send verification email. Please try again later.",
        });
      }
    }

    // Store email in session for verification page
    req.session.pendingVerification = {
      email: email,
      token: emailVerificationToken,
    };

    res.status(201).json({
      success: true,
      message:
        "Registration initiated! Please check your email for verification code.",
      data: {
        email: email,
        token: emailVerificationToken,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during registration",
    });
  }
};

// Sign In
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        error:
          "Please verify your email first. Check your inbox for verification code.",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: "Account is inactive. Please contact support.",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
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

    res.json({
      success: true,
      message: "Welcome back!",
      user: req.session.user,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during sign in",
    });
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({
        success: false,
        error: "Error during logout",
      });
    }
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  });
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // Check if email is provided
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No account found with this email address",
      });
    }

    // Check if user is active and email verified
    if (!user.isActive || !user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: "Account is not active. Please verify your email first.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // For development/testing: Log reset link to console instead of sending email
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/auth/reset-password/${resetToken}`;

    console.log(`\n PASSWORD RESET LINK:`);
    console.log(` Reset URL: ${resetUrl}`);
    console.log(` Expires in: 1 hour\n`);

    // Check if email configuration is available
    if (!process.env.SMTP_USER && !process.env.EMAIL_USER) {
      console.log(
        "  SMTP configuration not found. Using console output for development."
      );
      console.log("   To configure SMTP email, update your .env file with:");
      console.log("   SMTP_HOST=your-smtp-host (e.g., smtp.gmail.com)");
      console.log("   SMTP_PORT=587");
      console.log("   SMTP_USER=your-email@domain.com");
      console.log("   SMTP_PASS=your-app-password");
      return res.json({
        success: true,
        message:
          "Password reset link generated! Check console for the reset link.",
        resetUrl: resetUrl,
      });
    }

    // Send reset email
    const mailOptions = {
      from: process.env.SMTP_USER || process.env.EMAIL_USER,
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
      res.json({
        success: true,
        message: "Password reset email sent! Check your inbox.",
      });
    } catch (emailError) {
      console.error(" Email sending failed:", emailError);
      res.status(500).json({
        success: false,
        error: "Failed to send email. Please try again later.",
      });
    }
  } catch (error) {
    console.error(" Forgot password error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during password reset. Please try again.",
    });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if OTP is valid and not expired
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    if (
      user.emailVerificationToken !== hashedOtp ||
      user.emailVerificationExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired verification code",
      });
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

    res.json({
      success: true,
      message: "Email verified successfully! Welcome to your account.",
      user: req.session.user,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during email verification",
    });
  }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: "Email is already verified",
      });
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
    if (!process.env.SMTP_USER && !process.env.EMAIL_USER) {
      console.log(
        "  SMTP configuration not found. Using console output for development."
      );
      console.log("   To configure SMTP email, update your .env file with:");
      console.log("   SMTP_HOST=your-smtp-host (e.g., smtp.gmail.com)");
      console.log("   SMTP_PORT=587");
      console.log("   SMTP_USER=your-email@domain.com");
      console.log("   SMTP_PASS=your-app-password");
      console.log(`\n RESEND OTP:`);
      console.log(` New Verification Code: ${otp}`);
      console.log(` Expires in: 10 minutes\n`);
      return res.json({
        success: true,
        message: "New verification code sent! Check console for the code.",
      });
    } else {
      // Send new verification email
      const mailOptions = {
        from: process.env.SMTP_USER || process.env.EMAIL_USER,
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
        res.json({
          success: true,
          message: "New verification code sent to your email!",
        });
      } catch (emailError) {
        console.error(" Email sending failed:", emailError);
        res.status(500).json({
          success: false,
          error: "Failed to send verification email. Please try again later.",
        });
      }
    }
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while sending verification code",
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    // Validate input
    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Reset token is missing",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Passwords do not match",
      });
    }

    // Hash token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid or expired reset token. Please request a new password reset.",
      });
    }

    // Update password and clear reset token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({
      success: true,
      message:
        "Password has been reset successfully! You can now sign in with your new password.",
    });
  } catch (error) {
    console.error(" Reset password error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during password reset. Please try again.",
    });
  }
};
