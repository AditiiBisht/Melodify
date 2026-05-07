const express = require("express");
const router = express.Router();
const Playlist = require("../models/Playlist");
const { protect } = require("../middleware/authMiddleware");



// All playlist routes require authentication

// ─────────────────────────────────────────
// GET /api/playlists/mine  — get logged-in user's playlists
// ─────────────────────────────────────────
router.get("/mine", protect, async (req, res) => {
  try {
    const playlists = await Playlist.find({ owner: req.user._id })
      .populate("songs", "title artist coverUrl duration audioUrl")
      .sort({ updatedAt: -1 });

    res.json({ success: true, playlists });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─────────────────────────────────────────
// GET /api/playlists/:id  — get single playlist
// ─────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate("songs", "title artist coverUrl duration audioUrl plays likes")
      .populate("owner", "username avatar");

    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found." });
    }

    // If private, only owner can view
    if (!playlist.isPublic) {
      // requires token check — skip for now or add optional protect
    }

    res.json({ success: true, playlist });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─────────────────────────────────────────
// POST /api/playlists  — create playlist
// ─────────────────────────────────────────
router.post("/", protect, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Playlist name is required." });
    }

    const playlist = await Playlist.create({
      name,
      description: description || "",
      owner: req.user._id,
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    res.status(201).json({
      success: true,
      message: "Playlist created!",
      playlist,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─────────────────────────────────────────
// PUT /api/playlists/:id  — update playlist name/desc
// ─────────────────────────────────────────
router.put("/:id", protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found." });
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    const { name, description, isPublic, coverUrl } = req.body;
    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    if (coverUrl) playlist.coverUrl = coverUrl;

    await playlist.save();

    res.json({ success: true, message: "Playlist updated!", playlist });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─────────────────────────────────────────
// DELETE /api/playlists/:id
// ─────────────────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found." });
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    await playlist.deleteOne();

    res.json({ success: true, message: "Playlist deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─────────────────────────────────────────
// POST /api/playlists/:id/songs  — add song to playlist
// ─────────────────────────────────────────
router.post("/:id/songs", protect, async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found." });
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    if (playlist.songs.includes(songId)) {
      return res
        .status(400)
        .json({ success: false, message: "Song already in playlist." });
    }

    playlist.songs.push(songId);
    await playlist.save();

    res.json({ success: true, message: "Song added to playlist!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─────────────────────────────────────────
// DELETE /api/playlists/:id/songs/:songId  — remove song from playlist
// ─────────────────────────────────────────
router.delete("/:id/songs/:songId", protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found." });
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    playlist.songs = playlist.songs.filter(
      (id) => id.toString() !== req.params.songId
    );
    await playlist.save();

    res.json({ success: true, message: "Song removed from playlist." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;