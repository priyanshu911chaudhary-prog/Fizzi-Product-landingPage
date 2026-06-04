import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { scene } from './scene.js';

export function setupEnvironment(onProgress) {
    return new Promise((resolve, reject) => {
        const rgbeLoader = new RGBELoader();
        rgbeLoader.load(
            'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/photo_studio_01_1k.hdr',
            (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = texture;
                scene.environmentIntensity = 0.8;
                scene.backgroundBlurriness = 0;
                resolve(texture);
            },
            onProgress,
            (error) => {
                console.error('Error loading HDRI:', error);
                reject(error);
            }
        );
    });
}
