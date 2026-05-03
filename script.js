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

  function playBoing() {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const dur = 0.7;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    // Add random variance to base pitch
    osc.frequency.setValueAtTime(70 + Math.random() * 20, t);

    // Pitch wobble (spring vibrating)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    // Randomize initial wobble speed
    lfo.frequency.setValueAtTime(15 + Math.random() * 8, t);
    lfo.frequency.exponentialRampToValueAtTime(5, t + dur);

    const lfoGain = ctx.createGain();
    // Randomize pitch deviation depth
    lfoGain.gain.setValueAtTime(8 + Math.random() * 6, t);
    lfoGain.gain.exponentialRampToValueAtTime(1, t + dur);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    // Twang filter
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    // Randomize filter resonance and sweep frequencies
    filt.Q.value = 10 + Math.random() * 4;
    filt.frequency.setValueAtTime(300 + Math.random() * 150, t);
    filt.frequency.exponentialRampToValueAtTime(1200 + Math.random() * 600, t + 0.05);
    filt.frequency.exponentialRampToValueAtTime(250 + Math.random() * 100, t + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, t + dur);

    osc.connect(filt);
    filt.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    lfo.start(t);
    osc.stop(t + dur);
    lfo.stop(t + dur);
  }

  function playCurtain() {
    const curtainSfx = document.getElementById('curtain-sfx');
    if (curtainSfx) {
      const isMobile = window.innerWidth <= 700;
      curtainSfx.volume = 0.25;
      curtainSfx.playbackRate = isMobile ? 1.2 : 0.8;
      curtainSfx.play().catch(() => { });
    }
  }

  function playReveal() {
    const ctx = getCtx();
    const isMobile = window.innerWidth <= 700;
    const dur = isMobile ? 1.47 : 2.2;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource(); src.buffer = buf;

    const filt = ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.Q.value = 0.5;
    filt.frequency.setValueAtTime(300, ctx.currentTime);
    filt.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + (isMobile ? 0.13 : 0.2));
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
    const isMobile = window.innerWidth <= 700;
    playReveal();
    setTimeout(startMusic, isMobile ? 667 : 1000);
    gsap.to(curtain, { opacity: 0, duration: isMobile ? 0.33 : .5, onComplete: () => curtain.remove() });
    runEntrance();
  };

  // === HIDE EVERYTHING EXCEPT TITLE (immediately, before curtains open) ===
  gsap.set('.subtitle', { opacity: 0 });
  gsap.set('.big-face', { opacity: 0 });
  gsap.set('.box', { opacity: 0 });

  // Store original opacity for decos before hiding them (fixes Cloudflare getComputedStyle crash and opacity bug)
  document.querySelectorAll('.deco').forEach(el => {
    try {
      if (el && el.nodeType === 1) {
        el.dataset.origOp = window.getComputedStyle(el).opacity;
      }
    } catch (e) { }
  });
  gsap.set('.deco', { opacity: 0 });

  gsap.set('.face', { opacity: 0 });
  gsap.set('.chat-bubble', { opacity: 0, scale: 0 });
  gsap.set('.event-date', { opacity: 0 });
  gsap.set('.buy-btn', { opacity: 0 });
  gsap.set('.cal-btn', { opacity: 0 });
  gsap.set('.foot', { opacity: 0 });

  // Center title on mobile initially
  if (window.innerWidth <= 700) {
    const title = document.querySelector('.title');
    if (title) {
      const rect = title.getBoundingClientRect();
      const offset = (window.innerHeight / 2) - (rect.height / 2) - rect.top;
      gsap.set('.title', { y: offset });
    }
  }

  // === ENTRANCE (runs after curtain) ===
  // Title is already visible behind curtains — only animate everything else
  function runEntrance() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    if (window.innerWidth <= 700) tl.timeScale(1.5);

    // Move title up on mobile
    if (window.innerWidth <= 700) {
      tl.to('.title', { y: 0, duration: 1, ease: 'power2.inOut' }, 0);
    }

    // Subtitle fades in
    tl.to('.subtitle', { opacity: .5, duration: .5, delay: .1 }, 0);
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
    tl.to('.deco', {
      opacity: (i, el) => {
        try { return parseFloat(el.dataset.origOp) || 0.3; }
        catch (e) { return 0.3; }
      },
      stagger: .05,
      duration: .4
    }, '-=.3');
    // Faces pop in
    document.querySelectorAll('.face').forEach(f => {
      const isFlipped = f.classList.contains('face--inv');
      gsap.set(f, { scaleX: 0, scaleY: 0 });
      tl.to(f, { opacity: 1, scaleX: isFlipped ? -1 : 1, scaleY: 1, stagger: .06, duration: .4, ease: 'back.out(2)' }, '-=.2');
    });
    // === DIALOG SYSTEM ===
    const dialogs = [
      "Welcome to my site!",
      "Do you like it?"
    ];
    const reactions = [
      "Kill her! I'm the real one.",
      "Don't listen to her!",
      "She's an imposter!",
      "I'm the only Bianca!",
      "I'm the real Bianca!",
      "Get her!",
      "Shoot her!",
      "Shoot more!!"
    ];
    let currentDialog = 0;
    let isTyping = false;
    const bubble = document.getElementById('bianca-bubble');

    function playTextBlip() {
      const c = getCtx();
      if (!c) return;
      const t = c.currentTime;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(650 + Math.random() * 150, t);
      g.gain.setValueAtTime(0.04, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    }

    function typeWriter(text, i = 0) {
      if (i === 0) {
        const textNode = document.createTextNode('');
        bubble.innerHTML = '';
        bubble.appendChild(textNode);
        const ind = document.createElement('span');
        ind.className = 'indicator';
        ind.textContent = '▼';
        bubble.appendChild(ind);
        isTyping = true;
        bubble.classList.remove('has-more');
        if (bubble.style.display === 'none') {
          bubble.style.display = 'block';
          gsap.set(bubble, { scale: 0, opacity: 0 });
          gsap.to(bubble, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.8)' });
        }
      }
      if (i < text.length) {
        bubble.firstChild.textContent += text.charAt(i);
        playTextBlip();
        setTimeout(() => typeWriter(text, i + 1), 50);
      } else {
        isTyping = false;
        bubble.classList.add('has-more');
      }
    }

    function progressDialog() {
      if (isTyping) return;
      currentDialog++;
      if (currentDialog >= dialogs.length) {
        gsap.to(bubble, { scale: 0, opacity: 0, duration: 0.4, ease: 'back.in(1.6)', onComplete: () => bubble.style.display = 'none' });
        return;
      }
      typeWriter(dialogs[currentDialog]);
      playTap();
    }

    let reactionCount = 0;
    function showReaction() {
      if (isTyping) return;
      let r;
      if (reactionCount === 0) {
        r = reactions[0];
      } else {
        r = reactions[Math.floor(Math.random() * reactions.length)];
      }
      reactionCount++;
      typeWriter(r);
    }

    const juggleReactions = [
      "You're juggling me!",
      "Look at you go!",
      "Wheee!",
      "Higher!",
      "Don't drop me!"
    ];

    let lastJuggleReactionTime = 0;
    const JUGGLE_REACTION_COOLDOWN = 1500;

    function showJuggleReaction() {
      if (isTyping) return;
      if (Date.now() - lastJuggleReactionTime < JUGGLE_REACTION_COOLDOWN) return;
      lastJuggleReactionTime = Date.now();
      const r = juggleReactions[Math.floor(Math.random() * juggleReactions.length)];
      typeWriter(r);
    }

    bubble.addEventListener('click', (e) => {
      e.stopPropagation();
      progressDialog();
    });

    // Chat bubble pops up from the side and starts typing
    tl.to('.chat-bubble', {
      opacity: 1,
      scale: 1,
      duration: 0.7,
      ease: 'back.out(1.8)',
      delay: 0.3,
      onComplete: () => typeWriter(dialogs[0])
    }, '-=0.1');

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
    const MIN_VEL = 0.3;    // deg/frame threshold to stop
    document.querySelectorAll('.face,.big-face').forEach(f => {
      let vel = 0, spinning = false;
      const isWrapped = f.parentElement.classList.contains('big-face-wrap');
      const target = isWrapped ? f.parentElement : f;

      // Initialize rotation from CSS variable if not already set by GSAP
      const initialRot = parseFloat(target.style.getPropertyValue('--br')) ||
        parseFloat(target.style.getPropertyValue('--fr')) || 0;
      if (initialRot) gsap.set(target, { rotation: initialRot });

      function tick() {
        vel *= 0.985;
        const cur = gsap.getProperty(target, 'rotation');
        gsap.set(target, { rotation: cur + vel });
        if (Math.abs(vel) > MIN_VEL) {
          requestAnimationFrame(tick);
        } else {
          spinning = false;
        }
      }
      f.addEventListener('click', e => {
        e.stopPropagation();
        if (isWrapped) {
          progressDialog();
          return;
        }
        showReaction();
        const dir = Math.random() > .5 ? 1 : -1;
        vel += dir * (800 + Math.random() * 1200);
        vel = Math.min(Math.max(vel, -40), 40);
        if (!spinning) { spinning = true; requestAnimationFrame(tick); }
        playWoosh();
      });
    });

    // LETTERS EXPLODE
    const letters = document.querySelectorAll('.ch');
    let explodedCount = 0;

    letters.forEach(c => {
      c._exploded = false;
      c.addEventListener('click', e => {
        e.stopPropagation();
        if (c._exploded) return;
        c._exploded = true;
        explodedCount++;

        const angle = Math.random() * Math.PI * 2;
        const dist = 300 + Math.random() * 400;

        gsap.to(c, {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 200, // Bias upwards
          rotation: `+=${(Math.random() - 0.5) * 1440}`,
          scale: 0,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
          pointerEvents: 'none'
        });

        playWoosh();

        if (explodedCount === letters.length) {
          typeWriter("woah!!");
          // Rain Bianca's face
          const numFaces = window.innerWidth <= 700 ? 35 : 70;
          for (let i = 0; i < numFaces; i++) {
            const face = document.createElement('img');
            face.src = 'biancasface.png';
            face.style.position = 'fixed';
            face.style.zIndex = '9999';
            face.style.pointerEvents = 'none';

            const size = 40 + Math.random() * 70;
            face.style.width = `${size}px`;
            face.style.height = 'auto';
            face.style.left = `${Math.random() * 100}vw`;
            face.style.top = `${-150 - Math.random() * 300}px`;

            document.body.appendChild(face);

            gsap.to(face, {
              y: window.innerHeight + 500,
              x: `+=${(Math.random() - 0.5) * 300}`,
              rotation: (Math.random() - 0.5) * 1080,
              duration: 2 + Math.random() * 2.5,
              ease: 'power1.in',
              delay: Math.random() * 0.8,
              onComplete: () => face.remove()
            });
          }

          setTimeout(() => {
            explodedCount = 0;
            gsap.set(letters, { clearProps: 'transform,opacity,pointerEvents' });
            letters.forEach(l => l._exploded = false);

            gsap.from(letters, {
              scale: 0,
              opacity: 0,
              y: 40,
              duration: 0.8,
              stagger: 0.05,
              ease: 'back.out(1.5)'
            });
            playWoosh();
          }, 3500); // Delayed reset slightly to match the rain duration
        }
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
    ov.addEventListener('click', e => { if (e.target === ov) closeOv() });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeOv() });

    // MOBILE SCROLL CENTER CARD
    const boxesScroll = document.querySelector('.boxes-scroll');
    if (boxesScroll && window.innerWidth <= 700) {
      function updateCenterCard() {
        const center = window.innerWidth / 2;
        let closest = null;
        let minDiff = Infinity;
        boxes.forEach(box => {
          const rect = box.getBoundingClientRect();
          const boxCenter = rect.left + rect.width / 2;
          const diff = Math.abs(center - boxCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closest = box;
          }
        });
        boxes.forEach(box => {
          const rot = parseFloat(getComputedStyle(box).getPropertyValue('--rot')) || 0;
          if (box === closest) {
            gsap.to(box, { scale: 1.05, rotation: rot, zIndex: 30, duration: 0.3, overwrite: 'auto' });
          } else {
            gsap.to(box, { scale: 0.9, rotation: rot, zIndex: 20, duration: 0.3, overwrite: 'auto' });
          }
        });
      }

      // Let entrance animations finish before applying scroll logic
      setTimeout(() => {
        updateCenterCard();
        boxesScroll.addEventListener('scroll', updateCenterCard);
        window.addEventListener('resize', updateCenterCard);
      }, 1200);
    }

    // Cursor hover states
    if (isFine) {
      document.querySelectorAll('.box,.ov-x').forEach(el => {
        el.addEventListener('mouseenter', () => cur.querySelector('.cursor-dot').style.transform = 'translate(-50%,-50%) scale(2.5)');
        el.addEventListener('mouseleave', () => cur.querySelector('.cursor-dot').style.transform = 'translate(-50%,-50%) scale(1)');
      });
    }

    // HAND JUGGLE
    const handLeft = document.querySelector('.hand-left');
    const handRight = document.querySelector('.hand-right');
    if (handLeft && handRight && isFine) {

      // Dedicated preview faces for hover so they don't teleport away
      const hoverFaceL = document.createElement('img');
      hoverFaceL.src = 'biancasface.png';
      hoverFaceL.className = 'juggle-face';
      document.body.appendChild(hoverFaceL);
      gsap.set(hoverFaceL, { opacity: 0, scale: 0.8 });

      const hoverFaceR = document.createElement('img');
      hoverFaceR.src = 'biancasface.png';
      hoverFaceR.className = 'juggle-face';
      document.body.appendChild(hoverFaceR);
      gsap.set(hoverFaceR, { opacity: 0, scale: 0.8 });

      const restingFaces = { left: [], right: [] };
      let lastJuggleTime = 0;
      let hoveredHand = null; // 'left' or 'right'
      const JUGGLE_COOLDOWN = 500;

      function getPalmPos(hand) {
        const rect = hand.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.38 };
      }

      function showHover(hand, faceEl, side) {
        if (restingFaces[side].length > 0) return;
        if (Date.now() - lastJuggleTime < JUGGLE_COOLDOWN) return;
        const pos = getPalmPos(hand);
        gsap.to(faceEl, {
          left: pos.x - 27, top: pos.y - 27,
          opacity: 0.8, scale: 1, rotation: 0,
          duration: 0.25, ease: 'back.out(2)', overwrite: true
        });
      }

      function hideHover(faceEl) {
        gsap.to(faceEl, { opacity: 0, scale: 0.6, duration: 0.2, overwrite: true });
      }

      handLeft.addEventListener('mouseenter', () => { hoveredHand = 'left'; showHover(handLeft, hoverFaceL, 'left'); });
      handLeft.addEventListener('mouseleave', () => { hoveredHand = null; hideHover(hoverFaceL); });
      handRight.addEventListener('mouseenter', () => { hoveredHand = 'right'; showHover(handRight, hoverFaceR, 'right'); });
      handRight.addEventListener('mouseleave', () => { hoveredHand = null; hideHover(hoverFaceR); });



      function juggleTo(fromHand, toHand, toSide) {
        const fromSide = toSide === 'right' ? 'left' : 'right';
        const hasExisting = restingFaces[fromSide].length > 0;

        // Cooldown only applies to spawning NEW heads
        if (!hasExisting && (Date.now() - lastJuggleTime < JUGGLE_COOLDOWN)) return;
        showJuggleReaction();

        if (!hasExisting) {
          lastJuggleTime = Date.now();
          // Hide previews only on new spawn cooldown
          hideHover(hoverFaceL);
          hideHover(hoverFaceR);
          setTimeout(() => {
            if (hoveredHand === 'left') showHover(handLeft, hoverFaceL, 'left');
            if (hoveredHand === 'right') showHover(handRight, hoverFaceR, 'right');
          }, JUGGLE_COOLDOWN);
        }

        let face;
        let startY;

        if (hasExisting) {
          // Toss an existing face that's already in the hand
          face = restingFaces[fromSide].pop();
          startY = parseFloat(face.style.top) || (getPalmPos(fromHand).y - 27);
          gsap.killTweensOf(face);

          // If now empty, ensure preview appears immediately if still hovering
          if (restingFaces[fromSide].length === 0) {
            if (fromSide === 'left') showHover(handLeft, hoverFaceL, 'left');
            else showHover(handRight, hoverFaceR, 'right');
          }
        } else {
          // Spawn a new permanent face
          face = document.createElement('img');
          face.src = 'biancasface.png';
          face.className = 'juggle-face';
          document.body.appendChild(face);

          const from = getPalmPos(fromHand);
          startY = from.y - 27;
          gsap.set(face, { left: from.x - 27, top: startY, opacity: 1, scale: 1 });
        }

        const to = getPalmPos(toHand);

        // Scatter landing position so they pile up chaotically
        const scatterX = (Math.random() - 0.5) * 60;
        const scatterY = (Math.random() - 0.5) * 60;
        const finalX = to.x - 27 + scatterX;
        const finalY = to.y - 27 + scatterY;
        const arcHeight = 280 + Math.random() * 120;

        const tl = gsap.timeline({
          onComplete: () => {
            restingFaces[toSide].push(face);
            // If a head just landed, hide the preview face
            if (toSide === 'left') hideHover(hoverFaceL);
            else hideHover(hoverFaceR);
          }
        });

        // Horizontal movement
        tl.to(face, {
          left: finalX,
          duration: 0.7,
          ease: 'none'
        }, 0);

        // Vertical arc: up then down
        tl.to(face, {
          top: Math.min(startY, finalY) - arcHeight,
          duration: 0.35,
          ease: 'power2.out'
        }, 0);
        tl.to(face, {
          top: finalY,
          duration: 0.35,
          ease: 'power2.in'
        }, 0.35);

        // Spin
        tl.to(face, {
          rotation: `+=${(toSide === 'right' ? 1 : -1) * (360 + Math.random() * 360)}`,
          duration: 0.7,
          ease: 'power1.inOut'
        }, 0);

        // Little bounce on landing
        tl.to(face, {
          scale: 1.2,
          duration: 0.08,
          ease: 'power2.out'
        }, 0.65);
        tl.to(face, {
          scale: 1,
          duration: 0.2,
          ease: 'elastic.out(1, 0.4)'
        }, 0.73);

        playBoing();
      }

      handLeft.addEventListener('click', e => {
        e.stopPropagation();
        juggleTo(handLeft, handRight, 'right');
      });

      handRight.addEventListener('click', e => {
        e.stopPropagation();
        juggleTo(handRight, handLeft, 'left');
      });

      // Add hand hover states for custom cursor
      [handLeft, handRight].forEach(el => {
        el.addEventListener('mouseenter', () => cur.querySelector('.cursor-dot').style.transform = 'translate(-50%,-50%) scale(2.5)');
        el.addEventListener('mouseleave', () => cur.querySelector('.cursor-dot').style.transform = 'translate(-50%,-50%) scale(1)');
      });
    }

  } // end runEntrance

})();
