// 🌀 Parallax-effekt där elementen rör sig upp från botten när scrollen börjar

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const moveDistance = 200; // Större rörelse för tydligare effekt

  gsap.utils.toArray(".col-left").forEach((el) => {
    gsap.fromTo(el,
      { y: moveDistance, opacity: 0 },
      {
        y: -moveDistance,
        opacity: 1,
        ease: "power1.out",
        scrollTrigger: {
          trigger: "#parallax-wrapper",
          start: "center bottom",
          end: "bottom top",
          scrub: 1,
        },
      }
    );
  });

  gsap.utils.toArray(".col-mid").forEach((el) => {
    gsap.fromTo(el,
      { y: -moveDistance, opacity: 0 },
      {
        y: moveDistance,
        opacity: 1,
        ease: "power1.out",
        scrollTrigger: {
          trigger: "#parallax-wrapper",
          start: "center bottom",
          end: "bottom top",
          scrub: 1,
        },
      }
    );
  });

  gsap.utils.toArray(".col-right").forEach((el) => {
    gsap.fromTo(el,
      { y: moveDistance, opacity: 0 },
      {
        y: -moveDistance,
        opacity: 1,
        ease: "power1.out",
        scrollTrigger: {
          trigger: "#parallax-wrapper",
          start: "center bottom",
          end: "bottom top",
          scrub: 1,
        },
      }
    );
  });

  // Pinnar parallaxen med spacing för smidig övergång
  ScrollTrigger.create({
    trigger: "#parallax-wrapper",
    start: "top top",
    end: "bottom top",
    pin: "#parallax-inner",
    pinSpacing: true,
    scrub: true,
  });
});
