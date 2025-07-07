require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");
const cors = require("cors");

// Import modules
const { connectDB } = require("./server/config/connection");
const { setupLiveReload } = require("./server/middleware/devSetup");
const {
  notFoundHandler,
  errorHandler,
  pageNotFound,
  globalErrorHandler,
} = require("./server/middleware/errorHandler");
const routes = require("./server/routes");

const app = express();
const port = process.env.PORT || 5050;

// CORS setup for development
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? false : ["http://localhost:3000"],
    credentials: true,
  })
);

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Session and Flash
app.use(
  session({
    secret: process.env.SESSION_SECRET || "crud-app-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);
app.use(flash());

// Development setup (LiveReload)
if (process.env.NODE_ENV !== "production") {
  setupLiveReload(app, path);
}

// Database Connection
connectDB();

// API Routes (before React app)
app.use("/api", routes);

// Serve static files from React build folder
app.use(express.static(path.join(__dirname, "client/build")));

// Serve React app for all non-API routes
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).end();
  // If the request is for a static file that doesn't exist, return 404
  if (req.path.match(/^\/static\//)) return res.status(404).end();
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);
app.use(pageNotFound);
app.use(globalErrorHandler);

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}/`);
  console.log(`📁 React app served from: client/build/`);
  console.log(`⚙️  Server files located in: server/`);
  console.log(`🔧 API endpoints available at: http://localhost:${port}/api/`);
  console.log(
    "IMPORTANT: If you made changes, ensure you have STOPPED any old server instance (Ctrl+C) and RESTARTED this one."
  );
});

module.exports = app;
