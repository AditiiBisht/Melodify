// backend/seed.js
// Run: node seed.js  (make sure MongoDB is running first)

require("dotenv").config();
const mongoose = require("mongoose");
const Song = require("./models/Song");

const songs = [
  // ── Country ──────────────────────────────────
  {
    title: "Travelin' Soldier (Acoustic)",
    artist: "Cody Johnson",
    album: "Acoustic Sessions",
    genre: "Country",
    duration: 251,
    audioUrl: "/assets/songs/Cody-Johnson-Travelin'-Soldier-(Acoustic).mp3",
    coverUrl: "https://picsum.photos/seed/cody1/300/300",
    releaseYear: 2022,
    featured: true,
    trending: true,
    newRelease: false,
  },
  {
    title: "Time Marches On (Acoustic)",
    artist: "Tracy Lawrence",
    album: "Classic Sessions",
    genre: "Country",
    duration: 218,
    audioUrl: "/assets/songs/Tracy-Lawrence-Time-Marches-On-(acoustic).mp3",
    coverUrl: "https://picsum.photos/seed/tracy1/300/300",
    releaseYear: 2021,
    featured: true,
    trending: false,
    newRelease: false,
  },
  // ── Pop ──────────────────────────────────────
  {
    title: "Neon Lights",
    artist: "Luna Ray",
    album: "Afterglow",
    genre: "Pop",
    duration: 195,
    audioUrl: "",
    coverUrl: "https://picsum.photos/seed/pop1/300/300",
    releaseYear: 2024,
    featured: false,
    trending: true,
    newRelease: true,
  },
  {
    title: "Midnight Drive",
    artist: "The Solar Drops",
    album: "Open Road",
    genre: "Pop",
    duration: 212,
    audioUrl: "",
    coverUrl: "https://picsum.photos/seed/pop2/300/300",
    releaseYear: 2024,
    featured: true,
    trending: false,
    newRelease: true,
  },
  {
    title: "Electric Soul",
    artist: "NOVA",
    album: "Voltage",
    genre: "Pop",
    duration: 183,
    audioUrl: "",
    coverUrl: "https://picsum.photos/seed/pop3/300/300",
    releaseYear: 2024,
    featured: false,
    trending: true,
    newRelease: true,
  },
  // ── Hip-Hop ───────────────────────────────────
  {
    title: "City Pulse",
    artist: "K-Verse",
    album: "Urban Frequencies",
    genre: "Hip-Hop",
    duration: 204,
    audioUrl: "",
    coverUrl: "https://picsum.photos/seed/hh1/300/300",
    releaseYear: 2023,
    featured: false,
    trending: true,
    newRelease: false,
  },
  {
    title: "Golden Era",
    artist: "Phantom Lyric",
    album: "Chronicles",
    genre: "Hip-Hop",
    duration: 231,
    audioUrl: "",
    coverUrl: "https://picsum.photos/seed/hh2/300/300",
    releaseYear: 2024,
    featured: false,
    trending: false,
    newRelease: true,
  },
  // ── Electronic ────────────────────────────────
  {
    title: "Deep Blue",
    artist: "AXIOM",
    album: "Submerged",
    genre: "Electronic",
    duration: 367,
    audioUrl: "",
    coverUrl: "https://picsum.photos/seed/edm1/300/300",
    releaseYear: 2024,
    featured: true,
    trending: true,
    newRelease: true,
  },
  {
    title: "Pulse State",
    artist: "Circuit Zero",
    album: "Frequency",
    genre: "Electronic",
    duration: 298,
    audioUrl: "",
    coverUrl: "https://picsum.photos/seed/edm2/300/300",
    releaseYear: 2023,
    featured: false,
    trending: true,
    newRelease: false,
  },
  // ── R&B ───────────────────────────────────────
  {
    title: "Velvet Morning",
    artist: "Sable",
    album: "Warmth",
    genre: "R&B",
    duration: 245,
    audioUrl: "",
    coverUrl: "https://picsum.photos/seed/rnb1/300/300",
    releaseYear: 2024,
    featured: true,
    trending: false,
    newRelease: true,
  },
  {
    title: "Running Back",
    artist: "Jade Collins",
    album: "Between Lines",
    genre: "R&B",
    duration: 219,
    audioUrl: "",
    coverUrl: "https://picsum.photos/seed/rnb2/300/300",
    releaseYear: 2023,
    featured: false,
    trending: true,
    newRelease: false,
  },
  // ── Rock ──────────────────────────────────────
  {
    title: "Shatter Glass",
    artist: "The Faultline",
    album: "Tremors",
    genre: "Rock",
    duration: 267,
    audioUrl: "",
    coverUrl: "https://picsum.photos/seed/rock1/300/300",
    releaseYear: 2024,
    featured: false,
    trending: true,
    newRelease: true,
  },
  {
    title: "Storm Season",
    artist: "Iron Shelf",
    album: "Reckoning",
    genre: "Rock",
    duration: 290,
    audioUrl: "",
    coverUrl: "https://picsum.photos/seed/rock2/300/300",
    releaseYear: 2023,
    featured: true,
    trending: false,
    newRelease: false,
  },
];

async function seed() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/melodify"
    );
    console.log("✅ Connected to MongoDB");

    await Song.deleteMany({});
    console.log("🗑️  Cleared existing songs");

    await Song.insertMany(songs);
    console.log(`✅ Seeded ${songs.length} songs`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();