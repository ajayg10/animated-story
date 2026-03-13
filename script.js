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
  playTone(1200, 'sine', 0.12, 0.04, 0.05);
}

function playClick() {
  playTone(320, 'square', 0.06, 0.05);
}

function playAmbient() {
  if (muted || !ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = 'sine';
  o.frequency.value = 60;
  g.gain.value = 0.03;
  o.start();
  setTimeout(() => {
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
    setTimeout(() => o.stop(), 2100);
  }, 5000);
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
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

/* ============================================
   SCROLL PROGRESS LINE
============================================ */
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total = document.body.scrollHeight - window.innerHeight;
  document.getElementById('progress-line').style.width = (scrolled / total * 100) + '%';
  if (scrolled > 80) document.getElementById('scroll-hint').style.opacity = '0';
});

/* ============================================
   GSAP + SCROLLTRIGGER SETUP
============================================ */
gsap.registerPlugin(ScrollTrigger);

/* Utility: split a sentence into individual .word spans */
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
   Word-by-word staggered reveal using GSAP timeline
============================================ */
const ch1Words = buildWordSpans(
  'In the year 2041, the Global Silence Accord changed everything.',
  document.getElementById('ch1-headline')
);

const tl1 = gsap.timeline({
  scrollTrigger: {
    trigger: '#ch1',
    start: 'top 60%',
    once: true,
    onEnter: () => { initAudio(); playAmbient(); }
  }
});

