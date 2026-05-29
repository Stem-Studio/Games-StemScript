/**
 * HexGL Geometry Converter: Three.js JSON v3.1 → GLB
 *
 * Parses the legacy OBJConverter format and outputs glTF 2.0 binary (.glb).
 * Builds GLB directly (no GLTFExporter dependency) for Node.js reliability.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = '/tmp/hexgl-source';

/**
 * Parse Three.js JSON v3.1 face array into flat attribute arrays.
 *
 * Bit flags per face entry:
 *   0: isQuad, 1: hasMaterial, 2: hasFaceUv, 3: hasFaceVertexUv,
 *   4: hasFaceNormal, 5: hasFaceVertexNormal, 6: hasFaceColor, 7: hasFaceVertexColor
 */
function parseJsonGeometry(data) {
  const vertices = data.vertices;
  const normals = data.normals || [];
  const uvLayers = Array.isArray(data.uvs[0]) ? data.uvs : [data.uvs];
  const nUvLayers = uvLayers.length;
  const faces = data.faces;

  const outPos = [];
  const outNorm = [];
  const outUv = [];

  let offset = 0;
  while (offset < faces.length) {
    const type = faces[offset++];
    const isQuad = (type & 1) !== 0;
    const hasMat = (type & 2) !== 0;
    const hasFaceUv = (type & 4) !== 0;
    const hasFVUv = (type & 8) !== 0;
    const hasFN = (type & 16) !== 0;
    const hasFVN = (type & 32) !== 0;
    const hasFC = (type & 64) !== 0;
    const hasFVC = (type & 128) !== 0;

    const nVerts = isQuad ? 4 : 3;

    // Vertex position indices
    const vi = [];
    for (let i = 0; i < nVerts; i++) vi.push(faces[offset++]);

    // Material index (skip)
    if (hasMat) offset++;

    // Face UV (skip — 1 index per UV layer)
    if (hasFaceUv) offset += nUvLayers;

    // Face vertex UV (nVerts indices per UV layer)
    const uvIdx = [];
    if (hasFVUv) {
      for (let layer = 0; layer < nUvLayers; layer++) {
        for (let i = 0; i < nVerts; i++) {
          uvIdx.push(faces[offset++]);
        }
      }
    }

    // Face normal (1 shared index)
    let faceNormalIdx = -1;
    if (hasFN) faceNormalIdx = faces[offset++];

    // Face vertex normals (nVerts indices)
    const normalIdx = [];
    if (hasFVN) {
      for (let i = 0; i < nVerts; i++) normalIdx.push(faces[offset++]);
    }

    // Face color / vertex colors (skip)
    if (hasFC) offset++;
    if (hasFVC) offset += nVerts;

    // Triangulate (fan for quads: [0,1,2] and [0,2,3])
    const tris = isQuad ? [[0, 1, 2], [0, 2, 3]] : [[0, 1, 2]];

    for (const tri of tris) {
      for (const t of tri) {
        const vIdx = vi[t];
        outPos.push(vertices[vIdx * 3], vertices[vIdx * 3 + 1], vertices[vIdx * 3 + 2]);

        if (hasFVN && normalIdx.length > 0) {
          const nIdx = normalIdx[t];
          outNorm.push(normals[nIdx * 3], normals[nIdx * 3 + 1], normals[nIdx * 3 + 2]);
        } else if (hasFN && faceNormalIdx >= 0) {
          outNorm.push(
            normals[faceNormalIdx * 3],
            normals[faceNormalIdx * 3 + 1],
            normals[faceNormalIdx * 3 + 2]
          );
        }

        if (hasFVUv && nUvLayers > 0) {
          const uIdx = uvIdx[t];
          outUv.push(uvLayers[0][uIdx * 2], uvLayers[0][uIdx * 2 + 1]);
        }
      }
    }
  }

  return {
    positions: new Float32Array(outPos),
    normals: outNorm.length > 0 ? new Float32Array(outNorm) : null,
    uvs: outUv.length > 0 ? new Float32Array(outUv) : null,
    vertexCount: outPos.length / 3,
  };
}

/**
 * Compute vertex normals from positions (flat shading fallback).
 */
function computeNormals(positions) {
  const normals = new Float32Array(positions.length);
  for (let i = 0; i < positions.length; i += 9) {
    const ax = positions[i], ay = positions[i + 1], az = positions[i + 2];
    const bx = positions[i + 3], by = positions[i + 4], bz = positions[i + 5];
    const cx = positions[i + 6], cy = positions[i + 7], cz = positions[i + 8];
    const ex = bx - ax, ey = by - ay, ez = bz - az;
    const fx = cx - ax, fy = cy - ay, fz = cz - az;
    let nx = ey * fz - ez * fy;
    let ny = ez * fx - ex * fz;
    let nz = ex * fy - ey * fx;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    nx /= len; ny /= len; nz /= len;
    for (let j = 0; j < 3; j++) {
      normals[i + j * 3] = nx;
      normals[i + j * 3 + 1] = ny;
      normals[i + j * 3 + 2] = nz;
    }
  }
  return normals;
}

/**
 * Build a GLB (glTF 2.0 Binary) file from geometry data.
 */
