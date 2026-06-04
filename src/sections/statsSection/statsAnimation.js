import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── Connector → Card pairings ─── */
const SEQUENCE = [
    {
        connector: ".connector-sugar",
        card: ".stat-sugar",
        fromX: -220, fromY: 80, rotate: -12,
    },
    {
        connector: ".connector-artificial",
        card: ".stat-artificial",
        fromX: 220, fromY: 80, rotate: 12,
    },
    {
        connector: ".connector-probiotic",
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
            gsap.set([".connector-sugar", ".connector-probiotic", ".connector-artificial"], { opacity: 1 });
            document.querySelectorAll(".line-horizontal, .line-diagonal").forEach(line => {
                line.style.clipPath = "none";
            });
            gsap.set(".connector-joint", { scale: 1, opacity: 1 });
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

            /* Connectors: hidden */
            gsap.set([".connector-sugar", ".connector-probiotic", ".connector-artificial"], {
                opacity: 0,
            });

            /* Lines: clipped to 0 width (draw-on start) */
            document.querySelectorAll(".line-horizontal, .line-diagonal").forEach(line => {
                line.style.clipPath = "inset(0 100% 0 0)";
            });

            /* Joints: scaled to 0 */
            gsap.set(".connector-joint", {
                scale: 0,
                opacity: 0,
                transformOrigin: "center center",
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

            /* Phase 2+3: For each connector → draw lines → pop joint → then reveal card */
            SEQUENCE.forEach(({ connector, card }, i) => {
                const connectorEl = document.querySelector(connector);
                if (!connectorEl) return;

                const diagonal = connectorEl.querySelector(".line-diagonal");
                const horizontal = connectorEl.querySelector(".line-horizontal");
                const joint = connectorEl.querySelector(".connector-joint");
                const numberEl = document.querySelector(`${card} .stat-number`);
                const labelEl = document.querySelector(`${card} .stat-label`);

                const baseDelay = 0.08 + i * 0.22;

                /* Step 1: Show connector container */
                tl.to(connectorEl, {
                    opacity: 1,
                    duration: 0.01,
                }, baseDelay);

                /* Step 2: Draw horizontal line */
                if (horizontal) {
                    tl.to(horizontal, {
                        clipPath: "inset(0 0% 0 0)",
                        duration: 0.12,
                        ease: "power2.inOut",
                    }, baseDelay + 0.01);
                }

                /* Step 3: Draw diagonal line */
                if (diagonal) {
                    tl.to(diagonal, {
                        clipPath: "inset(0 0% 0 0)",
                        duration: 0.10,
                        ease: "power2.inOut",
                    }, baseDelay + 0.08);
                }

                /* Step 4: Pop connector joint */
                if (joint) {
                    tl.to(joint, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.06,
                        ease: "back.out(4)",
                    }, baseDelay + 0.14);
                }

                /* Step 5: Card flies in (AFTER connector is fully drawn) */
                const cardDelay = baseDelay + 0.16;

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

                /* Step 6: Number pops in */
                if (numberEl) {
                    tl.to(numberEl, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.12,
                        ease: "back.out(2.5)",
                    }, cardDelay + 0.04);
                }

                /* Step 7: Label fades in */
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
