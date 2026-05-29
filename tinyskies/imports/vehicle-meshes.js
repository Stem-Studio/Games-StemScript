// Procedural vehicle meshes for Batch D — boat + carpet capped variants.
//
// Source equivalents are richer:
//   - BoatMesh.ts (~280 lines) has hull + sail + oars + waterline trim + 2 boat sizes.
//   - CarpetMesh.ts (~250 lines) has cloth-wobble vertex shader, 4 tassels, gold trim,
//     trimLeft / trimRight named meshes for speed-curl animation.
//
// What's shipped here (FDR-005): minimum viable hull / rug shapes that read clearly
// as boat + carpet. No animated cloth wobble (TSL would need a per-vertex `positionNode`
// + onBeforeCompile-equivalent wiring; out of scope for the capped sweep). No sail,
// no tassels, no gold trim, no separate small-boat NPC variant.
//
// Both functions return a THREE.Group whose userData carries:
//   - hullMaterial (THREE.MeshStandardNodeMaterial) — primary hull color.
// The vehicleSwitcher mounts/unmounts these groups on the player gameObject as the
// `tinyskies/vehicleType` store key changes between "plane" / "boat" / "carpet".

function createBoatMesh(hullColor) {
  if (hullColor === undefined) hullColor = 0xb83c2b;
  const root = new THREE.Group();
  const s = 0.025;

  const hullMat = new THREE.MeshStandardNodeMaterial({
    color: hullColor, roughness: 0.6, metalness: 0.05, flatShading: true,
  });
  const deckMat = new THREE.MeshStandardNodeMaterial({
    color: 0x8b6914, roughness: 0.7, metalness: 0.05, flatShading: true,
  });
  const trimMat = new THREE.MeshStandardNodeMaterial({
    color: 0xffd866, roughness: 0.4, metalness: 0.3, flatShading: true,
  });

  // Hull — long box with a tapered front via a separate triangular prism.
  const hullLen = 8 * s;
  const hullW = 2.4 * s;
  const hullH = 0.9 * s;
  const hull = new THREE.Mesh(new THREE.BoxGeometry(hullW, hullH, hullLen), hullMat);
  hull.position.set(0, 0, 0);
  root.add(hull);

  // Bow taper — pointed cone forward (toward -Z).
  const bow = new THREE.Mesh(new THREE.ConeGeometry(hullW * 0.55, 1.6 * s, 4), hullMat);
  bow.rotation.x = -Math.PI / 2;
  bow.position.set(0, 0, -hullLen * 0.5 - 0.6 * s);
  root.add(bow);

  // Deck — slightly narrower box on top.
  const deck = new THREE.Mesh(new THREE.BoxGeometry(hullW * 0.85, 0.18 * s, hullLen * 0.85), deckMat);
  deck.position.set(0, hullH * 0.5 + 0.09 * s, 0);
  root.add(deck);

  // Trim — gunwale lip around the deck edge.
  const lipGeo = new THREE.BoxGeometry(hullW + 0.1 * s, 0.12 * s, 0.2 * s);
  const lipFront = new THREE.Mesh(lipGeo, trimMat);
  lipFront.position.set(0, hullH * 0.5 + 0.06 * s, -hullLen * 0.42);
  root.add(lipFront);
  const lipBack = new THREE.Mesh(lipGeo, trimMat);
  lipBack.position.set(0, hullH * 0.5 + 0.06 * s, hullLen * 0.42);
  root.add(lipBack);

  // Mast stub.
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * s, 0.08 * s, 1.6 * s, 6), trimMat);
  mast.position.set(0, hullH * 0.5 + 0.8 * s, 0);
  root.add(mast);

  root.traverse(function (c) { c.castShadow = true; c.userData.isRuntimeOnly = true; });
  root.userData.hullMaterial = hullMat;
  return root;
}

function createCarpetMesh(baseColor) {
  if (baseColor === undefined) baseColor = 0x6b1d6e;
  const root = new THREE.Group();
  const s = 0.025;

  const bodyMat = new THREE.MeshStandardNodeMaterial({
    color: baseColor, roughness: 0.55, metalness: 0.0, flatShading: true,
    side: THREE.DoubleSide,
  });
  const patternMat = new THREE.MeshStandardNodeMaterial({
    color: 0x8b2252, roughness: 0.55, metalness: 0.0, flatShading: true,
    side: THREE.DoubleSide,
  });
  const trimMat = new THREE.MeshStandardNodeMaterial({
    color: 0xd4a830, roughness: 0.4, metalness: 0.3, flatShading: true,
    side: THREE.DoubleSide,
  });

  const bodyW = 2.8 * s;
  const bodyH = 0.06 * s;
  const bodyLen = 3.6 * s;

  // Subdivided body — 10×1×14 segments to match source CarpetMesh.ts:73 so
  // CPU-side cloth wobble has enough vertices to deform smoothly.
  const body = new THREE.Mesh(new THREE.BoxGeometry(bodyW, bodyH, bodyLen, 10, 1, 14), bodyMat);
  body.userData.wobbleOffset = [0, 0, 0];
  body.userData.tinyskiesWobble = true;
  root.add(body);

  // Center pattern panel — also subdivided.
  const inner = new THREE.Mesh(
    new THREE.BoxGeometry(bodyW * 0.55, bodyH + 0.001, bodyLen * 0.55, 6, 1, 8),
    patternMat,
  );
  inner.position.set(0, 0.0008, 0);
  inner.userData.wobbleOffset = [0, 0.001, 0];
  inner.userData.tinyskiesWobble = true;
  root.add(inner);

  // Gold trim — 4 thin strips, subdivided along their long axis.
  const trimThick = 0.18 * s;
  let trimIdx = 0;
  for (const side of [-1, 1]) {
    const sx = side * (bodyW * 0.5 - trimThick * 0.3);
    const lipLR = new THREE.Mesh(
      new THREE.BoxGeometry(trimThick, bodyH + 0.001, bodyLen + 0.1 * s, 1, 1, 12),
      trimMat,
    );
    lipLR.position.set(sx, 0.0008, 0);
    lipLR.userData.wobbleOffset = [sx, 0.001, 0];
    lipLR.userData.tinyskiesWobble = true;
    lipLR.name = "trim" + (trimIdx++);
    root.add(lipLR);
    const sz = side * (bodyLen * 0.5 - trimThick * 0.3);
    const lipFB = new THREE.Mesh(
      new THREE.BoxGeometry(bodyW + 0.1 * s, bodyH + 0.001, trimThick, 12, 1, 1),
      trimMat,
    );
    lipFB.position.set(0, 0.0008, sz);
    lipFB.userData.wobbleOffset = [0, 0.001, sz];
    lipFB.userData.tinyskiesWobble = true;
    lipFB.name = "trim" + (trimIdx++);
    root.add(lipFB);
  }

  // Tassels — 4 named cones at corners hanging down (named for speed-curl
  // animation per source Carpet.ts:205).
  const tasselGeo = new THREE.ConeGeometry(0.12 * s, 0.4 * s, 5);
  let tasselIdx = 0;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const t = new THREE.Mesh(tasselGeo, trimMat);
      t.position.set(sx * bodyW * 0.45, -0.18 * s, sz * bodyLen * 0.45);
      t.rotation.x = Math.PI;
      t.name = "tassel" + (tasselIdx++);
      root.add(t);
    }
  }

  root.traverse(function (c) { c.castShadow = true; c.userData.isRuntimeOnly = true; });
  root.userData.hullMaterial = bodyMat;
  return root;
}
