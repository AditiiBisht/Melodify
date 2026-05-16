// =============================================================
// client/js/discover.js
// ⚠️  THIS FILE WAS EMPTY — COPY TO: client/js/discover.js
// Populates .track-list (charts) and .releases-scroll (albums)
// with real data from MongoDB via the backend API.
// Wires search (#heroInput) and genre chips (#genreStrip).
// =============================================================

document.addEventListener("DOMContentLoaded", async function () {

  // ── Grab existing DOM containers ─────────────────────────
  const heroInput      = document.getElementById("heroInput");
  const genreStrip     = document.getElementById("genreStrip");
  const releasesScroll = document.querySelector(".releases-scroll");
  // The two chart panels — first = Global Top 5, second = New Entries
  const chartPanels    = document.querySelectorAll(".chart-panel");
  const globalTrackList = chartPanels[0]?.querySelector(".track-list");
  const newTrackList    = chartPanels[1]?.querySelector(".track-list");

  // ── Fetch from backend ────────────────────────────────────
  async function getSongs(params) {
    const qs = new URLSearchParams(params).toString();
    const { ok, data } = await apiFetch("/songs?" + qs);
    return ok ? (data.songs || []) : [];
  }

  // ── Format duration ───────────────────────────────────────
  const fmtDur = s => (!s) ? "—" : `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;

  // ── Build chart track row (matches .track-row CSS already in page) ──
  function makeChartRow(song, index, allSongs) {
    const colors = ["tart-1","tart-2","tart-3","tart-4","tart-5","tart-6","tart-7","tart-8","tart-9","tart-10"];
    const row = document.createElement("div");
    row.className = "track-row";
    row.style.cursor = "pointer";
    row.innerHTML = `
      <div class="tr-num">${String(index+1).padStart(2,"0")}</div>
      <div class="tr-art ${colors[index % colors.length]}"></div>
      <div>
        <div class="tr-info-name">${song.title}</div>
        <div class="tr-info-art">${song.artist}</div>
      </div>
      <div class="tr-change ${index < 3 ? "up" : "same"}">${index < 3 ? "↑"+(index+1) : "—"}</div>
      <div class="tr-dur">${fmtDur(song.duration)}</div>`;
    row.addEventListener("click", () => window.Player?.playAll(allSongs, index));
    row.addEventListener("mouseenter", () => row.style.background = "rgba(255,255,255,.05)");
    row.addEventListener("mouseleave", () => row.style.background = "");
    return row;
  }

  // ── Build album release card (matches .album-card CSS already in page) ──
  function makeAlbumCard(song, index, allSongs) {
    const bgs = ["alb1","alb2","alb3","alb4","alb5","alb6","alb7","alb8"];
    const card = document.createElement("div");
    card.className = "album-card";
    card.style.cursor = "pointer";
    card.innerHTML = `
      <div class="album-art">
        <div class="album-art-bg ${bgs[index % bgs.length]}"></div>
        <div class="album-art-overlay">
          <button class="album-play-btn" title="Play">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M5 3L15 9L5 15V3Z" fill="white"/>
            </svg>
          </button>
        </div>
        ${song.newRelease ? '<div class="album-new-badge">New</div>' : ""}
      </div>
      <div class="album-name">${song.title}</div>
      <div class="album-artist">${song.artist}</div>
      <div class="album-meta">
        <span>${song.album || "Single"}</span>
        <div class="album-dot"></div>
        <span>${fmtDur(song.duration)}</span>
        <div class="album-dot"></div>
        <span>${song.releaseYear || 2026}</span>
      </div>`;
    card.querySelector(".album-play-btn").addEventListener("click", e => {
      e.stopPropagation();
      window.Player?.playAll(allSongs, index);
    });
    card.addEventListener("click", () => window.Player?.playAll(allSongs, index));
    return card;
  }

  // ── Load Global Top 5 chart ───────────────────────────────
  async function loadGlobalChart() {
    if (!globalTrackList) return;
    const songs = await getSongs({ limit: 5 });
    if (!songs.length) return;
    globalTrackList.innerHTML = "";
    songs.forEach((s, i) => globalTrackList.appendChild(makeChartRow(s, i, songs)));
  }

  // ── Load New Entries chart ────────────────────────────────
  async function loadNewEntries() {
    if (!newTrackList) return;
    const songs = await getSongs({ newRelease: "true", limit: 5 });
    if (!songs.length) return;
    newTrackList.innerHTML = "";
    songs.forEach((s, i) => newTrackList.appendChild(makeChartRow(s, i, songs)));
  }

  // ── Load New Releases scroll ──────────────────────────────
  async function loadReleases() {
    if (!releasesScroll) return;
    const songs = await getSongs({ limit: 8 });
    if (!songs.length) return;
    releasesScroll.innerHTML = "";
    songs.forEach((s, i) => releasesScroll.appendChild(makeAlbumCard(s, i, songs)));
  }

  // ── Search (wired to existing #heroInput) ─────────────────
  // Dynamically create a results section below the hero
  function ensureSearchSection() {
    let sec = document.getElementById("mel-search-section");
    if (sec) return sec;
    sec = document.createElement("section");
    sec.id = "mel-search-section";
    sec.style.cssText = "padding:0 60px 48px;display:none;";
    sec.innerHTML = `
      <div class="sec-head">
        <div>
          <div class="sec-label">🔍 Search</div>
          <div class="sec-title" id="mel-search-title">Results</div>
        </div>
      </div>
      <div id="mel-search-list" style="display:flex;flex-direction:column;gap:2px;"></div>`;
    // Insert right after the hero-search section
    const hero = document.querySelector(".hero-search") || document.querySelector(".hero-section");
    if (hero?.parentNode) hero.parentNode.insertBefore(sec, hero.nextSibling);
    else document.body.appendChild(sec);
    return sec;
  }

  function makeSearchRow(song, index, allSongs) {
    const row = document.createElement("div");
    row.className = "track-row";
    row.style.cssText = "cursor:pointer;padding:10px 16px;border-radius:10px;transition:background .15s;display:grid;grid-template-columns:32px 44px 1fr 1fr 52px;align-items:center;gap:14px;";
    row.innerHTML = `
      <div class="tr-num" style="text-align:center;color:var(--muted,#888)">${index+1}</div>
      <div style="width:44px;height:44px;border-radius:8px;overflow:hidden;background:linear-gradient(135deg,#1a0533,#8a2be2);">
        ${song.coverUrl ? `<img src="${song.coverUrl}" style="width:100%;height:100%;object-fit:cover;" loading="lazy"/>` : ""}
      </div>
      <div>
        <div style="font-size:.88rem;font-weight:500;">${song.title}</div>
        <div style="font-size:.75rem;color:var(--muted,#888)">${song.artist}</div>
      </div>
      <div style="font-size:.82rem;color:var(--muted,#888)">${song.album||"—"}</div>
      <div style="font-size:.78rem;color:var(--muted,#888);text-align:right">${fmtDur(song.duration)}</div>`;
    row.addEventListener("mouseenter", () => row.style.background = "rgba(255,255,255,.05)");
    row.addEventListener("mouseleave", () => row.style.background = "");
    row.addEventListener("click", () => window.Player?.playAll(allSongs, index));
    return row;
  }

  let searchTimer = null;
  heroInput?.addEventListener("input", function () {
    clearTimeout(searchTimer);
    const q = heroInput.value.trim();
    const sec = document.getElementById("mel-search-section");
    if (!q) { if (sec) sec.style.display = "none"; return; }
    searchTimer = setTimeout(async () => {
      const section = ensureSearchSection();
      const list    = document.getElementById("mel-search-list");
      const title   = document.getElementById("mel-search-title");
      section.style.display = "block";
      if (list) list.innerHTML = `<div style="padding:16px;color:var(--muted,#888)">Searching…</div>`;
      const songs = await getSongs({ search: q, limit: 20 });
      if (title) title.textContent = `${songs.length} results for "${q}"`;
      if (list) {
        list.innerHTML = "";
        if (!songs.length) {
          list.innerHTML = `<div style="padding:24px;text-align:center;color:var(--muted,#888)">No results for "${q}"</div>`;
          return;
        }
        songs.forEach((s, i) => list.appendChild(makeSearchRow(s, i, songs)));
      }
    }, 300);
  });

  // Also handle clicking the search button if present
  document.querySelector(".big-search-btn")?.addEventListener("click", () => {
    if (heroInput?.value.trim()) heroInput.dispatchEvent(new Event("input"));
  });
  heroInput?.addEventListener("keydown", e => {
    if (e.key === "Enter" && heroInput.value.trim()) heroInput.dispatchEvent(new Event("input"));
  });

  // ── Genre strip chips ─────────────────────────────────────
  const genreMap = {
    pop:"Pop", hiphop:"Hip-Hop", electronic:"Electronic",
    rnb:"R&B", rock:"Rock", country:"Country", jazz:"Jazz",
    classical:"Classical", lofi:"Lo-fi", ambient:"Ambient",
    metal:"Metal", latin:"Latin", indie:"Indie"
  };

  genreStrip?.addEventListener("click", async function (e) {
    const chip = e.target.closest(".genre-chip");
    if (!chip) return;
    document.querySelectorAll(".genre-chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");

    const g = chip.dataset.g;
    if (g === "all") { loadGlobalChart(); loadNewEntries(); loadReleases(); return; }

    const genre = genreMap[g] || g;
    if (globalTrackList) {
      globalTrackList.innerHTML = `<div style="padding:16px;color:var(--muted,#888)">Loading ${genre}…</div>`;
      const songs = await getSongs({ genre, limit: 5 });
      globalTrackList.innerHTML = "";
      if (!songs.length) {
        globalTrackList.innerHTML = `<div style="padding:16px;color:var(--muted,#888)">No ${genre} tracks yet.</div>`;
      } else {
        songs.forEach((s, i) => globalTrackList.appendChild(makeChartRow(s, i, songs)));
      }
    }
    if (releasesScroll) {
      const songs2 = await getSongs({ genre, limit: 8 });
      if (songs2.length) {
        releasesScroll.innerHTML = "";
        songs2.forEach((s, i) => releasesScroll.appendChild(makeAlbumCard(s, i, songs2)));
      }
    }
  });

  // ── Trending tag clicks (tt-chip elements in discover.html) ──
  window.fillSearch = function (el) {
    if (!heroInput) return;
    heroInput.value = el.textContent.trim();
    heroInput.dispatchEvent(new Event("input"));
    heroInput.scrollIntoView({ behavior: "smooth" });
  };

  // ── Initial load ──────────────────────────────────────────
  Promise.all([loadGlobalChart(), loadNewEntries(), loadReleases()]);
});