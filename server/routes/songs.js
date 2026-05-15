const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");

const {
  uploadSong,
  getSongs,
} = require("../controllers/songController");

// ─────────────────────────────────────────────
// Upload Song Route
// ─────────────────────────────────────────────
router.post(
  "/upload",
  upload.any(),
  uploadSong
);

// ─────────────────────────────────────────────
// Get All Songs Route
// ─────────────────────────────────────────────
router.get("/", getSongs);

module.exports = router;