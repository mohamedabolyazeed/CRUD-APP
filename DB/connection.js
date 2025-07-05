const express = require("express");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://");
    console.log("Connected to DB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

exports.connectDB = connectDB;
