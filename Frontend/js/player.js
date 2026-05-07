// js/player.js  — persistent bottom music player (Spotify-style)
// Included on every page. Reads/writes to sessionStorage so the
// currently-playing track survives page navigations.
// ──────────────────────────────────────────────────────────────

(function () {
  // ── State ──────────────────────────────────────────────
  let queue      = [];   // array of song objects
  let queueIndex = 0;
  let shuffled   = false;
  let repeatMode = 0;    // 0 = off, 1 = repeat all, 2 = repeat one

  const audio = new Audio();
  audio.preload = "metadata";

  // ── DOM ────────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);

  const playerBar      = $("player-bar");
  const coverEl        = $("player-cover");
  const titleEl        = $("player-title");
  const artistEl       = $("player-artist");
  const likeBtn        = $("player-like");
  const prevBtn        = $("player-prev");
  const playPauseBtn   = $("player-play");
  const nextBtn        = $("player-next");
  const shuffleBtn     = $("player-shuffle");
  const repeatBtn      = $("player-repeat");
  const progressBar    = $("player-progress");
  const progressFill   = $("player-progress-fill");
  const currentTimeEl  = $("player-current-time");
  const durationEl     = $("player-duration");
  const volumeSlider   = $("player-volume");
  const muteBtn        = $("player-mute");

  if (!playerBar) return; // player HTML not on this page

  // ── Format time ────────────────────────────────────────
  function fmt(secs) {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // ── Load & play a song object ───────────────────────────
  function loadSong(song) {
    if (!song) return;

    audio.src = song.audioUrl || "";
    coverEl.src        = song.coverUrl  || "https://picsum.photos/seed/default/60/60";
    titleEl.textContent  = song.title   || "Unknown";
    artistEl.textContent = song.artist  || "Unknown Artist";
    likeBtn.dataset.id   = song._id || song.id || "";

    // Highlight liked state
    const likedSongs = JSON.parse(localStorage.getItem("melodify_liked") || "[]");
    likeBtn.classList.toggle("liked", likedSongs.includes(likeBtn.dataset.id));

    // Save to session so it survives navigation
    sessionStorage.setItem("melodify_current", JSON.stringify(song));
    sessionStorage.setItem("melodify_queue",   JSON.stringify(queue));
    sessionStorage.setItem("melodify_qidx",    queueIndex);

    playerBar.classList.add("active");
    audio.play().catch(() => {});
    setPlayIcon(true);

    // Log play to backend
    if (Auth.isLoggedIn() && (song._id || song.id)) {
      const id = song._id || song.id;
      apiFetch(`/songs/${id}/play`, { method: "POST" });
      if (Auth.isLoggedIn()) {
        apiFetch(`/user/recently-played/${id}`, { method: "POST" });
      }
    }
  }

  function setPlayIcon(playing) {
    playPauseBtn.innerHTML = playing
      ? `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M8 5v14l11-7z"/></svg>`;
  }

  // ── Public API ─────────────────────────────────────────
  window.Player = {
    // Play a single song (replaces queue)
    play(song) {
      queue      = [song];
      queueIndex = 0;
      loadSong(song);
    },

    // Play a list of songs (e.g. whole playlist)
    playAll(songs, startIndex = 0) {
      if (!songs || !songs.length) return;
      queue      = songs;
      queueIndex = startIndex;
      loadSong(songs[startIndex]);
    },

    // Add song to end of queue
    addToQueue(song) {
      queue.push(song);
      sessionStorage.setItem("melodify_queue", JSON.stringify(queue));
      showToast("Added to queue");
    },

    current() {
      return queue[queueIndex] || null;
    },
  };

  // ── Controls ────────────────────────────────────────────
  playPauseBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      setPlayIcon(true);
    } else {
      audio.pause();
      setPlayIcon(false);
    }
  });

  prevBtn.addEventListener("click", () => {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (queueIndex > 0) {
      queueIndex--;
      loadSong(queue[queueIndex]);
    }
  });

  nextBtn.addEventListener("click", () => {
    playNext();
  });

  function playNext() {
    if (repeatMode === 2) {
      audio.currentTime = 0;
      audio.play();
      return;
    }
    if (queueIndex < queue.length - 1) {
      queueIndex++;
      loadSong(queue[queueIndex]);
    } else if (repeatMode === 1) {
      queueIndex = 0;
      loadSong(queue[queueIndex]);
    } else {
      audio.pause();
      setPlayIcon(false);
    }
  }

  audio.addEventListener("ended", playNext);

  // ── Shuffle ────────────────────────────────────────────
  shuffleBtn.addEventListener("click", () => {
    shuffled = !shuffled;
    shuffleBtn.classList.toggle("active", shuffled);
    if (shuffled && queue.length > 1) {
      // Shuffle remaining queue keeping current song first
      const current = queue[queueIndex];
      const rest    = queue.filter((_, i) => i !== queueIndex);
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      queue      = [current, ...rest];
      queueIndex = 0;
    }
  });

  // ── Repeat ─────────────────────────────────────────────
  repeatBtn.addEventListener("click", () => {
    repeatMode = (repeatMode + 1) % 3;
    repeatBtn.dataset.mode = repeatMode;
    const icons = ["🔁", "🔁", "🔂"];
    repeatBtn.textContent = icons[repeatMode];
    repeatBtn.title = ["Repeat Off", "Repeat All", "Repeat One"][repeatMode];
  });

  // ── Progress bar ───────────────────────────────────────
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = pct + "%";
    currentTimeEl.textContent = fmt(audio.currentTime);
    durationEl.textContent    = fmt(audio.duration);
  });

  audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = fmt(audio.duration);
  });

  progressBar.addEventListener("click", (e) => {
    const rect = progressBar.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });

  // Drag scrubbing
  let dragging = false;
  progressBar.addEventListener("mousedown", () => (dragging = true));
  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const rect = progressBar.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    progressFill.style.width = pct * 100 + "%";
    currentTimeEl.textContent = fmt(pct * audio.duration);
  });
  document.addEventListener("mouseup", (e) => {
    if (!dragging) return;
    dragging = false;
    const rect = progressBar.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
  });

  // ── Volume ─────────────────────────────────────────────
  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;
    muteBtn.textContent = audio.volume === 0 ? "🔇" : audio.volume < 0.5 ? "🔉" : "🔊";
  });

  muteBtn.addEventListener("click", () => {
    audio.muted = !audio.muted;
    muteBtn.textContent = audio.muted ? "🔇" : "🔊";
  });

  // ── Like from player ───────────────────────────────────
  likeBtn.addEventListener("click", async () => {
    const id = likeBtn.dataset.id;
    if (!id) return;
    if (!Auth.isLoggedIn()) { window.location.href = "login.html"; return; }

    const { ok, data } = await apiFetch(`/songs/${id}/like`, { method: "POST" });
    if (!ok) return;

    // Update local liked list
    let liked = JSON.parse(localStorage.getItem("melodify_liked") || "[]");
    if (data.liked) {
      liked.push(id);
      likeBtn.classList.add("liked");
    } else {
      liked = liked.filter((x) => x !== id);
      likeBtn.classList.remove("liked");
    }
    localStorage.setItem("melodify_liked", JSON.stringify(liked));
    showToast(data.message);
  });

  // ── Keyboard shortcuts ──────────────────────────────────
  document.addEventListener("keydown", (e) => {
    // Don't hijack input fields
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.code === "Space") { e.preventDefault(); playPauseBtn.click(); }
    if (e.code === "ArrowRight") audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    if (e.code === "ArrowLeft")  audio.currentTime = Math.max(0, audio.currentTime - 10);
    if (e.code === "ArrowUp")    { volumeSlider.value = Math.min(1, parseFloat(volumeSlider.value) + 0.1); audio.volume = volumeSlider.value; }
    if (e.code === "ArrowDown")  { volumeSlider.value = Math.max(0, parseFloat(volumeSlider.value) - 0.1); audio.volume = volumeSlider.value; }
  });

  // ── Restore on page load ───────────────────────────────
  const savedSong  = sessionStorage.getItem("melodify_current");
  const savedQueue = sessionStorage.getItem("melodify_queue");
  const savedIdx   = sessionStorage.getItem("melodify_qidx");

  if (savedSong) {
    const song = JSON.parse(savedSong);
    if (savedQueue) queue      = JSON.parse(savedQueue);
    if (savedIdx)   queueIndex = parseInt(savedIdx);

    coverEl.src          = song.coverUrl  || "https://picsum.photos/seed/default/60/60";
    titleEl.textContent  = song.title     || "Unknown";
    artistEl.textContent = song.artist    || "Unknown Artist";
    likeBtn.dataset.id   = song._id || song.id || "";
    durationEl.textContent = fmt(song.duration);
    playerBar.classList.add("active");
    setPlayIcon(false); // paused state on restore
  }
})();

// ── Toast notification ──────────────────────────────────
function showToast(msg) {
  let toast = document.getElementById("melodify-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "melodify-toast";
    toast.style.cssText = `
      position:fixed; bottom:100px; left:50%; transform:translateX(-50%);
      background:#ff3d6e; color:#fff; padding:10px 22px; border-radius:24px;
      font-size:13px; font-weight:600; z-index:9999;
      opacity:0; transition:opacity .3s; pointer-events:none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (toast.style.opacity = "0"), 2500);
}