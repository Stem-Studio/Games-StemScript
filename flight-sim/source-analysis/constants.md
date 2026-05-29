# Key Constants and Globals - fly.pieter.com Source Analysis

## World Constants

```js
const SEA_LEVEL = 0;                               // L1190
const GROUND_LEVEL = 10;                            // L1191
```

## Spawn Points

```js
const RUNWAY_SPAWN_X = 0;                           // L1195
const RUNWAY_SPAWN_Y = GROUND_LEVEL + 0.6;          // L1194 = 10.6
const RUNWAY_SPAWN_Z = 97;                           // L1196

const CARRIER_SPAWN_X = -600;                        // L1197
const CARRIER_SPAWN_Y = GROUND_LEVEL + 0.6;          // L1198 = 10.6
const CARRIER_SPAWN_Z = 70;                           // L1199

const MOUNTAIN_SPAWN_X = 300;                         // L1200
const MOUNTAIN_SPAWN_Y = GROUND_LEVEL + 225;          // L1201 = 235
const MOUNTAIN_SPAWN_Z = -200;                        // L1202
```

## Combat Constants

```js
const HIT_DAMAGE = 10;                               // L1187
const PROJECTILE_SPEED = 2.0;                        // L~4080
const MAX_MISSILES = 50;                              // L~4082
const FIRE_RATE = 10;                                 // L~4083 (shots per second)
const MAX_MISSILE_DISTANCE = 100;                     // L~4085
```

## Camera Constants

```js
const INITIAL_CAMERA_X = -600;                        // L474
const INITIAL_CAMERA_Y = 100;                         // L475
const INITIAL_CAMERA_Z = 100;                         // L476
const COCKPIT_OFFSET = new THREE.Vector3(0, 1.0, -0.6); // L2900
const MOUSE_TIMEOUT = 3000;                           // L2898
```

## FOV Constants

```js
const normalFOV = 75;                                // L~1286
const MIN_FOV = normalFOV;                            // 75
const MAX_FOV_INCREASE = 5;                           // L~1289
const TURBO_EXTRA_FOV = 5;                            // L~1290
const TURBO_SPEED_MULTIPLIER = 5;                     // L~1283
const TURBO_FOV_INCREASE = 15;                        // L~1284
```

## Flight Physics Constants

```js
const MAX_THRUST = 0.005;                             // L~3300
const IDLE_THRUST = 0.0001;                           // L~3301
const DRAG_COEFFICIENT = 0.012;                       // L~3302
const GEAR_DRAG_PENALTY = 0.015;                      // L~3303
const GRAVITY_PITCH_FACTOR = 0.008;                   // L~3304
const GEAR_SHAKE_AMOUNT = 0.015;                      // L~3305
const CL_SLOPE = 0.1;                                // L~3308
const STALL_AOA = 15;                                 // L~3309
const STALL_DROP = 0.5;                               // L~3310
const CD_PARASITIC = 0.02;                            // L~3313
const CD_INDUCED_FACTOR = 0.05;                       // L~3314
const CONTROL_AUTHORITY_MIN = 0.3;                    // L~3317
const STALL_SPEED_KMH = 83;                           // L~3318
const GRAVITY_ACCEL = 9.8;                            // L~3321
const PHYSICS_SCALE = 0.015;                          // L~3322
const SPEEDBRAKE_DRAG = 0.04;                         // (implicit from usage)
```

## Multiplayer Constants

```js
const WS_SERVER = 'wss://fly.pieter.com:8080';       // L1356
const BROADCAST_INTERVAL = 0.05;                      // L502 (50ms / 20Hz)
const PLAYER_TIMEOUT = 10000;                         // L539 (10 seconds)
const RUNWAY_FADE_START = 50;                          // L1273
const RUNWAY_FADE_DISTANCE = 100;                      // L~1274
const RUNWAY_SHOOT_DISTANCE = 100;                     // L~1275
```

## Minimap Constants