tl1.to('#ch1-label', { opacity: 1, duration: 1, ease: 'power2.out' })
  .to(ch1Words, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    stagger: 0.18,         // each word appears 0.18s after the last
    ease: 'power3.out'
  }, '+=0.4')
  .to('#s1', { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, '+=1.2')
  .to('#s2', { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, '+=0.9')
  .to('#s3', { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, '+=0.9');

/* ============================================
   CHAPTER 2 — THE MAN
   Silhouette fade + silence counter counting up
============================================ */
let clockInterval = null;
let clockDeg = 0;

const tl2 = gsap.timeline({
  scrollTrigger: {
    trigger: '#ch2',
    start: 'top 60%',
    once: true,
    onEnter: () => {
      // Start clock ticking sound + hand rotation
      clockInterval = setInterval(() => {
        playTick();
        clockDeg += 6;
        const hand = document.getElementById('clock-hand-min');
        if (hand) hand.setAttribute('transform', `rotate(${clockDeg}, 118, 138)`);
      }, 1000);

      // Animate silence counter from 0 → 2331 days
      const target = { days: 2331, hrs: 23 };
      gsap.to({ d: 0, h: 0 }, {
        d: target.days, h: target.hrs,
        duration: 3.5,
        delay: 1.5,
        ease: 'power2.out',
        onUpdate: function() {
          document.getElementById('silence-days').textContent = Math.floor(this.targets()[0].d).toLocaleString();
          document.getElementById('silence-hrs').textContent = Math.floor(this.targets()[0].h);
        }
      });
    }
  }
});

tl2.to('#ch2-label', { opacity: 1, duration: 1 })
   .to('#silhouette', { opacity: 1, duration: 1.5, ease: 'power2.out' }, 0)
   .to('#ch2-name', { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }, '+=0.3')
   .to('#ch2-detail1', { opacity: 1, duration: 0.8 }, '+=0.6')
   .to('#ch2-detail2', { opacity: 1, duration: 0.8 }, '+=0.5')
   .to('#ch2-counter', { opacity: 1, duration: 1 }, '+=0.8');

/* ============================================
   CHAPTER 3 — THE ACCOUNT
   Word Bank UI with credit milestones animating
   over "10 years" — coin sound on each milestone
============================================ */
const milestones = [
  { credits: 5,  year: 1  },
  { credits: 12, year: 2  },
  { credits: 18, year: 3  },
  { credits: 29, year: 5  },
  { credits: 41, year: 7  },
  { credits: 61, year: 10 }
];

ScrollTrigger.create({
  trigger: '#ch3',
  start: 'top 60%',
  once: true,
  onEnter: () => {
    gsap.to('#ch3-label', { opacity: 1, duration: 1 });
    gsap.to('#bank-ui', { opacity: 1, duration: 1, delay: 0.3 });

    let mIdx = 0;
    function animateMilestone() {
      if (mIdx >= milestones.length) {
        // All milestones done — reveal the closing statement
        gsap.to('#ch3-stmt', { opacity: 1, y: 0, duration: 1.2, delay: 0.5 });
        return;
      }
      const m = milestones[mIdx];
      const prevCredits = mIdx === 0 ? 0 : milestones[mIdx - 1].credits;

      gsap.to({ val: prevCredits }, {
        val: m.credits,
        duration: 1.2,
        ease: 'power1.inOut',
        onUpdate: function() {
          const v = Math.floor(this.targets()[0].val);
          document.getElementById('bank-num').textContent = v;
          document.getElementById('bank-bar').style.width = (v / 61 * 100) + '%';
          document.getElementById('bank-years').textContent = `Year ${m.year} of 10`;
        },
        onComplete: () => {
          playCoin();
          mIdx++;
          setTimeout(animateMilestone, 700); // pause between milestones
        }
      });
    }
    setTimeout(animateMilestone, 600);
  }
});

/* ============================================
   CHAPTER 4 — THE COST
   Word Cost Registry rows appear one by one
   "loved" gets a dramatic scale pulse
============================================ */
ScrollTrigger.create({
  trigger: '#ch4',
  start: 'top 60%',
  once: true,
  onEnter: () => {
    gsap.to('#ch4-label', { opacity: 1, duration: 1 });
    gsap.to('#cost-registry', { opacity: 1, duration: 0.8, delay: 0.3 });

    const rows = ['#cost-I', '#cost-have', '#cost-always', '#cost-loved', '#cost-you'];
    rows.forEach((id, i) => {
      gsap.to(id, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        delay: 0.6 + i * 0.45,
        ease: 'power2.out',
        onComplete: () => {
          playCoin();
          // Dramatic pause: "loved" pulses to emphasize its cost
          if (id === '#cost-loved') {
            gsap.to('#cost-loved .word-text', {
              scale: 1.08,
              duration: 0.4,
              yoyo: true,
              repeat: 1,
              delay: 0.2
            });
          }
        }
      });
    });

    // Total line appears after all rows
    gsap.to('#cost-total', {
      opacity: 1,
      duration: 1,
      delay: 0.6 + rows.length * 0.45 + 0.4
    });
  }
});

/* ============================================
   CHAPTER 5 — THE DAY
   Scene lines appear slowly; meter fills then clicks
============================================ */
ScrollTrigger.create({
  trigger: '#ch5',
  start: 'top 60%',
  once: true,
  onEnter: () => {
    gsap.to('#ch5-label', { opacity: 1, duration: 1 });

    // Each scene line appears 1 second after the last
    const scenes = ['#sc1', '#sc2', '#sc3', '#sc4'];
    scenes.forEach((id, i) => {
      gsap.to(id, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.5 + i * 1.0,
        ease: 'power2.out'
      });
    });

    // Meter: appears, fills, then clicks
    gsap.to('#meter-wrap', { opacity: 1, duration: 0.8, delay: 4.5 });
    gsap.to('#meter-fill', {
      width: '100%',
      duration: 1.8,
      delay: 5,
      ease: 'power1.inOut',
      onComplete: () => {
        playClick();
        gsap.to('#meter-click', { opacity: 1, duration: 0.3 });
      }
    });
  }
});

/* ============================================
   CHAPTER 6 — THE FINAL SENTENCE
   Each word appears and deducts from the balance.
   Word balance counter synchronized with animation.
============================================ */

// Word balance state — tracks current credits and cost per word
const wordBalance = {
  val: 61,
  words: [
    { id: 'fw-I',      cost: 4,  after: 57 },
    { id: 'fw-have',   cost: 6,  after: 51 },
    { id: 'fw-always', cost: 12, after: 39 },
    { id: 'fw-loved',  cost: 31, after: 8  },
    { id: 'fw-you',    cost: 8,  after: 0  }
  ]
};

let ch6Triggered = false;

ScrollTrigger.create({
  trigger: '#ch6',
  start: 'top 60%',
  once: true,
  onEnter: () => {
    if (ch6Triggered) return;
    ch6Triggered = true;

    // Reveal the fixed word balance meter
    gsap.to('#word-balance', { opacity: 1, duration: 1 });
    gsap.to('#ch6-label', { opacity: 1, duration: 1 });

    let delay = 0.8;

    // Animate each word — on start, deduct from balance counter
    wordBalance.words.forEach((word, i) => {
      delay += i === 0 ? 0.5 : 1.4; // longer pause between words

      gsap.to(`#${word.id}`, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        delay,
        ease: 'power3.out',
        onStart: () => {
          playCoin();
          // Animate balance number from current → after
          animateBalance(wordBalance.val, word.after, word.id === 'fw-loved');
          wordBalance.val = word.after;

          // After 600ms mark word as "spoken" (turns gold + shows cost label)
          setTimeout(() => {
            document.getElementById(word.id).classList.add('spoken');
          }, 600);
        }
      });
    });

    // Epilogue appears after all words have been spoken
    const epilogueDelay = delay + 1.6 + wordBalance.words.length * 0.2;

    gsap.to('#epilogue', { opacity: 1, duration: 0.1, delay: epilogueDelay });
    gsap.to('#ep1', { opacity: 1, duration: 1.2, delay: epilogueDelay, ease: 'power2.out' });
    gsap.to('#ep2', { opacity: 1, duration: 1.2, delay: epilogueDelay + 1.4, ease: 'power2.out' });

    // Final fade to black
    gsap.to('#final-black', {
      opacity: 1,
      duration: 3,
      delay: epilogueDelay + 4.5,
      ease: 'power2.inOut'
    });
  }
});

/* ============================================
   WORD BALANCE COUNTER ANIMATION
   Animates the number and bar from `from` → `to`
   dramaticPause = true for the "loved" word (31 credits)
============================================ */
function animateBalance(from, to, dramaticPause) {
  const balanceEl = document.getElementById('balance-num');
  const barFill = document.getElementById('balance-bar-fill');

  const duration = dramaticPause ? 2.0 : 0.9;
  const ease = dramaticPause ? 'power3.inOut' : 'power2.out';

  // Switch to red when critically low
  if (to < 20) {
    balanceEl.classList.add('depleting');
    barFill.style.background = 'var(--red)';
  }

  gsap.to({ val: from }, {
    val: to,
    duration,
    ease,
    onUpdate: function() {
      const v = Math.ceil(this.targets()[0].val);
      balanceEl.textContent = v;
      barFill.style.width = (v / 61 * 100) + '%';
    }
  });
}

/* ============================================
   PARALLAX ON CHAPTER LABELS
   Each label drifts upward as you scroll through
============================================ */
gsap.utils.toArray('.chapter-label').forEach(label => {
  gsap.to(label, {
    yPercent: -20,
    ease: 'none',
    scrollTrigger: {
      trigger: label.closest('.chapter'),
      scrub: true
    }
  });
});