function buildGlb(name, geom) {
  const positions = geom.positions;
  const normals = geom.normals || computeNormals(positions);
  const uvs = geom.uvs;
  const vertexCount = geom.vertexCount;

  // Compute bounding box for positions accessor
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }

  // Build binary buffer: positions + normals + uvs (all Float32)
  const posBytes = positions.byteLength;
  const normBytes = normals.byteLength;
  const uvBytes = uvs ? uvs.byteLength : 0;
  const totalBinSize = posBytes + normBytes + uvBytes;

  const binBuffer = Buffer.alloc(totalBinSize);
  Buffer.from(positions.buffer).copy(binBuffer, 0);
  Buffer.from(normals.buffer).copy(binBuffer, posBytes);
  if (uvs) Buffer.from(uvs.buffer).copy(binBuffer, posBytes + normBytes);

  // Build glTF JSON
  const accessors = [
    {
      bufferView: 0,
      componentType: 5126, // FLOAT
      count: vertexCount,
      type: 'VEC3',
      max: [maxX, maxY, maxZ],
      min: [minX, minY, minZ],
    },
    {
      bufferView: 1,
      componentType: 5126,
      count: vertexCount,
      type: 'VEC3',
    },
  ];

  const bufferViews = [
    { buffer: 0, byteOffset: 0, byteLength: posBytes, target: 34962 },
    { buffer: 0, byteOffset: posBytes, byteLength: normBytes, target: 34962 },
  ];

  const attributes = { POSITION: 0, NORMAL: 1 };

  if (uvs) {
    accessors.push({
      bufferView: 2,
      componentType: 5126,
      count: vertexCount,
      type: 'VEC2',
    });
    bufferViews.push({
      buffer: 0,
      byteOffset: posBytes + normBytes,
      byteLength: uvBytes,
      target: 34962,
    });
    attributes.TEXCOORD_0 = 2;
  }

  const gltfJson = {
    asset: { version: '2.0', generator: 'HexGL Converter' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name }],
    meshes: [
      {
        primitives: [
          {
            attributes,
            material: 0,
          },
        ],
      },
    ],
    materials: [
      {
        pbrMetallicRoughness: {
          baseColorFactor: [0.6, 0.6, 0.6, 1.0],
          metallicFactor: 0.4,
          roughnessFactor: 0.6,
        },
        name: 'Default',
      },
    ],
    accessors,
    bufferViews,
    buffers: [{ byteLength: totalBinSize }],
  };

  // Serialize JSON and pad to 4-byte alignment
  let jsonStr = JSON.stringify(gltfJson);
  while (jsonStr.length % 4 !== 0) jsonStr += ' ';
  const jsonBuf = Buffer.from(jsonStr, 'utf8');

  // Pad binary to 4-byte alignment
  const binPadding = (4 - (totalBinSize % 4)) % 4;
  const paddedBin = binPadding > 0
    ? Buffer.concat([binBuffer, Buffer.alloc(binPadding)])
    : binBuffer;

  // GLB structure: header (12) + JSON chunk (8 + jsonLen) + BIN chunk (8 + binLen)
  const totalLength = 12 + 8 + jsonBuf.length + 8 + paddedBin.length;
  const glb = Buffer.alloc(totalLength);
  let off = 0;

  // Header
  glb.writeUInt32LE(0x46546C67, off); off += 4; // "glTF"
  glb.writeUInt32LE(2, off); off += 4;           // version
  glb.writeUInt32LE(totalLength, off); off += 4;

  // JSON chunk
  glb.writeUInt32LE(jsonBuf.length, off); off += 4;
  glb.writeUInt32LE(0x4E4F534A, off); off += 4;  // "JSON"
  jsonBuf.copy(glb, off); off += jsonBuf.length;

  // BIN chunk
  glb.writeUInt32LE(paddedBin.length, off); off += 4;
  glb.writeUInt32LE(0x004E4942, off); off += 4;  // "BIN\0"
  paddedBin.copy(glb, off);

  return glb;
}

// Conversion jobs
const jobs = [
  { src: 'geometries/ships/feisar/feisar.js', out: 'feisar.glb', name: 'Feisar Ship' },
  { src: 'geometries/tracks/cityscape/track.js', out: 'track-cityscape.glb', name: 'Cityscape Track' },
  { src: 'geometries/tracks/cityscape/scrapers1.js', out: 'scrapers1.glb', name: 'Scrapers Set 1' },
  { src: 'geometries/tracks/cityscape/scrapers2.js', out: 'scrapers2.glb', name: 'Scrapers Set 2' },
  { src: 'geometries/tracks/cityscape/start.js', out: 'start-line.glb', name: 'Start Line' },
  { src: 'geometries/tracks/cityscape/startbanner.js', out: 'start-banner.glb', name: 'Start Banner' },
  { src: 'geometries/tracks/cityscape/bonus/speed.js', out: 'bonus-speed.glb', name: 'Bonus Speed Pad' },
  { src: 'geometries/bonus/base/base.js', out: 'bonus-base.glb', name: 'Bonus Base' },
  { src: 'geometries/booster/booster.js', out: 'booster.glb', name: 'Booster Exhaust' },
];

const modelsDir = resolve(ROOT, 'models');
if (!existsSync(modelsDir)) mkdirSync(modelsDir, { recursive: true });

console.log(`Converting ${jobs.length} geometries from JSON v3.1 → GLB...\n`);

for (const job of jobs) {
  const srcPath = resolve(SRC, job.src);
  if (!existsSync(srcPath)) {
    console.error(`  SKIP: ${job.name} — source not found: ${srcPath}`);
    continue;
  }

  try {
    const raw = readFileSync(srcPath, 'utf8');
    const data = JSON.parse(raw);
    const geom = parseJsonGeometry(data);
    const glb = buildGlb(job.name, geom);
    const outPath = resolve(modelsDir, job.out);
    writeFileSync(outPath, glb);
    console.log(`  ✓ ${job.name}: ${geom.vertexCount} verts → ${job.out} (${(glb.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`  ✗ ${job.name}: ${err.message}`);
  }
}

console.log('\nDone.');
