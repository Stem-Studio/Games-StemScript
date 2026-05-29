# Flight Physics - fly.pieter.com Source Analysis

## Physics Constants (L~3300-3330)

### Throttle-Based Engine Model
```js
const MAX_THRUST = 0.005;           // Maximum engine thrust (good climb power)
const IDLE_THRUST = 0.0001;         // Idle thrust (keeps plane from stopping completely in air)
const DRAG_COEFFICIENT = 0.012;     // Air resistance - balances accel speed and max speed ~165kts
const GEAR_DRAG_PENALTY = 0.015;    // Extra drag when landing gear is down
const GRAVITY_PITCH_FACTOR = 0.008; // How much pitch affects speed (climb=slow, dive=fast)
const GEAR_SHAKE_AMOUNT = 0.015;    // Camera shake intensity when gear is down at speed
```

### Lift Curve Parameters
```js
const CL_SLOPE = 0.1;              // Lift per degree AoA
const STALL_AOA = 15;              // Degrees - critical angle of attack
const STALL_DROP = 0.5;            // Lift drops to this fraction post-stall
```

### Drag Parameters
```js
const CD_PARASITIC = 0.02;         // Base drag (fuselage, etc)
const CD_INDUCED_FACTOR = 0.05;    // Induced drag from lift
```

### Control Authority
```js
const CONTROL_AUTHORITY_MIN = 0.3;  // Control effectiveness at stall speed
const STALL_SPEED_KMH = 83;        // km/h (~45 kts) - minimum effective flying speed
```

### Physics Scaling
```js
const GRAVITY_ACCEL = 9.8;         // m/s^2 base gravity
const PHYSICS_SCALE = 0.015;       // Scale factor for game units
```

### Other Flight Variables
```js
let liftFactor = 1.8;              // Stronger lift for better gliding
let gravityFactor = 0.1;           // Reduced gravity for realistic glide ratio (~9:1)
let minLiftSpeed = 0.2115;         // 1.5x takeoffSpeed
```

### Speedbrakes
```js
const SPEEDBRAKE_DRAG = 0.04;      // Extra drag when speedbrakes deployed
```

---

## getLiftCoefficient(aoaDegrees) (L~3340)

```js
function getLiftCoefficient(aoaDegrees) {
    const absAoA = Math.abs(aoaDegrees);

    if (absAoA <= STALL_AOA) {                          // <= 15 degrees
        // Linear lift region (pre-stall)
        return Math.sign(aoaDegrees || 1) * CL_SLOPE * absAoA;
        // => sign * 0.1 * absAoA
    } else {
        // Post-stall: lift drops
        const stallLift = CL_SLOPE * STALL_AOA;         // 0.1 * 15 = 1.5
        const postStallFactor = Math.max(STALL_DROP, 1 - (absAoA - STALL_AOA) * 0.05);
        // => max(0.5, 1 - (absAoA - 15) * 0.05)
        return Math.sign(aoaDegrees || 1) * stallLift * postStallFactor;
    }
}
```

## getDragCoefficient(liftCoeff) (L~3355)

```js
function getDragCoefficient(liftCoeff) {
    return CD_PARASITIC + CD_INDUCED_FACTOR * liftCoeff * liftCoeff;
    // => 0.02 + 0.05 * Cl^2
}
```

## getControlAuthority(speedKmh) (L~3360)

```js
function getControlAuthority(speedKmh) {
    if (speedKmh < 40) {
        return 0.05 + (speedKmh / 40) * 0.15;           // 0.05 to 0.2 from 0-40 km/h
    }
    if (speedKmh <= STALL_SPEED_KMH) {                   // <= 83 km/h
        return CONTROL_AUTHORITY_MIN;                     // 0.3
    }
    // Above stall speed, linearly increase up to 1.0
    return Math.min(1, CONTROL_AUTHORITY_MIN + (speedKmh - STALL_SPEED_KMH) / 200);
    // => min(1, 0.3 + (speed - 83) / 200)
}
```

