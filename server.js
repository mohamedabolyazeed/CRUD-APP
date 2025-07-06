require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");

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
const port = process.env.PORT || 3001;

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "client/views"));

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "client/public")));

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
setupLiveReload(app, path);

// Database Connection
connectDB();

// Mount all routes
app.use("/", routes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);
app.use(pageNotFound);
app.use(globalErrorHandler);

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}/`);
  console.log(`📁 Client files served from: client/`);
  console.log(`⚙️  Server files located in: server/`);
  console.log(
    "IMPORTANT: If you made changes, ensure you have STOPPED any old server instance (Ctrl+C) and RESTARTED this one."
  );
  console.log(
    "Check terminal logs for messages starting with 'GET /edit/...' or 'POST /delete...' when you click the buttons."
  );
});

module.exports = app;
