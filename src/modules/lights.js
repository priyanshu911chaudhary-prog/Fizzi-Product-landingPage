import * as THREE from 'three';
import { scene } from './scene.js';

export function setupLights() {
    // Ambient Light
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 5.4);
    hemisphereLight.name = 'ambientLight'; 
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);

    // Main Studio Light
    const spotLight = new THREE.SpotLight(0xfff5e6, 249); 
    spotLight.name = 'mainLight'; 
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.bias = -0.0005;
    spotLight.shadow.normalBias = 0.02;
    spotLight.position.set(2, 5, 4); 
    
    // ── THE FIX: Reverted back to 0.6! Wide angles stretch and destroy shadow maps ──
    spotLight.angle = 0.6; 
    spotLight.penumbra = 0.8; // Restores the soft edge of the light
    spotLight.decay = 2;
    scene.add(spotLight);

    // Hero Spotlight (starts at 0 so it doesn't "snap" on)
    const cherryLight = new THREE.SpotLight(0xffffff, 0);
    cherryLight.name = 'cherryLight';
    cherryLight.position.set(-4.2, -2, 2.5);
    cherryLight.angle = 0.45;
    cherryLight.penumbra = 1;
    cherryLight.decay = 2;
    cherryLight.distance = 20;
    scene.add(cherryLight);

    return { hemisphereLight, spotLight, cherryLight };
}