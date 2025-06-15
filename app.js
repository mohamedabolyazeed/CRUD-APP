// app.js

const express = require("express");
const mongoose = require("mongoose");
const { connectDB } = require("./DB/connection");
const { Mydata } = require("./DB/user.schema");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const app = express();
const port = process.env.PORT || 3001;

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// LiveReload (Development Only - remove or comment out for production)
if (process.env.NODE_ENV !== "production") {
  try {
    const livereload = require("livereload");
    const connectLivereload = require("connect-livereload");

    const liveReloadServer = livereload.createServer();
    liveReloadServer.watch(path.join(__dirname, "views"));
    liveReloadServer.watch(path.join(__dirname, "public"));
    app.use(connectLivereload());

    liveReloadServer.server.once("connection", () => {
      setTimeout(() => {
        liveReloadServer.refresh("/");
      }, 100);
    });
  } catch (e) {
    console.warn(
      "Livereload setup failed. Ensure livereload and connect-livereload are installed if in development.",
      e.message
    );
  }
}

// Database Connection
connectDB();

// --- ROUTES ---

// GET: Display home page with all users and the form to add new user
app.get("/", async (req, res) => {
  console.log("GET / - Request received");
  try {
    const allUsers = await Mydata.find().sort({ createdAt: -1 });
    res.render("home", {
      my_title: "Home Page",
      arr: allUsers,
      error: null,
      formData: {},
    });
  } catch (err) {
    console.error("Error fetching data for home page:", err);
    res.status(500).render("home", {
      my_title: "Home Page",
      arr: [],
      error: "Error retrieving data from database",
      formData: {},
    });
  }
});

// POST: Create a new user
app.post("/", async (req, res) => {
  console.log("POST / - Request body:", req.body);
  try {
    const { username, age, specialization, address } = req.body;

    // Validate required fields
    if (!username || !age || !specialization || !address) {
      throw new Error("All fields are required");
    }

    const newData = new Mydata({
      username: username.trim(),
      age: Number(age),
      specialization: specialization.trim(),
      address: address.trim(),
    });

    await newData.save();
    console.log("Data saved:", newData);
    res.redirect("/");
  } catch (err) {
    console.error("Error saving data:", err);
    try {
      const allUsers = await Mydata.find().sort({ createdAt: -1 });
      res.status(400).render("home", {
        my_title: "Home Page",
        arr: allUsers,
        error:
          "Error saving data: " + (err.message || "Please check your input."),
        formData: req.body || {},
      });
    } catch (fetchErr) {
      console.error("Error fetching data after save error:", fetchErr);
      res.status(500).render("home", {
        my_title: "Home Page",
        arr: [],
        error: "Error saving data and retrieving existing data",
        formData: req.body || {},
      });
    }
  }
});

// GET: Display the edit form for a specific user
app.get("/edit/:id", async (req, res) => {
  console.log(`GET /edit/:id - Requested ID: ${req.params.id}`);
  try {
    const userId = req.params.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.warn("Invalid ObjectId format for edit:", userId);
      return res.status(400).send("Invalid user ID format.");
    }

    const userToEdit = await Mydata.findById(userId);
    if (!userToEdit) {
      console.warn("User not found for edit:", userId);
      return res.status(404).send("User not found");
    }

    console.log("User found for edit:", userToEdit.username);
    res.render("edit", {
      user: userToEdit,
      my_title: "Edit Information",
    });
  } catch (err) {
    console.error(`Error fetching user for edit (ID: ${req.params.id}):`, err);
    res.status(500).send("Error fetching user data for edit.");
  }
});

// POST: Update user (Form submission)
app.post("/update/:id", async (req, res) => {
  console.log("POST /update/:id - Request body:", req.body);
  try {
    const { username, age, specialization, address } = req.body;
    const { id } = req.params;

    // Validate required fields
    if (!username || !age || !specialization || !address) {
      return res.status(400).render("edit", {
        user: { _id: id, ...req.body },
        error: "All fields are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).render("edit", {
        user: { _id: id, ...req.body },
        error: "Invalid User ID format",
      });
    }

    const updatedUser = await Mydata.findByIdAndUpdate(
      id,
      {
        username: username.trim(),
        age: Number(age),
        specialization: specialization.trim(),
        address: address.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).render("edit", {
        user: { _id: id, ...req.body },
        error: "User not found",
      });
    }

    res.redirect("/");
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).render("edit", {
      user: { _id: req.params.id, ...req.body },
      error: "Error updating user: " + err.message,
    });
  }
});

// POST: Delete user (Form submission)
app.post("/delete/:id", async (req, res) => {
  console.log("POST /delete/:id - Params:", req.params);
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid User ID format");
    }

    const deletedUser = await Mydata.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).send("User not found");
    }

    res.redirect("/");
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Error deleting user: " + err.message);
  }
});

// API Routes (Optional - for programmatic access)
app.put("/api/users/:id", async (req, res) => {
  console.log("PUT /api/users/:id - Request body:", req.body);
  try {
    const { id } = req.params;
    const { username, age, specialization, address } = req.body;

    // Validate required fields
    if (!username || !age || !specialization || !address) {
      return res.status(400).json({
        success: false,
        message: "All fields are required for update",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format",
      });
    }

    const updatedUser = await Mydata.findByIdAndUpdate(
      id,
      {
        username: username.trim(),
        age: Number(age),
        specialization: specialization.trim(),
        address: address.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error(`Error updating user (ID: ${req.params.id}):`, err);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: err.message,
    });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  console.log("DELETE /api/users/:id - Requested ID:", req.params.id);
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format",
      });
    }

    const deletedUser = await Mydata.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (err) {
    console.error(`Error deleting user (ID: ${req.params.id}):`, err);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: err.message,
    });
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err.message });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).send("Something went wrong!");
});

// --- End of Routes ---

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  console.log(
    "IMPORTANT: If you made changes, ensure you have STOPPED any old server instance (Ctrl+C) and RESTARTED this one."
  );
  console.log(
    "Check terminal logs for messages starting with 'GET /edit/...' or 'POST /delete...' when you click the buttons."
  );
});

module.exports = app;
