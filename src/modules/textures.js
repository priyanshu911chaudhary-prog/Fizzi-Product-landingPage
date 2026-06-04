import * as THREE from 'three';

/**
 * Loads a single texture and returns a Promise.
 */
function loadTexture(loader, path) {
    return new Promise((resolve, reject) => {
        loader.load(
            path,
            (texture) => resolve(texture),
            undefined,
            (error) => {
                console.error(`Error loading texture: ${path}`, error);
                reject(error);
            }
        );
    });
}

export async function loadTextures() {
    const textureLoader = new THREE.TextureLoader();

    const tablePaths = [
        '../src/assets/textures/table/wood_table_diff_8k.jpg',
        '../src/assets/textures/table/wood_table_nor_gl_8k.jpg',
        '../src/assets/textures/table/wood_table_arm_8k.jpg',
    ];

    const fabricPaths = [
        '../src/assets/textures/mate/fabric_pattern_05_col_01_8k.jpg',
        '../src/assets/textures/mate/fabric_pattern_05_nor_gl_8k.jpg',
        '../src/assets/textures/mate/fabric_pattern_05_rough_8k.jpg',
    ];

    const [diffuseMap, normalMap, armMap, collMap, normalMap2, roughMap] = await Promise.all([
        ...tablePaths.map(p => loadTexture(textureLoader, p)),
        ...fabricPaths.map(p => loadTexture(textureLoader, p)),
    ]);

    diffuseMap.colorSpace = THREE.SRGBColorSpace;
    collMap.colorSpace = THREE.SRGBColorSpace;

    [diffuseMap, normalMap, armMap].forEach((texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 2);
        texture.anisotropy = 16;
    });

    [collMap, normalMap2, roughMap].forEach((texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        texture.anisotropy = 16;
    });

    return { diffuseMap, normalMap, armMap, collMap, normalMap2, roughMap };
}
