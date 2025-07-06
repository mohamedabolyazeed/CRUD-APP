const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }
    await mongoose.connect(mongoURI);
    console.log("Connected to DB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

exports.connectDB = connectDB;
