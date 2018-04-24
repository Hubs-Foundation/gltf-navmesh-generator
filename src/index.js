const fs = require("fs-extra");
const crypto = require("crypto");
const path = require("path");

/**
 * Setup THREE.GLTFLoader for use in nodejs
 */
// TODO: Avoid leaking/overwriting global variables
const { JSDOM } =  require("jsdom");
const { window, document } = new JSDOM();
global.window = window;
global.document = document;
window.URL.createObjectURL = () => {};
window.URL.revokeObjectURL = () =>{};
global.URL = window.URL;
global.Blob = window.Blob;
global.THREE = require("three");
THREE.TextureLoader.prototype.load = (url, onLoad) => {
  setTimeout(() => onLoad(new THREE.Texture()), 0);
};
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

async function readToArrayBuffer(gltfPath) {
  let glbBuffer;

  if (gltfPath.endsWith(".gltf")) {
    glbPath = path.join(path.parse(gltfPath).dir, "navmesh_temp.glb");
    ConvertGltfToGLB(gltfPath, glbPath);
    glbBuffer = await fs.readFile(glbPath);
    await fs.remove(glbPath);
  } else {
    glbBuffer = await fs.readFile(glbPath);
  }

  return toArrayBuffer(glbBuffer);
}

module.exports = async function generateNavMeshJSON(gltfPath, navMeshPath, navMeshObjName) {
  const glbArrayBuffer = await readToArrayBuffer(gltfPath);
  const { scene } = await parseGlbAsync(glbArrayBuffer);

  const navMeshObj = scene.getObjectByName(navMeshObjName);

  if (!navMeshObj) {
    throw new Error("Navmesh Object3D not found");
  }

  const geometry = new THREE.Geometry().fromBufferGeometry(navMeshObj.geometry);

  const navMeshData = Builder.buildZone(geometry);
  const navMeshJSON = JSON.stringify(navMeshData);

  await fs.writeFile(navMeshPath, navMeshJSON);

  return navMeshPath;
};
