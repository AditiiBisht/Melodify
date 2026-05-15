const Song = require("../models/Song");

// ─────────────────────────────────────────────
// Upload Song Controller
// ─────────────────────────────────────────────
const uploadSong = async (req, res) => {
  try {

    let title = "Unknown Title";
    let artist = "Unknown Artist";

    let songFile = null;
    let imageFile = null;

    // Loop through uploaded files
    req.files.forEach((file) => {

      // Song file
      if (file.fieldname === "song") {
        songFile = file;
      }

      // Image file
      else if (file.fieldname === "image") {
        imageFile = file;
      }

      // Title text
      else if (file.fieldname === "title") {
   title = file.buffer?.toString() || "Unknown Title";
      }

      // Artist text
      else if (file.fieldname === "artist") {
       artist = file.buffer?.toString() || "Unknown Artist";
      }

    });

    // Validation
    if (!songFile || !imageFile) {
      return res.status(400).json({
        success: false,
        error: "Song and image are required",
      });
    }

    // Create new song document
    const newSong = new Song({
      title,
      artist,
      audioUrl: songFile.path,
      coverUrl: imageFile.path,
    });

    // Save to MongoDB
    await newSong.save();

    // Success response
    res.status(201).json({
      success: true,
      message: "Song uploaded successfully",
      song: newSong,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });

  }
};

// ─────────────────────────────────────────────
// Get All Songs Controller
// ─────────────────────────────────────────────
const getSongs = async (req, res) => {
  try {

    const songs = await Song.find();

    res.json(songs);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch songs",
    });

  }
};

module.exports = {
  uploadSong,
  getSongs,
};