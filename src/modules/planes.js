import * as THREE from 'three';
import { scene } from './scene.js';

export function createPlanes(textures) {
    const { diffuseMap, normalMap, armMap, collMap, normalMap2, roughMap } = textures;

    const planeGeometry = new THREE.BoxGeometry(5, 3, 0.1, 100, 100);
    planeGeometry.setAttribute('uv2', new THREE.BufferAttribute(planeGeometry.attributes.uv.array, 2));

    const planeGeometry2 = new THREE.BoxGeometry(2.2, 1.6, 0.1, 100, 100);
    planeGeometry2.setAttribute('uv2', new THREE.BufferAttribute(planeGeometry2.attributes.uv.array, 2));

    const planeMaterial = new THREE.MeshPhysicalMaterial({
        map: diffuseMap,
        normalMap: normalMap,
        normalScale: new THREE.Vector2(1, 1),
        aoMap: armMap,
        roughnessMap: armMap,
        roughness: 1,
        metalnessMap: armMap,
        metalness: 0,
        clearcoat: 0,
        side: THREE.DoubleSide,
        transparent: true, // ── FIX: Add this so it compiles correctly on load
    });

    const planeMaterial2 = new THREE.MeshPhysicalMaterial({
        map: collMap,
        normalMap: normalMap2,
        normalScale: new THREE.Vector2(2, 2),
        roughnessMap: roughMap,
        clearcoat: 0,
        side: THREE.DoubleSide,
        transparent: true, // ── FIX: Add this so it compiles correctly on load
    });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.name = 'plane';
    plane.position.set(0, 0.2, -0.225);
    plane.receiveShadow = true;
    scene.add(plane);

    const plane2 = new THREE.Mesh(planeGeometry2, planeMaterial2);
    plane2.name = 'plane2';
    plane2.position.set(-1.4, 0.9, -0.13);
    plane2.rotation.set(0, 0, 0.2);
    scene.add(plane2);

    return { plane, plane2 };
}