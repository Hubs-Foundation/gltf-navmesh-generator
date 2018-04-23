# gltf-navmesh-generator

Small library and command line utility for generating precomputed navmesh data for [aframe-extra's nav-mesh](https://github.com/donmccurdy/aframe-extras/tree/master/src/pathfinding);

## Library Usage

```js
import path from "path";
import fs from "fs";
import generateNavMeshJSON from "gltf-navmesh-generator";

// Works with .gltf and .glb
// .glb input preferred.
const navMeshGltfPath = path.join(__dirname, "navmesh.gltf");

// Where to output navmesh file
const navMeshJSONPath = path.join(__dirname, "navmesh.json");

// Generates navmesh data that can be loaded in aframe via <a-entity nav-mesh="src: navmesh.json">
const outNavMeshPath = await generateNavMeshJSON(navMeshGltfPath, navMeshJSONPath);
```

## CLI Usage

```
npm install -g gltf-navmesh-generator
```

```
  Usage: gltf-navmesh-generator <gltfPath> <navMeshPath>

  Options:

    -V, --version  output the version number
    -h, --help     output usage information
```
