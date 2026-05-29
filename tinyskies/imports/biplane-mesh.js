// Procedural biplane mesh ported from
// source/client/src/game/BiplaneMesh.ts
//   (with the addRimLight Fresnel hook from
//    source/client/src/game/RimLight.ts inlined below).
//
// FIDELITY NOTE: the source uses MeshPhongMaterial + a GLSL onBeforeCompile
// patch for rim lighting. StemStudio runs WebGPU exclusively (no MeshPhongMaterial,
// no onBeforeCompile shader injection). We swap to:
//   - MeshStandardNodeMaterial in place of MeshPhongMaterial (constructor params
//     mostly identical; shininess maps to roughness/metalness).
//   - TSL emissiveNode for the Fresnel rim glow on materials that originally got
//     `addRimLight`. Visual result is the same Fresnel halo; the GLSL code path
//     can't be reproduced verbatim.
// Outside of the material classes, the geometry, transforms, and userData are
// 1:1 with the source.
//
// Exported builder is `createBiplane(color)`. The MVP only uses this; the
// source's `createMonoplane` is intentionally omitted (no NPC planes in MVP).

const RIM_COLOR = new THREE.Color(0xffeebb);

// Approximate the source's MeshPhongMaterial(shininess=N, flatShading=true) with
// MeshStandardNodeMaterial. Shininess maps inversely to roughness; flat shading
// kept so faceted-look matches.
function makeStandardLitMaterial(opts) {
  const m = new THREE.MeshStandardNodeMaterial({
    color: opts.color,
    roughness: opts.roughness !== undefined ? opts.roughness : 0.6,
    metalness: opts.metalness !== undefined ? opts.metalness : 0.0,
    flatShading: opts.flatShading !== undefined ? opts.flatShading : true,
    transparent: opts.transparent !== undefined ? opts.transparent : false,
    opacity: opts.opacity !== undefined ? opts.opacity : 1.0,
    side: opts.side !== undefined ? opts.side : THREE.FrontSide,
  });
  return m;
}

// TSL Fresnel rim glow — visual analogue of the source's addRimLight() shader patch.
// Sets emissiveNode = (1 - max(dot(viewDir, normalWorld), 0))^power * intensity * rimColor.
// The source shares one `globalRimColor` across materials so a day/night cycle can
// update it live; the MVP has no day/night, so we hard-code the daytime rim color.
function applyRimLight(mat, rimColor, intensity, power) {
  if (rimColor === undefined) rimColor = RIM_COLOR;
  if (intensity === undefined) intensity = 0.6;
  if (power === undefined) power = 2.5;
  const TSL = THREE.TSL;
  const c = rimColor instanceof THREE.Color ? rimColor : new THREE.Color(rimColor);
  const viewDir = TSL.normalize(TSL.sub(TSL.cameraPosition, TSL.positionWorld));
  const ndotv = TSL.max(TSL.dot(viewDir, TSL.normalWorld), TSL.float(0.0));
  const fresnel = TSL.pow(TSL.sub(TSL.float(1.0), ndotv), TSL.float(power));
  const rimVec = TSL.vec3(TSL.float(c.r), TSL.float(c.g), TSL.float(c.b));
  mat.emissiveNode = fresnel.mul(TSL.float(intensity)).mul(rimVec);
  mat.needsUpdate = true;
}

function markPaintSplatterWing(m) {
  m.userData.paintSplatterSurface = true;
}

