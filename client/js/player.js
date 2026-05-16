// =============================================================
// client/js/player.js
// COPY TO: client/js/player.js
// Fix: localStorage key changed to "mel_liked" to match api.js
// =============================================================

(function () {
  "use strict";

  let queue = [], queueIndex = 0, shuffled = false, repeatMode = 0;
  const audio = new Audio();
  audio.preload = "metadata";
  audio.volume  = 0.8;

  const $ = id => document.getElementById(id);
  const playerBar = $("player-bar"), coverEl = $("player-cover"),
        titleEl = $("player-title"), artistEl = $("player-artist"),
        likeBtn = $("player-like"), prevBtn = $("player-prev"),
        playBtn = $("player-play"), nextBtn = $("player-next"),
        shuffleBtn = $("player-shuffle"), repeatBtn = $("player-repeat"),
        progressBar = $("player-progress"), progressFill = $("player-progress-fill"),
        curTimeEl = $("player-current-time"), durEl = $("player-duration"),
        volSlider = $("player-volume"), muteBtn = $("player-mute");

  if (!playerBar) return;

  const fmt = s => (!s || isNaN(s)) ? "0:00"
    : `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}`;

  function setIcon(playing) {
    if (!playBtn) return;
    playBtn.innerHTML = playing
      ? `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M8 5v14l11-7z"/></svg>`;
  }

  function loadSong(song) {
    if (!song) return;
    const id = song._id || song.id || "";
    audio.src = song.audioUrl || "";

    if (coverEl)  coverEl.src          = song.coverUrl || `https://picsum.photos/seed/${id||"x"}/60/60`;
    if (titleEl)  titleEl.textContent  = song.title    || "Unknown Track";
    if (artistEl) artistEl.textContent = song.artist   || "Unknown Artist";
    if (likeBtn)  likeBtn.dataset.id   = id;

    // ✅ Fixed: use "mel_liked" key (was "melodify_liked" — mismatch with api.js)
    const liked = JSON.parse(localStorage.getItem("mel_liked") || "[]");
    if (likeBtn) likeBtn.classList.toggle("liked", liked.includes(id));

    try {
      sessionStorage.setItem("melodify_current", JSON.stringify(song));
      sessionStorage.setItem("melodify_queue",   JSON.stringify(queue));
      sessionStorage.setItem("melodify_qidx",    String(queueIndex));
    } catch (e) {}

    playerBar.classList.add("active");
    if (audio.src && audio.src !== location.href) audio.play().catch(() => {});
    setIcon(true);

    if (id) {
      apiFetch(`/songs/${id}/play`, { method: "POST" });
      if (Auth.isLoggedIn()) apiFetch(`/user/recently-played/${id}`, { method: "POST" });
    }
  }

  // ── Public API ────────────────────────────────────────────
  window.Player = {
    play:       (song)              => { queue=[song]; queueIndex=0; loadSong(song); },
    playAll:    (songs, idx=0)      => { if(!songs?.length) return; queue=songs; queueIndex=Math.min(idx,songs.length-1); loadSong(queue[queueIndex]); },
    addToQueue: (song)              => { queue.push(song); showToast("Added to queue ✓","success"); },
    current:    ()                  => queue[queueIndex] || null,
  };

  playBtn?.addEventListener("click", () => { if(audio.paused){audio.play();setIcon(true);}else{audio.pause();setIcon(false);} });
  prevBtn?.addEventListener("click", () => { if(audio.currentTime>3){audio.currentTime=0;return;} if(queueIndex>0){queueIndex--;loadSong(queue[queueIndex]);} });
  nextBtn?.addEventListener("click", playNext);

  function playNext() {
    if (repeatMode===2) { audio.currentTime=0; audio.play(); return; }
    if (queueIndex<queue.length-1) { queueIndex++; loadSong(queue[queueIndex]); }
    else if (repeatMode===1) { queueIndex=0; loadSong(queue[0]); }
    else { audio.pause(); setIcon(false); }
  }
  audio.addEventListener("ended", playNext);

  shuffleBtn?.addEventListener("click", () => {
    shuffled = !shuffled;
    shuffleBtn.classList.toggle("active", shuffled);
    if (shuffled && queue.length>1) {
      const cur=queue[queueIndex], rest=queue.filter((_,i)=>i!==queueIndex);
      for(let i=rest.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]];}
      queue=[cur,...rest]; queueIndex=0;
    }
    showToast(shuffled?"Shuffle on 🔀":"Shuffle off","info");
  });

  repeatBtn?.addEventListener("click", () => {
    repeatMode=(repeatMode+1)%3;
    repeatBtn.textContent=repeatMode===2?"🔂":"🔁";
    repeatBtn.style.color=repeatMode?"#ff3d6e":"";
    repeatBtn.style.opacity=repeatMode?"1":"0.5";
  });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const pct=(audio.currentTime/audio.duration)*100;
    if (progressFill) progressFill.style.width=pct+"%";
    if (curTimeEl) curTimeEl.textContent=fmt(audio.currentTime);
    if (durEl) durEl.textContent=fmt(audio.duration);
  });
  audio.addEventListener("loadedmetadata", () => { if(durEl) durEl.textContent=fmt(audio.duration); });

  if (progressBar) {
    progressBar.addEventListener("click", e => {
      const r=progressBar.getBoundingClientRect();
      audio.currentTime=((e.clientX-r.left)/r.width)*audio.duration;
    });
    let drag=false;
    progressBar.addEventListener("mousedown", ()=>drag=true);
    document.addEventListener("mouseup", e => { if(!drag)return; drag=false; const r=progressBar.getBoundingClientRect(); audio.currentTime=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*(audio.duration||0); });
    document.addEventListener("mousemove", e => { if(!drag||!progressFill)return; const r=progressBar.getBoundingClientRect(); progressFill.style.width=(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*100)+"%"; });
  }

  if (volSlider) {
    volSlider.value="0.8";
    volSlider.addEventListener("input", () => { audio.volume=volSlider.value; if(muteBtn) muteBtn.textContent=audio.volume===0?"🔇":audio.volume<0.5?"🔉":"🔊"; });
  }
  muteBtn?.addEventListener("click", () => { audio.muted=!audio.muted; if(muteBtn) muteBtn.textContent=audio.muted?"🔇":"🔊"; });

  likeBtn?.addEventListener("click", async () => {
    const id=likeBtn.dataset.id;
    if (!id) return;
    if (!Auth.isLoggedIn()) { window.location.href="login.html"; return; }
    const {ok,data}=await apiFetch(`/songs/${id}/like`,{method:"POST"});
    if (!ok) return;
    // ✅ Fixed: use "mel_liked" key
    let liked=JSON.parse(localStorage.getItem("mel_liked")||"[]");
    if (data.liked) { liked.push(id); likeBtn.classList.add("liked"); showToast("Added to Liked Songs ♥","success"); }
    else { liked=liked.filter(x=>x!==id); likeBtn.classList.remove("liked"); showToast("Removed from Liked Songs","info"); }
    localStorage.setItem("mel_liked",JSON.stringify(liked));
  });

  document.addEventListener("keydown", e => {
    if (e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA") return;
    if (e.code==="Space")      { e.preventDefault(); playBtn?.click(); }
    if (e.code==="ArrowRight") audio.currentTime=Math.min(audio.duration||0,audio.currentTime+10);
    if (e.code==="ArrowLeft")  audio.currentTime=Math.max(0,audio.currentTime-10);
    if (e.code==="ArrowUp"   &&volSlider) { volSlider.value=Math.min(1,+volSlider.value+0.05); audio.volume=volSlider.value; }
    if (e.code==="ArrowDown" &&volSlider) { volSlider.value=Math.max(0,+volSlider.value-0.05); audio.volume=volSlider.value; }
  });

  // Restore on page navigation
  try {
    const saved=sessionStorage.getItem("melodify_current");
    if (saved) {
      const song=JSON.parse(saved);
      const sq=sessionStorage.getItem("melodify_queue"), si=sessionStorage.getItem("melodify_qidx");
      if (sq) queue=JSON.parse(sq); if (si) queueIndex=parseInt(si,10)||0;
      const id=song._id||song.id||"";
      if (coverEl)  coverEl.src=song.coverUrl||`https://picsum.photos/seed/${id||"x"}/60/60`;
      if (titleEl)  titleEl.textContent=song.title||"Unknown Track";
      if (artistEl) artistEl.textContent=song.artist||"Unknown Artist";
      if (likeBtn)  likeBtn.dataset.id=id;
      if (durEl)    durEl.textContent=fmt(song.duration||0);
      const liked2=JSON.parse(localStorage.getItem("mel_liked")||"[]");
      if (likeBtn) likeBtn.classList.toggle("liked",liked2.includes(id));
      playerBar.classList.add("active");
      setIcon(false);
    }
  } catch(e){}

})();