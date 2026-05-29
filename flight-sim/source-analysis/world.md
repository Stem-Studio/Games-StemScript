# World Generation - fly.pieter.com Source Analysis

## Global Level Constants

```js
const SEA_LEVEL = 0;                   // L1190
const GROUND_LEVEL = 10;               // L1191 - Airport/ground elevation above sea level
```

---

## Ground/Terrain (L~2460-2480)

```js
const groundGeometry = new THREE.BoxGeometry(1000, 35, 4000);
const groundMaterial = new THREE.MeshPhongMaterial({
    color: 0x2D5A27,                   // Darker forest green
    shininess: 0,
    flatShading: true
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.position.y = GROUND_LEVEL - 17.5;  // Top of ground at GROUND_LEVEL (10 - 17.5 = -7.5)
ground.position.x = 150;                   // Offset east
ground.receiveShadow = true;
```

**Summary:** 1000 x 35 x 4000 box, top surface at y=10, centered at x=150, z=0.

---

## Runway (L~2480-2500)

```js
const runwayGeometry = new THREE.BoxGeometry(10, 0.001, 200);
const runwayMaterial = new THREE.MeshPhongMaterial({ color: 0x404040 });
const runway = new THREE.Mesh(runwayGeometry, runwayMaterial);
runway.position.x = 0;
runway.position.y = GROUND_LEVEL + 0.1;   // 10.1 - Raised slightly to prevent z-fighting
runway.position.z = 0;
runway.receiveShadow = true;
```

**Summary:** 10 wide, 200 long runway at origin, dark gray.

### Runway Markings/Lights (L~6100+)

```js
const edgeMarkingGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.2);
const edgeMarkingMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true
});

// Edge markings every 10 units from z=-95 to z=95
for (let z = -95; z <= 95; z += 10) {
    // Left edge at x=-5, y=GROUND_LEVEL+0.2
    // Right edge at x=5, y=GROUND_LEVEL+0.2
}
// Stored in runwayLights array for night animation
```

---

## Ocean (L~3660)

```js
// Ocean is a large plane at SEA_LEVEL
ocean.position.y = SEA_LEVEL;  // y=0
```

The ocean extends from x < -450 (west of the beach).

---

## Beach (L~3899)

```js
const beachGeometry = new THREE.BoxGeometry(100, GROUND_LEVEL, 4000);
// width=100, height=GROUND_LEVEL(10), length=4000
// Fills the gap between ocean (y=0) and ground (y=10)
// Position around x=-400 to x=-350 area
```

---

## Aircraft Carrier (L~3470-3560)

### Hull
```js
const hullGeometry = new THREE.BoxGeometry(40, 10, 150);
const hullMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
hull.position.y = -5;  // Half height below deck
```

### Flight Deck
```js
const deckGeometry = new THREE.BoxGeometry(40, 0.5, 150);
const deckMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
deck.position.y = 0.25;
deck.receiveShadow = true;
```

### Runway Markings
```js
const centerLineGeometry = new THREE.PlaneGeometry(1, 140);
centerLine.rotation.x = -Math.PI / 2;
centerLine.position.y = 0.51;  // Just above deck
```

### Island (Superstructure)
```js
const islandMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
// Multiple box geometries for the island structure
```

### Radar/Antenna
```js
const radarBaseGeometry = new THREE.CylinderGeometry(2, 2, 5, 8);
radarBase.position.set(15, 17.5, 20);

const radarDishGeometry = new THREE.CylinderGeometry(4, 4, 1, 8);
radarDish.position.set(15, 21, 20);
// Animated rotation: radarDish.rotation.z += 0.05;
```

### Deck Lights
```js
const lightGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const lightMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0xffffff
});
```

### Position
```js
carrierGroup.position.set(-600, GROUND_LEVEL - 0.5, 0);
// Deck surface at GROUND_LEVEL (deck is 0.5 thick at y=0.25)
```

### Collision Box
```js
const deckBoundingBox = new THREE.Box3(
    new THREE.Vector3(-20, GROUND_LEVEL, -75).add(carrierGroup.position),
    new THREE.Vector3(20, GROUND_LEVEL + 1, 75).add(carrierGroup.position)
);
```

---

## Buildings (createBuilding function, L~3800)

```js
function createBuilding() {
    // Square flat buildings
    const height = Math.random() * 5 + 3;      // 3-8 units tall
    const width = Math.random() * 4 + 3;       // 3-7 units wide
    const depth = Math.random() * 4 + 3;       // 3-7 units deep

    const buildingGeometry = new THREE.BoxGeometry(width, height, depth);

    // Wall texture via canvas:
    // - White walls (#FFFFFF base)
    // - Orange roof
    // - Windows: BoxGeometry(width * 0.2, height * 0.2, 0.1)
    //   windowMaterial: color 0xaaaaff, emissive 0x444444

    // Material array: [left, right, top(orange roof), bottom, front, back]
    // All sides use wall canvas texture except top
}
```

---

## Houses (createHouse function, L~6700)

```js
function createHouse() {
    // Houses with pointy roofs
    const width = 4 + Math.random() * 4;       // 4-8 units
    const height = 6 + Math.random() * 8;      // 6-14 units
    const depth = 4 + Math.random() * 4;       // 4-8 units

    // Main building
    const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
    const buildingMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color(
            0.7 + Math.random() * 0.3,          // Random pastel colors
            0.7 + Math.random() * 0.3,
            0.7 + Math.random() * 0.3
        )
    });
    building.position.y = height/2;

    // Roof (pyramid style)
    const roofHeight = height * 0.3;
    const roofGeometry = new THREE.ConeGeometry(width * 0.8, roofHeight, 4);
    // Random roof color: 0x8B0000 (dark red) or 0x654321 (brown)

    // Door
    const doorGeometry = new THREE.BoxGeometry(width * 0.15, height * 0.3, 0.1);
    doorMaterial: color 0x8B4513
    door.position.set(0, doorHeight/2, depth/2);
}
```

---

## Mountains

Mountains are procedurally placed in the world. Key reference:
```js
const MOUNTAIN_SPAWN_X = 300;
const MOUNTAIN_SPAWN_Y = GROUND_LEVEL + 225;  // 235
const MOUNTAIN_SPAWN_Z = -200;
```

---

## Spawn Points

```js
const RUNWAY_SPAWN_X = 0;
const RUNWAY_SPAWN_Y = GROUND_LEVEL + 0.6;    // 10.6
const RUNWAY_SPAWN_Z = 97;                     // Start of runway

const CARRIER_SPAWN_X = -600;
const CARRIER_SPAWN_Y = GROUND_LEVEL + 0.6;   // 10.6
const CARRIER_SPAWN_Z = 70;

const MOUNTAIN_SPAWN_X = 300;
const MOUNTAIN_SPAWN_Y = GROUND_LEVEL + 225;  // 235
const MOUNTAIN_SPAWN_Z = -200;
```
