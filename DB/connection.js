const express = require("express");
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://mohamedaboelyazeed920:H1iPPlJG9GeOzcwN@cluster0.lbwsy.mongodb.net/all-data?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("Connected to DB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

exports.connectDB = connectDB;
