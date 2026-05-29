# Environment Effects - fly.pieter.com Source Analysis

## Scene Background and Fog (L~1300)

```js
scene.background = new THREE.Color(0x7FAFFF);  // Minecraft-style sky blue

const fogColor = new THREE.Color(0xE6E6FA);    // Light grayish-purple misty color
scene.fog = new THREE.Fog(fogColor, 100, 500); // Start at 100, end at 500 units
```

---

## Clouds

### Low-Level Clouds
```js
// Count not explicitly shown for low clouds in search results
// Created via createLowCloud() or similar
```

### Mid-Level Clouds (L~4200)
```js
for (let i = 0; i < 40; i++) {                // 40 mid-level clouds
    const cloud = createMidCloud();
    cloud.position.x = Math.random() * 1600 - 800;   // Spread: -800 to 800
    cloud.position.z = Math.random() * 1600 - 800;
    clouds.push(cloud);
    scene.add(cloud);
}
```

### High-Level Clouds (L~4210)
```js
for (let i = 0; i < 30; i++) {                // 30 high-level clouds
    const cloud = createHighCloud();
    cloud.position.x = Math.random() * 1800 - 900;   // Spread: -900 to 900
    cloud.position.z = Math.random() * 1800 - 900;
    clouds.push(cloud);
    scene.add(cloud);
}
```

### Cloud Movement
```js
function updateClouds() {
    clouds.forEach((cloud) => {
        // Higher clouds move faster, frame-rate independent
        const speed = (cloud.position.y > 400 ? 0.2 :
                      cloud.position.y > 200 ? 0.15 : 0.1) * deltaTime * 60;
        cloud.position.x += speed;

        // Reset cloud position when it goes too far
        if (cloud.position.x > 700) {
            cloud.position.x = -700;
            cloud.position.z = Math.random() * 1400 - 700;
        }
    });
}
```

---

## Day/Night Cycle (L~4300-4420)

### Time Constants
```js
const dawnStart = 4000;
const dawnEnd = 6000;
const duskStart = 19000;
const duskEnd = 21000;
```

### Transition Logic
```js
let transitionFactor = 0;
let planetVisibility = 0;

if (gameTime >= dawnStart && gameTime <= dawnEnd) {
    // Dawn: night to day
    transitionFactor = (gameTime - dawnStart) / (dawnEnd - dawnStart);
    planetVisibility = Math.max(0.5, 1 - transitionFactor);
} else if (gameTime >= duskStart && gameTime <= duskEnd) {
    // Dusk: day to night
    transitionFactor = 1 - ((gameTime - duskStart) / (duskEnd - duskStart));
    planetVisibility = Math.max(0.5, 1 - transitionFactor);
} else if (gameTime > dawnEnd && gameTime < duskStart) {
    // Full day
    transitionFactor = 1;
    planetVisibility = 0.5;
} else {
    // Full night
    planetVisibility = 1;
}
```

### Color Definitions
```js
const dayColor = 0xfff0e0;
const nightColor = 0x2b4c8c;
const daySkyColor = 0x7FAFFF;
const nightSkyColor = 0x000000;
```

### Intensity Calculations
```js
const timeBasedSunIntensity = 0.5 + (transitionFactor * 0.8);      // 0.5 to 1.3
const timeBasedAmbientIntensity = 0.25 + (transitionFactor * 0.1); // 0.25 to 0.35

// Altitude darkening factor
const finalSunIntensity = timeBasedSunIntensity * (1 - altitudeFactor * 0.8);
const finalAmbientIntensity = timeBasedAmbientIntensity * (1 - altitudeFactor * 0.5);
```

### Applied Updates
```js
sunLight.color.copy(finalSunColor);
sunLight.intensity = finalSunIntensity;
ambientLight.intensity = finalAmbientIntensity;
scene.background.copy(finalSkyColor);
scene.fog.color.copy(finalSkyColor);
```

---

## Star Field (L9958-10010)

```js
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 2.5,
    transparent: true,
    opacity: 0,                              // Start invisible
    fog: false,
    sizeAttenuation: false
});

const starVertices = [];
for (let i = 0; i < 500; i++) {              // 500 stars
    const r = 10000;                          // Radius of star sphere
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    starVertices.push(x, y, z);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starGeometry, starMaterial);
stars.renderOrder = 1;
```

### Star Visibility
```js
function updateStars() {
    const HIGH_ALTITUDE = 5000;
    const NIGHT_START = 18000;               // 6 PM in game time
    const NIGHT_END = 6000;                  // 6 AM in game time

    // Altitude-based visibility
    let altitudeRatio = Math.max(0, Math.min(1, (player.position.y - 1000) / HIGH_ALTITUDE));

    // Time-based visibility
    let timeRatio = 0;
    if (gameTime > NIGHT_START || gameTime < NIGHT_END) {
        timeRatio = 1;                        // Visible at night
    }

    // Combined visibility
    starMaterial.opacity = Math.max(altitudeRatio, timeRatio);
}
```

---

## Rain System (DISABLED - createRain returns immediately)

```js
const RAIN_COUNT = 3000;                     // L525
const RAIN_AREA = 1000;                      // L526
const RAIN_HEIGHT = 200;                     // L527
const RAIN_SPEED = 20;                       // L528
let raindrops;
let isRaining = false;                       // L522

function createRain() {
    return;                                   // DISABLED

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(RAIN_COUNT * 3);

    // Random positions in RAIN_AREA cube
    for (let i = 0; i < RAIN_COUNT * 3; i += 3) {
        positions[i] = Math.random() * RAIN_AREA - RAIN_AREA/2;
        positions[i+1] = Math.random() * RAIN_HEIGHT;
        positions[i+2] = Math.random() * RAIN_AREA - RAIN_AREA/2;
    }

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.3,
        transparent: true,
        opacity: 0.6,
        fog: true
    });

    raindrops = new THREE.Points(geometry, material);
}

function updateRain() {
    if (!raindrops || !isRaining) return;

    // Move particles downward
    positions[i+1] -= RAIN_SPEED * deltaTime;

    // Reset when below ground
    if (positions[i+1] < GROUND_LEVEL + 1) {
        positions[i+1] = RAIN_HEIGHT;
        // Random XZ position
    }

    // Follow player
    raindrops.position.x = player.position.x;
    raindrops.position.z = player.position.z;
}
```

---

## Planets (Mars, Jupiter)

### Mars
```js
let marsMaterial;
// Mars sphere with texture loaded from assets/fly_mars.png or similar
// Opacity varies with planetVisibility (day/night)
// Position in sky at high altitude
```

### Jupiter
```js
let jupiterMaterial;
// Similar to Mars, large sphere in sky
```

---

## Turbulence
```js
function addTurbulence() {
    // Adds random small rotational perturbations to player
    // Called every frame in animation loop
}
```
