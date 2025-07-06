const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-email-password",
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

    // For development/testing: Log OTP to console instead of sending email
    console.log(`\n📧 EMAIL VERIFICATION OTP for ${email}:`);
    console.log(`🔐 Verification Code: ${otp}`);
    console.log(`⏰ Expires in: 10 minutes\n`);

    // Uncomment the following code when you have proper email configuration
    /*
    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL_USER,
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

    await transporter.sendMail(mailOptions);
    */

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
    const user = await User.findOne({ email });

    if (!user) {
      req.flash("error_msg", "User not found or account is inactive");
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

    // Send reset email
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/auth/reset-password/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
                <h1>You requested a password reset</h1>
                <p>Click this <a href="${resetUrl}">link</a> to reset your password.</p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
    };

    await transporter.sendMail(mailOptions);

    req.flash("success_msg", "Password reset email sent");
    res.redirect("/auth/signin");
  } catch (error) {
    req.flash("error_msg", "Server error during password reset");
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

    // For development/testing: Log OTP to console instead of sending email
    console.log(`\n📧 RESEND OTP for ${email}:`);
    console.log(`🔐 New Verification Code: ${otp}`);
    console.log(`⏰ Expires in: 10 minutes\n`);

    // Uncomment the following code when you have proper email configuration
    /*
    // Send new verification email
    const mailOptions = {
      from: process.env.EMAIL_USER,
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

    await transporter.sendMail(mailOptions);
    */

    req.flash("success_msg", "New verification code sent to your email!");
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
    const { token, password } = req.body;

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
      req.flash("error_msg", "Invalid or expired reset token");
      return res.redirect("/auth/forgot-password");
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.flash("success_msg", "Password has been reset successfully");
    res.redirect("/auth/signin");
  } catch (error) {
    req.flash("error_msg", "Server error during password reset");
    res.redirect("/auth/forgot-password");
  }
};
