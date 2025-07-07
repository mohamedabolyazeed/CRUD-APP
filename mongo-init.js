// MongoDB initialization script
db = db.getSiblingDB("crud_app");

// Create admin user for the application database
db.createUser({
  user: "appuser",
  pwd: "apppassword123",
  roles: [
    {
      role: "readWrite",
      db: "crud_app",
    },
  ],
});

// Create collections
db.createCollection("users");
db.createCollection("data");

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ emailVerificationToken: 1 });
db.users.createIndex({ resetPasswordToken: 1 });
db.data.createIndex({ user: 1 });
db.data.createIndex({ createdAt: -1 });

print("MongoDB initialization completed successfully!");
