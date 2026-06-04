import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger"; // ── NEW IMPORT ──
import * as THREE from 'three';

// ── FIX PART 1: Prevent the massive flash when the mobile address bar moves ──
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

export function createScrollAnimation(cans, scene, renderer, plane, plane2) {
    console.log("createScrollAnimation called");
    const secondaryCanMaterials = [];
    const secondaryCanMeshes = [];
    const canDarkness = { value: 1 };
    const cherryCan = cans[1];

    cans.forEach((can, index) => {
        if (index === 1) return;
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
                secondaryCanMeshes.push(child);
            }
        });
    });

    const envSettings = { intensity: 0.91 }; 
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
            invalidateOnRefresh: true, 
        }
    });

    const getScale = () => window.innerWidth <= 768 ? 1.25 : 1.85 * Math.min(window.innerWidth / 1920, 1);
    const getZ = () => window.innerWidth <= 768 ? 0.1 : 0.55;
    const getX = () => window.innerWidth <= 768 ? 0 : 0;
    const getY = () => window.innerWidth <= 768 ? 0.05 : 0;

    // We keep position/scale/rotation as .to() so they seamlessly connect to your intro animation!
    scrollTL.to(cherryCan.position, { x: getX, y: getY, z: getZ, duration: 0.7 }, 0);
    scrollTL.to(cherryCan.scale, { x: getScale, y: getScale, z: getScale, duration: 0.7 }, 0);
    scrollTL.to(cherryCan.rotation, { x: 0.072488, y: 15.656186, z: 0.036573, duration: 0.85 }, 0);

    /* ════════════════════════════════════════════════════════════
       FIX PART 2: All environment variables swapped to .fromTo()
       This explicitly locks in the start AND end values forever.
       ════════════════════════════════════════════════════════════ */

    scrollTL.fromTo(canDarkness, { value: 1 }, {
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
            secondaryCanMeshes.forEach((mesh) => {
                mesh.castShadow = t > 0.05; 
            });
        }
    }, 0.15);

    if (plane) scrollTL.fromTo(plane.material, { opacity: 1 }, { opacity: 0, duration: 0.25 }, 0.15);
    if (plane2) scrollTL.fromTo(plane2.material, { opacity: 1 }, { opacity: 0, duration: 0.25 }, 0.15);

    scrollTL.fromTo(bg, { value: 1 }, {
        value: 0,
        duration: 0.25,
        onUpdate: () => {
            scene.background = new THREE.Color(bg.value, bg.value, bg.value);
        }
    }, 0.15);

    scrollTL.fromTo(renderer, { toneMappingExposure: 1.8 }, { toneMappingExposure: 1.0, duration: 0.25 }, 0.15);

    scrollTL.fromTo(envSettings, { intensity: 0.91 }, {
        intensity: 0.68,
        duration: 0.25,
        onUpdate: () => {
            scene.environmentIntensity = envSettings.intensity;
        }
    }, 0.15);

    const ambientLight = scene.getObjectByName('ambientLight');
    const mainLight = scene.getObjectByName('mainLight');
    const cherryLight = scene.getObjectByName('cherryLight');

    if (ambientLight) {
        scrollTL.fromTo(ambientLight, { intensity: 5.4 }, { intensity: 15, duration: 0.25 }, 0.15);
    }
    
    if (mainLight) {
        scrollTL.fromTo(mainLight, { intensity: 249 }, { intensity: 0, duration: 0.25 }, 0.15); 
    }

    scrollTL.fromTo(cherryLighting, { env: 0.18 }, {
        env: 0.4, 
        onUpdate: () => {
            const envMult = cherryCan.userData.envMapIntensityMultiplier !== undefined ? cherryCan.userData.envMapIntensityMultiplier : 1.0;
            cherryCan.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.envMapIntensity = cherryLighting.env * envMult;
                }
            });
        }
    }, 0.40);

    scrollTL.fromTo(cherryBrightness, { value: 1 }, {
        value: 0.76, 
        onUpdate: () => {
            const mult = cherryCan.userData.brightnessMultiplier !== undefined ? cherryCan.userData.brightnessMultiplier : 1.0;
            cherryCan.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.color.setScalar(cherryBrightness.value * mult);
                }
            });
        }
    }, 0.40);

    if (cherryLight) {
        scrollTL.fromTo(cherryLight.position, { x: -4.2, y: -2, z: 2.5 }, { x: -1.8, y: -3, z: 3.5, duration: 0.4 }, 0.40);
        scrollTL.fromTo(cherryLight, { intensity: 0, angle: 0.45 }, { intensity: 253, angle: 1.2, duration: 0.4 }, 0.40);
    }

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