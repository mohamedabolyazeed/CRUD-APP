const User = require("../models/User");
const Data = require("../models/Data");

// Admin Dashboard API
exports.getDashboardAPI = async (req, res) => {
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

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          verifiedUsers,
          totalData,
        },
        recentUsers,
        recentData,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      success: false,
      error: "Error loading admin dashboard",
    });
  }
};

// Get All Users API
exports.getUsersAPI = async (req, res) => {
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

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          totalUsers,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      error: "Error loading users",
    });
  }
};

// Update User Role API
exports.updateUserRoleAPI = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Invalid role",
      });
    }

    // Prevent admin from removing their own admin role
    if (id === req.session.user._id && role === "user") {
      return res.status(400).json({
        success: false,
        error: "Cannot remove your own admin role",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Update User Status API
exports.updateUserStatusAPI = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Prevent admin from deactivating their own account
    if (id === req.session.user._id && !isActive) {
      return res.status(400).json({
        success: false,
        error: "Cannot deactivate your own account",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// Delete User API
exports.deleteUserAPI = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting their own account
    if (id === req.session.user._id) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete your own account",
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Also delete user's data
    await Data.deleteMany({ user: id });

    res.json({
      success: true,
      message: "User and associated data deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
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
