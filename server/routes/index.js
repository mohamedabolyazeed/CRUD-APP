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
router.use("/", dataRouter);

// Redirects for convenience
router.get("/signin", (req, res) => res.redirect("/auth/signin"));
router.get("/signup", (req, res) => res.redirect("/auth/signup"));
router.get("/forgot-password", (req, res) =>
  res.redirect("/auth/forgot-password")
);
router.get("/reset-password/:token", (req, res) =>
  res.redirect(`/auth/reset-password/${req.params.token}`)
);

module.exports = router;
