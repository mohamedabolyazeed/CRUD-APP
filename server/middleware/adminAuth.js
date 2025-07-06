const User = require("../models/User");

const adminAuth = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.user) {
      req.flash("error_msg", "Please login to access admin panel");
      return res.redirect("/auth/signin");
    }

    // Get user from database to check role
    const user = await User.findById(req.session.user._id);
    if (!user) {
      req.flash("error_msg", "User not found");
      return res.redirect("/auth/signin");
    }

    // Check if user is admin
    if (user.role !== "admin") {
      req.flash("error_msg", "Access denied. Admin privileges required.");
      return res.redirect("/");
    }

    // Add admin user to request object
    req.adminUser = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    req.flash("error_msg", "Server error during admin authentication");
    res.redirect("/auth/signin");
  }
};

module.exports = adminAuth;
