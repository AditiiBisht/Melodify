const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Song = require("../models/Song");
const { protect } = require("../middleware/authMiddleware");

// ─────────────────────────────────────────
// GET /api/user/me  — get current user profile
// ─────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("likedSongs", "title artist coverUrl duration audioUrl");

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─────────────────────────────────────────
// PUT /api/user/me  — update profile (username, avatar)
// ─────────────────────────────────────────
router.put("/me", protect, async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) {
        return res
          .status(400)
          .json({ success: false, message: "Username already taken." });
      }
      user.username = username;
    }

    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─────────────────────────────────────────
// GET /api/user/liked  — get liked songs
// ─────────────────────────────────────────
router.get("/liked", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "likedSongs",
      "title artist album coverUrl duration audioUrl plays"
    );

    res.json({ success: true, songs: user.likedSongs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─────────────────────────────────────────
// GET /api/user/recently-played
// ─────────────────────────────────────────
router.get("/recently-played", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("recentlyPlayed")
      .populate("recentlyPlayed.song", "title artist coverUrl duration audioUrl");

    // Sort by most recently played, limit to 20
    const recent = user.recentlyPlayed
      .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
      .slice(0, 20);

    res.json({ success: true, recentlyPlayed: recent });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─────────────────────────────────────────
// POST /api/user/recently-played/:songId  — log a play
// ─────────────────────────────────────────
router.post("/recently-played/:songId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const songId = req.params.songId;

    // Remove old entry of the same song if exists
    user.recentlyPlayed = user.recentlyPlayed.filter(
      (entry) => entry.song.toString() !== songId
    );

    // Add to front
    user.recentlyPlayed.unshift({ song: songId, playedAt: new Date() });

    // Keep max 50 entries
    if (user.recentlyPlayed.length > 50) {
      user.recentlyPlayed = user.recentlyPlayed.slice(0, 50);
    }

    await user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;