const Data = require("../models/Data");
const mongoose = require("mongoose");

// GET: Display home page with user's data only (protected by auth)
const getHomePage = async (req, res) => {
  console.log("GET / - Request received for user:", req.session.user._id);
  try {
    // Get only the current user's data entries
    const userData = await Data.find({ user: req.session.user._id }).sort({
      createdAt: -1,
    });
    res.render("home", {
      my_title: "Home Page",
      arr: userData,
      error: null,
      formData: {},
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      req: req,
    });
  } catch (err) {
    console.error("Error fetching data for home page:", err);
    res.status(500).render("home", {
      my_title: "Home Page",
      arr: [],
      error: "Error retrieving data from database",
      formData: {},
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg"),
      req: req,
    });
  }
};

// POST: Create a new user
const createData = async (req, res) => {
  console.log("POST / - Request body:", req.body);
  try {
    const { username, age, specialization, address } = req.body;

    // Validate required fields
    if (!username || !age || !specialization || !address) {
      throw new Error("All fields are required");
    }

    const newData = new Data({
      user: req.session.user._id, // Associate with current user
      username: username.trim(),
      age: Number(age),
      specialization: specialization.trim(),
      address: address.trim(),
    });

    await newData.save();
    console.log("Data saved:", newData);
    req.flash("success_msg", "Data added successfully!");
    res.redirect("/");
  } catch (err) {
    console.error("Error saving data:", err);
    try {
      const userData = await Data.find({ user: req.session.user._id }).sort({
        createdAt: -1,
      });
      res.status(400).render("home", {
        my_title: "Home Page",
        arr: userData,
        error:
          "Error saving data: " + (err.message || "Please check your input."),
        formData: req.body || {},
        req: req,
      });
    } catch (fetchErr) {
      console.error("Error fetching data after save error:", fetchErr);
      res.status(500).render("home", {
        my_title: "Home Page",
        arr: [],
        error: "Error saving data and retrieving existing data",
        formData: req.body || {},
        req: req,
      });
    }
  }
};

// GET: Display the edit form for a specific user
const getEditForm = async (req, res) => {
  console.log(`GET /edit/:id - Requested ID: ${req.params.id}`);
  try {
    const userId = req.params.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.warn("Invalid ObjectId format for edit:", userId);
      return res.status(400).send("Invalid user ID format.");
    }

    const userToEdit = await Data.findOne({
      _id: userId,
      user: req.session.user._id,
    });
    if (!userToEdit) {
      console.warn("Data not found or user not authorized for edit:", userId);
      return res
        .status(404)
        .send("Data not found or you are not authorized to edit this data");
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
};

// POST: Update user (Form submission)
const updateData = async (req, res) => {
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

    const updatedUser = await Data.findOneAndUpdate(
      { _id: id, user: req.session.user._id }, // Only update if user owns the data
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

    req.flash("success_msg", "Data updated successfully!");
    res.redirect("/");
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).render("edit", {
      user: { _id: req.params.id, ...req.body },
      error: "Error updating user: " + err.message,
    });
  }
};

// POST: Delete user (Form submission)
const deleteData = async (req, res) => {
  console.log("POST /delete/:id - Params:", req.params);
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid User ID format");
    }

    const deletedUser = await Data.findOneAndDelete({
      _id: id,
      user: req.session.user._id,
    });

    if (!deletedUser) {
      return res.status(404).send("User not found");
    }

    req.flash("success_msg", "Data deleted successfully!");
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Error deleting user: " + err.message);
  }
};

// API Routes (Optional - for programmatic access)
const updateDataAPI = async (req, res) => {
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

    const updatedUser = await Data.findByIdAndUpdate(
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
};

const deleteDataAPI = async (req, res) => {
  console.log("DELETE /api/users/:id - Requested ID:", req.params.id);
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format",
      });
    }

    const deletedUser = await Data.findByIdAndDelete(id);

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
};

module.exports = {
  getHomePage,
  createData,
  getEditForm,
  updateData,
  deleteData,
  updateDataAPI,
  deleteDataAPI,
};
