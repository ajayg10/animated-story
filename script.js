gsap.registerPlugin(ScrollTrigger, TextPlugin);

const tickSound = document.getElementById("tick-sound");
const startOverlay = document.getElementById("start-overlay");
const creditCount = document.getElementById("credit-count");

let totalCredits = 61;

// --- 1. Audio Control ---
function playTick(isGold) {
    if (tickSound) {
        tickSound.currentTime = 0;
        tickSound.playbackRate = isGold ? 0.6 : 1.6; // Deep for "Loved", snappy for others
        tickSound.volume = isGold ? 1.0 : 0.4;
        tickSound.play().catch(() => {}); 
    }
}

// --- 2. Start Sequence ---
startOverlay.addEventListener("click", () => {
    // Prime audio
    tickSound.play();
    tickSound.pause();
    
    // Fade out overlay
    gsap.to(startOverlay, { 
        opacity: 0, 
        duration: 1, 
        onComplete: () => {
            startOverlay.style.display = "none";
            runRevealAnimation();
        } 
    });
});

function runRevealAnimation() {
    const revealTl = gsap.timeline({ defaults: { ease: "power2.out" } });
    
    revealTl
        .to(".fog-layer", { opacity: 1, duration: 1 })
        .to(".hero-img-bg", { opacity: 0.5, duration: 2 }, "-=0.5")
        .to(".hero-title", { opacity: 1, y: -20, duration: 1.5 }, "-=1")
        .to(".hero-sub", { opacity: 0.8, duration: 1 }, "-=0.5")
        .add("clearFog")
        .to(".fog-1", { x: "-120%", opacity: 0, duration: 3 }, "clearFog")
        .to(".fog-2", { x: "120%", opacity: 0, duration: 3 }, "clearFog")
        .set(".fog-container", { display: "none" });
}

// --- 3. Horizontal Scroll ---
const panels = gsap.utils.toArray(".panel, .sentence-panel");
let scrollTween = gsap.to(panels, {
    xPercent: -100 * (panels.length - 1),
    ease: "none",
    scrollTrigger: {
        trigger: ".horizontal",
        pin: true,
        scrub: 1,
        end: () => "+=" + (document.querySelector(".horizontal").scrollWidth - window.innerWidth)
    }
});

// --- 4. The Climax Logic ---
const words = [
    { id: "#word-1", text: "I", cost: 4 },
    { id: "#word-2", text: "have", cost: 6 },
    { id: "#word-3", text: "always", cost: 12 },
    { id: "#word-4", text: "loved", cost: 31, gold: true },
    { id: "#word-5", text: "you", cost: 8 }
];

const climaxTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".sentence-panel",
        containerAnimation: scrollTween,
        start: "left 30%",
        toggleActions: "play none none reverse"
    }
});

words.forEach((word) => {
    climaxTl.to(word.id, {
        duration: 0.7,
        text: word.text,
        onStart: () => {
            totalCredits -= word.cost;
            creditCount.innerText = Math.max(0, totalCredits);
            playTick(word.gold);
            
            // Visual feedback
            gsap.to(creditCount, { 
                scale: 1.5, 
                color: word.gold ? "#c8a96e" : "#ff4d4d", 
                duration: 0.1, 
                yoyo: true, 
                repeat: 1 
            });

            if (word.gold) {
                gsap.to(".sentence-panel", { x: "+=10", y: "+=10", duration: 0.05, repeat: 8, yoyo: true });
            }
        }
    }, "+=0.5");
});

climaxTl.to(".epilogue", { opacity: 1, y: -20, duration: 1.5 }, "+=0.8");

// --- 5. Atmospheric Parallax ---
gsap.utils.toArray(".image-slot img").forEach(img => {
    gsap.to(img, {
        x: 100,
        ease: "none",
        scrollTrigger: {
            trigger: img.parentElement,
            containerAnimation: scrollTween,
            scrub: true
        }
    });
});