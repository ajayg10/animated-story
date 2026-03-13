gsap.registerPlugin(ScrollTrigger);

const panels = gsap.utils.toArray(".panel");

gsap.to(panels, {

  xPercent: -100 * (panels.length - 1),

  ease: "none",

  scrollTrigger: {

    trigger: ".horizontal",
    pin: true,
    scrub: 1,
    end: () => "+=" + document.querySelector(".horizontal").offsetWidth

  }

});


gsap.from(".hero-title", {

  opacity: 0,
  y: 80,
  duration: 2

});


gsap.to(".meter-fill", {

  width: "100%",
  scrollTrigger: {
    trigger: ".saving",
    start: "center center",
    scrub: 1
  }

});


gsap.to(".sentence span", {

  opacity: 1,
  y: -20,
  stagger: 0.5,

  scrollTrigger: {
    trigger: ".sentence",
    start: "center center"
  }

});