// =============================================================
// client/js/library.js
// ⚠️  THIS FILE WAS EMPTY — COPY TO: client/js/library.js
// Populates #trackList with real liked songs from MongoDB.
// Wires #songSearch filter and #sortSelect sorting.
// Populates recently played section.
// =============================================================

document.addEventListener("DOMContentLoaded", async function () {

  // Redirect to login if not authenticated
  if (!Auth.isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const user = Auth.user();

  // ── DOM elements (matching library.html exactly) ──────────
  const trackList   = document.getElementById("trackList");
  const songSearch  = document.getElementById("songSearch");
  const sortSelect  = document.getElementById("sortSelect");
  const lbPlayBtn   = document.querySelector(".lb-play-btn");
  const lbTitle     = document.querySelector(".lb-title");
  const lbMeta      = document.querySelector(".lb-meta");
  const recentScroll= document.querySelector(".recent-scroll");
  const filterChips = document.querySelectorAll(".tf-chip");

  // Track all loaded songs for in-page filtering
  let allSongs    = [];
  let activeFilter = "all";

  // ── Format helpers ────────────────────────────────────────
  const fmtDur = s => (!s) ? "—" : `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;
  const timeAgo = d => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff/60000), hrs = Math.floor(diff/3600000), days = Math.floor(diff/86400000);
    if (mins < 1)   return "Just now";
    if (mins < 60)  return mins + " min ago";
    if (hrs < 24)   return hrs + " hr ago";
    if (days < 7)   return days + " days ago";
    return new Date(d).toLocaleDateString();
  };

  // ── Build a track table row ───────────────────────────────
  function makeRow(song, index, songArr) {
    const liked = JSON.parse(localStorage.getItem("mel_liked") || "[]");
    const isLiked = liked.includes(song._id);
    const row = document.createElement("div");
    row.className = "track-row";
    row.dataset.id     = song._id;
    row.dataset.title  = (song.title  || "").toLowerCase();
    row.dataset.artist = (song.artist || "").toLowerCase();
    // Match the table-head columns: # | thumb | title+artist | album | added | like | time
    row.style.cssText = "display:grid;grid-template-columns:32px 44px 1fr 1fr 90px 36px 52px;align-items:center;gap:14px;padding:10px 16px;border-radius:10px;cursor:pointer;transition:background .15s;";
    row.innerHTML = `
      <div style="text-align:center;color:var(--muted,#888);font-size:13px;">${index+1}</div>
      <div style="width:40px;height:40px;border-radius:8px;overflow:hidden;background:linear-gradient(135deg,#1a0533,#8a2be2,#ff3d6e);">
        ${song.coverUrl ? `<img src="${song.coverUrl}" style="width:100%;height:100%;object-fit:cover;" loading="lazy"/>` : ""}
      </div>
      <div>
        <div style="font-size:.88rem;font-weight:500;color:var(--text,#f0eeff);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${song.title}</div>
        <div style="font-size:.75rem;color:var(--muted,#888)">${song.artist}</div>
      </div>
      <div style="font-size:.82rem;color:var(--muted,#888);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${song.album||"—"}</div>
      <div style="font-size:.75rem;color:var(--muted,#888)">Liked</div>
      <button class="like-btn" data-id="${song._id}" title="${isLiked?"Unlike":"Like"}"
        style="background:none;border:none;cursor:pointer;font-size:16px;color:${isLiked?"#ff3d6e":"var(--muted,#888)"};transition:color .2s,transform .2s;">♥</button>
      <div style="font-size:.78rem;color:var(--muted,#888);text-align:right;">${fmtDur(song.duration)}</div>`;

    row.addEventListener("mouseenter", () => row.style.background = "rgba(255,255,255,.05)");
    row.addEventListener("mouseleave", () => row.style.background = "");
    row.addEventListener("click", e => {
      if (e.target.classList.contains("like-btn")) return;
      window.Player?.playAll(songArr, index);
    });

    // Like/unlike button
    row.querySelector(".like-btn").addEventListener("click", async function (e) {
      e.stopPropagation();
      const { ok, data } = await apiFetch(`/songs/${song._id}/like`, { method: "POST" });
      if (!ok) return;
      let liked2 = JSON.parse(localStorage.getItem("mel_liked") || "[]");
      if (data.liked) {
        liked2.push(song._id);
        this.style.color = "#ff3d6e";
        showToast("♥ Added to Liked Songs", "success");
      } else {
        liked2 = liked2.filter(x => x !== song._id);
        this.style.color = "var(--muted,#888)";
        showToast("Removed from Liked Songs", "info");
        // If in "liked" filter view, hide this row
        if (activeFilter === "liked") row.style.display = "none";
      }
      localStorage.setItem("mel_liked", JSON.stringify(liked2));
    });

    return row;
  }

  // ── Render track list ─────────────────────────────────────
  function renderTracks(songs) {
    if (!trackList) return;
    trackList.innerHTML = "";
    if (!songs.length) {
      trackList.innerHTML = `<div style="padding:40px;text-align:center;color:var(--muted,#888)">
        No songs found. Go to <a href="discover.html" style="color:#ff3d6e">Discover</a> and like some tracks! ♥</div>`;
      return;
    }
    songs.forEach((s, i) => trackList.appendChild(makeRow(s, i, songs)));
  }

  // ── Load liked songs from API ─────────────────────────────
  async function loadLikedSongs() {
    if (!trackList) return;
    trackList.innerHTML = `<div style="padding:24px;color:var(--muted,#888)">Loading your songs…</div>`;

    const { ok, data } = await apiFetch("/user/liked");
    if (!ok) {
      trackList.innerHTML = `<div style="padding:24px;color:#ff3d6e">Could not load songs. Is the server running?</div>`;
      return;
    }
    allSongs = data.songs || [];

    // Update liked banner stats
    if (lbTitle) lbTitle.textContent = "Liked Songs";
    if (lbMeta) {
      lbMeta.innerHTML = `
        <div class="lb-meta-item"><strong>${allSongs.length}</strong> tracks</div>
        <div class="lb-meta-item"><strong>${Math.round(allSongs.reduce((a,s)=>a+(s.duration||0),0)/3600 * 10)/10}h</strong> total</div>`;
    }

    // Save liked IDs to localStorage for player sync
    const likedIds = allSongs.map(s => s._id);
    localStorage.setItem("mel_liked", JSON.stringify(likedIds));

    renderTracks(allSongs);
  }

  // ── Load recently played ──────────────────────────────────
  async function loadRecentlyPlayed() {
    if (!recentScroll) return;
    const { ok, data } = await apiFetch("/user/recently-played");
    if (!ok || !data.recentlyPlayed?.length) return;

    const songs = data.recentlyPlayed.map(e => e.song).filter(Boolean);
    if (!songs.length) return;

    // Replace static placeholder cards with real data
    recentScroll.innerHTML = "";
    const bgs = ["rca1","rca2","rca3","rca4","rca5","rca6","rca7","rca8"];
    songs.slice(0, 8).forEach((song, i) => {
      const card = document.createElement("div");
      card.className = "recent-card";
      card.style.cursor = "pointer";
      card.innerHTML = `
        <div class="rc-art">
          <div class="rc-art-bg ${bgs[i % bgs.length]}"></div>
          <div class="rc-overlay">
            <button class="rc-play">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 2L11 7L3 12V2Z" fill="white"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="rc-body">
          <div class="rc-name">${song.title}</div>
          <div class="rc-sub">${song.artist}</div>
          <div class="rc-time">${timeAgo(data.recentlyPlayed[i]?.playedAt)}</div>
        </div>`;
      card.addEventListener("click", () => window.Player?.playAll(songs, i));
      recentScroll.appendChild(card);
    });
  }

  // ── Play All button (liked songs banner) ──────────────────
  lbPlayBtn?.addEventListener("click", () => {
    if (allSongs.length) window.Player?.playAll(allSongs, 0);
    else showToast("No songs to play yet", "info");
  });

  // ── Search filter (wired to #songSearch) ──────────────────
  songSearch?.addEventListener("input", function () {
    const q = this.value.trim().toLowerCase();
    const rows = trackList?.querySelectorAll(".track-row");
    rows?.forEach(row => {
      const match = !q
        || row.dataset.title?.includes(q)
        || row.dataset.artist?.includes(q);
      row.style.display = match ? "" : "none";
    });
  });

  // ── Sort select ───────────────────────────────────────────
  sortSelect?.addEventListener("change", function () {
    const val = this.value;
    let sorted = [...allSongs];
    if (val === "title")    sorted.sort((a,b) => (a.title||"").localeCompare(b.title||""));
    if (val === "artist")   sorted.sort((a,b) => (a.artist||"").localeCompare(b.artist||""));
    if (val === "duration") sorted.sort((a,b) => (b.duration||0) - (a.duration||0));
    // "recent" = default order from API
    renderTracks(sorted);
  });

  // ── Filter chips (All / Liked / Downloaded) ───────────────
  filterChips?.forEach(chip => {
    chip.addEventListener("click", function () {
      filterChips.forEach(c => c.classList.remove("active"));
      this.classList.add("active");
      activeFilter = this.dataset.filter || "all";
      // "liked" = all songs in this view are already liked
      // "downloaded" = placeholder (no offline yet)
      if (activeFilter === "downloaded") {
        trackList.innerHTML = `<div style="padding:40px;text-align:center;color:var(--muted,#888)">
          Offline downloads coming soon.</div>`;
        return;
      }
      renderTracks(allSongs);
    });
  });

  // ── Logout (any logout button in library) ─────────────────
  document.querySelectorAll("[data-action='logout'], #logoutBtn, .logout-btn").forEach(btn => {
    btn.addEventListener("click", () => Auth.logout());
  });

  // ── Initial load ──────────────────────────────────────────
  await Promise.all([loadLikedSongs(), loadRecentlyPlayed()]);
});