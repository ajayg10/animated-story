/* ═══════════════════════════════════════════
   THE ARCHITECT OF SILENCE
   3D Motion Scroll — Main Script
   ═══════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);


/* ── LENIS SMOOTH SCROLL ── */

const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Sync Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);


/* ═══════════════════════════════════════════
   THREE.JS — 3D PARTICLE SCENE
   ═══════════════════════════════════════════ */

const canvas = document.getElementById('scene3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030308, 0.0008);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.set(0, 0, 800);


/* ── PARTICLE SYSTEM ── */

const PARTICLE_COUNT = 4000;
const particlesGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3);
const colors = new Float32Array(PARTICLE_COUNT * 3);
const sizes = new Float32Array(PARTICLE_COUNT);

const goldColor = new THREE.Color(0xc8a96e);
const cyanColor = new THREE.Color(0x5ee7df);

for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Spread particles in a long tunnel
    positions[i * 3] = (Math.random() - 0.5) * 2000;   // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;   // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6000;   // z (deep tunnel)

    // Mix gold and cyan colors
    const mixFactor = Math.random();
    const color = goldColor.clone().lerp(cyanColor, mixFactor * 0.3);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = Math.random() * 3 + 1;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const particlesMaterial = new THREE.PointsMaterial({
    size: 2.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
});

const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particleSystem);


/* ── WIREFRAME GEOMETRY (Floating shapes) ── */

const geometries = [];

// Dodecahedrons
for (let i = 0; i < 6; i++) {
    const geo = new THREE.DodecahedronGeometry(
        Math.random() * 40 + 20, 0
    );
    const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xc8a96e : 0x5ee7df,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
        (Math.random() - 0.5) * 1200,
        (Math.random() - 0.5) * 1200,
        (Math.random() - 0.5) * 3000
    );
    mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    mesh.userData = {
        rotSpeed: {
            x: (Math.random() - 0.5) * 0.003,
            y: (Math.random() - 0.5) * 0.003,
            z: (Math.random() - 0.5) * 0.001,
        }
    };
    scene.add(mesh);
    geometries.push(mesh);
}

// Torus rings
for (let i = 0; i < 4; i++) {
    const geo = new THREE.TorusGeometry(
        Math.random() * 60 + 30,
        1,
        16,
        60
    );
    const mat = new THREE.MeshBasicMaterial({
        color: 0xc8a96e,
        wireframe: true,
        transparent: true,
        opacity: 0.05,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
        (Math.random() - 0.5) * 1500,
        (Math.random() - 0.5) * 1000,
        -1000 - Math.random() * 2000
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    mesh.userData = {
        rotSpeed: {
            x: (Math.random() - 0.5) * 0.002,
            y: (Math.random() - 0.5) * 0.002,
            z: 0,
        }
    };
    scene.add(mesh);
    geometries.push(mesh);
}


/* ── SCROLL-DRIVEN CAMERA MOTION ── */

let scrollProgress = 0;
const cameraStartZ = 800;
const cameraEndZ = -2500;

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    scrollProgress = scrollTop / maxScroll;

    // Move camera forward through the particle tunnel
    camera.position.z = cameraStartZ + (cameraEndZ - cameraStartZ) * scrollProgress;

    // Subtle camera sway
    camera.position.x = Math.sin(scrollProgress * Math.PI * 2) * 50;
    camera.position.y = Math.cos(scrollProgress * Math.PI * 3) * 30;

    // Slight rotation
    camera.rotation.z = Math.sin(scrollProgress * Math.PI) * 0.03;

    // Progress bar
    document.getElementById('progress').style.width = (scrollProgress * 100) + '%';
});


/* ── ANIMATION LOOP ── */

let time = 0;

function animate() {
    requestAnimationFrame(animate);
    time += 0.001;

    // Drift particles gently
    const posArray = particlesGeometry.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        posArray[i * 3 + 1] += Math.sin(time * 2 + i * 0.1) * 0.15;
    }
    particlesGeometry.attributes.position.needsUpdate = true;

    // Rotate floating shapes
    geometries.forEach(mesh => {
        mesh.rotation.x += mesh.userData.rotSpeed.x;
        mesh.rotation.y += mesh.userData.rotSpeed.y;
        mesh.rotation.z += mesh.userData.rotSpeed.z;
    });

    // Particle system slow rotation
    particleSystem.rotation.y = time * 0.05;

    renderer.render(scene, camera);
}

animate();


/* ── RESIZE HANDLER ── */

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


/* ═══════════════════════════════════════════
   GSAP SCROLL ANIMATIONS
   ═══════════════════════════════════════════ */


/* ── LOADER ── */

