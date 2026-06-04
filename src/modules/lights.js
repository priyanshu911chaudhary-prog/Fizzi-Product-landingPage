import * as THREE from 'three';
import { scene } from './scene.js';

export function setupLights() {
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 10);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);

    const spotLight = new THREE.SpotLight(0xffffff, 10);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024 * 4;
    spotLight.shadow.mapSize.height = 1024 * 4;
    spotLight.shadow.bias = -0.0001;
    spotLight.position.set(0, 2, 2);
    scene.add(spotLight);

    const cherryLight = new THREE.SpotLight(0xffffff, 0);
    cherryLight.name = 'cherryLight';
    cherryLight.position.set(1.5, 1.5, 2);
    cherryLight.angle = 0.45;
    cherryLight.penumbra = 1;
    cherryLight.decay = 2;
    cherryLight.distance = 20;
    scene.add(cherryLight);

    return { hemisphereLight, spotLight, cherryLight };
}