---

## getTerrainHeight(x, z)

```js
function getTerrainHeight(x, z) {
    // Check if over aircraft carrier (at x=-600, z=0, deck ~40 wide, ~150 long)
    const carrierX = -600;
    const carrierZ = 0;
    if (Math.abs(x - carrierX) <= 25 && Math.abs(z - carrierZ) <= 80) {
        return GROUND_LEVEL;                              // Carrier deck
    }

    // Check if over any blimp - ellipsoid collision
    const blimps = [
        { x: -50, y: 150, z: -200 },   // White blimp
        // ... other blimp positions
    ];
    // For each blimp: check distance from center, compute ellipsoid surface height

    // Beach check
    if (x < -450) {
        return SEA_LEVEL;                                 // Over ocean (0)
    } else {
        return GROUND_LEVEL;                              // Beach and land (10)
    }
}
```

---

## updatePlayer() - Core Physics Loop

### Speed Conversion
```js
const speedKmh = currentSpeed * 525;       // Convert speed to km/h
speedKts = Math.round(speedKmh * 0.539957); // Convert to knots
```

### Step 1: Thrust Calculation
```js
const idleThrust = (isOnGround || !engineOn) ? 0 : IDLE_THRUST;   // 0.0001 in air only
const thrust = engineOn ? (idleThrust + throttle * (MAX_THRUST - idleThrust)) : 0;
```

### Step 2: Drag Calculation
```js
const speedSquared = currentSpeed * currentSpeed;
let drag = speedSquared * DRAG_COEFFICIENT;            // 0.012 * v^2

// Extra drag when landing gear is down
if (landingGearParts && landingGearDown) {
    drag += speedSquared * GEAR_DRAG_PENALTY;          // + 0.015 * v^2
}

// Extra drag when speedbrakes deployed
if (speedbrakesDeployed) {
    drag += speedSquared * SPEEDBRAKE_DRAG;            // + 0.04 * v^2
}
```

### Step 3: Gravity Pitch Effect
```js
const pitchEffect = isOnGround ? 0 : -Math.sin(currentPitch) * GRAVITY_PITCH_FACTOR;
// Climbing = lose speed, diving = gain speed. Disabled on ground.
```

### Step 4: Ground Friction
```js
if (isOnGround && (speedbrakesDeployed || throttle < 0.1)) {
    // Apply extra ground friction when idle/braking on ground
    drag += currentSpeed * 0.05;                       // Linear friction on ground
}
```

### Step 5: Speed Integration
```js
currentSpeed += (thrust - drag + pitchEffect) * deltaTime * 60;
currentSpeed = Math.max(0, Math.min(currentSpeed, maxSpeed));
```

### Step 6: Angle of Attack
```js
// AoA = pitch angle in degrees (simplified)
const aoaDegrees = currentPitch * (180 / Math.PI);
currentAoA = aoaDegrees;

const liftCoeff = getLiftCoefficient(aoaDegrees);
const dragCoeff = getDragCoefficient(liftCoeff);
```

### Step 7: Lift Force
```js
const dynamicPressure = 0.5 * speedKmh * speedKmh;
const liftForce = dynamicPressure * liftCoeff * PHYSICS_SCALE;   // * 0.015
```

### Step 8: Stall Mechanics
```js
// Stall shaking
const stallSeverity = Math.max(0, (Math.abs(currentAoA) - STALL_AOA) / 10);
if (stallSeverity > 0) {
    // Random wing drop in deep stall
    if (stallSeverity > 0.5 && Math.random() < 0.02) {
        currentRoll += (Math.random() - 0.5) * 0.1;
    }
}
```

