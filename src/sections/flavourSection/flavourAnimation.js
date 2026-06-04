import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function createFlavorTransition(cans) {

    /* ══════════════════════════════════════
       PHASE 1 – STATS → FLAVOR TRANSITION
       ══════════════════════════════════════ */
    const transitionTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".flavors-section",
            start: "top bottom",
            end: "top top",
            scrub: 0.8,
            invalidateOnRefresh: true, // Recalculate on window resize
        },
    });

    transitionTl.to(".stat-sugar", { x: -500, y: -60, rotateZ: -15, scale: 0.7, opacity: 0, filter: "blur(8px)", ease: "power2.in", duration: 0.4 }, 0);
    transitionTl.to(".stat-probiotic", { x: -500, y: 60, rotateZ: -10, scale: 0.7, opacity: 0, filter: "blur(8px)", ease: "power2.in", duration: 0.4 }, 0.05);
    transitionTl.to(".stat-artificial", { x: 500, y: -40, rotateZ: 12, scale: 0.7, opacity: 0, filter: "blur(8px)", ease: "power2.in", duration: 0.4 }, 0.08);
    transitionTl.to(".connector", { opacity: 0, scale: 0.8, duration: 0.3, ease: "power2.in" }, 0);
    transitionTl.to(".stats-overlay", { autoAlpha: 0, duration: 0.15 }, 0.35);

    /* ══════════════════════════════════════
       PHASE 2 – FLAVOR HEADING REVEAL
       ══════════════════════════════════════ */
    transitionTl.fromTo(".flavor-heading .number",
        { scale: 0.3, opacity: 0, filter: "blur(16px)" },
        { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.25, ease: "back.out(1.5)" }, 0.42
    );

    transitionTl.fromTo(".flavor-heading span:not(.number)",
        { y: 40, opacity: 0, filter: "blur(6px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power3.out" }, 0.52
    );

    // ── NEW: Dynamic getter functions for fully responsive GSAP recalculation ──
    transitionTl.fromTo(".flavor-heading",
        {
            x: () => window.innerWidth <= 768 ? 0 : -100,
            y: () => window.innerWidth <= 768 ? -50 : 0,
            yPercent: () => window.innerWidth <= 768 ? 0 : -50, // Only translate -50% on desktop!
            opacity: 0,
            rotate: () => window.innerWidth <= 768 ? 0 : -90,
        },
        {
            x: 0,
            y: 0,
            yPercent: () => window.innerWidth <= 768 ? 0 : -50,
            opacity: 1,
            rotate: () => window.innerWidth <= 768 ? 0 : -90,
            duration: 0.35,
            ease: "power3.out",
        },
        0.40
    );

    /* ══════════════════════════════════════
       PHASE 3 – FLAVOR BUTTONS CASCADE
       ══════════════════════════════════════ */
    const buttons = document.querySelectorAll(".flavor-btn");
    buttons.forEach((btn, i) => {
        transitionTl.fromTo(btn,
            { 
                x: () => window.innerWidth <= 768 ? 0 : 180, 
                y: () => window.innerWidth <= 768 ? 50 : 0, 
                opacity: 0, 
                scale: 0.85, 
                filter: "blur(6px)" 
            },
            { 
                x: 0, 
                y: 0, 
                opacity: 1, 
                scale: 1, 
                filter: "blur(0px)", 
                duration: 0.18, 
                ease: "power3.out" 
            },
            0.62 + i * 0.05
        );
    });

    /* ══════════════════════════════════════
       PHASE 4 – FINAL SECTION
       ══════════════════════════════════════ */
    const heroCan = cans?.[1];
    const finalTl = gsap.timeline({
        scrollTrigger: { trigger: ".final-section", start: "top bottom", end: "bottom bottom", scrub: 1.5 },
    });

    finalTl.to(".flavor-heading", { opacity: 0, y: -100, ease: "power2.in", duration: 0.15 }, 0);
    finalTl.to(".flavor-picker", { opacity: 0, y: 100, ease: "power2.in", duration: 0.15 }, 0);

    if (heroCan) {
        finalTl.to(heroCan.position, { y: 8, z: -2, duration: 0.6, ease: "power2.in" }, 0);
        finalTl.to(heroCan.rotation, { y: "+=3.14", x: "-=0.5", z: "+=0.2", duration: 0.6, ease: "power1.inOut" }, 0);
        finalTl.to(heroCan.scale, { x: 0.5, y: 0.5, z: 0.5, duration: 0.6, ease: "power2.in" }, 0);
    }

    finalTl.fromTo(".final-graphic",
        { y: "100vh", opacity: 0.5, scale: 0.9, filter: "blur(10px)" },
        { y: "0vh", opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "power3.out" }, 0.17
    );
}