/* =============================================================
   BIRTHDAY SURPRISE WEBSITE — SCRIPT
   Organized into small, independent modules. Each init function
   can be read (and reused) on its own.
   ============================================================= */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============ 1. OPENING SCREEN (the "envelope") ============ */
function initOpeningScreen() {
  const openBtn = document.getElementById('openBtn');
  const envelope = document.getElementById('envelope');
  const openingScreen = document.getElementById('openingScreen');
  const htmlEl = document.documentElement;
  if (!openBtn || !envelope || !openingScreen) return;

  openBtn.addEventListener('click', () => {
    openBtn.classList.add('is-breaking');
    openBtn.disabled = true;

    // 1. seal breaks -> 2. flap opens -> 3. whole screen fades away -> 4. unlock scroll
    setTimeout(() => envelope.classList.add('is-open'), 220);

    setTimeout(() => {
      openingScreen.classList.add('is-closing');
      htmlEl.classList.remove('lock-scroll');
      startHeroTyping();
      showMusicTooltip();
    }, 900);

    setTimeout(() => {
      openingScreen.style.display = 'none';
    }, 1900);
  }, { once: true });
}

/* ============ 2. AMBIENT FLOATING HEARTS ============ */
function spawnAmbientHeart(container) {
  if (!container) return;
  const heart = document.createElement('span');
  heart.className = 'ambient-heart';
  heart.textContent = Math.random() > 0.5 ? '❤' : '♥';
  heart.style.left = Math.random() * 100 + '%';
  heart.style.fontSize = (10 + Math.random() * 14) + 'px';
  heart.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
  heart.style.animationDuration = (8 + Math.random() * 6) + 's';
  container.appendChild(heart);
  heart.addEventListener('animationend', () => heart.remove());
}

function startAmbientHearts() {
  if (REDUCED_MOTION) return; // keep the page calm if the user prefers less motion

  const containers = [
    document.getElementById('ambientHearts'),
    document.getElementById('ambientHeartsSurprise'),
    document.getElementById('ambientHeartsFinal')
  ].filter(Boolean);

  if (!containers.length) return;

  containers.forEach((c) => {
    for (let i = 0; i < 3; i++) setTimeout(() => spawnAmbientHeart(c), i * 900);
  });

  // one gentle heart every ~1.4s keeps things light on low-end phones
  setInterval(() => {
    const c = containers[Math.floor(Math.random() * containers.length)];
    spawnAmbientHeart(c);
  }, 1400);
}

/* ============ 3. HERO TYPING ANIMATION ============ */
function startHeroTyping() {
  const el = document.getElementById('heroTypingText');
  if (!el) return;
  const text = '...to the most unexpected person in my life...';

  if (REDUCED_MOTION) {
    el.textContent = text;
    el.classList.add('done');
    return;
  }

  let i = 0;
  el.textContent = '';
  function tick() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(tick, 28);
    } else {
      el.classList.add('done');
    }
  }
  setTimeout(tick, 300);
}

/* ============ 4. SCROLL REVEAL ============ */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((el) => observer.observe(el));
}

/* ============ 5. SUBTLE PARALLAX (hero only) ============ */
function initParallax() {
  if (REDUCED_MOTION) return;
  const hero = document.getElementById('hero');
  const inner = hero ? hero.querySelector('.hero-inner') : null;
  if (!hero || !inner) return;

  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const progress = Math.min(Math.max(-rect.top / (rect.height || 1), 0), 1);
        inner.style.transform = `translateY(${progress * 30}px)`;
        ticking = false;
      });
    },
    { passive: true }
  );
}

/* ============ 6. GALLERY LIGHTBOX ============ */
function initGalleryLightbox() {
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  if (!items.length || !lightbox) return;

  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  let currentIndex = 0;

  function render() {
    const img = items[currentIndex].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  }

  function open(index) {
    currentIndex = index;
    render();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('lock-scroll');
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('lock-scroll');
  }

  function show(delta) {
    currentIndex = (currentIndex + delta + items.length) % items.length;
    render();
  }

  items.forEach((item, i) => item.addEventListener('click', () => open(i)));
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => show(-1));
  nextBtn.addEventListener('click', () => show(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(-1);
    if (e.key === 'ArrowRight') show(1);
  });
}

/* ============ 7. SURPRISE: CONFETTI + ROSE BURST ============ */
function spawnConfetti() {
  const container = document.getElementById('confettiContainer');
  if (!container || REDUCED_MOTION) return;

  const colors = ['#D9A566', '#8C3A4B', '#F3D9CE', '#B85C6F', '#FFF8F3'];
  const count = 46;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animationDuration = (2.2 + Math.random() * 1.6) + 's';
    piece.style.animationDelay = (Math.random() * 0.4) + 's';
    container.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}

