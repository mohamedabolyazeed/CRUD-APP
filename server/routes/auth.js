const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// Validation middleware
const validateSignup = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const validateSignin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const validateForgotPassword = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),
];

const validateResetPassword = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),
];

// Authentication Routes

// GET: Sign In page
router.get("/signin", (req, res) => {
  res.render("auth/signin", {
    success_msg: req.flash("success_msg"),
    error_msg: req.flash("error_msg"),
    errors: {},
  });
});

// POST: Sign In
router.post("/signin", validateSignin, authController.signin);

// GET: Sign Up page
router.get("/signup", (req, res) => {
  res.render("auth/signup", {
    success_msg: req.flash("success_msg"),
    error_msg: req.flash("error_msg"),
    errors: {},
  });
});

// POST: Sign Up
router.post("/signup", validateSignup, authController.signup);

// GET: Verify Email page
router.get("/verify-email", (req, res) => {
  if (!req.session.pendingVerification) {
    req.flash("error_msg", "No pending verification found");
    return res.redirect("/auth/signup");
  }

  res.render("auth/verify-email", {
    email: req.session.pendingVerification.email,
    token: req.session.pendingVerification.token,
    success_msg: req.flash("success_msg"),
    error_msg: req.flash("error_msg"),
    errors: {},
  });
});

// POST: Verify Email
router.post(
  "/verify-email",
  [
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be exactly 6 digits")
      .isNumeric()
      .withMessage("OTP must contain only numbers"),
  ],
  authController.verifyEmail
);

// POST: Resend OTP
router.post("/resend-otp", authController.resendOtp);

// GET: Forgot Password page
router.get("/forgot-password", (req, res) => {
  res.render("auth/forgot-password", {
    success_msg: req.flash("success_msg"),
    error_msg: req.flash("error_msg"),
    errors: {},
  });
});

// POST: Forgot Password
router.post(
  "/forgot-password",
  validateForgotPassword,
  authController.forgotPassword
);

// GET: Reset Password page
router.get("/reset-password/:token", (req, res) => {
  res.render("auth/reset-password", {
    token: req.params.token,
    success_msg: req.flash("success_msg"),
    error_msg: req.flash("error_msg"),
    errors: {},
  });
});

// POST: Reset Password
router.post(
  "/reset-password",
  validateResetPassword,
  authController.resetPassword
);

// GET: Logout
router.get("/logout", authController.logout);

module.exports = router;
