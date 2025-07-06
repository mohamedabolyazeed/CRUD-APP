const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Check for session-based authentication first
  if (req.session && req.session.user) {
    req.user = { userId: req.session.user._id };
    return next();
  }

  // Check for JWT token in cookies
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/auth/signin");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    req.user = decoded;
    next();
  } catch (err) {
    res.redirect("/auth/signin");
  }
};

module.exports = authMiddleware;
