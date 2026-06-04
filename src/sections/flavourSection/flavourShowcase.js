import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { flavorTextures } from "../../modules/models.js";

gsap.registerPlugin(ScrollTrigger);

const SPIN_DURATION = 0.5;
const CHERRY_INDEX = 1;

/** Matches flavourAnimation heading reveal (end: "top top") */
const PICKER_READY_TRIGGER = {
    trigger: ".flavors-section",
    start: "top top",
};

/* ─── Flavor-specific color accents for button glow ─── */
const FLAVOR_COLORS = {
    0: "rgba(180, 255, 80, 0.35)",   // Lemon — green-yellow
    1: "rgba(255, 77, 109, 0.35)",   // Cherry — red-pink
    2: "rgba(180, 100, 255, 0.35)",  // Grape — purple
    3: "rgba(255, 130, 170, 0.35)",  // Strawberry — pink
    4: "rgba(80, 220, 120, 0.35)",   // Watermelon — green
};

export function createFlavorShowcase(cans) {
    const heroCan = cans?.[1];
    const section = document.querySelector(".flavors-section");
    const picker = section?.querySelector(".flavor-picker");
    const buttons = picker
        ? [...picker.querySelectorAll("[data-flavor]")]
        : [];

    if (!heroCan || !section || !picker || buttons.length === 0 || flavorTextures.length === 0) {
        return () => { };
    }

    const labelMeshes = [];
    heroCan.traverse((child) => {
        if (child.isMesh && child.material?.map) {
            labelMeshes.push(child);
        }
    });

    if (labelMeshes.length === 0) {
        return () => { };
    }

    let currentFlavor = CHERRY_INDEX;
    let isAnimating = false;
    let spinTween = null;
    const baseRotationY = heroCan.rotation.y;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const FLAVOR_MULTIPLIERS = {
        0: 1.0,  // Lemon
        1: 1.3,   // Cherry
        2: 1.0,  // Grape
        3: 1.0,  // Strawberry
        4: 1.0   // Watermelon
    };

    const FLAVOR_ENV_MULTIPLIERS = {
        0: 1.0,   // Lemon
        1: 1.0,   // Cherry
        2: 1.0,   // Grape
        3: 1.0,   // Strawberry
        4: 1.0   // Watermelon
    };

    function setTexture(index) {
        const texture = flavorTextures[index];
        if (!texture) return;

        const mult = FLAVOR_MULTIPLIERS[index] !== undefined ? FLAVOR_MULTIPLIERS[index] : 1.0;
        const envMult = FLAVOR_ENV_MULTIPLIERS[index] !== undefined ? FLAVOR_ENV_MULTIPLIERS[index] : 1.0;

        heroCan.userData.brightnessMultiplier = mult;
        heroCan.userData.envMapIntensityMultiplier = envMult;

        for (const mesh of labelMeshes) {
            mesh.material.map = texture;
            mesh.material.needsUpdate = true;
        }

        heroCan.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.color.setScalar(0.76 * mult);
                child.material.envMapIntensity = 0.4 * envMult;
                child.material.needsUpdate = true;
            }
        });
    }

    function setActiveButton(index) {
        for (const btn of buttons) {
            const flavorIndex = Number(btn.dataset.flavor);
            const isActive = flavorIndex === index;
            btn.classList.toggle("is-active", isActive);
            btn.setAttribute("aria-pressed", String(isActive));

            // Update active button glow color
            if (isActive) {
                const glowColor = FLAVOR_COLORS[index] || FLAVOR_COLORS[1];
                btn.style.boxShadow = `0 0 20px ${glowColor}, inset 0 0 12px ${glowColor}`;
            } else {
                btn.style.boxShadow = "";
            }
        }
    }

    function finishSpin(startRotationY, index) {
        const innerCan = heroCan.children[0];
        innerCan.rotation.y = startRotationY;
        spinTween = null;
        isAnimating = false;
        currentFlavor = index;
        setActiveButton(index);
    }

    function changeFlavor(index) {
        if (index === currentFlavor || !flavorTextures[index]) return;
        if (isAnimating) return;

        const innerCan = heroCan.children[0];

        if (reducedMotion) {
            setTexture(index);
            finishSpin(0, index);
            return;
        }

        isAnimating = true;
        spinTween?.kill();

        const startRotationY = innerCan.rotation.y;
        let didSwap = false;

        // Quick scale pulse on the can during spin
        gsap.to(heroCan.scale, {
            x: 1.5,
            y: 1.5,
            z: 1.5,
            duration: SPIN_DURATION * 0.4,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
        });

        spinTween = gsap.to(innerCan.rotation, {
            y: startRotationY + Math.PI * 2,
            duration: SPIN_DURATION,
            ease: "power2.inOut",
            overwrite: true,
            onUpdate() {
                if (didSwap || this.progress() < 0.5) return;
                setTexture(index);
                didSwap = true;
            },
            onComplete() {
                finishSpin(startRotationY, index);
            },
        });
    }

    function onPickerClick(event) {
        const btn = event.target.closest("[data-flavor]");
        if (!btn || !picker.classList.contains("is-ready")) return;

        const index = Number(btn.dataset.flavor);
        if (Number.isNaN(index)) return;

        changeFlavor(index);
    }

    setTexture(CHERRY_INDEX);
    setActiveButton(CHERRY_INDEX);
    picker.addEventListener("click", onPickerClick);

    const setPickerReady = (ready) => {
        picker.classList.toggle("is-ready", ready);
        picker.setAttribute("aria-hidden", String(!ready));
    };

    const ctx = gsap.context(() => {
        ScrollTrigger.create({
            ...PICKER_READY_TRIGGER,
            onEnter: () => setPickerReady(true),
            onEnterBack: () => setPickerReady(true),
            onLeave: () => setPickerReady(false),
            onLeaveBack: () => setPickerReady(false),
        });
    }, section);

    return () => {
        spinTween?.kill();
        picker.removeEventListener("click", onPickerClick);
        picker.classList.remove("is-ready");
        ctx.revert();
    };
}
