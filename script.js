(function () {
  'use strict';

  // === SOUND FX (Web Audio API) ===
  let audioCtx;
  function getCtx() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }

  function playWoosh() {
    const ctx = getCtx();
    const dur = 0.35;
    // Noise buffer
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++)data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource(); src.buffer = buf;
    // Bandpass filter with frequency sweep
    const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.Q.value = 2;
    filt.frequency.setValueAtTime(800, ctx.currentTime);
    filt.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + dur);
    // Gain envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    src.start(); src.stop(ctx.currentTime + dur);
  }

  function playCurtain() {
    const curtainSfx = document.getElementById('curtain-sfx');
    if (curtainSfx) {
      curtainSfx.volume = 0.25;
      curtainSfx.playbackRate = 0.8;
      curtainSfx.play().catch(() => { });
    }
  }

  function playReveal() {
    const ctx = getCtx();
    const dur = 2.2;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource(); src.buffer = buf;

    const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.Q.value = 0.5;
    filt.frequency.setValueAtTime(300, ctx.currentTime);
    filt.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

    src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    src.start(); src.stop(ctx.currentTime + dur);
  }


  function playTap() {
    const ctx = getCtx();
    const dur = 0.04;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++)d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
    const src = ctx.createBufferSource(); src.buffer = buf;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 600;
    const gain = ctx.createGain(); gain.gain.value = 0.1;
    src.connect(hp); hp.connect(gain); gain.connect(ctx.destination);
    src.start(); src.stop(ctx.currentTime + dur);
  }

  // CURSOR
  const cur = document.getElementById('cursor');
  let mx = 0, my = 0;
  const isFine = matchMedia('(pointer:fine)').matches;
  if (isFine) {
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; gsap.set(cur, { x: mx, y: my }) });
  }

  // BACKGROUND MUSIC
  const bgMusic = document.getElementById('bg-music');
  const muteBtn = document.getElementById('mute-btn');
  bgMusic.volume = 0.15;
  let musicStarted = false;
  function startMusic() {
    if (musicStarted) return;
    musicStarted = true;
    bgMusic.play().catch(() => { });
  }
  muteBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (!musicStarted) { startMusic(); }
    bgMusic.muted = !bgMusic.muted;
    muteBtn.textContent = bgMusic.muted ? '🔇' : '🔊';
  });

  // === CURTAIN ===
  const curtain = document.getElementById('curtain');

  curtain.addEventListener('click', function openCurtain() {
    curtain.removeEventListener('click', openCurtain);
    curtain.style.cursor = 'default';
    playCurtain();
    // Fade prompt
    gsap.to('#curtain-prompt', { opacity: 0, duration: .3 });
    // Trigger Three.js cloth physics
    if (window._openCurtains) window._openCurtains();
  });

  // Called by curtain.js when cloth has settled
  window._onCurtainOpen = function () {
    playReveal();
    setTimeout(startMusic, 1000);
    gsap.to(curtain, { opacity: 0, duration: .5, onComplete: () => curtain.remove() });
    runEntrance();
  };

  // === HIDE EVERYTHING EXCEPT TITLE (immediately, before curtains open) ===
  gsap.set('.subtitle', { opacity: 0 });
  gsap.set('.big-face', { opacity: 0 });
  gsap.set('.box', { opacity: 0 });
  gsap.set('.deco', { opacity: 0 });
  gsap.set('.face', { opacity: 0 });
  gsap.set('.event-date', { opacity: 0 });
  gsap.set('.buy-btn', { opacity: 0 });
  gsap.set('.cal-btn', { opacity: 0 });
  gsap.set('.foot', { opacity: 0 });

  // === ENTRANCE (runs after curtain) ===
  // Title is already visible behind curtains — only animate everything else
  function runEntrance() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    // Subtitle fades in
    tl.to('.subtitle', { opacity: .5, duration: .5, delay: .1 });
    // Big faces drop in
    const bigFaces = gsap.utils.toArray('.big-face');
    bigFaces.forEach((f, i) => {
      const isFlipped = f.classList.contains('face--inv');
      gsap.set(f, { y: -60, scaleX: isFlipped ? -.6 : .6, scaleY: .6 });
      tl.to(f, { opacity: 1, y: 0, scaleX: isFlipped ? -1 : 1, scaleY: 1, duration: .5, ease: 'back.out(1.6)' }, 0.15 + i * .08);
    });
    // Boxes pop in from random directions
    const boxes = gsap.utils.toArray('.box');
    boxes.forEach((b, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 60;
      gsap.set(b, { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: .7 });
      tl.to(b, { opacity: 1, x: 0, y: 0, scale: 1, duration: .6, ease: 'back.out(1.4)' }, 0.4 + i * .06);
    });
    // Decos fade in
    tl.to('.deco', { opacity: (i, el) => parseFloat(getComputedStyle(el).opacity) || .3, stagger: .05, duration: .4 }, '-=.3');
    // Faces pop in
    document.querySelectorAll('.face').forEach(f => {
      const isFlipped = f.classList.contains('face--inv');
      gsap.set(f, { scaleX: 0, scaleY: 0 });
      tl.to(f, { opacity: 1, scaleX: isFlipped ? -1 : 1, scaleY: 1, stagger: .06, duration: .4, ease: 'back.out(2)' }, '-=.2');
    });
    // Event date
    gsap.set('.event-date', { y: 10 });
    tl.to('.event-date', { opacity: .6, y: 0, duration: .4, ease: 'power2.out' }, '-=.15');
    // Buy button
    gsap.set('.buy-btn', { y: 20 });
    tl.to('.buy-btn', { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }, '-=.1');
    // Calendar button
    gsap.set('.cal-btn', { y: 10 });
    tl.to('.cal-btn', { opacity: 1, y: 0, duration: .4, ease: 'power2.out' }, '-=.2');
    // Footer
    tl.to('.foot', { opacity: .3, duration: .4 }, '-=.1');

    // CHAR HOVER
    document.querySelectorAll('.ch').forEach(c => {
      c.addEventListener('mouseenter', () => gsap.to(c, { scale: 1.25, y: -12, duration: .2, ease: 'power2.out' }));
      c.addEventListener('mouseleave', () => gsap.to(c, { scale: 1, y: 0, duration: .4, ease: 'elastic.out(1,.4)' }));
    });

    // FACE SPIN — physics simulation
    const FRICTION = 0.985; // per-frame decay
    const MIN_VEL = 0.3;    // deg/frame threshold to stop
    document.querySelectorAll('.face,.big-face').forEach(f => {
      let vel = 0, spinning = false;
      function tick() {
        vel *= FRICTION;
        const cur = gsap.getProperty(f, 'rotation');
        gsap.set(f, { rotation: cur + vel });
        if (Math.abs(vel) > MIN_VEL) {
          requestAnimationFrame(tick);
        } else {
          spinning = false;
        }
      }
      f.addEventListener('click', e => {
        e.stopPropagation();
        const dir = Math.random() > .5 ? 1 : -1;
        vel += dir * (800 + Math.random() * 1200);
        vel = Math.min(Math.max(vel, -40), 40);
        if (!spinning) { spinning = true; requestAnimationFrame(tick); }
        playWoosh();
      });
    });

    // MOUSE PARALLAX — all elements with data-depth
    if (isFine) {
      const els = document.querySelectorAll('[data-depth]');
      document.addEventListener('mousemove', e => {
        const cx = (e.clientX / window.innerWidth - .5) * 2;
        const cy = (e.clientY / window.innerHeight - .5) * 2;
        els.forEach(el => {
          const d = parseFloat(el.dataset.depth) || 0;
          gsap.to(el, { x: cx * d * 120, y: cy * d * 120, duration: .8, ease: 'power2.out', overwrite: 'auto' });
        });
      });
    }

    // BOX 3D TILT on hover
    if (isFine) {
      boxes.forEach(box => {
        box.addEventListener('mousemove', e => {
          const r = box.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - .5;
          const y = (e.clientY - r.top) / r.height - .5;
          gsap.to(box, {
            rotateX: -y * 18, rotateY: x * 18, scale: 1.08,
            boxShadow: `${-x * 12}px ${-y * 12}px 0 rgba(0,0,0,.35)`,
            duration: .25, ease: 'power2.out', overwrite: 'auto'
          });
        });
        box.addEventListener('mouseleave', () => {
          gsap.to(box, {
            rotateX: 0, rotateY: 0, scale: 1,
            boxShadow: '5px 5px 0 rgba(0,0,0,.2)',
            duration: .5, ease: 'elastic.out(1,.5)', overwrite: 'auto'
          });
        });
      });
    }

    // OVERLAY
    const ov = document.getElementById('ov');
    const ovCard = document.getElementById('ov-card');
    const ovX = document.getElementById('ov-x');

    boxes.forEach(box => {
      box.addEventListener('click', () => {
        const data = box.querySelector('.b-data');
        if (!data) return;
        ovCard.innerHTML = data.innerHTML;
        ov.classList.add('active');
        playTap();
      });
    });

    function closeOv() { ov.classList.remove('active') }
    ovX.addEventListener('click', closeOv);
    ov.addEventListener('click', e => { if (e.target === ov || e.target === ov.querySelector('::before')) closeOv() });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeOv() });

    // Cursor hover states
    if (isFine) {
      document.querySelectorAll('.box,.ov-x').forEach(el => {
        el.addEventListener('mouseenter', () => cur.querySelector('.cursor-dot').style.transform = 'translate(-50%,-50%) scale(2.5)');
        el.addEventListener('mouseleave', () => cur.querySelector('.cursor-dot').style.transform = 'translate(-50%,-50%) scale(1)');
      });
    }
  } // end runEntrance

})();
