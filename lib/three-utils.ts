import * as THREE from "three";

/**
 * Recursively disposes of a Three.js Object3D and all its geometries,
 * materials, textures, and child nodes to prevent WebGL context leaks.
 */
export function disposeThreeObject(object: THREE.Object3D | null | undefined): void {
  if (!object) return;

  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((mat) => disposeMaterial(mat));
      } else {
        disposeMaterial(mesh.material);
      }
    }
  });

  if (object.parent) {
    object.parent.remove(object);
  }
}

function disposeMaterial(material: THREE.Material): void {
  material.dispose();

  // Dispose of all material texture maps explicitly
  const mat = material as unknown as Record<string, unknown>;
  
  const textureProperties = [
    'map', 'lightMap', 'bumpMap', 'normalMap', 
    'specularMap', 'envMap', 'roughnessMap', 
    'metalnessMap', 'alphaMap', 'aoMap', 
    'displacementMap', 'emissiveMap', 'clearcoatMap',
    'clearcoatNormalMap', 'clearcoatRoughnessMap'
  ];

  for (const key of textureProperties) {
    const value = mat[key];
    if (value && typeof value === "object" && "isTexture" in value && (value as THREE.Texture).isTexture) {
      (value as THREE.Texture).dispose();
      mat[key] = null; // Nullify reference
    }
  }
}
