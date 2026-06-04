import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { scene } from './scene.js';
import { animateCan1 } from '../animations/heroAnim/can1Animation.js';
import { animateCan2 } from '../animations/heroAnim/can2Animation.js';
import { animateCan3 } from '../animations/heroAnim/can3Animation.js';
import { animateCan4 } from '../animations/heroAnim/can4Animation.js';
import { animateCan5 } from '../animations/heroAnim/can5Animation.js';
import { createScrollAnimation } from './scrollAnimation.js';
import gsap from 'gsap';
import { createFlavorShowcase } from '../sections/flavourSection/flavourShowcase.js';


export const flavorTextures = [];
export const cans = [];

/**
 * Loads label textures (can labels) — returns a Promise that resolves
 * only when ALL label textures are fully decoded and ready.
 */
function loadLabelTextures() {
    const loader = new THREE.TextureLoader();
    const paths = [
        '../src/assets/textures/lemon-lime.png',
        '../src/assets/textures/cherry.png',
        '../src/assets/textures/grape.png',
        '../src/assets/textures/strawberry.png',
        '../src/assets/textures/watermelon.png'
    ];

    const promises = paths.map(path => new Promise((resolve, reject) => {
        loader.load(
            path,
            (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.flipY = false;
                resolve(texture);
            },
            undefined,
            (error) => {
                console.error(`Error loading label texture: ${path}`, error);
                reject(error);
            }
        );
    }));

    return Promise.all(promises);
}

/**
 * Loads the GLTF can model — returns a Promise that resolves with the model scene.
 */
function loadCanModel() {
    return new Promise((resolve, reject) => {
        const gltfLoader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        gltfLoader.setDRACOLoader(dracoLoader);

        gltfLoader.load(
            '../src/assets/models/Soda-can.gltf',
            (gltf) => resolve(gltf.scene),
            undefined,
            (error) => {
                console.error('Error loading model:', error);
                reject(error);
            }
        );
    });
}

/**
 * Loads all models and label textures. Returns a Promise that resolves
 * when everything is fully loaded and ready to render.
 * Does NOT start any animations — that's the caller's job.
 */
export async function loadModels(cherryLight) {
    const [modelScene, labelTextures] = await Promise.all([
        loadCanModel(),
        loadLabelTextures(),
    ]);

    flavorTextures.push(...labelTextures);

    const model = modelScene;

    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material.map) {
                child.material.map.anisotropy = 16;
            }
        }
    });

    const separation = 0.5;
    const totalCans = 5;
    const offset = (totalCans - 1) * separation / 2;
    const canMaterialSettings = {
        metalness: 0.7,
        roughness: 0.62,
        clearcoat: 0.08,
        clearcoatRoughness: 0.45,
        envMapIntensity: 0.18,
        specularIntensity: 0.55,
        specularColor: new THREE.Color(0xf7ede3)
    };

    for (let i = 0; i < totalCans; i++) {
        const can = model.clone();

        can.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material = new THREE.MeshPhysicalMaterial({
                    map: labelTextures[i],
                    ...canMaterialSettings
                });
            }
        });

        // Create a parent wrapper group to isolate scroll animations from interactive spin animations
        const wrapper = new THREE.Group();
        wrapper.name = `can-wrapper-${i}`;
        wrapper.position.x = i * separation - offset;
        wrapper.rotation.y = 3.44;
        wrapper.add(can);

        cans.push(wrapper);
        scene.add(wrapper);
    }

    cherryLight.target = cans[1];
    scene.add(cherryLight.target);

    return cans;
}

/**
 * Plays the intro can animation. Call this AFTER all assets are loaded.
 */
export function playIntroAnimation(loadedCans, plane, plane2, renderer) {
    const intro = gsap.timeline({ paused: true });
    intro.add(animateCan1(loadedCans[0]), 0);
    intro.add(animateCan2(loadedCans[1]), 0);
    intro.add(animateCan3(loadedCans[2]), 0);
    intro.add(animateCan4(loadedCans[3]), 0);
    intro.add(animateCan5(loadedCans[4]), 0);

    intro.eventCallback("onComplete", () => {
        createScrollAnimation(
            loadedCans,
            scene,
            renderer,
            plane,
            plane2
        );

        createFlavorShowcase(loadedCans);
    });

    return intro;
}
