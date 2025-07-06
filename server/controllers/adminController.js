const User = require("../models/User");
const Data = require("../models/Data");

// Admin Dashboard
exports.dashboard = async (req, res) => {
  try {
    // Get statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const totalData = await Data.countDocuments();

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name email role isActive isEmailVerified createdAt");

    // Get recent data entries
    const recentData = await Data.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email");

    res.render("admin/dashboard", {
      user: req.adminUser,
      stats: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        totalData,
      },
      recentUsers,
      recentData,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    req.flash("error_msg", "Error loading admin dashboard");
    res.redirect("/");
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires"
      );

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    res.render("admin/users", {
      user: req.adminUser,
      users,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    req.flash("error_msg", "Error loading users");
    res.redirect("/admin");
  }
};

// Update User Role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Prevent admin from removing their own admin role
    if (userId === req.adminUser._id.toString() && role === "user") {
      return res
        .status(400)
        .json({ error: "Cannot remove your own admin role" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Toggle User Status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // Prevent admin from deactivating their own account
    if (userId === req.adminUser._id.toString() && !isActive) {
      return res
        .status(400)
        .json({ error: "Cannot deactivate your own account" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting their own account
    if (userId === req.adminUser._id.toString()) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Also delete user's data
    await Data.deleteMany({ user: userId });

    res.json({
      success: true,
      message: "User and associated data deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Site Statistics
exports.getSiteStats = async (req, res) => {
  try {
    const stats = {
      totalUsers: await User.countDocuments(),
      activeUsers: await User.countDocuments({ isActive: true }),
      verifiedUsers: await User.countDocuments({ isEmailVerified: true }),
      adminUsers: await User.countDocuments({ role: "admin" }),
      totalData: await Data.countDocuments(),
      usersThisMonth: await User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
      dataThisMonth: await Data.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
    };

    res.json(stats);
  } catch (error) {
    console.error("Get site stats error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
