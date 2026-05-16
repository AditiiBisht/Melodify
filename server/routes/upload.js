
const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Song = require("../models/Song");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

router.post(
  "/",
  protect,
  adminOnly,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {

    try {

      const {
        title,
        artist,
        album,
        genre,
      } = req.body;

      if (!req.files.audio) {
        return res.status(400).json({
          success: false,
          message: "Audio file required",
        });
      }

      // Upload audio
      const audioUpload = await cloudinary.uploader.upload_stream({
        resource_type: "video",
        folder: "melodify/songs",
      });

      // Upload cover
      let coverUrl = "";

      if (req.files.cover) {
        const coverUpload = await cloudinary.uploader.upload_stream({
          folder: "melodify/covers",
        });

        coverUrl = coverUpload.secure_url;
      }

      const song = await Song.create({
        title,
        artist,
        album,
        genre,

        audioUrl: audioUpload.secure_url,
        coverUrl,

        uploadedBy: req.user._id,

        cloudinaryAudioId: audioUpload.public_id,
        cloudinaryCoverId: coverUrl
          ? coverUpload.public_id
          : "",

        featured: false,
        trending: false,
        newRelease: true,
      });

      res.status(201).json({
        success: true,
        song,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        success: false,
        message: "Upload failed",
      });
    }
  }
);

module.exports = router;