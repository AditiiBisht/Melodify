// ============================================================
// client/js/player.js
// COPY THIS FILE to: client/js/player.js
// Replaces the existing player.js — fixes the liked-songs key
// to match api.js (mel_liked) and adds better error handling.
// The player HTML IDs in your pages already match this file.
// ============================================================

(function () {
  "use strict";

  // ── State ─────────────────────────────────────────────────
  var queue      = [];
  var queueIndex = 0;
  var shuffled   = false;
  var repeatMode = 0; // 0=off 1=all 2=one

  var audio = new Audio();
  audio.preload = "metadata";
  audio.volume  = 0.8;

  // ── DOM ───────────────────────────────────────────────────
  var playerBar    = document.getElementById("player-bar");
  var coverEl      = document.getElementById("player-cover");
  var titleEl      = document.getElementById("player-title");
  var artistEl     = document.getElementById("player-artist");
  var likeBtn      = document.getElementById("player-like");
  var prevBtn      = document.getElementById("player-prev");
  var playBtn      = document.getElementById("player-play");
  var nextBtn      = document.getElementById("player-next");
  var shuffleBtn   = document.getElementById("player-shuffle");
  var repeatBtn    = document.getElementById("player-repeat");
  var progressBar  = document.getElementById("player-progress");
  var progressFill = document.getElementById("player-progress-fill");
  var curTimeEl    = document.getElementById("player-current-time");
  var durEl        = document.getElementById("player-duration");
  var volSlider    = document.getElementById("player-volume");
  var muteBtn      = document.getElementById("player-mute");

  if (!playerBar) return; // No player bar on this page

  // ── Helpers ───────────────────────────────────────────────
  function fmt(s) {
    if (!s || isNaN(s)) return "0:00";
    return Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
  }

  function setPlayIcon(playing) {
    if (!playBtn) return;
    playBtn.innerHTML = playing
      ? '<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M8 5v14l11-7z"/></svg>';
  }

  // ── Load & play a song ────────────────────────────────────
  function loadSong(song) {
    if (!song) return;

    var id = song._id || song.id || "";
    audio.src = song.audioUrl || "";

    if (coverEl)  coverEl.src          = song.coverUrl || "https://picsum.photos/seed/" + (id || "default") + "/60/60";
    if (titleEl)  titleEl.textContent  = song.title    || "Unknown Track";
    if (artistEl) artistEl.textContent = song.artist   || "Unknown Artist";
    if (likeBtn)  likeBtn.dataset.id   = id;

    // Sync liked heart state
    var liked = JSON.parse(localStorage.getItem("mel_liked") || "[]");
    if (likeBtn) likeBtn.classList.toggle("liked", liked.indexOf(id) !== -1);

    // Persist across page navigation
    try {
      sessionStorage.setItem("melodify_current", JSON.stringify(song));
      sessionStorage.setItem("melodify_queue",   JSON.stringify(queue));
      sessionStorage.setItem("melodify_qidx",    String(queueIndex));
    } catch (e) {}

    playerBar.classList.add("active");

    if (audio.src && audio.src !== window.location.href) {
      audio.play().catch(function () {
        // Autoplay blocked — user must interact first
      });
    }
    setPlayIcon(true);

    // Track plays + recently played via API
  if (id) {

}
  }

  // ── Public API (used by discover.js and library.js) ───────
  window.Player = {
    play: function (song) {
      queue      = [song];
      queueIndex = 0;
      loadSong(song);
    },
    playAll: function (songs, startIndex) {
      if (!songs || !songs.length) return;
      queue      = songs;
      queueIndex = Math.max(0, Math.min(startIndex || 0, songs.length - 1));
      loadSong(queue[queueIndex]);
    },
    addToQueue: function (song) {
      queue.push(song);
      try { sessionStorage.setItem("melodify_queue", JSON.stringify(queue)); } catch (e) {}
      showToast("Added to queue ✓", "success");
    },
    current: function () { return queue[queueIndex] || null; },
  };

  // ── Play / Pause ──────────────────────────────────────────
  if (playBtn) {
    playBtn.addEventListener("click", function () {
      if (audio.paused) { audio.play(); setPlayIcon(true); }
      else              { audio.pause(); setPlayIcon(false); }
    });
  }

  // ── Previous ──────────────────────────────────────────────
  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (audio.currentTime > 3) { audio.currentTime = 0; return; }
      if (queueIndex > 0) { queueIndex--; loadSong(queue[queueIndex]); }
    });
  }

  // ── Next ──────────────────────────────────────────────────
  if (nextBtn) nextBtn.addEventListener("click", playNext);

  function playNext() {
    if (repeatMode === 2) { audio.currentTime = 0; audio.play(); return; }
    if (queueIndex < queue.length - 1) { queueIndex++; loadSong(queue[queueIndex]); }
    else if (repeatMode === 1)         { queueIndex = 0; loadSong(queue[0]); }
    else                               { audio.pause(); setPlayIcon(false); }
  }

  audio.addEventListener("ended", playNext);

  // ── Shuffle ───────────────────────────────────────────────
  if (shuffleBtn) {
    shuffleBtn.addEventListener("click", function () {
      shuffled = !shuffled;
      shuffleBtn.classList.toggle("active", shuffled);
      if (shuffled && queue.length > 1) {
        var curr = queue[queueIndex];
        var rest = queue.filter(function (_, i) { return i !== queueIndex; });
        for (var i = rest.length - 1; i > 0; i--) {
          var j   = Math.floor(Math.random() * (i + 1));
          var tmp = rest[i]; rest[i] = rest[j]; rest[j] = tmp;
        }
        queue = [curr].concat(rest);
        queueIndex = 0;
      }
      showToast(shuffled ? "Shuffle on 🔀" : "Shuffle off", "info");
    });
  }

  // ── Repeat ────────────────────────────────────────────────
  if (repeatBtn) {
    repeatBtn.addEventListener("click", function () {
      repeatMode = (repeatMode + 1) % 3;
      repeatBtn.textContent  = repeatMode === 2 ? "🔂" : "🔁";
      repeatBtn.dataset.mode = repeatMode;
      repeatBtn.style.color  = repeatMode ? "#ff3d6e" : "";
      repeatBtn.style.opacity = repeatMode ? "1" : "0.5";
      showToast(["Repeat off", "Repeat all 🔁", "Repeat one 🔂"][repeatMode], "info");
    });
  }

  // ── Progress ──────────────────────────────────────────────
  audio.addEventListener("timeupdate", function () {
    if (!audio.duration) return;
    var pct = (audio.currentTime / audio.duration) * 100;
    if (progressFill) progressFill.style.width    = pct + "%";
    if (curTimeEl)    curTimeEl.textContent        = fmt(audio.currentTime);
    if (durEl)        durEl.textContent            = fmt(audio.duration);
  });

  audio.addEventListener("loadedmetadata", function () {
    if (durEl) durEl.textContent = fmt(audio.duration);
  });

  if (progressBar) {
    progressBar.addEventListener("click", function (e) {
      var r = progressBar.getBoundingClientRect();
      audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
    });

    var dragging = false;
    progressBar.addEventListener("mousedown", function () { dragging = true; });
    document.addEventListener("mouseup", function (e) {
      if (!dragging) return;
      dragging = false;
      var r   = progressBar.getBoundingClientRect();
      var pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      audio.currentTime = pct * (audio.duration || 0);
    });
    document.addEventListener("mousemove", function (e) {
      if (!dragging || !progressFill) return;
      var r   = progressBar.getBoundingClientRect();
      var pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      progressFill.style.width = (pct * 100) + "%";
      if (curTimeEl) curTimeEl.textContent = fmt(pct * (audio.duration || 0));
    });
  }

  // ── Volume ────────────────────────────────────────────────
  if (volSlider) {
    volSlider.value = "0.8";
    volSlider.addEventListener("input", function () {
      audio.volume = volSlider.value;
      if (muteBtn) muteBtn.textContent = audio.volume === 0 ? "🔇" : audio.volume < 0.5 ? "🔉" : "🔊";
    });
  }
  if (muteBtn) {
    muteBtn.addEventListener("click", function () {
      audio.muted = !audio.muted;
      muteBtn.textContent = audio.muted ? "🔇" : "🔊";
    });
  }

  // ── Like from player bar ──────────────────────────────────
  if (likeBtn) {
    likeBtn.addEventListener("click", async function () {
      var id = likeBtn.dataset.id;
      if (!id) return;
      if (!Auth.isLoggedIn()) { window.location.href = "login.html"; return; }

      var res = await apiFetch("/songs/" + id + "/like", { method: "POST" });
      if (!res.ok) return;

      var liked = JSON.parse(localStorage.getItem("mel_liked") || "[]");
      if (res.data.liked) {
        if (liked.indexOf(id) === -1) liked.push(id);
        likeBtn.classList.add("liked");
        showToast("Added to Liked Songs ♥", "success");
      } else {
        liked = liked.filter(function (x) { return x !== id; });
        likeBtn.classList.remove("liked");
        showToast("Removed from Liked Songs", "info");
      }
      localStorage.setItem("mel_liked", JSON.stringify(liked));
    });
  }

  // ── Keyboard shortcuts ────────────────────────────────────
  document.addEventListener("keydown", function (e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.code === "Space")      { e.preventDefault(); if (playBtn) playBtn.click(); }
    if (e.code === "ArrowRight") audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
    if (e.code === "ArrowLeft")  audio.currentTime = Math.max(0, audio.currentTime - 10);
    if (e.code === "ArrowUp"   && volSlider) { volSlider.value = Math.min(1, +volSlider.value + 0.05); audio.volume = volSlider.value; }
    if (e.code === "ArrowDown" && volSlider) { volSlider.value = Math.max(0, +volSlider.value - 0.05); audio.volume = volSlider.value; }
  });

  // ── Restore state on page load (survives navigation) ─────
  try {
    var saved = sessionStorage.getItem("melodify_current");
    if (saved) {
      var song = JSON.parse(saved);
      var sq   = sessionStorage.getItem("melodify_queue");
      var si   = sessionStorage.getItem("melodify_qidx");
      if (sq) queue      = JSON.parse(sq);
      if (si) queueIndex = parseInt(si, 10) || 0;

      var id = song._id || song.id || "";
      if (coverEl)  coverEl.src          = song.coverUrl || "https://picsum.photos/seed/" + (id||"default") + "/60/60";
      if (titleEl)  titleEl.textContent  = song.title    || "Unknown Track";
      if (artistEl) artistEl.textContent = song.artist   || "Unknown Artist";
      if (likeBtn)  likeBtn.dataset.id   = id;
      if (durEl)    durEl.textContent    = fmt(song.duration || 0);

      var liked2 = JSON.parse(localStorage.getItem("mel_liked") || "[]");
      if (likeBtn) likeBtn.classList.toggle("liked", liked2.indexOf(id) !== -1);

      playerBar.classList.add("active");
      setPlayIcon(false); // Paused on restore
    }
  } catch (e) {}

})();