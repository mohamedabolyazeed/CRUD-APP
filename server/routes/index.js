const express = require("express");
const router = express.Router();
const authRouter = require("./auth");
const dataRouter = require("./data");
const adminRouter = require("./admin");

// Mount authentication routes
router.use("/auth", authRouter);

// Mount admin routes
router.use("/admin", adminRouter);

// Mount data routes (protected by auth middleware)
router.use("/data", dataRouter);

// Auth status check endpoint
router.get("/auth/me", (req, res) => {
  if (req.session.user) {
    res.json({
      user: req.session.user,
      authenticated: true,
    });
  } else {
    res.status(401).json({
      user: null,
      authenticated: false,
    });
  }
});

module.exports = router;
