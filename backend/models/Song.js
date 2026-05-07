const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Song title is required"],
      trim: true,
    },
    artist: {
      type: String,
      required: [true, "Artist is required"],
      trim: true,
    },
    album: {
      type: String,
      default: "Single",
      trim: true,
    },
    genre: {
      type: String,
      default: "Unknown",
    },
    duration: {
      type: Number,
      default: 0,
    },
    audioUrl: {
      type: String,
      required: [true, "Audio URL is required"],
    },
    coverUrl: {
      type: String,
      default: "",
    },
    releaseYear: {
      type: Number,
      default: new Date().getFullYear(),
    },
    plays: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    newRelease: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Song", songSchema);