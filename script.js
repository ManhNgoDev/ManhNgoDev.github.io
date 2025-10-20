(function () {
  const greeting = document.getElementById('greeting');
  const confettiBtn = document.getElementById('confetti-btn');
  const canvas = document.getElementById('confetti-canvas');
  const bgm = document.getElementById('bgm');
  const musicToggle = document.getElementById('music-toggle');

  // Greeting is static in DOM now

  // Heart particles effect — lightweight, no dependency
  const ctx = canvas.getContext('2d');
  const particles = [];
  const colors = ['#ff2f7b', '#ff5f9c', '#ff8bb6', '#ffd1e3', '#ffffff'];
  let animationId = null;

  function resizeCanvas() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnHearts(amount = 260) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    // main hearts
    for (let i = 0; i < amount; i++) {
      const size = 6 + Math.random() * 10; // heart size
      particles.push({
        type: 'heart',
        x: Math.random() * width,
        y: height + 20, // shoot upward then fall a bit
        r: size,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 1.6,
        vy: -6 - Math.random() * 4,
        ay: 0.18 + Math.random() * 0.06,
        life: 160 + Math.random() * 80,
        rotation: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.08,
        shimmer: Math.random() * 0.5 + 0.5,
        motion: Math.random() < 0.33 ? 'sway' : (Math.random() < 0.5 ? 'spiral' : 'drift'),
        t: Math.random() * Math.PI * 2
      });
    }
    // sparkles
    for (let i = 0; i < Math.floor(amount * 0.8); i++) {
      const size = 1 + Math.random() * 2.2;
      particles.push({
        type: 'sparkle',
        x: Math.random() * width,
        y: height * Math.random() * 0.8,
        r: size,
        color: '#ffffff',
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.5 - Math.random() * 0.8,
        ay: 0.03,
        life: 90 + Math.random() * 60,
        rotation: 0,
        vr: 0,
        shimmer: Math.random() * 0.7 + 0.3
      });
    }
    loop();
  }

  function drawHeartPath(ctx, size) {
    // Draw a heart centered at (0,0)
    const s = size / 16; // normalize
    ctx.beginPath();
    ctx.moveTo(0, -6 * s);
    ctx.bezierCurveTo(6 * s, -12 * s, 16 * s, -2 * s, 0, 10 * s);
    ctx.bezierCurveTo(-16 * s, -2 * s, -6 * s, -12 * s, 0, -6 * s);
    ctx.closePath();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      // physics
      p.vy += p.ay;
      if (p.type === 'heart') {
        // motion styles
        p.t += 0.03 + Math.random() * 0.01;
        if (p.motion === 'sway') {
          p.vx += Math.sin(p.t) * 0.02;
        } else if (p.motion === 'spiral') {
          p.vx += Math.cos(p.t) * 0.04;
          p.vy += Math.sin(p.t) * 0.03;
        } else if (p.motion === 'drift') {
          p.vx += (Math.random() - 0.5) * 0.02;
        }
      }
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vr;
      p.life -= 1;

      // wrap x softly
      if (p.x < -20) p.x = window.innerWidth + 20;
      if (p.x > window.innerWidth + 20) p.x = -20;

      // draw
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      if (p.type === 'sparkle') {
        const alpha = Math.max(0, Math.min(1, p.life / 60)) * p.shimmer;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        // small cross sparkle
        ctx.fillRect(-p.r, -0.4, p.r * 2, 0.8);
        ctx.fillRect(-0.4, -p.r, 0.8, p.r * 2);
      } else {
        // heart
        ctx.globalAlpha = 0.9;
        const grad = ctx.createLinearGradient(-p.r, -p.r, p.r, p.r);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, '#ffffff');
        ctx.fillStyle = grad;
        drawHeartPath(ctx, p.r * 2);
        ctx.fill();
        // glossy highlight
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(-p.r * 0.4, -p.r * 0.2, p.r * 0.7, p.r * 0.5, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (p.y > window.innerHeight + 40 || p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function loop() {
    if (animationId) cancelAnimationFrame(animationId);
    function frame() {
      // idle spawn to keep page lively (reduced density)
      if (particles.length < 40 && Math.random() < 0.05) {
        particles.push({
          type: Math.random() < 0.7 ? 'heart' : 'sparkle',
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 10,
          r: 4 + Math.random() * 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 0.8,
          vy: -2 - Math.random() * 2,
          ay: 0.06,
          life: 160,
          rotation: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.05,
          shimmer: 0.6
        });
      }
      draw();
      if (particles.length > 0) {
        animationId = requestAnimationFrame(frame);
      } else {
        animationId = requestAnimationFrame(frame); // keep idle loop
      }
    }
    animationId = requestAnimationFrame(frame);
  }

  // Events
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Music controls
  const STORAGE_KEY = 'bgm-muted';
  const wasMuted = localStorage.getItem(STORAGE_KEY) === '1';
  if (wasMuted) {
    bgm.muted = true;
  }

  function updateMusicButton() {
    const playing = !bgm.paused && !bgm.muted;
    musicToggle.classList.toggle('is-playing', playing);
    musicToggle.setAttribute('aria-pressed', String(playing));
    musicToggle.textContent = playing ? '♫' : '♪';
  }

  async function ensureMusicPlays() {
    try {
      if (!bgm.muted && bgm.paused) {
        await bgm.play();
        updateMusicButton();
      }
    } catch (_) {
      // autoplay may fail until user gesture
      musicToggle.classList.add('is-needing-gesture');
    }
  }

  // Try autoplay immediately on load
  (async function tryAuto() {
    try {
      if (!bgm.muted) {
        await bgm.play();
      }
    } catch (_) {
      musicToggle.classList.add('is-needing-gesture');
    } finally {
      updateMusicButton();
    }
  })();

  musicToggle.addEventListener('click', async function () {
    if (bgm.muted || bgm.paused) {
      bgm.muted = false;
      localStorage.setItem(STORAGE_KEY, '0');
      try { await bgm.play(); } catch (_) {}
    } else {
      bgm.pause();
      bgm.muted = true;
      localStorage.setItem(STORAGE_KEY, '1');
    }
    updateMusicButton();
  });

  confettiBtn.addEventListener('click', function () {
    spawnHearts(240);
    ensureMusicPlays();
  });

  // Hearts burst at click position anywhere on page
  document.addEventListener('click', function (e) {
    const x = e.clientX;
    const y = e.clientY;
    for (let i = 0; i < 20; i++) {
      particles.push({
        type: 'heart',
        x, y,
        r: 5 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3.2,
        vy: (Math.random() - 1.8) * 3.2,
        ay: 0.12,
        life: 120 + Math.random() * 60,
        rotation: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.12,
        shimmer: 0.8,
        motion: 'sway',
        t: Math.random() * Math.PI * 2
      });
    }
  }, { passive: true });

  // Trail hearts helper
  function addTrail(x, y) {
    particles.push({
      type: 'heart',
      x: x,
      y: y + 6,
      r: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.6,
      vy: -1.2,
      ay: 0.05,
      life: 80,
      rotation: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.08,
      shimmer: 0.9,
      motion: 'sway',
      t: Math.random() * Math.PI * 2
    });
  }

  // Cursor trail hearts (desktop)
  let lastTrail = 0;
  document.addEventListener('mousemove', function (e) {
    const now = performance.now();
    if (now - lastTrail < 60) return; // throttle (reduced)
    lastTrail = now;
    addTrail(e.clientX, e.clientY);
  }, { passive: true });

  // Touch trail hearts (mobile)
  function handleTouch(e) {
    const now = performance.now();
    if (now - lastTrail < 60) return; // throttle (reduced)
    lastTrail = now;
    const touch = e.touches && e.touches[0];
    if (!touch) return;
    addTrail(touch.clientX, touch.clientY);
  }
  document.addEventListener('touchstart', handleTouch, { passive: true });
  document.addEventListener('touchmove', handleTouch, { passive: true });

  // Show immediate trail on load so effect is visible
  (function initialTrail() {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.6;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => addTrail(cx + (Math.random() - 0.5) * 60, cy + (Math.random() - 0.5) * 40), i * 40);
    }
  })();

  // Initial greeting
  updateMusicButton();
})();


