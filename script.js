gsap.registerPlugin(ScrollTrigger, TextPlugin);

// 1. Setup Horizontal Scroll
const panels = gsap.utils.toArray(".panel, .sentence-panel");

let scrollTween = gsap.to(panels, {
    xPercent: -100 * (panels.length - 1),
    ease: "none",
    scrollTrigger: {
        trigger: ".horizontal",
        pin: true,
        scrub: 1,
        // Ensure the end is calculated correctly based on width
        end: () => "+=" + (document.querySelector(".horizontal").scrollWidth - window.innerWidth)
    }
});

// 2. Hero Fade In
gsap.from(".hero-title", { opacity: 0, y: 100, duration: 2, ease: "power4.out" });

// 3. Savings Meter Animation
gsap.to(".meter-fill", {
    width: "100%",
    scrollTrigger: {
        trigger: ".saving",
        containerAnimation: scrollTween,
        start: "left center",
        end: "right center",
        scrub: true
    }
});

// 4. Typewriter & Credit System
const creditCount = document.getElementById("credit-count");
let totalCredits = 61;

const script = [
    { id: "#word-1", text: "I", cost: 4 },
    { id: "#word-2", text: "have", cost: 6 },
    { id: "#word-3", text: "always", cost: 12 },
    { id: "#word-4", text: "loved", cost: 31 },
    { id: "#word-5", text: "you", cost: 8 }
];

const climaxTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: ".sentence-panel",
        containerAnimation: scrollTween,
        start: "left 30%",
        toggleActions: "play none none reverse"
    }
});

script.forEach((word) => {
    climaxTimeline.to(word.id, {
        duration: 0.8, // Slightly longer duration per word for impact
        text: word.text,
        onStart: () => {
            totalCredits -= word.cost;
            // Update UI
            creditCount.innerText = Math.max(0, totalCredits);
            gsap.to(creditCount, { scale: 1.3, color: "#fff", duration: 0.1, yoyo: true, repeat: 1 });
        }
    }, "+=0.4"); // Delay between words increased for gravity
});

// Final Epilogue reveal
climaxTimeline.to(".epilogue", { 
    opacity: 1, 
    y: -20, 
    duration: 1.5 
}, "+=0.5");

// 5. Image Parallax Effect (Updated for better movement)
gsap.utils.toArray(".image-slot img").forEach(img => {
    gsap.to(img, {
        x: 60, // Increased distance for stronger parallax effect
        ease: "none",
        scrollTrigger: {
            trigger: img.parentElement,
            containerAnimation: scrollTween,
            scrub: true
        }
    });
});

// 6. Background "Debt" Shift
gsap.to("body", {
    backgroundColor: "#1a0505",
    scrollTrigger: {
        trigger: ".sentence-panel",
        containerAnimation: scrollTween,
        start: "left center",
        scrub: true
    }
});