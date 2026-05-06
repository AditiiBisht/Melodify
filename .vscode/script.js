// ===== HELPERS =====
const audio = document.getElementById('audioPlayer');
const playBtn = document.querySelector('.play-btn');
let isPlaying = false;

// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
if (cursor) {
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  function animateCursor() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;

    cursor.style.left = mx - 6 + 'px';
    cursor.style.top = my - 6 + 'px';

    requestAnimationFrame(animateCursor);
  }

  animateCursor();
}



// ===== WAVE BG =====
const waveBg = document.getElementById('waveBg');
if (waveBg) {
  for (let i = 0; i < 120; i++) {
    const bar = document.createElement('div');
    bar.className = 'wave-bar';

    bar.style.setProperty('--h', (Math.random() * 100 + 20) + 'px');
    bar.style.setProperty('--d', (Math.random() * 1.2 + 0.6) + 's');
    bar.style.setProperty('--delay', (Math.random() * 2) + 's');

    waveBg.appendChild(bar);
  }
}

// ===== MINI VIZ =====
const miniViz = document.getElementById('miniViz');
if (miniViz) {
  for (let i = 0; i < 5; i++) {
    const bar = document.createElement('div');
    bar.className = 'mini-bar';

    bar.style.setProperty('--h', (Math.random() * 16 + 6) + 'px');
    bar.style.setProperty('--d', (Math.random() * 0.5 + 0.4) + 's');
    bar.style.animationDelay = (i * 0.1) + 's';

    miniViz.appendChild(bar);
  }
}

// ===== BANNER EQ =====
const bannerEq = document.getElementById('bannerEq');
if (bannerEq) {
  const heights = [30,55,70,40,80,60,45,75,35,65,50,85];

  heights.forEach((h, i) => {
    const bar = document.createElement('div');
    bar.className = 'eq-bar';

    bar.style.setProperty('--h', h + 'px');
    bar.style.setProperty('--d', (Math.random() * 0.6 + 0.4) + 's');
    bar.style.setProperty('--delay', (i * 0.08) + 's');

    bannerEq.appendChild(bar);
  });
}

// ===== PLAY BUTTON =====
if (audio && playBtn) {
  playBtn.addEventListener('click', () => {
    if (!audio.src) {
      audio.src = "assets/audio/song1.mp3"; // default
    }

    if (isPlaying) {
      audio.pause();
      playBtn.textContent = "▶";
    } else {
      audio.play();
      playBtn.textContent = "⏸";
    }

    isPlaying = !isPlaying;
  });
}

// ===== PROGRESS BAR (single correct version) =====
const progressFill = document.querySelector('.progress-fill');

if (audio && progressFill) {
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const percent = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = percent + '%';
    }
  });
}

// ===== SONG CLICK =====
document.querySelectorAll('.release-row').forEach(row => {
  row.addEventListener('click', () => {
    const src = row.dataset.src;

    if (!src) return;

    audio.src = src;
    audio.play();

    isPlaying = true;
    if (playBtn) playBtn.textContent = "⏸";
  });
});

// ===== SEARCH =====
const searchInput = document.querySelector('.search-bar input');
const rows = document.querySelectorAll('.release-row');

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const value = searchInput.value.toLowerCase();

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(value) ? 'grid' : 'none';
    });
  });
}

// ===== GENRE FILTER =====
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const genre = chip.innerText.toLowerCase();

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = genre === 'all' || text.includes(genre) ? 'grid' : 'none';
    });
  });
});

// songssss 

const songs = [

{
 title: "Neon Dreams",
 artist: "Luna Wave",
 album: "After Midnight",
 duration: "4:05",
 liked: true,
 color: "ta1"
},

{
 title: "Violet Frequency",
 artist: "Parallax Echo",
 album: "Echoes",
 duration: "3:42",
 liked: true,
 color: "ta2"
},

{
 title: "Rainy Afternoon",
 artist: "Cozy Beats Lab",
 album: "Rainy Days Vol.4",
 duration: "4:15",
 liked: false,
 color: "ta3"
},

{
 title: "Desert Sun",
 artist: "Atlas Groove",
 album: "Desert Sun",
 duration: "3:58",
 liked: true,
 color: "ta4"
}

];

const trackList =
document.getElementById('trackList');

songs.forEach((song,index)=>{

trackList.innerHTML += `

<div class="track-row">

<div class="tr-num">
${index + 1}
</div>

<div class="tr-art">
<div class="tr-art-bg ${song.color}"></div>
</div>

<div class="tr-info">

<div class="tr-name">
${song.title}
</div>

<div class="tr-artist">
${song.artist}
</div>

</div>

<div class="tr-album">
${song.album}
</div>

<div class="tr-date">
Today
</div>

<div class="tr-heart ${song.liked ? 'liked' : ''}">
${song.liked ? '♥' : '♡'}
</div>

<div class="tr-dur">
${song.duration}
</div>

</div>

`;

});

// ===== SCROLL ANIMATION =====
const revealElements = document.querySelectorAll('.fade-up');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

revealElements.forEach(el => observer.observe(el));