```js
const MINIMAP_SCALE = 0.02;                           // L544
const MINIMAP_PLAYER_DOT_SIZE = 4;                    // L545
const MINIMAP_OTHER_DOT_SIZE = 3;                     // L546
```

## Rain Constants (System Disabled)

```js
const RAIN_COUNT = 3000;                              // L525
const RAIN_AREA = 1000;                               // L526
const RAIN_HEIGHT = 200;                              // L527
const RAIN_SPEED = 20;                                // L528
```

## Game State Constants

```js
const ROUND_DURATION = 15 * 60;                       // L451 (15 minutes = 900 seconds)
const totalBalloons = 100;                             // L500
```

## Scene Setup

```js
// Camera
PerspectiveCamera(85, aspect, 0.1, 10000)            // FOV=85, near=0.1, far=10000

// Background
scene.background = new THREE.Color(0x7FAFFF);         // Sky blue

// Fog
scene.fog = new THREE.Fog(0xE6E6FA, 100, 500);        // Misty purple, start=100, end=500

// Sun Light
const sunLight = new THREE.DirectionalLight(0xfff0e0, 0.7);  // Warm white, intensity 0.7
sunLight.position.set(100, 100, 50);

// Shadow settings
sunLight.shadow.mapSize.width = 512;
sunLight.shadow.mapSize.height = 512;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 500;
sunLight.shadow.camera.left = -50;
sunLight.shadow.camera.right = 50;
sunLight.shadow.camera.top = 50;
sunLight.shadow.camera.bottom = -50;
sunLight.shadow.bias = -0.001;

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xfff6e6, 0.5);   // Slightly warm, intensity 0.5
```

## Day/Night Cycle Time Constants

```js
const dawnStart = 4000;
const dawnEnd = 6000;
const duskStart = 19000;
const duskEnd = 21000;

// Day colors
const dayColor = 0xfff0e0;
const nightColor = 0x2b4c8c;
const daySkyColor = 0x7FAFFF;
const nightSkyColor = 0x000000;
```

## Star Field Constants

```js
// 500 stars at radius 10000
const HIGH_ALTITUDE = 5000;                            // Stars visible above this
const NIGHT_START = 18000;                             // 6 PM game time
const NIGHT_END = 6000;                                // 6 AM game time
```

## Player State Variables

```js
let vehicleName = 'cessna';                            // L1205
let currentSpeed = 0;                                  // L1208
let currentHeading = 0;                                // Direction 0-360
let currentVerticalSpeed = 0;
let yawAngle = 0;
let currentRoll = 0;
let currentPitch = 0;
let verticalVelocity = 0;

let isAirborne = false;                                // L455
let isMuted = false;                                   // L456
let engineOn = true;                                   // (default)
let landingGearDown = true;                            // (default)
let speedbrakesDeployed = false;

let currentHealth = 100;                               // L463
let maxHealth = 100;                                   // L464
let currentDeaths = 0;                                 // L465
let currentKills = 0;                                  // L466

let score = 0;
let balloonsHit = 0;                                   // L499

let skipControls = false;                              // L505
let isA10Shooting = false;                             // L507
let isRaining = false;                                 // L522

let mainRotor = null;                                  // L469
let mainRotor2 = null;                                 // L470
let tailRotor = null;                                  // L471
let rotorSpeed = 0;                                    // L472
```

## Speed Conversion Factor

```js
const speedKmh = currentSpeed * 525;                   // game units to km/h
const speedKts = speedKmh * 0.539957;                  // km/h to knots
```

## Crash Messages

```js
const CRASH_MESSAGES = {
    "ground": "crashed into the ground",
    "building": "crashed into a building",
    "balloon": "crashed into a balloon",
    "castle": "crashed into the castle",
    "atc": "crashed into the control tower",
    "house": "crashed into a house",
    "mountain": "crashed into the mountain",
    "mars": "crashed into Mars",
    "moon": "crashed into the Moon",
    "jupiter": "crashed into Jupiter"
};
```
