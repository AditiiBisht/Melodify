// =============================================================
// server/routes/songs.js
// ✅ BUG FIX: /api/songs/:id/like now has `protect` middleware
//    (was crashing with "Cannot read _id of undefined")
// COPY TO: server/routes/songs.js
// =============================================================

const express  = require("express");
const router   = express.Router();
const Song     = require("../models/Song");
const User     = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// GET /api/songs — all songs with optional filters
router.get("/", async (req, res) => {
  try {
    const { genre, artist, search, featured, trending, newRelease, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (genre)              filter.genre  = { $regex: genre,  $options: "i" };
    if (artist)             filter.artist = { $regex: artist, $options: "i" };
    if (featured === "true")  filter.featured   = true;
    if (trending === "true")  filter.trending   = true;
    if (newRelease === "true")filter.newRelease  = true;
    if (search) {
      filter.$or = [
        { title:  { $regex: search, $options: "i" } },
        { artist: { $regex: search, $options: "i" } },
        { album:  { $regex: search, $options: "i" } },
      ];
    }
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Song.countDocuments(filter);
    const songs = await Song.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit)).skip(skip);
    res.json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), songs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// GET /api/songs/featured
router.get("/featured", async (req, res) => {
  try {
    const songs = await Song.find({ featured: true }).limit(10);
    res.json({ success: true, songs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// GET /api/songs/trending
router.get("/trending", async (req, res) => {
  try {
    const songs = await Song.find({ trending: true }).sort({ plays: -1 }).limit(10);
    res.json({ success: true, songs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// GET /api/songs/new-releases
router.get("/new-releases", async (req, res) => {
  try {
    const songs = await Song.find({ newRelease: true }).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, songs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// GET /api/songs/:id
router.get("/:id", async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: "Song not found." });
    res.json({ success: true, song });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// POST /api/songs/:id/play — increment play count (no auth needed)
router.post("/:id/play", async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, { $inc: { plays: 1 } }, { new: true });
    if (!song) return res.status(404).json({ success: false, message: "Song not found." });
    res.json({ success: true, plays: song.plays });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ✅ POST /api/songs/:id/like — FIXED: added `protect` middleware
router.post("/:id/like", protect, async (req, res) => {
  try {
    const user        = await User.findById(req.user._id);
    const songId      = req.params.id;
    const alreadyLiked = user.likedSongs.map(String).includes(String(songId));

    if (alreadyLiked) {
      user.likedSongs = user.likedSongs.filter(id => id.toString() !== songId);
      await Song.findByIdAndUpdate(songId, { $inc: { likes: -1 } });
    } else {
      user.likedSongs.push(songId);
      await Song.findByIdAndUpdate(songId, { $inc: { likes: 1 } });
    }
    await user.save();
    res.json({ success: true, liked: !alreadyLiked, message: alreadyLiked ? "Song unliked." : "Song liked!" });
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;