gsap.registerPlugin(ScrollTrigger, TextPlugin);

// --- 1. Cinematic Fog Reveal (Page Load) ---
window.addEventListener("load", () => {
    const revealTl = gsap.timeline({ defaults: { ease: "power2.out" } });

    revealTl
        .to(".fog-layer", { opacity: 1, duration: 1 })
        .to(".hero-img-bg", { opacity: 0.3, duration: 2 }, "-=0.5")
        .to(".hero-title", { opacity: 1, y: -20, duration: 1.5 }, "-=1")
        .to(".hero-sub", { opacity: 0.8, duration: 1 }, "-=0.5")
        // THE REVEAL: Fog moves outside
        .to(".fog-1", { x: "-100%", opacity: 0, duration: 3 }, "reveal")
        .to(".fog-2", { x: "100%", opacity: 0, duration: 3 }, "reveal")
        .to(".fog-3", { y: "100%", opacity: 0, duration: 3 }, "reveal")
        .set(".fog-container", { display: "none" });
});

// --- 2. Horizontal Scroll Setup ---
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

// --- 3. Credit Drain & Typewriter Climax ---
const creditCount = document.getElementById("credit-count");
let totalCredits = 61;
const script = [
    { id: "#word-1", text: "I", cost: 4 },
    { id: "#word-2", text: "have", cost: 6 },
    { id: "#word-3", text: "always", cost: 12 },
    { id: "#word-4", text: "loved", cost: 31 },
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

script.forEach((word) => {
    climaxTl.to(word.id, {
        duration: 0.8,
        text: word.text,
        onStart: () => {
            totalCredits -= word.cost;
            creditCount.innerText = Math.max(0, totalCredits);
            gsap.to(creditCount, { scale: 1.4, color: "#fff", duration: 0.1, yoyo: true, repeat: 1 });
        }
    }, "+=0.4");
});

climaxTl.to(".epilogue", { opacity: 1, y: -20, duration: 1.5 }, "+=0.5");

// Background color bleed for climax
gsap.to("body", {
    backgroundColor: "#1a0505",
    scrollTrigger: {
        trigger: ".sentence-panel",
        containerAnimation: scrollTween,
        start: "left center",
        scrub: true
    }
});

// Parallax for images
gsap.utils.toArray(".image-slot img").forEach(img => {
    gsap.to(img, {
        x: 80,
        ease: "none",
        scrollTrigger: {
            trigger: img.parentElement,
            containerAnimation: scrollTween,
            scrub: true
        }
    });
});