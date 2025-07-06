const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const adminController = require("../controllers/adminController");

// Apply admin authentication middleware to all admin routes
router.use(adminAuth);

// Admin Dashboard
router.get("/", adminController.dashboard);

// User Management
router.get("/users", adminController.getAllUsers);
router.put("/users/:userId/role", adminController.updateUserRole);
router.put("/users/:userId/status", adminController.toggleUserStatus);
router.delete("/users/:userId", adminController.deleteUser);

// Site Statistics
router.get("/stats", adminController.getSiteStats);

module.exports = router;
