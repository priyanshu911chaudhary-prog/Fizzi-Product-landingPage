import gsap from "gsap";
import * as THREE from 'three';

export function createScrollAnimation(cans, scene, renderer, plane, plane2) {
    console.log("createScrollAnimation called");
    const secondaryCanMaterials = [];
    const secondaryCanMeshes = []; // ── NEW LINE ──
    const canDarkness = { value: 1 };
    const cherryCan = cans[1];

    cans.forEach((can, index) => {
        if (index === 1) return; // Cherry can stays visible
        can.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.transparent = true;
                if (!child.material.userData.__originalValues) {
                    child.material.userData.__originalValues = {
                        color: child.material.color ? child.material.color.clone() : null,
                        envMapIntensity: child.material.envMapIntensity,
                        metalness: child.material.metalness,
                        specularIntensity: child.material.specularIntensity,
                        clearcoat: child.material.clearcoat,
                        clearcoatRoughness: child.material.clearcoatRoughness
                    };
                }
                secondaryCanMaterials.push(child.material);
                secondaryCanMeshes.push(child); // ── NEW LINE ──
            }
        });
    });

    const envSettings = { intensity: 0.4 };
    const bg = { value: 1 };

    if (plane) {
        plane.material.transparent = true;
        plane.material.needsUpdate = true;
    }
    if (plane2) {
        plane2.material.transparent = true;
        plane2.material.needsUpdate = true;
    }

    const cherryLighting = { env: 0.18 };
    const cherryBrightness = { value: 1 };

    const scrollTL = gsap.timeline({
        scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "+=3000",
            scrub: 1.5,
            invalidateOnRefresh: true, // ── NEW: Recalculate on window resize
        }
    });

    console.log("GSAP timeline created:", scrollTL);

    // ── NEW: Dynamic sizing functions ──
    // Note: Kept your 1.25 mobile scale tweak!
    const getScale = () => window.innerWidth <= 768 ? 1.25 : 1.85 * Math.min(window.innerWidth / 1920, 1);
    const getZ = () => window.innerWidth <= 768 ? 0.1 : 0.55;
    const getX = () => window.innerWidth <= 768 ? 0 : 0;
    const getY = () => window.innerWidth <= 768 ? 0.05 : 0;

    // ── Feed the responsive targets here (using the functions) ──
    scrollTL.to(cherryCan.position, { x: getX, y: getY, z: getZ, duration: 0.7 }, 0);
    scrollTL.to(cherryCan.scale, { x: getScale, y: getScale, z: getScale, duration: 0.7 }, 0);
    
    // (Kept your original perfect desktop rotation)
    scrollTL.to(cherryCan.rotation, { x: 0.072488, y: 15.656186, z: 0.036573, duration: 0.85 }, 0);

    scrollTL.to(canDarkness, {
        value: 0,
        duration: 0.25,
        onUpdate: () => {
            const t = canDarkness.value;
            secondaryCanMaterials.forEach((mat) => {
                const original = mat.userData.__originalValues;
                if (original?.color && mat.color) mat.color.copy(original.color).multiplyScalar(t);
                if (original && original.envMapIntensity !== undefined) mat.envMapIntensity = original.envMapIntensity * t;
                if (original && original.metalness !== undefined) mat.metalness = original.metalness * t;
                if (original && original.specularIntensity !== undefined) mat.specularIntensity = original.specularIntensity * t;
                if (original && original.clearcoat !== undefined) mat.clearcoat = original.clearcoat * t;
                if (original && original.clearcoatRoughness !== undefined) mat.clearcoatRoughness = original.clearcoatRoughness * t;
                
                mat.opacity = t;
                mat.needsUpdate = true;
            });

            // ── Turn off the shadows when the cans fade out ──
            secondaryCanMeshes.forEach((mesh) => {
                // If opacity (t) drops below 5%, completely disable the shadow
                mesh.castShadow = t > 0.05; 
            });
        }
    }, 0.15);

    if (plane) {
        scrollTL.to(plane.material, { opacity: 0, duration: 0.25 }, 0.15);
    }
    if (plane2) {
        scrollTL.to(plane2.material, { opacity: 0, duration: 0.25 }, 0.15);
    }

    scrollTL.to(bg, {
        value: 0,
        duration: 0.25,
        onUpdate: () => {
            scene.background = new THREE.Color(bg.value, bg.value, bg.value);
        }
    }, 0.15);

    scrollTL.to(renderer, { toneMappingExposure: 0.4, duration: 0.25 }, 0.15);

    scrollTL.to(envSettings, {
        intensity: 0.15,
        duration: 0.25,
        onUpdate: () => {
            scene.environmentIntensity = envSettings.intensity;
        }
    }, 0.15);

    scrollTL.to(cherryLighting, {
        env: 1.2,
        onUpdate: () => {
            const envMult = cherryCan.userData.envMapIntensityMultiplier !== undefined ? cherryCan.userData.envMapIntensityMultiplier : 1.0;
            cherryCan.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.envMapIntensity = cherryLighting.env * envMult;
                }
            });
        }
    }, 0.40);

    scrollTL.to(cherryBrightness, {
        value: 1.5,
        onUpdate: () => {
            const mult = cherryCan.userData.brightnessMultiplier !== undefined ? cherryCan.userData.brightnessMultiplier : 1.0;
            cherryCan.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.color.setScalar(cherryBrightness.value * mult);
                }
            });
        }
    }, 0.40);

    const cherryLight = scene.getObjectByName('cherryLight');
    if (cherryLight) {
        scrollTL.to(cherryLight.position, { x: 0.48, y: -1, z: 5, duration: 0.4 }, 0.40);
        scrollTL.to(cherryLight, { intensity: 47.1, angle: 1.2, duration: 0.4 }, 0.40);
    }

    // ── Fade out "SCROLL DOWN" text and arrow on initial scroll ──
    gsap.to(".scroll-indicator", {
        scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "15% top",
            scrub: true,
        },
        opacity: 0,
        y: 20
    });

    // ── Subtle continuous floating effect for the inner cherry can ──
    const innerCan = cherryCan.children[0];
    if (innerCan) {
        gsap.to(innerCan.position, {
            x: 0.01,
            z: 0.01,
            duration: 2.5,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
    }
}