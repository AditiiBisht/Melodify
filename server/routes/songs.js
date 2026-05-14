const express = require("express");
const router = express.Router();

const Song = require("../models/Song");
const upload = require("../middlewares/upload");

router.post(
  "/upload",
  upload.fields([
    { name: "song", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, artist } = req.body;

      const songFile = req.files["song"][0];
      const imageFile = req.files["image"][0];

      const newSong = new Song({
        title,
        artist,
        audioUrl: songFile.path,
        imageUrl: imageFile.path,
      });

      await newSong.save();

      res.status(201).json({
        message: "Song uploaded successfully",
        song: newSong,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Upload failed",
      });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const songs = await Song.find();
    res.json(songs);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch songs",
    });
  }
});

module.exports = router;