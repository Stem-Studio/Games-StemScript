// Terrain helpers ported from
//   source/client/src/game/SimplexNoise.ts
//   source/client/src/game/TerrainPresets.ts
//   source/client/src/game/TerrainSurface.ts
//
// What's included:
//   - 3D simplex noise (Stefan Gustavson public-domain algorithm) seeded from int.
//   - 4 named presets (default / archipelago / pangaea / waterworld).
//   - sampleTerrain(seed, type, nx, ny, nz) → {value, isLand, elevation, depth}.
//   - surfaceDisplacement(seed, type, nx, ny, nz) → radial offset from base sphere.
//   - surfaceAltitudeAt() alias matching source.
//
// What's intentionally omitted (Batch C scope cut, FDR-004):
//   - Ocean backbone river-carving (complex axis machinery + region caching).
//     The MVP terrain has noise-only land/ocean — recognizable continents but no
//     carved river systems.
//   - terrainIsLand region-flood-fill / connected-ocean detection (not needed
//     since we only ask "is this single point land?").
//
// Consumers: tinyskiesGlobeVisual (vertex displacement + biome color),
//            tinyskiesFlightController (hover-floor altitude lookup),
//            tinyskiesFloatingLanterns (cluster center altitude + land filtering).

const GRAD3 = [
  [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
  [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
  [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1],
];

const F3 = 1 / 3;
const G3 = 1 / 6;

function buildPermutation(seed) {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let s = (seed >>> 0) % 2147483647;
  if (s <= 0) s += 2147483646;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    const tmp = p[i];
    p[i] = p[j];
    p[j] = tmp;
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  return perm;
}

function createNoise3D(seed) {
  const perm = buildPermutation(seed);
  return function (x, y, z) {
    const s = (x + y + z) * F3;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const k = Math.floor(z + s);
    const t = (i + j + k) * G3;

    const x0 = x - (i - t);
    const y0 = y - (j - t);
    const z0 = z - (k - t);

    let i1, j1, k1;
    let i2, j2, k2;

    if (x0 >= y0) {
      if (y0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
      else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
      else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
    } else {
      if (y0 < z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
      else if (x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
      else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
    }

    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2 * G3;
    const y2 = y0 - j2 + 2 * G3;
    const z2 = z0 - k2 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3;
    const y3 = y0 - 1 + 3 * G3;
    const z3 = z0 - 1 + 3 * G3;

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;

    let n = 0;
    let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
    if (t0 > 0) {
      t0 *= t0;
      const g = GRAD3[perm[ii + perm[jj + perm[kk]]] % 12];
      n += t0 * t0 * (g[0]*x0 + g[1]*y0 + g[2]*z0);
    }
    let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
    if (t1 > 0) {
      t1 *= t1;
      const g = GRAD3[perm[ii+i1 + perm[jj+j1 + perm[kk+k1]]] % 12];
      n += t1 * t1 * (g[0]*x1 + g[1]*y1 + g[2]*z1);
    }
    let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
    if (t2 > 0) {
      t2 *= t2;
      const g = GRAD3[perm[ii+i2 + perm[jj+j2 + perm[kk+k2]]] % 12];
      n += t2 * t2 * (g[0]*x2 + g[1]*y2 + g[2]*z2);
    }
    let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
    if (t3 > 0) {
      t3 *= t3;
      const g = GRAD3[perm[ii+1 + perm[jj+1 + perm[kk+1]]] % 12];
      n += t3 * t3 * (g[0]*x3 + g[1]*y3 + g[2]*z3);
    }

    return 32 * n;
  };
}

function terrainNoise(noise, x, y, z, octaves, lacunarity, persistence, scale) {
  let value = 0;
  let amplitude = 1;
  let frequency = scale;
  let maxAmplitude = 0;
  for (let o = 0; o < octaves; o++) {
    value += noise(x * frequency, y * frequency, z * frequency) * amplitude;
    maxAmplitude += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  return value / maxAmplitude;
}

const TERRAIN_PRESETS = {
  default:     { scale: 1.5, octaves: 4, lacunarity: 2.05, persistence: 0.48, threshold: 0.0 },
  archipelago: { scale: 3.0, octaves: 4, lacunarity: 2.20, persistence: 0.45, threshold: 0.2 },
  pangaea:     { scale: 0.8, octaves: 3, lacunarity: 2.00, persistence: 0.54, threshold: -0.15 },
  waterworld:  { scale: 2.5, octaves: 3, lacunarity: 2.00, persistence: 0.40, threshold: 0.35 },
};

function getTerrainParams(terrainType) {
  return TERRAIN_PRESETS[terrainType] || TERRAIN_PRESETS["default"];
}

// Caches — recreating noise per call is expensive (the globe deformation
// calls displacement ~16k times at init).
const noiseFnBySeed = new Map();
function noiseForSeed(seed) {
  let n = noiseFnBySeed.get(seed);
  if (!n) {
    n = createNoise3D(seed);
    noiseFnBySeed.set(seed, n);
  }
  return n;
}

function sampleTerrainValue(seed, terrainType, nx, ny, nz) {
  const params = getTerrainParams(terrainType);
  const noise = noiseForSeed(seed);
  return terrainNoise(noise, nx, ny, nz, params.octaves, params.lacunarity, params.persistence, params.scale);
}

function terrainIsLand(terrainType, value) {
  return value > getTerrainParams(terrainType).threshold;
}

function terrainElevationFromValue(terrainType, value) {
  const params = getTerrainParams(terrainType);
  if (value <= params.threshold) return 0;
  return (value - params.threshold) / (1 - params.threshold);
}

function terrainWaterDepthFromValue(terrainType, value) {
  const params = getTerrainParams(terrainType);
  if (value > params.threshold) return 0;
  return Math.min(1, (params.threshold - value) * 4);
}

function sampleTerrain(seed, terrainType, nx, ny, nz) {
  const value = sampleTerrainValue(seed, terrainType, nx, ny, nz);
  return {
    value: value,
    isLand: value > getTerrainParams(terrainType).threshold,
    elevation: terrainElevationFromValue(terrainType, value),
    depth: terrainWaterDepthFromValue(terrainType, value),
  };
}

// Constants from source TerrainSurface.ts.
const MOUNTAIN_HEIGHT = 0.52;
const LAND_HEIGHT = 0.02;
const OCEAN_DEPTH = 0.01;

// Source TerrainSurface.ts:27 — small inset so trees/rocks/houses sit slightly
// below the geometric surface and don't visibly float when the surface
// micro-displacement noise dips. Used by every prop placement.
const PROP_TERRAIN_SINK = 0.018;

function smoothstep(min, max, x) {
  if (x <= min) return 0;
  if (x >= max) return 1;
  const t = (x - min) / (max - min);
  return t * t * (3 - 2 * t);
}

function landDisplacement(seed, nx, ny, nz, elevation) {
  const ruggedNoise = noiseForSeed(seed + 9001);
  const rugged = terrainNoise(ruggedNoise, nx, ny, nz, 5, 2.2, 0.5, 7.0);
  const r01 = (rugged + 1) * 0.5;
  const peakMask = Math.pow(smoothstep(0.52, 0.86, elevation), 1.35);
  const jagged = 1 + 0.38 * Math.pow(r01, 1.2) * peakMask;
  const micro = 0.06 * rugged * elevation * peakMask;
  return LAND_HEIGHT + elevation * MOUNTAIN_HEIGHT * jagged + micro;
}

function surfaceDisplacementAt(seed, terrainType, nx, ny, nz) {
  const sample = sampleTerrain(seed, terrainType, nx, ny, nz);
  if (sample.isLand) {
    return landDisplacement(seed, nx, ny, nz, sample.elevation);
  }
  return -OCEAN_DEPTH * sample.depth;
}

// Source-name alias kept for fidelity. Declared as a function (not a bare const
// alias) so the script-import export collector picks it up — `const x = otherFn`
// is module-private since the RHS is an identifier reference, not a function
// expression. See docs/domains/script-imports.md "What can be exported".
function surfaceAltitudeAt(seed, terrainType, nx, ny, nz) {
  return surfaceDisplacementAt(seed, terrainType, nx, ny, nz);
}

// Source Globe.ts:2085 `terrainRingElevationRoughness`. Standard deviation
// of elevation samples in a ring around `normal` at `ringDist`. Returns 999
// if any sample lands in water (used as a "stay inland" rejection criterion
// by mushroom / butterfly-garden placement). All samples must be land for a
// finite result.
function terrainRingElevationRoughness(seed, terrainType, nx, ny, nz, ringDist) {
  let refX = 0, refY = 1, refZ = 0;
  if (Math.abs(ny) >= 0.9) { refX = 1; refY = 0; refZ = 0; }
  // tang = normal × ref
  let tx = ny * refZ - nz * refY;
  let ty = nz * refX - nx * refZ;
  let tz = nx * refY - ny * refX;
  const tlen = Math.hypot(tx, ty, tz) || 1;
  tx /= tlen; ty /= tlen; tz /= tlen;
  // bitang = normal × tang
  let bx = ny * tz - nz * ty;
  let by = nz * tx - nx * tz;
  let bz = nx * ty - ny * tx;
  const blen = Math.hypot(bx, by, bz) || 1;
  bx /= blen; by /= blen; bz /= blen;

  const values = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const cs = Math.cos(a) * ringDist;
    const sn = Math.sin(a) * ringDist;
    let cx = nx + tx * cs + bx * sn;
    let cy = ny + ty * cs + by * sn;
    let cz = nz + tz * cs + bz * sn;
    const clen = Math.hypot(cx, cy, cz) || 1;
    cx /= clen; cy /= clen; cz /= clen;
    const sample = sampleTerrain(seed, terrainType, cx, cy, cz);
    if (!sample.isLand) return 999;
    values.push(sample.elevation);
  }
  let mean = 0;
  for (const v of values) mean += v;
  mean /= values.length;
  let variance = 0;
  for (const v of values) variance += (v - mean) * (v - mean);
  return Math.sqrt(variance / values.length);
}

// Source Globe.ts:406 `waterRatioAround`. Fraction of `checks` ring samples
// at `sampleDist` that land in water. Used by coconut-tree placement (>0)
// and mushroom placement (≤MAX_WATER_RATIO).
function waterRatioAround(seed, terrainType, nx, ny, nz, sampleDist, checks) {
  let refX = 0, refY = 0, refZ = 0;
  // tangent in source: (-ny, nx, 0) with fallback (0, -nz, ny)
  let tx = -ny, ty = nx, tz = 0;
  if (tx * tx + ty * ty + tz * tz < 0.001) { tx = 0; ty = -nz; tz = ny; }
  const tlen = Math.hypot(tx, ty, tz) || 1;
  tx /= tlen; ty /= tlen; tz /= tlen;
  // bitangent = normal × tangent
  let bx = ny * tz - nz * ty;
  let by = nz * tx - nx * tz;
  let bz = nx * ty - ny * tx;
  const blen = Math.hypot(bx, by, bz) || 1;
  bx /= blen; by /= blen; bz /= blen;

  let waterCount = 0;
  for (let c = 0; c < checks; c++) {
    const angle = (c / checks) * Math.PI * 2;
    const cs = Math.cos(angle) * sampleDist;
    const sn = Math.sin(angle) * sampleDist;
    let cx = nx + tx * cs + bx * sn;
    let cy = ny + ty * cs + by * sn;
    let cz = nz + tz * cs + bz * sn;
    const clen = Math.hypot(cx, cy, cz) || 1;
    cx /= clen; cy /= clen; cz /= clen;
    if (!sampleTerrain(seed, terrainType, cx, cy, cz).isLand) waterCount++;
  }
  return waterCount / checks;
}

// PROP_TERRAIN_SINK is exported as a const-via-function since the script-import
// collector only picks up function-shaped declarations as exports.
function getPropTerrainSink() {
  return PROP_TERRAIN_SINK;
}
