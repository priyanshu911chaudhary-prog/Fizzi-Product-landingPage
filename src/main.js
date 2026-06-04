import * as THREE from 'three';
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scene, camera, renderer } from './modules/scene.js';
import { setupLights } from './modules/lights.js';
import { loadTextures } from './modules/textures.js';
import { createPlanes } from './modules/planes.js';
import { cans, loadModels, playIntroAnimation } from './modules/models.js';
import { setupEnvironment } from './modules/environment.js';
import { setupPostProcessing } from './modules/postprocessing.js';
// import { initLogoAnimation } from "./animations/logoAnimation.js";
import { createStatsAnimation } from "./sections/statsSection/statsAnimation.js";
import { createFlavorTransition } from "./sections/flavourSection/flavourAnimation.js";

import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

/* ══════════════════════════════════════
   LOADING SCREEN
   ══════════════════════════════════════ */

const loader = document.getElementById('loading-screen');
const progressBar = document.getElementById('loading-progress');
const progressText = document.getElementById('loading-percent');

THREE.DefaultLoadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    const pct = Math.round((itemsLoaded / itemsTotal) * 100);
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressText) progressText.textContent = `${pct}%`;
};

function hideLoadingScreen() {
    return new Promise((resolve) => {
        if (!loader) {
            resolve();
            return;
        }
        gsap.to(loader, {
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => {
                loader.style.display = 'none';
                resolve();
            },
        });
    });
}

/* ══════════════════════════════════════
   LENIS SMOOTH SCROLL (paused until loaded)
   ══════════════════════════════════════ */

const lenis = new Lenis();

// Lock scroll until everything loads
lenis.stop();

lenis.on('scroll', (e) => {
    ScrollTrigger.update();

    // Update scroll progress bar
    const scrollProgress = document.querySelector('.scroll-progress-bar');
    if (scrollProgress) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / docHeight) * 100;
        scrollProgress.style.width = `${progress}%`;
    }
});

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

THREE.ColorManagement.enabled = true;

/* ══════════════════════════════════════
   SYNC SETUP (instant — no loading)
   ══════════════════════════════════════ */

const { cherryLight } = setupLights();
const composer = setupPostProcessing();

/* Start render loop immediately (shows loading screen over blank scene) */
function animate() {
    requestAnimationFrame(animate);
    composer.render();
}
animate();

/* ══════════════════════════════════════
   RESPONSIVE CONNECTORS (Uniform Scaling)
   ══════════════════════════════════════ */

const sugarSettings = {
    left: 310, top: 292, diagonalWidth: 109, diagonalAngle: 75,
    horizontalWidth: 220, horizontalTop: 105, horizontalLeft: 27,
};

const probioticSettings = {
    left: 260, top: 632, diagonalWidth: 73, diagonalAngle: -63,
    horizontalWidth: 230, horizontalTop: -115, horizontalLeft: 62,
};

const artificialSettings = {
    right: 550, top: 620, diagonalWidth: 85, diagonalAngle: -70,
    diagonalLeft: 223, horizontalWidth: 225, horizontalTop: 0, horizontalLeft: 0,
};

function applyConnector(key, settings) {
    const connector = document.querySelector(`.connector-${key}`);
    if (!connector) return;

    const diagonal = connector.querySelector(".line-diagonal");
    const horizontal = connector.querySelector(".line-horizontal");

    if (settings.left !== undefined) {
        connector.style.left = `${settings.left}px`;
        connector.style.right = "";
    }
    if (settings.right !== undefined) {
        connector.style.right = `${settings.right}px`;
        connector.style.left = "";
    }
    connector.style.top = `${settings.top}px`;

    if (diagonal) {
        diagonal.style.width = `${settings.diagonalWidth}px`;
        diagonal.style.transform = `rotate(${settings.diagonalAngle}deg)`;
        if (settings.diagonalLeft !== undefined) {
            diagonal.style.left = `${settings.diagonalLeft}px`;
        }
    }

    if (horizontal) {
        horizontal.style.width = `${settings.horizontalWidth}px`;
        horizontal.style.top = `${settings.horizontalTop}px`;
        horizontal.style.left = `${settings.horizontalLeft}px`;
    }
    
    const joint = connector.querySelector(".connector-joint");
    if (joint) {
        if (key === 'probiotic') {
            joint.style.left = '28px';
            joint.style.top = 'auto';
            joint.style.bottom = '48px';
        } else if (key === 'artificial') {
            joint.style.left = '250px';
            joint.style.top = 'auto';
            joint.style.bottom = '78px';
        }
    }
}

function updateConnectors() {
    const wrapper = document.querySelector('.stats-scale-wrapper');
    if (!wrapper) return;
    
    // ── NEW: Disable the shrinking math entirely on mobile ──
    if (window.innerWidth <= 768) {
        wrapper.style.transform = "none";
        wrapper.style.width = "100%";
        wrapper.style.height = "100%";
        wrapper.style.top = "0";
        wrapper.style.left = "0";
        return; // Exit early, don't calculate the desktop lines
    }

    // ── Restore the strict 1920x900 grid if returning to desktop ──
    wrapper.style.width = "1920px";
    wrapper.style.height = "900px";
    wrapper.style.top = "50%";
    wrapper.style.left = "50%";
    
    // Scale the entire 1920x900 wrapper to fit the screen
    const scale = Math.min(window.innerWidth / 1920, 1); 
    
    wrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
    
    applyConnector("sugar", sugarSettings);
    applyConnector("probiotic", probioticSettings);
    applyConnector("artificial", artificialSettings);
}

window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
    updateConnectors();
});

// Initial call
updateConnectors();

/* ══════════════════════════════════════
   ASYNC LOADING — wait for EVERYTHING
   ══════════════════════════════════════ */

async function init() {
    try {
        // Fire all heavy loading in parallel
        const [tableTextures, , loadedCans] = await Promise.all([
            loadTextures(),
            setupEnvironment(),
            loadModels(cherryLight),
        ]);

        // Create planes AFTER textures are loaded
        const { plane, plane2 } = createPlanes(tableTextures);

        // Call playIntroAnimation to set the initial off-screen positions, but it returns a paused timeline
        const introAnimation = playIntroAnimation(loadedCans, plane, plane2, renderer);

        // Force one render so the first frame has textures visible and cans are off-screen
        composer.render();

        // Everything is loaded — fade out loading screen and wait for it to finish
        await hideLoadingScreen();

        // Unlock scroll
        lenis.start();

        // Now play intro animation — cans will fly in from off-screen
        // Add scroll indicator fade-in at the end of intro
        introAnimation.to('.scroll-indicator', {
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        }, "-=0.5");

        introAnimation.play();

        // Init scroll-based animations
        // initLogoAnimation();
        createStatsAnimation();
        createFlavorTransition(loadedCans);

    } catch (error) {
        console.error('Failed to load assets:', error);
        // Still hide loader and show whatever loaded
        await hideLoadingScreen();
        lenis.start();
    }
}

init();