### Step 9: Vertical Forces
```js
const gravityForce = gravityFactor * 60;               // 0.1 * 60 = 6
const takeoffSpeedKmh = 75;                             // ~40 kts rotation speed
const canApplyLift = isAirborne || (speedKmh >= takeoffSpeedKmh && currentPitch > 0.05);

if (canApplyLift && speedKmh >= 40) {
    const netVerticalForce = liftForce - gravityForce;
    const pitchClimbContribution = Math.sin(currentPitch) * currentSpeed * 0.4;
    const forceContribution = netVerticalForce * 0.01;
    verticalVelocity += (forceContribution + pitchClimbContribution * 0.1) * deltaTime * 60;
} else {
    // No lift - pure gravity
    verticalVelocity -= gravityFactor * deltaTime * 60;
}
```

### Step 10: Ground Contact
```js
const terrainHeightHere = getTerrainHeight(player.position.x, player.position.z);
const isOnGround = player.position.y < terrainHeightHere + 2;

if (isOnGround) {
    player.position.y = terrainHeightHere + 0.6;       // Snap to ground
    verticalVelocity = Math.max(0, verticalVelocity);  // No sinking
    currentPitch *= 0.95;                               // Level out pitch
    currentRoll *= 0.95;                                // Level out roll
}
```

### Step 11: Position Update
```js
player.translateZ(-currentSpeed);                       // Move forward
player.position.y += verticalVelocity * deltaTime;     // Apply vertical velocity
```

---

## Control Inputs (in updatePlayer)

### Throttle (W/S keys)
```js
const speedInc = speedIncrement * deltaTime;
if (keys['KeyW'] || rightJoystickData.y > 0.3) {
    currentSpeed += speedInc;
} else if (keys['KeyS'] || rightJoystickData.y < -0.3) {
    currentSpeed = Math.max(currentSpeed - speedIncrement * 8 * deltaTime, minSpeed);
}
```

### Turbo (ShiftRight or AltLeft)
```js
if (keys['ShiftRight']) {
    currentSpeed += speedInc;
    currentSpeed = Math.min(currentSpeed, maxSpeed);
    // FOV increase applied separately
}
```

### Roll (A/D or ArrowLeft/ArrowRight)
```js
if (keys['KeyA']) {
    currentRoll += rollSpeed * deltaTime;
} else if (keys['KeyD']) {
    currentRoll -= rollSpeed * deltaTime;
}
currentRoll = Math.max(-maxRoll, Math.min(maxRoll, currentRoll));
```

### Pitch (ArrowUp/ArrowDown)
```js
if (keys['ArrowUp']) {
    currentPitch += pitchSpeed * deltaTime * controlAuthority;
} else if (keys['ArrowDown']) {
    currentPitch -= pitchSpeed * deltaTime * controlAuthority;
}
```

### Yaw (derived from roll)
```js
const rollFactor = Math.abs(currentRoll) / Math.PI;
const yawChange = Math.sin(currentRoll) * yawRate * deltaTime;
currentHeading += yawChange;
```

---

## Crash Detection

### Ground Crash
```js
// Checks vertical speed and impact angle
if (verticalSpeed > threshold && impactAngle > threshold) {
    // Crash detected
    console.log('crashed into ground at ' + verticalSpeed + ' and angle ' + impactAngle);
}
```

### Structure Collisions
```js
// Collision checked against: buildings, houses, balloons, castle, ATC tower,
// mountains, mars, moon, jupiter
// Uses Box3.setFromObject() and intersectsBox()
```

### Crash Messages (L479-489)
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

---

## Airborne Detection
```js
let isAirborne = false;
// Set true when player.position.y > terrainHeight + threshold
// Used to gate lift application and landing detection
```

## Landing Detection
```js
// Track if we've climbed high enough
if (player.position.y > GROUND_LEVEL + 50) {
    reachedCruiseAltitude = true;
}

// Detect landing approach
const lowAltitude = player.position.y < GROUND_LEVEL + 15;  // ~50ft AGL
if (isAirborne && lowAltitude && !landingGearDown && reachedCruiseAltitude) {
    // Auto extend gear on mobile, show tip on desktop
}
```
