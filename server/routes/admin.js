const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminAuthMiddleware = require("../middleware/adminAuth");

// Apply admin auth middleware to all admin routes
router.use(adminAuthMiddleware);

// API routes for admin functionality
router.get("/api/dashboard", adminController.getDashboardAPI);
router.get("/api/users", adminController.getUsersAPI);
router.put("/api/users/:id/role", adminController.updateUserRoleAPI);
router.put("/api/users/:id/status", adminController.updateUserStatusAPI);
router.delete("/api/users/:id", adminController.deleteUserAPI);

module.exports = router;
