const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User reference is required"],
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    minlength: [2, "Username must be at least 2 characters long"],
  },
  age: {
    type: Number,
    required: [true, "Age is required"],
    min: [1, "Age must be at least 1"],
    max: [120, "Age cannot exceed 120"],
  },
  specialization: {
    type: String,
    required: [true, "Specialization is required"],
    trim: true,
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
dataSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for better query performance
dataSchema.index({ createdAt: -1 });
dataSchema.index({ username: 1 });

module.exports = mongoose.model("Data", dataSchema);
