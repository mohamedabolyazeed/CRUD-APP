const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");
const authMiddleware = require("../middleware/auth");

// Apply auth middleware to all data routes
router.use(authMiddleware);

// API routes for CRUD operations
router.get("/", dataController.getDataAPI);
router.post("/", dataController.createDataAPI);
router.get("/:id", dataController.getDataByIdAPI);
router.put("/:id", dataController.updateDataAPI);
router.delete("/:id", dataController.deleteDataAPI);

module.exports = router;
