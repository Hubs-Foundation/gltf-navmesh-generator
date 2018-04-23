const fs = require("fs-extra");
const crypto = require("crypto");
const path = require("path");
// TODO: Avoid leaking/overwriting THREE global.
global.THREE = require("three");
require("three/examples/js/loaders/GLTFLoader");
const Builder = require("three-pathfinding/src/Builder");
const { ConvertGltfToGLB } = require("gltf-import-export");

function toArrayBuffer(buffer) {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  let bufferView = new Uint8Array(arrayBuffer);

  for (var i = 0; i < buffer.length; ++i) {
    bufferView[i] = buffer[i];
  }

  return arrayBuffer;
}

function parseGlbAsync(glbArrayBuffer) {
  return new Promise((resolve, reject) => {
    new THREE.GLTFLoader().parse(glbArrayBuffer, "", resolve, reject);
  });
}

module.exports = async function generateNavMeshJSON(gltfPath, navMeshPath) {
  let glbPath = gltfPath;

  if (gltfPath.endsWith(".gltf")) {
    glbPath = path.join(path.basename(gltfPath, ".gltf"), "navmesh_temp.glb");
    ConvertGltfToGLB(gltfPath, glbPath);
  }

  const glbBuffer = await fs.readFile(glbPath);
  const glbArrayBuffer = toArrayBuffer(glbBuffer);
  const { scene } = await parseGlbAsync(glbArrayBuffer);

  const navMeshObj = scene.getObjectByName("Navmesh");

  if (!navMeshObj) {
    throw new Error("Navmesh Object3D not found");
  }

  const geometry = new THREE.Geometry().fromBufferGeometry(navMeshObj.geometry);

  const navMeshData = Builder.buildZone(geometry);
  const navMeshJSON = JSON.stringify(navMeshData);

  await fs.writeFile(navMeshPath, navMeshJSON);

  return navMeshPath;
};
