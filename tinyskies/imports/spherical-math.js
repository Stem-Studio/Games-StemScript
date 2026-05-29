// Spherical-math helpers ported verbatim from
// source/client/src/game/SphericalMath.ts
//
// Quaternion-based great-circle motion on a globe, plus the matrix builder
// the plane uses. Multiplayer-only helpers (slerpPlayerState, deadReckon,
// buildCarpetMatrixVoidPlane, buildBoatMatrix) are intentionally omitted —
// they're deferred per the MVP scope.
//
// Consumers: tinyskies.flightController, tinyskies.cameraRig,
// tinyskies.paintballSystem. All three rely on the exact source semantics —
// numbers / formulas must not drift.

const REF_UP = new THREE.Vector3(0, 1, 0);
const _v = new THREE.Vector3();
const _q = new THREE.Quaternion();

function quaternionFromSurfaceNormal(nx, ny, nz) {
  const n = new THREE.Vector3(nx, ny, nz).normalize();
  return new THREE.Quaternion().setFromUnitVectors(REF_UP, n);
}

function seededRandom(seed) {
  let s = seed >>> 0;
  if (s === 0) s = 1;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function randomSpawnQuaternionAndHeading(seed) {
  const rnd = seededRandom(seed + 1337);
  const theta = rnd() * Math.PI * 2;
  const phi = Math.acos(2 * rnd() - 1);
  const nx = Math.sin(phi) * Math.cos(theta);
  const ny = Math.sin(phi) * Math.sin(theta);
  const nz = Math.cos(phi);
  return {
    qPosition: quaternionFromSurfaceNormal(nx, ny, nz),
    heading: rnd() * Math.PI * 2,
  };
}

function tangentFrame(qPosition) {
  const up = REF_UP.clone().applyQuaternion(qPosition).normalize();
  const north = new THREE.Vector3(0, 0, -1).applyQuaternion(qPosition).normalize();
  const east = new THREE.Vector3().crossVectors(up, north).normalize();
  north.crossVectors(east, up).normalize();
  return { up: up, north: north, east: east };
}

function moveOnSphere(qPosition, heading, arcAngle) {
  if (Math.abs(arcAngle) < 1e-10) return qPosition.clone();
  const frame = tangentFrame(qPosition);
  const dir = new THREE.Vector3()
    .addScaledVector(frame.north, Math.cos(heading))
    .addScaledVector(frame.east, Math.sin(heading))
    .normalize();
  const axis = new THREE.Vector3().crossVectors(dir, frame.up).normalize();
  _q.setFromAxisAngle(axis, -arcAngle);
  return qPosition.clone().premultiply(_q);
}

function cartesianFromSpherical(qPosition, altitude, globeRadius) {
  return REF_UP.clone()
    .multiplyScalar(globeRadius + altitude)
    .applyQuaternion(qPosition);
}

function paintballRayFromPlaneState(qPosition, heading, pitch, altitude, globeRadius) {
  const origin = cartesianFromSpherical(qPosition, altitude, globeRadius);
  const frame = tangentFrame(qPosition);
  const forward = new THREE.Vector3()
    .addScaledVector(frame.north, Math.cos(heading))
    .addScaledVector(frame.east, Math.sin(heading))
    .normalize();
  const right = new THREE.Vector3().crossVectors(forward, frame.up).normalize();
  const pitchQ = _q.setFromAxisAngle(right, -pitch);
  const direction = forward.clone().applyQuaternion(pitchQ).normalize();
  return { origin: origin, direction: direction };
}

function buildPlaneMatrix(qPosition, heading, pitch, bankAngle, altitude, globeRadius) {
  const frame = tangentFrame(qPosition);
  const forward = new THREE.Vector3()
    .addScaledVector(frame.north, Math.cos(heading))
    .addScaledVector(frame.east, Math.sin(heading))
    .normalize();
  const right = new THREE.Vector3().crossVectors(forward, frame.up).normalize();
  const pitchQ = _q.setFromAxisAngle(right, -pitch);
  const pitchedForward = forward.clone().applyQuaternion(pitchQ).normalize();
  const pitchedUp = frame.up.clone().applyQuaternion(pitchQ).normalize();
  const bankQ = new THREE.Quaternion().setFromAxisAngle(pitchedForward, bankAngle);
  const bankedRight = right.clone().applyQuaternion(bankQ).normalize();
  const bankedUp = pitchedUp.clone().applyQuaternion(bankQ).normalize();
  const pos = cartesianFromSpherical(qPosition, altitude, globeRadius);
  const m = new THREE.Matrix4();
  m.makeBasis(bankedRight, bankedUp, pitchedForward.negate());
  m.setPosition(pos);
  return m;
}

function lerpAngle(a, b, t) {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
