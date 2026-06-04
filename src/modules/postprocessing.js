import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { scene, camera, renderer } from './scene.js';

export function setupPostProcessing() {
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // ── REALISM TWEAK: Macro Lens Depth of Field ──
    const bokehPass = new BokehPass(
        scene,
        camera,
        {
            focus: 3.2,       // Dialed in to hit the hero can perfectly
            aperture: 0.0002, // Wider aperture for a more noticeable blur
            maxblur: 0.005
        }
    );
    composer.addPass(bokehPass);

    return composer;
}