window.addEventListener('load', () => {
    gsap.to('#loader', {
        opacity: 0,
        duration: 1,
        delay: 0.5,
        onComplete: () => {
            document.getElementById('loader').classList.add('hidden');
            animateHero();
        }
    });
});


/* ── HERO ENTRANCE ── */

function animateHero() {
    const tl = gsap.timeline();

    tl.to('.hero-title', {
        opacity: 1,
        y: 0,
        duration: 1.8,
        ease: 'power3.out',
    })
        .to('.hero-sub', {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power2.out',
        }, '-=1')
        .to('.hero-year', {
            opacity: 0.15,
            duration: 2,
            ease: 'power2.out',
        }, '-=0.8')
        .to('.scroll-hint', {
            opacity: 1,
            duration: 1,
            ease: 'power2.out',
        }, '-=0.5');
}


/* ── HIDE SCROLL HINT ON SCROLL ── */

ScrollTrigger.create({
    trigger: '.hero',
    start: 'top top',
    end: '+=100',
    onLeave: () => {
        gsap.to('.scroll-hint', { opacity: 0, duration: 0.5 });
    },
    onEnterBack: () => {
        gsap.to('.scroll-hint', { opacity: 1, duration: 0.5 });
    }
});


/* ── STORY CARDS — Reveal on scroll ── */

document.querySelectorAll('.story-card').forEach(card => {
    gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            end: 'top 40%',
            toggleActions: 'play none none reverse',
        }
    });
});


/* ── SECTION: TEN YEARS ── */

const yearsTL = gsap.timeline({
    scrollTrigger: {
        trigger: '.section-years',
        start: 'top 70%',
        end: 'top 20%',
        toggleActions: 'play none none reverse',
    }
});

yearsTL
    .to('.years-title', {
        opacity: 1,
        scale: 1,
        duration: 1.4,
        ease: 'power3.out',
    })
    .to('.years-sub', {
        opacity: 1,
        duration: 1,
        ease: 'power2.out',
    }, '-=0.8')
    .to('.meter-track', {
        opacity: 1,
        duration: 0.6,
    }, '-=0.6');

// Meter fill on scroll
ScrollTrigger.create({
    trigger: '.section-years',
    start: 'top 50%',
    onEnter: () => {
        document.getElementById('meterFill').style.width = '100%';
    },
    onLeaveBack: () => {
        document.getElementById('meterFill').style.width = '0%';
    }
});


/* ── SECTION: WORD REGISTRY — Stagger list items ── */

gsap.utils.toArray('.word-list li').forEach((li, i) => {
    gsap.to(li, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        delay: i * 0.15,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.section-registry',
            start: 'top 60%',
            toggleActions: 'play none none reverse',
        }
    });
});

gsap.to('.word-total', {
    opacity: 1,
    duration: 0.8,
    delay: 0.9,
    ease: 'power2.out',
    scrollTrigger: {
        trigger: '.section-registry',
        start: 'top 60%',
        toggleActions: 'play none none reverse',
    }
});


/* ── SECTION: FINALE — Word-by-word reveal ── */

const words = gsap.utils.toArray('.sentence .word');

words.forEach((word, i) => {
    gsap.to(word, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        delay: i * 0.4,
        ease: 'elastic.out(1, 0.5)',
        scrollTrigger: {
            trigger: '.section-finale',
            start: 'top 60%',
            toggleActions: 'play none none reverse',
        },
        onComplete: () => word.classList.add('revealed'),
        onReverseComplete: () => word.classList.remove('revealed'),
    });
});

// Epilogue appears after all words
gsap.to('#epilogue', {
    opacity: 1,
    y: 0,
    duration: 1.5,
    delay: 2.4,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.section-finale',
        start: 'top 60%',
        toggleActions: 'play none none reverse',
    }
});


/* ═══════════════════════════════════════════
   SIDE NAVIGATION
   ═══════════════════════════════════════════ */

const sections = gsap.utils.toArray('.story-section');
const dots = gsap.utils.toArray('.side-nav .dot');

sections.forEach((section, i) => {
    ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveDot(i),
        onEnterBack: () => setActiveDot(i),
    });
});

function setActiveDot(index) {
    dots.forEach((d, i) => {
        d.classList.toggle('active', i === index);
    });
}

// Click to scroll
dots.forEach(dot => {
    dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.section);
        const target = sections[idx];
        if (target) {
            lenis.scrollTo(target, { duration: 2 });
        }
    });
});


/* ═══════════════════════════════════════════
   IMAGE PARALLAX
   ═══════════════════════════════════════════ */

document.querySelectorAll('.scene-image').forEach(img => {
    gsap.to(img, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
            trigger: img,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
        }
    });
});