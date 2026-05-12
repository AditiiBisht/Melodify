const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// ─────────────────────────────────────────────
// Generate JWT Token
// ─────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ─────────────────────────────────────────────
// REGISTER ROUTE
// POST /api/auth/register
// ─────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {

    const { username, email, password } = req.body;

    // Validate fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check existing email
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Check existing username
    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,

      // Optional fields from advanced schema
      avatar: "",
      plan: "free",
      likedSongs: [],
      followedArtists: [],
      recentlyPlayed: [],
    });

    // Generate token
    const token = generateToken(user._id);

    // Response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        likedSongs: user.likedSongs,
        followedArtists: user.followedArtists,
        recentlyPlayed: user.recentlyPlayed,
      },
    });

  } catch (error) {

    console.error("Register Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
});

// ─────────────────────────────────────────────
// LOGIN ROUTE
// POST /api/auth/login
// ─────────────────────────────────────────────
router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    // User not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    // Wrong password
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        likedSongs: user.likedSongs,
        followedArtists: user.followedArtists,
        recentlyPlayed: user.recentlyPlayed,
      },
    });

  } catch (error) {

    console.error("Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }

});

module.exports = router;