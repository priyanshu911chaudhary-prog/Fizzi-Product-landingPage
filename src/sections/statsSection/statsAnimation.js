import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── Card pairings ─── */
const SEQUENCE = [
    {
        card: ".stat-sugar",
        fromX: -220, fromY: 80, rotate: -12,
    },
    {
        card: ".stat-artificial",
        fromX: 220, fromY: 80, rotate: 12,
    },
    {
        card: ".stat-probiotic",
        fromX: -220, fromY: -60, rotate: -8,
    },
];

export function createStatsAnimation() {
    const section = document.querySelector(".stats-section");
    const overlay = document.querySelector(".stats-overlay");
    if (!section || !overlay) return;

    const ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        /* ─── Reduced-motion fallback ─── */
        mm.add("(prefers-reduced-motion: reduce)", () => {
            gsap.set(overlay, { autoAlpha: 1 });
            SEQUENCE.forEach(({ card }) => {
                gsap.set(card, { x: 0, y: 0, rotateZ: 0, scale: 1, opacity: 1, filter: "blur(0px)" });
            });
            gsap.set(".stat-number", { scale: 1, opacity: 1 });
            gsap.set(".stat-label", { opacity: 1, y: 0 });
        });

        /* ─── Full animation ─── */
        mm.add("(prefers-reduced-motion: no-preference)", () => {

            /* ── Initial states ── */
            gsap.set(overlay, { autoAlpha: 0 });

            /* Cards: hidden, offset, blurred */
            SEQUENCE.forEach(({ card, fromX, fromY, rotate }) => {
                gsap.set(card, {
                    x: fromX,
                    y: fromY,
                    rotateZ: rotate,
                    scale: 0.6,
                    opacity: 0,
                    filter: "blur(12px)",
                    transformPerspective: 800,
                });
            });


            /* Numbers & labels: hidden */
            gsap.set(".stat-number", { scale: 0.5, opacity: 0 });
            gsap.set(".stat-label", { opacity: 0, y: 15 });

            /* ── Master scroll timeline ── */
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "top 10%",
                    scrub: 0.6,
                },
            });

            /* Phase 1: Overlay fade in */
            tl.to(overlay, {
                autoAlpha: 1,
                duration: 0.06,
                ease: "none",
            }, 0);

            /* Phase 2: For each card → fly in */
            SEQUENCE.forEach(({ card }, i) => {
                const numberEl = document.querySelector(`${card} .stat-number`);
                const labelEl = document.querySelector(`${card} .stat-label`);

                const baseDelay = 0.08 + i * 0.22;
                const cardDelay = baseDelay + 0.16;

                /* Step 1: Card flies in */
                tl.to(card, {
                    x: 0,
                    y: 0,
                    rotateZ: 0,
                    scale: 1,
                    opacity: 1,
                    filter: "blur(0px)",
                    duration: 0.18,
                    ease: "power3.out",
                }, cardDelay);

                /* Step 2: Number pops in */
                if (numberEl) {
                    tl.to(numberEl, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.12,
                        ease: "back.out(2.5)",
                    }, cardDelay + 0.04);
                }

                /* Step 3: Label fades in */
                if (labelEl) {
                    tl.to(labelEl, {
                        opacity: 1,
                        y: 0,
                        duration: 0.10,
                        ease: "power2.out",
                    }, cardDelay + 0.08);
                }
            });
        });
    }, section);

    return () => ctx.revert();
}
