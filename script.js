gsap.registerPlugin(ScrollTrigger, TextPlugin);

const panels = gsap.utils.toArray(".panel, .sentence-panel");

// 1. Horizontal Scroll Setup
let scrollTween = gsap.to(panels, {
  xPercent: -100 * (panels.length - 1),
  ease: "none",
  scrollTrigger: {
    trigger: ".horizontal",
    pin: true,
    scrub: 1,
    end: () => "+=" + (document.querySelector(".horizontal").offsetWidth)
  }
});

// 2. Hero Animation
gsap.from(".hero-title", { opacity: 0, y: 50, duration: 2 });

// 3. Savings Meter
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

// 4. THE TYPEWRITER & CREDIT DRAIN LOGIC
const creditCount = document.getElementById("credit-count");
let totalCredits = 61;

const dialogue = [
    { id: "#word-1", text: "I", cost: 4 },
    { id: "#word-2", text: "have", cost: 6 },
    { id: "#word-3", text: "always", cost: 12 },
    { id: "#word-4", text: "loved", cost: 31 },
    { id: "#word-5", text: "you", cost: 8 }
];

const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".sentence-panel",
        containerAnimation: scrollTween,
        start: "left 20%",
        toggleActions: "play none none reverse"
    }
});

dialogue.forEach((word, index) => {
    // Type out the word
    tl.to(word.id, {
        duration: 0.5,
        text: word.text,
        onStart: () => {
            // Subtract the cost and play a "drain" sound feel
            totalCredits -= word.cost;
            creditCount.innerText = Math.max(0, totalCredits);
            gsap.to(creditCount, { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1 });
            
            // Add typewriter cursor effect
            document.querySelector(word.id).style.borderRight = "2px solid #c8a96e";
        },
        onComplete: () => {
            document.querySelector(word.id).style.borderRight = "2px solid transparent";
        }
    }, "+=0.3");
});

// Final Epilogue Reveal
tl.to(".epilogue", { opacity: 1, duration: 1 }, "+=0.5");

// 5. Background Color Shift (The Debt Atmosphere)
gsap.to("body", {
    backgroundColor: "#1a0505",
    scrollTrigger: {
        trigger: ".sentence-panel",
        containerAnimation: scrollTween,
        start: "left center",
        scrub: true
    }
});

// 6. Image Parallax
gsap.utils.toArray(".image-slot").forEach(img => {
    gsap.from(img, {
        scale: 1.2,
        scrollTrigger: {
            trigger: img,
            containerAnimation: scrollTween,
            scrub: true
        }
    });
});