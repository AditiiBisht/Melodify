// =============================================================
// server/server.js
// ✅ BUG FIX: static path changed from "../Frontend/assets"
//    to "../client/assets" (your folder is named "client")
// COPY TO: server/server.js
// =============================================================

require("dotenv").config();

const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const path     = require("path");

const authRoutes     = require("./routes/authRoutes");
const songRoutes     = require("./routes/songs");
const playlistRoutes = require("./routes/playlists");
const userRoutes     = require("./routes/user");
const uploadRoutes = require("./routes/upload");

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// ✅ Fixed: was "../Frontend/assets" but your folder is "client"
app.use("/assets", express.static(path.join(__dirname, "../client/assets")));

// ── MongoDB ───────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/melodify")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/songs",     songRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/user",      userRoutes);
app.use("/api/upload", uploadRoutes);

// ── Health check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "🎵 Melodify API is running" });
});

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong." });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});