function createBiplane(color) {
  if (color === undefined) color = 0xff4444;
  const plane = new THREE.Group();
  const s = 0.025;

  // Original shininess values: bodyMat 50, accentMat 30, wingMat 25,
  // darkMat 60, strutMat 20, glassMat 90, metalMat 80.
  // Mapping: higher shininess → lower roughness, slightly higher metalness.
  const bodyMat = makeStandardLitMaterial({ color: color, roughness: 0.45, metalness: 0.15, flatShading: true });
  applyRimLight(bodyMat, 0xffeebb, 0.25, 3.5);
  const accentMat = makeStandardLitMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.05, flatShading: true });
  const wingMat = makeStandardLitMaterial({ color: 0xf0e0c0, roughness: 0.6, metalness: 0.05, flatShading: true });
  applyRimLight(wingMat, 0xffeebb, 0.2, 3.5);
  const darkMat = makeStandardLitMaterial({ color: 0x2a2a2a, roughness: 0.4, metalness: 0.2, flatShading: true });
  const strutMat = makeStandardLitMaterial({ color: 0x8b6914, roughness: 0.7, metalness: 0.1, flatShading: true });
  const glassMat = makeStandardLitMaterial({ color: 0x88ccee, roughness: 0.15, metalness: 0.0, flatShading: true, transparent: true, opacity: 0.6 });
  const metalMat = makeStandardLitMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.6, flatShading: true });
  applyRimLight(metalMat, 0xffffff, 0.4, 3.0);

  // --- Fuselage: single smooth body ---
  const profile = [];
  const fLen = 7.8 * s;
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const y = t * fLen;
    let r = 0;
    if (t < 0.15) {
      const t2 = t / 0.15;
      r = THREE.MathUtils.lerp(0.75 * s, 0.85 * s, Math.sin((t2 * Math.PI) / 2));
    } else if (t < 0.4) {
      r = 0.85 * s;
    } else {
      const t2 = (t - 0.4) / 0.6;
      r = THREE.MathUtils.lerp(0.85 * s, 0.15 * s, t2 * t2 * (3 - 2 * t2));
    }
    profile.push(new THREE.Vector2(r, y));
  }
  const fuselageGeo = new THREE.LatheGeometry(profile, 24);
  fuselageGeo.rotateX(Math.PI / 2);
  fuselageGeo.translate(0, 0, -3.1 * s);
  const fuselage = new THREE.Mesh(fuselageGeo, bodyMat);
  plane.add(fuselage);

  // --- Cockpit windshield ---
  const windshield = new THREE.Mesh(new THREE.SphereGeometry(s * 0.45, 8, 6), glassMat);
  windshield.scale.set(0.7, 0.6, 0.8);
  windshield.position.set(0, s * 0.8, -s * 0.4);
  plane.add(windshield);

  const windFrame = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.46, s * 0.46, s * 0.1, 8), metalMat);
  windFrame.rotation.x = Math.PI / 2;
  windFrame.rotation.z = Math.PI / 2;
  windFrame.position.set(0, s * 0.8, -s * 0.4);
  windFrame.scale.set(0.7, 0.8, 0.6);
  plane.add(windFrame);

  // --- Upper wing ---
  const upperWing = new THREE.Mesh(new THREE.BoxGeometry(s * 8.5, s * 0.18, s * 1.8), wingMat);
  upperWing.position.set(0, s * 1.4, -s * 0.2);
  markPaintSplatterWing(upperWing);
  plane.add(upperWing);

  for (const side of [-1, 1]) {
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.9, s * 0.9, s * 0.18, 12), wingMat);
    tip.position.set(side * s * 4.25, s * 1.4, -s * 0.2);
    tip.scale.set(1, 1, 1);
    plane.add(tip);
  }

  // --- Lower wing ---
  const lowerWing = new THREE.Mesh(new THREE.BoxGeometry(s * 7.0, s * 0.18, s * 1.6), wingMat);
  lowerWing.position.set(0, -s * 0.5, 0);
  markPaintSplatterWing(lowerWing);
  plane.add(lowerWing);

  for (const side of [-1, 1]) {
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.8, s * 0.8, s * 0.18, 12), wingMat);
    tip.position.set(side * s * 3.5, -s * 0.5, 0);
    plane.add(tip);
  }

  // --- Wing struts: angled for character ---
  const strutGeo = new THREE.CylinderGeometry(s * 0.07, s * 0.07, s * 1.8, 6);
  const struts = [
    [-s * 2.2, s * 0.45, -s * 0.1, -0.08],
    [s * 2.2, s * 0.45, -s * 0.1, 0.08],
    [-s * 2.2, s * 0.45, s * 0.5, -0.08],
    [s * 2.2, s * 0.45, s * 0.5, 0.08],
    [-s * 0.8, s * 0.45, -s * 0.1, 0.15],
    [s * 0.8, s * 0.45, -s * 0.1, -0.15],
  ];
  for (const entry of struts) {
    const x = entry[0], y = entry[1], z = entry[2], tilt = entry[3];
    const strut = new THREE.Mesh(strutGeo, strutMat);
    strut.position.set(x, y, z);
    strut.rotation.z = tilt;
    plane.add(strut);
  }

  // --- Tail fin ---
  const tailFin = new THREE.Mesh(new THREE.BoxGeometry(s * 0.12, s * 1.8, s * 1.4), bodyMat);
  tailFin.position.set(0, s * 0.8, s * 4.5);
  tailFin.rotation.x = 0.1;
  plane.add(tailFin);

  const finCap = new THREE.Mesh(new THREE.SphereGeometry(s * 0.35, 8, 6), bodyMat);
  finCap.scale.set(0.18, 1, 0.8);
  finCap.position.set(0, s * 1.7, s * 4.3);
  plane.add(finCap);

  // --- Horizontal stabilizer ---
  const hStab = new THREE.Mesh(new THREE.BoxGeometry(s * 3.2, s * 0.12, s * 1.0), bodyMat);
  hStab.position.set(0, s * 0.15, s * 4.6);
  plane.add(hStab);

  for (const side of [-1, 1]) {
    const stabTip = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.5, s * 0.5, s * 0.12, 10), bodyMat);
    stabTip.position.set(side * s * 1.6, s * 0.15, s * 4.6);
    plane.add(stabTip);
  }

  // --- Engine cowling + radial cylinders ---
  const cowling = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.75, s * 0.65, s * 0.4, 12), metalMat);
  cowling.rotation.x = Math.PI / 2;
  cowling.position.set(0, 0, -s * 3.3);
  plane.add(cowling);

  const cylGeo = new THREE.CylinderGeometry(s * 0.15, s * 0.15, s * 0.4, 6);
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const cyl = new THREE.Mesh(cylGeo, darkMat);
    cyl.position.set(Math.cos(angle) * s * 0.5, Math.sin(angle) * s * 0.5, -s * 3.3);
    cyl.rotation.z = angle + Math.PI / 2;
    plane.add(cyl);
  }

  // --- Propeller assembly ---
  const propellerGroup = new THREE.Group();
  propellerGroup.position.set(0, 0, -s * 3.55);
  plane.add(propellerGroup);

  const propDiscMat = makeStandardLitMaterial({
    color: 0x222222,
    roughness: 0.5,
    metalness: 0.0,
    flatShading: true,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
  });
  const propDisc = new THREE.Mesh(new THREE.CircleGeometry(s * 1.4, 16), propDiscMat);
  propellerGroup.add(propDisc);

  const bladeGeo = new THREE.BoxGeometry(s * 2.6, s * 0.15, s * 0.05);
  const bladeMat = makeStandardLitMaterial({ color: 0x111111, roughness: 0.5, metalness: 0.1, flatShading: true });
  const blade1 = new THREE.Mesh(bladeGeo, bladeMat);
  propellerGroup.add(blade1);
  const blade2 = new THREE.Mesh(bladeGeo, bladeMat);
  blade2.rotation.z = Math.PI / 2;
  propellerGroup.add(blade2);

  const hub = new THREE.Mesh(new THREE.SphereGeometry(s * 0.3, 8, 6), metalMat);
  hub.scale.set(1, 1, 1.5);
  hub.position.set(0, 0, -s * 0.05);
  propellerGroup.add(hub);

  // --- Landing gear ---
  const gearGeo = new THREE.CylinderGeometry(s * 0.06, s * 0.05, s * 1.0, 6);
  const wheelGeo = new THREE.CylinderGeometry(s * 0.25, s * 0.25, s * 0.15, 12);
  const tireGeo = new THREE.CylinderGeometry(s * 0.3, s * 0.3, s * 0.1, 12);

  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(gearGeo, strutMat);
    leg.position.set(side * s * 0.7, -s * 1.0, -s * 0.6);
    leg.rotation.z = side * 0.2;
    leg.rotation.x = -0.1;
    plane.add(leg);

    const axle = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.04, s * 0.04, s * 0.3, 6), metalMat);
    axle.rotation.z = Math.PI / 2;
    axle.position.set(side * s * 0.85, -s * 1.45, -s * 0.7);
    plane.add(axle);

    const wheel = new THREE.Mesh(wheelGeo, metalMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(side * s * 0.95, -s * 1.45, -s * 0.7);
    plane.add(wheel);

    const tire = new THREE.Mesh(tireGeo, darkMat);
    tire.rotation.z = Math.PI / 2;
    tire.position.set(side * s * 0.95, -s * 1.45, -s * 0.7);
    plane.add(tire);
  }

  const tailWheel = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.12, s * 0.12, s * 0.08, 8), darkMat);
  tailWheel.rotation.z = Math.PI / 2;
  tailWheel.position.set(0, -s * 0.55, s * 4.2);
  plane.add(tailWheel);

  const tailStrut = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.04, s * 0.04, s * 0.4, 4), metalMat);
  tailStrut.position.set(0, -s * 0.35, s * 4.1);
  tailStrut.rotation.x = -0.4;
  plane.add(tailStrut);

  const splatterAnchor = new THREE.Group();
  splatterAnchor.name = "splatterAnchor";
  plane.add(splatterAnchor);
  plane.userData.splatterAnchor = splatterAnchor;

  plane.traverse(function (child) {
    child.castShadow = true;
  });

  plane.userData.hullMaterial = bodyMat;
  plane.userData.propeller = propellerGroup;
  return plane;
}
