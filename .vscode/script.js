
    // Custom cursor
    const cursor = document.getElementById('cursor');
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    function animateCursor() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      cursor.style.left = mx - 6 + 'px';
      cursor.style.top = my - 6 + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Wave background bars
    const waveBg = document.getElementById('waveBg');
    for(let i = 0; i < 120; i++) {
      const bar = document.createElement('div');
      bar.className = 'wave-bar';
      const h = Math.random() * 100 + 20;
      bar.style.setProperty('--h', h + 'px');
      bar.style.setProperty('--d', (Math.random() * 1.2 + 0.6) + 's');
      bar.style.setProperty('--delay', (Math.random() * 2) + 's');
      waveBg.appendChild(bar);
    }

    // Mini visualizer
    const miniViz = document.getElementById('miniViz');
    for(let i = 0; i < 5; i++) {
      const bar = document.createElement('div');
      bar.className = 'mini-bar';
      const h = Math.random() * 16 + 6;
      bar.style.setProperty('--h', h + 'px');
      bar.style.setProperty('--d', (Math.random() * 0.5 + 0.4) + 's');
      bar.style.animationDelay = (i * 0.1) + 's';
      miniViz.appendChild(bar);
    }

    // Banner EQ
    const bannerEq = document.getElementById('bannerEq');
    const heights = [30,55,70,40,80,60,45,75,35,65,50,85];
    heights.forEach((h, i) => {
      const bar = document.createElement('div');
      bar.className = 'eq-bar';
      bar.style.setProperty('--h', h + 'px');
      bar.style.setProperty('--d', (Math.random() * 0.6 + 0.4) + 's');
      bar.style.setProperty('--delay', (i * 0.08) + 's');
      bannerEq.appendChild(bar);
    });