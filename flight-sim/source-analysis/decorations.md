# Decorative Objects - fly.pieter.com Source Analysis

## Blimps (Sponsor Slots)

### White Blimp
```js
// Position: (-50, 150, -200)
// Ellipsoid shape: ~54 units long, ~20 radius
// Rotated 90 deg so long axis is X
// Has banner geometry hanging below
```

### Banner on Blimp
```js
const blimpBannerGeometry = new THREE.PlaneGeometry(width, height);
const blimpBannerMaterial = new THREE.MeshPhongMaterial({ ... });
// Sponsor texture loaded from canvas
```

### Additional Blimps
```js
// "medvi" blimp with banner
// Multiple blimp positions in the world
```

---

## Castle (L~8700)

```js
castleGroup = new THREE.Group();

// Castle walls
const stoneMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });  // Gray stone

// Four corner towers
const towerPositions = [
    [-22, 35, -22],
    [22, 35, -22],
    [-22, 35, 22],
    [22, 35, 22]
];

towerPositions.forEach((pos) => {
    const tower = new THREE.Mesh(towerGeometry, stoneMaterial);
    tower.position.set(...pos);

    // Conical roof
    const roofGeometry = new THREE.ConeGeometry(8, 15, 8);
    const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    roof.position.set(pos[0], pos[1] + 42, pos[2]);
});

// Crenellations (battlements)
for (let x = -18; x <= 18; x += 4) {
    for (let z = -18; z <= 18; z += 4) {
        if (x === -18 || x === 18 || z === -18 || z === 18) {
            const merlon = new THREE.Mesh(
                new THREE.BoxGeometry(3, 4, 3),
                stoneMaterial
            );
            merlon.position.set(x, 62, z);
        }
    }
}

// Position
castleGroup.position.set(100, GROUND_LEVEL + 0.2, -300);
```

### Castle Banner
```js
const castleBannerGeometry = new THREE.PlaneGeometry(width, height);
// Sponsor slot for castle
```

---

## Robot (Sponsor Slot)

```js
robotGroup = new THREE.Group();

// Robot body geometry (multiple box geometries)
// Positioned in the sky

// Banner above robot
const lindyBannerGeometry = new THREE.PlaneGeometry(16, 4);
lindyBanner.position.y = 18;  // Above the robot

// Position
robotGroup.position.set(-100, GROUND_LEVEL + 15, -200);
robotGroup.rotation.y = 1.5;
```

---

## UFO (Sponsor Slot)

```js
const ufoGroup = new THREE.Group();

// Main body (saucer shape - half sphere)
const ufoBodyGeometry = new THREE.SphereGeometry(10, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
const ufoBodyMaterial = new THREE.MeshPhongMaterial({
    color: 0xC0C0C0,          // Silver
    shininess: 80,
    fog: false
});
ufoBody.scale.y = 0.3;        // Flatten to saucer shape

// Bottom dome
const ufoBottomGeometry = new THREE.SphereGeometry(10, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
const ufoBottomMaterial = new THREE.MeshPhongMaterial({
    color: 0x888888,
    shininess: 60,
    fog: false
});

// Cockpit dome
const ufoCockpitGeometry = new THREE.SphereGeometry(3, 16, 16);
const ufoCockpitMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.6
});

// Top/bottom plate
const ufoTopBottomPlateGeometry = new THREE.CylinderGeometry(10, 10, 0.5, 32);

// Lights around the rim
const ufoLightGeometry = new THREE.SphereGeometry(0.5, 8, 8);
const ufoLightMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    emissive: 0x00ff00
});

// UFO animation
function ufoAnimation() {
    ufoGroup.rotation.y += 0.01;   // Slow rotation
    ufoGroup.position.y = baseY + Math.sin(Date.now() * 0.001) * 5;  // Bob up/down
}

// Globe texture on UFO
const ufoGlobeTextureLoader = new THREE.TextureLoader();
// Globe/sponsor texture loaded
```

---

## Hot Air Balloons

```js
// Multiple hot air balloons at various positions
// Each with:
const hotAirBalloon3Geometry = new THREE.SphereGeometry(...);
// Texture loaded from assets
// Basket below

// Position set at moderate altitude
```

---

## Mailbox

```js
const mailboxGeometry = new THREE.BoxGeometry(...);
const mailboxMaterial = new THREE.MeshPhongMaterial({ color: ... });
// Canvas texture for sign
const mailboxCanvas = document.createElement('canvas');
const mailboxContext = mailboxCanvas.getContext('2d');
```

---

## Portals (Start and Exit)

### Start Portal
```js
const startPortalGroup = new THREE.Group();
const startPortalGeometry = new THREE.TorusGeometry(...);
// Particle system around portal
const startPortalParticleCount = ...;
// Particles in Float32Array, positions updated per frame

// Inner material with animated time uniform
if (startPortalInnerMaterial.uniforms && startPortalInnerMaterial.uniforms.time) {
    startPortalInnerMaterial.uniforms.time.value = Date.now() * 0.001;
}
```

### Exit Portal
```js
const exitPortalMaterial = new THREE.MeshPhongMaterial({ ... });
```

---

## Chat Bubble Cloud (Sponsor Slot)

```js
// Animated floating chat bubble group
chatBubbleMainGroup.position.y = 80 + Math.sin(Date.now() * 0.001) * 5;
// Animates up/down
```

---

## Birds

```js
// Multiple bird groups
// Each bird: small geometry (likely BoxGeometry or custom shape)
// Animated wing flapping
// Circular/random flight paths
```

---

## Ships

```js
// Ships on the ocean
// Position on water surface (SEA_LEVEL)
```

---

## Balloons (Targets)

```js
let balloonsHit = 0;
const totalBalloons = 100;
// Balloons positioned around the world
// Destructible - can be hit by missiles
// Count tracked for achievement
```

---

## Fireworks

```js
// Celebratory fireworks at random intervals
// Only shown during certain conditions
if (window.gameEnded || !showFireworksTime) return;
// Particle burst effects
```

---

## Windsock

```js
// Wind indicator near runway
// Geometry and animation for wind direction
```

---

## Check Sign

```js
const checkSignGeometry = new THREE.BoxGeometry(...);
// Near the runway
```

---

## Mars, Jupiter, Moon (Celestial Bodies)

```js
// Mars
const marsTextureLoader = new THREE.TextureLoader();
const marsGeometry = new THREE.SphereGeometry(...);
marsMaterial = new THREE.MeshPhongMaterial({
    // Mars texture
    transparent: true,
    opacity: varies   // Based on planetVisibility
});

// Jupiter - similar sphere with texture
// Moon - similar sphere

// All positioned at very high altitude / far distance
// Visible primarily at night or high altitude
// Collidable (crash into mars/moon/jupiter = death)
```

---

## In-Game Leaderboard (3D Object)

```js
// Canvas texture rendered to a plane in 3D space
const inGameLeaderboardCanvas = document.createElement('canvas');
const inGameLeaderboardContext = inGameLeaderboardCanvas.getContext('2d');
const inGameLeaderboardTexture = new THREE.CanvasTexture(inGameLeaderboardCanvas);
const inGameLeaderboardMaterial = new THREE.MeshBasicMaterial({
    map: inGameLeaderboardTexture
});
// Shows player names, kills, deaths in columns
```
