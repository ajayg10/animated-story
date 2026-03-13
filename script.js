/* ============================================
   AUDIO ENGINE
============================================ */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;
let muted = false;

function initAudio() {
  if (!ctx) ctx = new AudioCtx();
}

function playTone(freq, type, duration, volume = 0.08, delay = 0) {
  if (muted || !ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = type;
  o.frequency.value = freq;
  const start = ctx.currentTime + delay;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(volume, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, start + duration);
  o.start(start);
  o.stop(start + duration + 0.05);
}

function playTick() {
  if (muted || !ctx) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const s = ctx.createBufferSource();
  s.buffer = buf;
  const g = ctx.createGain();
  g.gain.value = 0.04;
  s.connect(g); g.connect(ctx.destination);
  s.start();
}

function playCoin() {
  playTone(880, 'sine', 0.18, 0.06);
  playTone(1200, 'sine', 0.12, 0.04, 0.06);
}

function playClick() {
  playTone(320, 'square', 0.06, 0.05);
}

function playDeepTone() {
  if (muted || !ctx) return;
  playTone(80, 'sine', 2.5, 0.04);
}

/* Mute button toggle */
document.getElementById('mute-btn').addEventListener('click', () => {
  initAudio();
  muted = !muted;
  document.getElementById('mute-btn').textContent = muted ? '✕ Muted' : '◎ Sound';
});

/* ============================================
   CURSOR
============================================ */
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let ringX = 0, ringY = 0, curX = 0, curY = 0;

document.addEventListener('mousemove', e => {
  curX = e.clientX;
  curY = e.clientY;
  cursor.style.left = curX + 'px';
  cursor.style.top = curY + 'px';
});

// Ring follows with slight lag
function animateRing() {
  ringX += (curX - ringX) * 0.15;
  ringY += (curY - ringY) * 0.15;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

/* ============================================
   LOADING SCREEN
============================================ */
gsap.registerPlugin(ScrollTrigger, TextPlugin);

window.addEventListener('DOMContentLoaded', () => {
  const loaderLine = document.getElementById('loader-line');
  loaderLine.style.width = '120px'; // trigger CSS transition

  gsap.to('#loader', {
    opacity: 0,
    duration: 0.8,
    delay: 1.5,
    ease: 'power2.inOut',
    onComplete: () => {
      document.getElementById('loader').style.display = 'none';
      startIntroAnimation();
    }
  });
});

/* ============================================
   INTRO ANIMATION
============================================ */
function startIntroAnimation() {
  const tl = gsap.timeline();

  tl.to('#intro-eyebrow', { opacity: 1, y: 0, duration: 1, ease: 'power2.out' })
    .to('#tl1', { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, '-=0.4')
    .to('#tl2', { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, '-=0.7')
    .to('#intro-divider', { width: 80, duration: 0.9, ease: 'power2.inOut' }, '-=0.3')
    .to('#intro-sub', { opacity: 1, duration: 1.1, ease: 'power2.out' }, '-=0.5')
    .to('#intro-meta', { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.4')
    .to('#chapter-indicator', { opacity: 1, duration: 0.6 }, '-=0.3');
}

/* ============================================
   SCROLL PROGRESS + CHAPTER INDICATOR
============================================ */
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total = document.body.scrollHeight - window.innerHeight;
  document.getElementById('progress-line').style.width = (scrolled / total * 100) + '%';

  if (scrolled > 100) {
    document.getElementById('scroll-hint').style.opacity = '0';
  }

  // Update chapter indicator
  const chapters = document.querySelectorAll('.chapter[data-chapter]');
  chapters.forEach(ch => {
    const rect = ch.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.5 && rect.bottom > 0) {
      document.getElementById('chapter-current').textContent = ch.dataset.chapter;
    }
  });
});

/* ============================================
   UTILITY: split a sentence into .word spans
============================================ */
function buildWordSpans(text, container) {
  container.innerHTML = '';
  text.split(' ').forEach(word => {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = word;
    container.appendChild(span);
  });
  return container.querySelectorAll('.word');
}

/* ============================================
   CHAPTER 1 — THE ECONOMY OF WORDS
============================================ */
const ch1Words = buildWordSpans(
  'In the year 2041, the Global Silence Accord changed everything.',
  document.getElementById('ch1-headline')
);

const tl1 = gsap.timeline({
  scrollTrigger: {
    trigger: '#ch1',
    start: 'top 65%',
    once: true,
    onEnter: () => {
      initAudio();
      playDeepTone();
    }
  }
});

tl1.to('#ch1-label', { opacity: 1, duration: 1, ease: 'power2.out' })
  .to(ch1Words, {
    opacity: 1,
    y: 0,
    duration: 0.75,
    stagger: 0.17,
    ease: 'power3.out'
  }, '+=0.3')
  .to('#s1', { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, '+=1.2')
  .to('#s2', { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, '+=0.8')
  .to('#s3', { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, '+=0.8')
  .to('#ch1-quote', { opacity: 1, duration: 1.2, ease: 'power2.out' }, '+=1.0');

/* ============================================
   CHAPTER 2 — THE MAN
============================================ */
let clockInterval = null;
let clockDeg = 0;

const tl2 = gsap.timeline({
  scrollTrigger: {
    trigger: '#ch2',
    start: 'top 65%',
    once: true,
    onEnter: () => {
      clockInterval = setInterval(() => {
        playTick();
        clockDeg += 6;
        const hand = document.getElementById('clock-hand-min');
        if (hand) hand.setAttribute('transform', `rotate(${clockDeg}, 118, 138)`);
      }, 1000);

      gsap.to({ d: 0, h: 0 }, {
        d: 2331, h: 23,
        duration: 3.2,
        delay: 1.2,
        ease: 'power2.out',
        onUpdate: function () {
          document.getElementById('silence-days').textContent = Math.floor(this.targets()[0].d).toLocaleString();
          document.getElementById('silence-hrs').textContent = Math.floor(this.targets()[0].h);
        }
      });
    }
  }
});

tl2.to('#ch2-label', { opacity: 1, duration: 1 })
  .to('#silhouette', { opacity: 1, duration: 1.6, ease: 'power2.out' }, 0)
  .to('#ch2-name', { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out' }, '+=0.2')
  .to('#ch2-detail1', { opacity: 1, duration: 0.9 }, '+=0.5')
  .to('#ch2-detail2', { opacity: 1, duration: 0.9 }, '+=0.4')
  .to('#ch2-detail3', { opacity: 1, duration: 0.9 }, '+=0.4')
  .to('#ch2-counter', { opacity: 1, duration: 1.1 }, '+=0.8');

/* ============================================
   CHAPTER 3 — THE ACCOUNT
============================================ */
const milestones = [
  { credits: 5, year: 1 },
  { credits: 12, year: 2 },
  { credits: 18, year: 3 },
  { credits: 29, year: 5 },
  { credits: 41, year: 7 },
  { credits: 61, year: 10 }
];

ScrollTrigger.create({
  trigger: '#ch3',
  start: 'top 65%',
  once: true,
  onEnter: () => {
    gsap.to('#ch3-label', { opacity: 1, duration: 1 });
    gsap.to('#bank-ui', { opacity: 1, duration: 1, delay: 0.4 });

    let mIdx = 0;
    function animateMilestone() {
      if (mIdx >= milestones.length) {
        gsap.to('#ch3-stmt', { opacity: 1, y: 0, duration: 1.2, delay: 0.5 });
        return;
      }
      const m = milestones[mIdx];
      const prev = mIdx === 0 ? 0 : milestones[mIdx - 1].credits;
      gsap.to({ val: prev }, {
        val: m.credits,
        duration: 1.1,
        ease: 'power1.inOut',
        onUpdate: function () {
          const v = Math.floor(this.targets()[0].val);
          document.getElementById('bank-num').textContent = v;
          document.getElementById('bank-bar').style.width = (v / 61 * 100) + '%';
          document.getElementById('bank-years').textContent = `Year ${m.year} of 10`;
        },
        onComplete: () => {
          playCoin();
          mIdx++;
          setTimeout(animateMilestone, 650);
        }
      });
    }
    setTimeout(animateMilestone, 700);
  }
});

/* ============================================
   CHAPTER 4 — THE COST
============================================ */
ScrollTrigger.create({
  trigger: '#ch4',
  start: 'top 65%',
  once: true,
  onEnter: () => {
    gsap.to('#ch4-label', { opacity: 1, duration: 1 });
    gsap.to('#cost-registry', { opacity: 1, duration: 0.8, delay: 0.3 });

    const rows = ['#cost-I', '#cost-have', '#cost-always', '#cost-loved', '#cost-you'];
    rows.forEach((id, i) => {
      gsap.to(id, {
        opacity: 1,
        x: 0,
        duration: 0.85,
        delay: 0.6 + i * 0.45,
        ease: 'power2.out',
        onComplete: () => {
          playCoin();
          if (id === '#cost-loved') {
            // Dramatic pulse on "loved"
            gsap.timeline()
              .to('#cost-loved .word-text', { scale: 1.06, color: '#e8d5a8', duration: 0.5, ease: 'power2.out' })
              .to('#cost-loved .word-text', { scale: 1.0, color: '#c8a96e', duration: 0.5, ease: 'power2.in' });
          }
        }
      });
    });

    gsap.to('#cost-total', {
      opacity: 1,
      duration: 1.2,
      delay: 0.6 + rows.length * 0.45 + 0.5
    });
  }
});

/* ============================================
   CHAPTER 5 — THE DAY
============================================ */
ScrollTrigger.create({
  trigger: '#ch5',
  start: 'top 65%',
  once: true,
  onEnter: () => {
    gsap.to('#ch5-label', { opacity: 1, duration: 1 });

    const scenes = ['#sc1', '#sc2', '#sc3', '#sc4'];
    scenes.forEach((id, i) => {
      gsap.to(id, {
        opacity: 1, y: 0,
        duration: 1.1,
        delay: 0.4 + i * 1.0,
        ease: 'power2.out'
      });
    });

    // Scene image fades in
    gsap.to('#ch5-img-wrap', {
      opacity: 1, y: 0,
      duration: 1.5,
      delay: 4.2,
      ease: 'power2.out'
    });

    // Meter fills then clicks
    gsap.to('#meter-wrap', { opacity: 1, duration: 0.8, delay: 5.0 });
    gsap.to('#meter-fill', {
      width: '100%',
      duration: 2,
      delay: 5.5,
      ease: 'power1.inOut',
      onComplete: () => {
        playClick();
        gsap.to('#meter-click', { opacity: 1, duration: 0.25 });
        // Small shake on the meter
        gsap.to('#meter-wrap', {
          x: 3, duration: 0.05,
          yoyo: true, repeat: 5
        });
      }
    });
  }
});

/* ============================================
   CHAPTER 6 — THE FINAL SENTENCE
============================================ */
const wordBalance = {
  val: 61,
  words: [
    { id: 'fw-I', cost: 4, after: 57 },
    { id: 'fw-have', cost: 6, after: 51 },
    { id: 'fw-always', cost: 12, after: 39 },
    { id: 'fw-loved', cost: 31, after: 8 },
    { id: 'fw-you', cost: 8, after: 0 }
  ]
};

let ch6Triggered = false;

ScrollTrigger.create({
  trigger: '#ch6',
  start: 'top 65%',
  once: true,
  onEnter: () => {
    if (ch6Triggered) return;
    ch6Triggered = true;
    playDeepTone();

    gsap.to('#word-balance', { opacity: 1, duration: 1.2 });
    gsap.to('#ch6-label', { opacity: 1, duration: 1 });

    let delay = 1.0;

    wordBalance.words.forEach((word, i) => {
      delay += i === 0 ? 0.5 : 1.5;

      gsap.to(`#${word.id}`, {
        opacity: 1,
        y: 0,
        duration: 1.3,
        delay,
        ease: 'power3.out',
        onStart: () => {
          playCoin();
          animateBalance(wordBalance.val, word.after, word.id === 'fw-loved');
          wordBalance.val = word.after;
          setTimeout(() => {
            document.getElementById(word.id).classList.add('spoken');
          }, 700);
        }
      });
    });

    const epilogueDelay = delay + 1.8;
    gsap.to('#epilogue', { opacity: 1, duration: 0.1, delay: epilogueDelay });
    gsap.to('#ep1', { opacity: 1, y: 0, duration: 1.2, delay: epilogueDelay, ease: 'power2.out' });
    gsap.to('#ep2', { opacity: 1, y: 0, duration: 1.2, delay: epilogueDelay + 1.5, ease: 'power2.out' });
    gsap.to('#ep3', { opacity: 1, y: 0, duration: 1.2, delay: epilogueDelay + 2.8, ease: 'power2.out' });

    // Final fade to black
    gsap.to('#final-black', {
      opacity: 1,
      duration: 3.5,
      delay: epilogueDelay + 5.5,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.to('#final-black-text', { opacity: 1, duration: 1.5 });
      }
    });
  }
});

/* ============================================
   WORD BALANCE ANIMATION
============================================ */
function animateBalance(from, to, dramaticPause) {
  const balanceEl = document.getElementById('balance-num');
  const barFill = document.getElementById('balance-bar-fill');
  const duration = dramaticPause ? 2.2 : 1.0;
  const ease = dramaticPause ? 'power3.inOut' : 'power2.out';

  if (to <= 10) {
    balanceEl.classList.add('depleting');
    barFill.style.background = 'var(--red)';
  } else if (to < 20) {
    barFill.style.background = '#a05020';
  }

  gsap.to({ val: from }, {
    val: to,
    duration,
    ease,
    onUpdate: function () {
      const v = Math.ceil(this.targets()[0].val);
      balanceEl.textContent = v;
      barFill.style.width = (v / 61 * 100) + '%';
    }
  });
}

/* ============================================
   PARALLAX ON CHAPTER BACKGROUNDS
============================================ */
gsap.utils.toArray('.img-bg').forEach(bg => {
  gsap.to(bg, {
    yPercent: 15,
    ease: 'none',
    scrollTrigger: {
      trigger: bg.closest('.chapter, #intro'),
      scrub: true
    }
  });
});

/* ============================================
   PARALLAX ON CHAPTER LABELS
============================================ */
gsap.utils.toArray('.chapter-label').forEach(label => {
  gsap.to(label, {
    yPercent: -25,
    ease: 'none',
    scrollTrigger: {
      trigger: label.closest('.chapter'),
      scrub: true
    }
  });
});