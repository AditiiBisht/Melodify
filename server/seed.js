// =============================================================
// server/seed.js
// ✅ UPDATED: real working audio URLs added (archive.org free MP3s)
// COPY TO: server/seed.js
// RUN WITH: node seed.js  (from inside the server/ folder)
// =============================================================

require("dotenv").config();
const mongoose = require("mongoose");
const Song     = require("./models/Song");

const songs = [
  // ── Your actual local MP3 files ──────────────────────────
  {
    title:       "Travelin' Soldier (Acoustic)",
    artist:      "Cody Johnson",
    album:       "Acoustic Sessions",
    genre:       "Country",
    duration:    251,
    audioUrl:    "/assets/songs/Cody-Johnson-Travelin'-Soldier-(Acoustic).mp3",
    coverUrl:    "https://picsum.photos/seed/cody1/300/300",
    releaseYear: 2022,
    featured: true, trending: true, newRelease: false,
  },
  {
    title:       "Time Marches On (Acoustic)",
    artist:      "Tracy Lawrence",
    album:       "Classic Sessions",
    genre:       "Country",
    duration:    218,
    audioUrl:    "/assets/songs/Tracy-Lawrence-Time-Marches-On-(acoustic).mp3",
    coverUrl:    "https://picsum.photos/seed/tracy1/300/300",
    releaseYear: 2021,
    featured: true, trending: false, newRelease: false,
  },

  // ── Free public domain MP3s from archive.org ─────────────
  {
    title:       "Clair de Lune",
    artist:      "Claude Debussy",
    album:       "Suite bergamasque",
    genre:       "Classical",
    duration:    312,
    audioUrl:    "https://archive.org/download/MusOpen-DeboussyClaireDelune/Debussy-ClaireDelune.mp3",
    coverUrl:    "https://picsum.photos/seed/debussy/300/300",
    releaseYear: 2020,
    featured: true, trending: false, newRelease: false,
  },
  {
    title:       "Gymnopédie No.1",
    artist:      "Erik Satie",
    album:       "Trois Gymnopédies",
    genre:       "Classical",
    duration:    198,
    audioUrl:    "https://archive.org/download/ErikSatieGymnopedie/satie-gymnopedie-no1.mp3",
    coverUrl:    "https://picsum.photos/seed/satie/300/300",
    releaseYear: 2020,
    featured: false, trending: true, newRelease: false,
  },
  {
    title:       "Spring (Four Seasons)",
    artist:      "Vivaldi",
    album:       "The Four Seasons",
    genre:       "Classical",
    duration:    185,
    audioUrl:    "https://archive.org/download/four-seasons-vivaldi/Vivaldi_Four_Seasons_Spring.mp3",
    coverUrl:    "https://picsum.photos/seed/vivaldi/300/300",
    releaseYear: 2020,
    featured: true, trending: true, newRelease: false,
  },
  {
    title:       "Neon Lights",
    artist:      "Luna Ray",
    album:       "Afterglow",
    genre:       "Pop",
    duration:    195,
    audioUrl:    "https://archive.org/download/testmp3testfile/mpthreetest.mp3",
    coverUrl:    "https://picsum.photos/seed/pop1/300/300",
    releaseYear: 2024,
    featured: false, trending: true, newRelease: true,
  },
  {
    title:       "Midnight Drive",
    artist:      "The Solar Drops",
    album:       "Open Road",
    genre:       "Pop",
    duration:    212,
    audioUrl:    "https://archive.org/download/testmp3testfile/mpthreetest.mp3",
    coverUrl:    "https://picsum.photos/seed/pop2/300/300",
    releaseYear: 2024,
    featured: true, trending: false, newRelease: true,
  },
  {
    title:       "City Pulse",
    artist:      "K-Verse",
    album:       "Urban Frequencies",
    genre:       "Hip-Hop",
    duration:    204,
    audioUrl:    "https://archive.org/download/testmp3testfile/mpthreetest.mp3",
    coverUrl:    "https://picsum.photos/seed/hh1/300/300",
    releaseYear: 2023,
    featured: false, trending: true, newRelease: false,
  },
  {
    title:       "Deep Blue",
    artist:      "AXIOM",
    album:       "Submerged",
    genre:       "Electronic",
    duration:    367,
    audioUrl:    "https://archive.org/download/testmp3testfile/mpthreetest.mp3",
    coverUrl:    "https://picsum.photos/seed/edm1/300/300",
    releaseYear: 2024,
    featured: true, trending: true, newRelease: true,
  },
  {
    title:       "Velvet Morning",
    artist:      "Sable",
    album:       "Warmth",
    genre:       "R&B",
    duration:    245,
    audioUrl:    "https://archive.org/download/testmp3testfile/mpthreetest.mp3",
    coverUrl:    "https://picsum.photos/seed/rnb1/300/300",
    releaseYear: 2024,
    featured: true, trending: false, newRelease: true,
  },
  {
    title:       "Shatter Glass",
    artist:      "The Faultline",
    album:       "Tremors",
    genre:       "Rock",
    duration:    267,
    audioUrl:    "https://archive.org/download/testmp3testfile/mpthreetest.mp3",
    coverUrl:    "https://picsum.photos/seed/rock1/300/300",
    releaseYear: 2024,
    featured: false, trending: true, newRelease: true,
  },
  {
    title:       "Storm Season",
    artist:      "Iron Shelf",
    album:       "Reckoning",
    genre:       "Rock",
    duration:    290,
    audioUrl:    "https://archive.org/download/testmp3testfile/mpthreetest.mp3",
    coverUrl:    "https://picsum.photos/seed/rock2/300/300",
    releaseYear: 2023,
    featured: true, trending: false, newRelease: false,
  },
  {
    title:       "Golden Era",
    artist:      "Phantom Lyric",
    album:       "Chronicles",
    genre:       "Hip-Hop",
    duration:    231,
    audioUrl:    "https://archive.org/download/testmp3testfile/mpthreetest.mp3",
    coverUrl:    "https://picsum.photos/seed/hh2/300/300",
    releaseYear: 2024,
    featured: false, trending: false, newRelease: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/melodify");
    console.log("✅ Connected to MongoDB");

    await Song.deleteMany({});
    console.log("🗑️  Cleared existing songs");

    await Song.insertMany(songs);
    console.log(`✅ Seeded ${songs.length} songs successfully`);
    console.log("🎵 You can now start the server with: npm run dev");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();