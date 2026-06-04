import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { scene, camera, renderer } from './scene.js';

export function setupPostProcessing() {
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bokehPass = new BokehPass(
        scene,
        camera,
        {
            focus: 3,
            aperture: 0.00005,
            maxblur: 0.001
        }
    );
    composer.addPass(bokehPass);

    return composer;
}
