const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(cors());

// ✅ MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/melodify")
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.log("❌ MongoDB error:", err));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// ✅ Start server
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});


// Temporary test route to create a user
app.get("/create-test-user", async (req, res) => {
  const bcrypt = require("bcrypt");

  const hashed = await bcrypt.hash("123456", 10);

  const user = new User({
    username: "Aditi",
    email: "test@gmail.com",
    password: hashed
  });

  await user.save();

  res.send("Test user created");
});