function spawnRoseBurst() {
  const container = document.getElementById('confettiContainer');
  if (!container || REDUCED_MOTION) return;

  for (let i = 0; i < 18; i++) {
    const rose = document.createElement('span');
    rose.className = 'rose-burst-piece';
    rose.textContent = '🌹';
    rose.style.left = (30 + Math.random() * 40) + '%';
    rose.style.setProperty('--driftx', (Math.random() * 160 - 80) + 'px');
    rose.style.animationDuration = (2 + Math.random() * 1.4) + 's';
    rose.style.animationDelay = (Math.random() * 0.3) + 's';
    container.appendChild(rose);
    rose.addEventListener('animationend', () => rose.remove());
  }
}

function initSurprise() {
  const btn = document.getElementById('surpriseBtn');
  const rose = document.getElementById('surpriseRose');
  const message = document.getElementById('surpriseMessage');
  if (!btn || !message) return;

  btn.addEventListener('click', () => {
    spawnConfetti();
    spawnRoseBurst();
    if (rose) {
      rose.classList.remove('hidden');
      requestAnimationFrame(() => rose.classList.add('is-visible'));
    }
    message.classList.remove('hidden');
    requestAnimationFrame(() => message.classList.add('is-visible'));
  });
}

/* ============ 8. COUNTDOWN TO 09 SEPTEMBER ============ */
function getBirthdayTarget() {
  const now = new Date();
  return new Date(now.getFullYear(), 8, 9, 0, 0, 0, 0); // month 8 = September
}

function dayStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function initCountdown() {
  const activeEl = document.getElementById('countdownActive');
  const todayEl = document.getElementById('countdownToday');
  const pastEl = document.getElementById('countdownPast');
  const dEl = document.getElementById('cdDays');
  const hEl = document.getElementById('cdHours');
  const mEl = document.getElementById('cdMinutes');
  const sEl = document.getElementById('cdSeconds');
  if (!activeEl || !todayEl || !pastEl) return;

  function render() {
    const now = new Date();
    const target = getBirthdayTarget();
    const nowDay = dayStart(now).getTime();
    const targetDay = dayStart(target).getTime();

    activeEl.classList.add('hidden');
    todayEl.classList.add('hidden');
    pastEl.classList.add('hidden');

    if (nowDay === targetDay) {
      todayEl.classList.remove('hidden');
      return false; // it's the big day — stop the ticking clock
    }

    if (nowDay > targetDay) {
      pastEl.classList.remove('hidden');
      return false; // already celebrated this year — no negative countdown
    }

    activeEl.classList.remove('hidden');
    const diff = target - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    dEl.textContent = String(days).padStart(2, '0');
    hEl.textContent = String(hours).padStart(2, '0');
    mEl.textContent = String(minutes).padStart(2, '0');
    sEl.textContent = String(seconds).padStart(2, '0');
    return true;
  }

  const keepGoing = render();
  if (keepGoing) {
    const intervalId = setInterval(() => {
      if (!render()) clearInterval(intervalId);
    }, 1000);
  }
}

/* ============ 9. FLOATING MUSIC PLAYER ============ */
function initMusicPlayer() {
  const audio = document.getElementById('bgMusic');
  const playBtn = document.getElementById('musicToggle');
  const muteBtn = document.getElementById('muteToggle');
  if (!audio || !playBtn || !muteBtn) return;

  const iconPlay = playBtn.querySelector('.icon-play');
  const iconPause = playBtn.querySelector('.icon-pause');
  const iconVol = muteBtn.querySelector('.icon-vol');
  const iconMute = muteBtn.querySelector('.icon-mute');

  // Music never autoplays — it only starts when the user taps this button.
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => { /* browser blocked playback; user can tap again */ });
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('play', () => {
    playBtn.classList.add('is-playing');
    playBtn.setAttribute('aria-pressed', 'true');
    playBtn.setAttribute('aria-label', 'Pause music');
    iconPlay.hidden = true;
    iconPause.hidden = false;
    hideMusicTooltip();
  });

  audio.addEventListener('pause', () => {
    playBtn.classList.remove('is-playing');
    playBtn.setAttribute('aria-pressed', 'false');
    playBtn.setAttribute('aria-label', 'Play music');
    iconPlay.hidden = false;
    iconPause.hidden = true;
  });

  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    muteBtn.setAttribute('aria-pressed', String(audio.muted));
    muteBtn.setAttribute('aria-label', audio.muted ? 'Unmute' : 'Mute');
    iconVol.hidden = audio.muted;
    iconMute.hidden = !audio.muted;
  });
}

function showMusicTooltip() {
  const tooltip = document.getElementById('musicTooltip');
  if (!tooltip) return;
  setTimeout(() => tooltip.classList.add('is-visible'), 600);
  setTimeout(() => tooltip.classList.remove('is-visible'), 5000);
}

function hideMusicTooltip() {
  const tooltip = document.getElementById('musicTooltip');
  if (tooltip) tooltip.classList.remove('is-visible');
}

/* ============ INIT EVERYTHING ============ */
initOpeningScreen();
startAmbientHearts();
initScrollReveal();
initParallax();
initGalleryLightbox();
initSurprise();
initCountdown();
initMusicPlayer();
