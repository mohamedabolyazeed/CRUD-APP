const Data = require("../models/Data");
const mongoose = require("mongoose");

// GET: Get all data for the authenticated user
const getDataAPI = async (req, res) => {
  try {
    // Get only the current user's data entries
    const userData = await Data.find({ user: req.session.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: userData,
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({
      success: false,
      error: "Error retrieving data from database",
    });
  }
};

// POST: Create a new data entry
const createDataAPI = async (req, res) => {
  try {
    const { username, age, specialization, address } = req.body;

    // Validate required fields
    if (!username || !age || !specialization || !address) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    const newData = new Data({
      user: req.session.user._id, // Associate with current user
      username: username.trim(),
      age: Number(age),
      specialization: specialization.trim(),
      address: address.trim(),
    });

    await newData.save();

    res.status(201).json({
      success: true,
      message: "Data added successfully!",
      data: newData,
    });
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).json({
      success: false,
      error:
        "Error saving data: " + (err.message || "Please check your input."),
    });
  }
};

// GET: Get a specific data entry by ID
const getDataByIdAPI = async (req, res) => {
  try {
    const dataId = req.params.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(dataId)) {
      console.warn("Invalid ObjectId format:", dataId);
      return res.status(400).json({
        success: false,
        error: "Invalid data ID format",
      });
    }

    const data = await Data.findOne({
      _id: dataId,
      user: req.session.user._id,
    });

    if (!data) {
      console.warn("Data not found or user not authorized:", dataId);
      return res.status(404).json({
        success: false,
        error: "Data not found or you are not authorized to access this data",
      });
    }

    res.json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error(`Error fetching data (ID: ${req.params.id}):`, err);
    res.status(500).json({
      success: false,
      error: "Error fetching data",
    });
  }
};

// PUT: Update a data entry
const updateDataAPI = async (req, res) => {
  try {
    const { username, age, specialization, address } = req.body;
    const { id } = req.params;

    // Validate required fields
    if (!username || !age || !specialization || !address) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid data ID format",
      });
    }

    const updatedData = await Data.findOneAndUpdate(
      { _id: id, user: req.session.user._id }, // Only update if user owns the data
      {
        username: username.trim(),
        age: Number(age),
        specialization: specialization.trim(),
        address: address.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedData) {
      return res.status(404).json({
        success: false,
        error: "Data not found or you are not authorized to update this data",
      });
    }

    res.json({
      success: true,
      message: "Data updated successfully!",
      data: updatedData,
    });
  } catch (err) {
    console.error("Error updating data:", err);
    res.status(500).json({
      success: false,
      error: "Error updating data: " + err.message,
    });
  }
};

// DELETE: Delete a data entry
const deleteDataAPI = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid data ID format",
      });
    }

    const deletedData = await Data.findOneAndDelete({
      _id: id,
      user: req.session.user._id,
    });

    if (!deletedData) {
      return res.status(404).json({
        success: false,
        error: "Data not found or you are not authorized to delete this data",
      });
    }

    res.json({
      success: true,
      message: "Data deleted successfully!",
      data: deletedData,
    });
  } catch (err) {
    console.error("Error deleting data:", err);
    res.status(500).json({
      success: false,
      error: "Error deleting data: " + err.message,
    });
  }
};

module.exports = {
  getDataAPI,
  createDataAPI,
  getDataByIdAPI,
  updateDataAPI,
  deleteDataAPI,
};
