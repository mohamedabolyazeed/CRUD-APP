const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");
const authMiddleware = require("../middleware/auth");

// Apply auth middleware to all data routes
router.use(authMiddleware);

// Main CRUD routes
router.get("/", dataController.getHomePage);
router.post("/", dataController.createData);
router.get("/edit/:id", dataController.getEditForm);
router.post("/update/:id", dataController.updateData);
router.post("/delete/:id", dataController.deleteData);

// API routes (optional - for programmatic access)
router.put("/api/users/:id", dataController.updateDataAPI);
router.delete("/api/users/:id", dataController.deleteDataAPI);

module.exports = router;
