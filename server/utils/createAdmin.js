const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/crud-app"
    );
    console.log("Connected to MongoDB");

    // Admin user details
    const adminData = {
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
      isEmailVerified: true,
      isActive: true,
    };    

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      return;
    }

    // Create admin user
    const adminUser = new User(adminData);
    await adminUser.save();

    console.log("Admin user created successfully!");
    console.log("\n You can now login at: http://localhost:3000/auth/signin");
    console.log("Admin panel: http://localhost:3000/admin");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the script if called directly
if (require.main === module) {
  createAdminUser();
}

module.exports = createAdminUser;
