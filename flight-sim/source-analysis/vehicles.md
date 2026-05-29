# Vehicle Definitions - fly.pieter.com Source Analysis

## Vehicle Types

The game supports: `cessna` (default/free), `f16` ($29.99 premium), `cyberpink` (free), `tank`, `apache` (helicopter).
Additional hidden/unused: `triangle`, `a10`, `ski`.

---

## 1. Cessna 172 (Default)

### Stats (L2252-2259)
```js
minSpeed = 0;
maxSpeed = 2.5;            // Lower top speed than F-16
takeoffSpeed = 0.3;
speedIncrement = 0.15;     // 0 to 100kts in 5 seconds
rollSpeed = 1.44;
maxRoll = Math.PI / 2;     // 90 degrees
yawRate = 8;
pitchSpeed = 0.7;
```

### Spawn
```js
SPAWN_POINT_X = RUNWAY_SPAWN_X;   // 0
SPAWN_POINT_Y = RUNWAY_SPAWN_Y;   // GROUND_LEVEL + 0.6 = 10.6
SPAWN_POINT_Z = RUNWAY_SPAWN_Z;   // 97
```

### Geometry (L2262-2400+)

**Materials:**
```js
bodyMaterial  = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });  // White body
wingMaterial  = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });  // White wings
trimMaterial  = new THREE.MeshPhongMaterial({ color: 0x2244CC });  // Blue trim
```

**Fuselage:**
```js
bodyGeometry = new THREE.BoxGeometry(0.8, 0.8, 4);
// body at default position (0,0,0) in group
```

**Nose:**
```js
noseGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.8);
nose.position.z = -2.2;
nose.position.y = -0.1;
```

**Propeller:**
```js
propellerGeometry = new THREE.BoxGeometry(2, 0.1, 0.1);
propellerMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
vehiclePropeller.position.z = -2.6;
```

**Propeller Hub:**
```js
hubGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 8);
hub.rotation.x = Math.PI/2;
hub.position.z = -2.6;
```

**Wings (high-mounted, Cessna characteristic):**
```js
wingGeometry = new THREE.BoxGeometry(7, 0.1, 1.2);
wings.position.y = 0.3;
```

**Ailerons:**
```js
leftAileronGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.6);
// vehicleAileronLeft stored for animation
// vehicleAileronRight stored for animation
```

**Tail Wings:**
```js
tailWingGeometry = new THREE.BoxGeometry(3, 0.1, 0.8);
// position at rear of fuselage
```

**Vertical Tail:**
```js
// tailGeometry with trimMaterial (blue)
```

**Cockpit Windows:**
```js
windowGeometry = new THREE.BoxGeometry(0.82, 0.3, 1.2);
windowMaterial = new THREE.MeshPhongMaterial({
    color: 0x87CEEB,  // Light blue
    transparent: true,
    opacity: 0.5
});
```

**Landing Gear:**
```js
wheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8);
wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
strutMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
// Left wheel at (-0.8, -0.6, 0.5)
// Right wheel at (0.8, -0.6, 0.5)
// Nose strut at (0, -0.6, -1.5)
// Landing gear parts stored in landingGearParts object
```

### Control Surfaces
- `vehiclePropeller` - rotates in update based on throttle
- `vehicleAileronLeft` / `vehicleAileronRight` - animated with roll
- `vehicleElevator` - animated with pitch
- `vehicleRudder` - animated with yaw

---

## 2. F-16 (Premium - $29.99)

### Stats
The F16 block at L2181 is **empty** in the source - it falls through. The F16 likely loads a GLTF model externally rather than using procedural geometry. Stats from previous conversion analysis:
```js
minSpeed = 0;
maxSpeed = 0.2;            // 100km/h (Note: this seems like tank/ground stats)
takeoffSpeed = 0.28;
speedIncrement = 0.02;
rollSpeed = 1.44;
maxRoll = Math.PI / 2;
yawRate = 1;
pitchSpeed = 0.9;
```

**UI Display Stats:**
```
Max speed: 1,500 knots
Max altitude: 50,000 ft
Fire power: Very high
```

### Other Player Model (L7657-7671)
```js
// Simplified for remote players
body = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.8, 5),
    new THREE.MeshPhongMaterial({ color: 0xff0000, fog: true })
);
wings = new THREE.Mesh(
    new THREE.BoxGeometry(5, 0.2, 2),
    new THREE.MeshPhongMaterial({ color: 0xff0000, fog: true })
);
```

---

## 3. Cyberpink (Free)

### Stats (L2172-2179)
```js
minSpeed = 0;
maxSpeed = 6;              // Fast!
takeoffSpeed = 0.3;
speedIncrement = 0.2;
rollSpeed = 1.5;
maxRoll = Math.PI / 2.2;   // ~81.8 degrees
yawRate = 1.8;
pitchSpeed = 1.0;
```

### Spawn
```js
SPAWN_POINT_X = RUNWAY_SPAWN_X;
SPAWN_POINT_Y = RUNWAY_SPAWN_Y + 1;  // Slightly elevated
SPAWN_POINT_Z = RUNWAY_SPAWN_Z;
```

### Geometry (L2056-2165+)
**Description:** "A flying cybertruck with wings in pink"

**Materials:**
```js
bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xFF69B4 });  // Hot pink body
wingMaterial = new THREE.MeshPhongMaterial({ color: 0xFF1493 });  // Deep pink wings
engineMaterial = new THREE.MeshPhongMaterial({ color: 0x505050 }); // Dark gray engines
```

**Fuselage (angular cybertruck shape):**
```js
bodyGeometry = new THREE.BoxGeometry(2.0, 1.0, 5.0);
```

**Windshield:**
```js
// Angular/futuristic windshield geometry
```

**Wings:**
```js
wingGeometry = new THREE.BoxGeometry(6, 0.1, 1.5);
```

**Thrusters:**
```js
thrusterGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.0, 8);
thrusterMaterial = new THREE.MeshPhongMaterial({
    color: 0x00FFFF,
    emissive: 0x00FFFF,
    emissiveIntensity: 0.5
});
// Left thruster and right thruster positions
```

**Wheels:**
```js
wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 8);
wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
```

**UI Display Stats:**
```
Max speed: 800 knots
Max altitude: 30,000 ft
Fire power: High
```

---

## 4. Tank

### Stats (L1928-1935)
```js
minSpeed = 0;
maxSpeed = 0.2;            // 100km/h
takeoffSpeed = 0.28;       // Kept same for physics compatibility
speedIncrement = 0.02;
rollSpeed = 1.44;
maxRoll = Math.PI / 2;
yawRate = 1;
pitchSpeed = 0.9;
```

### Spawn
```js
SPAWN_POINT_X = RUNWAY_SPAWN_X;   // 0
SPAWN_POINT_Y = RUNWAY_SPAWN_Y;   // 10.6
SPAWN_POINT_Z = RUNWAY_SPAWN_Z;   // 97
```

### Geometry (L1856-1919)

**Materials:**
```js
bodyMaterial    = new THREE.MeshPhongMaterial({ color: 0x4B5320 }); // Olive drab
trackMaterial   = new THREE.MeshPhongMaterial({ color: 0x1a1a1a }); // Dark gray
turretMaterial  = new THREE.MeshPhongMaterial({ color: 0x3B4210 }); // Darker olive
```

**Main Body:**
```js
bodyGeometry = new THREE.BoxGeometry(3, 1.2, 4);
body.position.y = 0.6;
```

**Tracks:**
```js
trackGeometry = new THREE.BoxGeometry(0.8, 0.6, 4.5);
// Left track and right track on sides
```

**Turret:**
```js
turretGeometry = new THREE.BoxGeometry(2, 0.8, 2);
// turretMaterial, stored as tankTurret for rotation control
```

**Main Barrel:**
```js
// CylinderGeometry for main gun barrel
```

**Secondary Barrel:**
```js
// Smaller barrel geometry
```

**Armor Plates:**
```js
armorGeometry = new THREE.BoxGeometry(3.2, 0.3, 0.8);
frontArmor.position.set(0, 0.8, 1.8);
frontArmor.rotation.x = -Math.PI / 6;
```

**Ground Position:**
```js
playerGroup.position.y = 0.3; // Position tracks just above ground
```

### Special Controls
- ArrowUp/Down: Turret elevation (limited to -0.5 radians max upward angle)
- Tank does not fly - ground vehicle only
- Speed control with W/S, reverse with S (8x deceleration)

---

## 5. Apache Helicopter

### Stats (L2046-2053)
```js
minSpeed = 0;
maxSpeed = 5;              // 2164 km/h
takeoffSpeed = 0.28;
speedIncrement = 0.15;
rollSpeed = 1.44;
maxRoll = Math.PI / 2;     // 90 degrees
yawRate = 2;
pitchSpeed = 0.9;
```

### Spawn
```js
SPAWN_POINT_X = RUNWAY_SPAWN_X;
SPAWN_POINT_Y = RUNWAY_SPAWN_Y + 2;  // Lift helicopter off ground
SPAWN_POINT_Z = RUNWAY_SPAWN_Z;
```

### Geometry (L1938-2040)

**Materials:**
```js
bodyMaterial   = new THREE.MeshPhongMaterial({ color: 0x4B5320 }); // Olive drab
rotorMaterial  = new THREE.MeshPhongMaterial({ color: 0x1a1a1a }); // Dark gray
detailMaterial = new THREE.MeshPhongMaterial({ color: 0x3B4210 }); // Darker olive
glassMaterial  = new THREE.MeshPhongMaterial({ color: 0x333333, transparent: true, opacity: 0.7 }); // Tinted glass
```

**Main Body:**
```js
bodyGeometry = new THREE.BoxGeometry(2, 1.8, 6);
body.position.y = 0.5;
```

**Cockpit (tandem seating):**
```js
cockpitGeometry = new THREE.BoxGeometry(1.8, 0.8, 2.5);
cockpit.position.set(0, 1.3, -1.5);
```

**Wings (stub wings for weapons):**
```js
wingGeometry = new THREE.BoxGeometry(4, 0.2, 1);
// Position on sides
```

**Main Rotor:**
```js
// mainRotor - stored for rotation animation
// mainRotor2 - second rotor blade (cross pattern)
```

**Tail Rotor:**
```js
// tailRotor - stored for rotation animation
```

**Weapons/Gun:**
```js
gunGeometry // chin-mounted gun
```

**Skid Landing Gear:**
```js
skidSupportGeometry = new THREE.BoxGeometry(0.1, -0.5, 0.1);
// Skid supports at multiple positions
```

### Special Features
- Rotor animation in updatePlayer():
  ```js
  const idleRotorSpeed = 0.1;
  const maxRotorSpeed = 0.5;
  rotorSpeed = idleRotorSpeed + (throttle * (maxRotorSpeed - idleRotorSpeed));
  mainRotor.rotation.y += rotorSpeed;
  mainRotor2.rotation.y += rotorSpeed;
  tailRotor.rotation.x += rotorSpeed * 2;
  ```

---

## Additional Hidden Vehicles

### Triangle (L1745-1752)
```js
minSpeed = 0;
maxSpeed = 5;              // 2164 km/h
takeoffSpeed = 0.1;
speedIncrement = 0.05;
rollSpeed = 1.44;
maxRoll = Math.PI / 2;
yawRate = 10;
pitchSpeed = 0.9;
```

### Ski (L1847-1854)
```js
minSpeed = 0;
maxSpeed = 0.3;            // Faster than tank but slower than planes
takeoffSpeed = 0.1;
speedIncrement = 0.03;
rollSpeed = 1.2;
maxRoll = Math.PI / 3;     // 60 degrees
yawRate = 1.5;
pitchSpeed = 0.7;
// Always spawns on mountain top
SPAWN_POINT_X = MOUNTAIN_SPAWN_X;  // 300
SPAWN_POINT_Y = MOUNTAIN_SPAWN_Y;  // GROUND_LEVEL + 225
SPAWN_POINT_Z = MOUNTAIN_SPAWN_Z;  // -200
```

---

## Other Player Models (Simplified, L7640+)

All other player vehicles use simplified red geometry for network display:

**Cessna (other player):**
```js
fuselage = BoxGeometry(1, 1, 4), color: 0xff0000
wings = BoxGeometry(7, 0.2, 2), color: 0xff0000
tail = BoxGeometry(2, 0.8, 0.5), position: (0, 0.4, -1.8)
```

**F-16 (other player):**
```js
body = BoxGeometry(1, 0.8, 5), color: 0xff0000
wings = BoxGeometry(5, 0.2, 2), color: 0xff0000
```

**Cyberpink (other player):**
```js
body = BoxGeometry(2, 1, 5), color: 0xff0000
wings = BoxGeometry(8, 0.3, 2), color: 0xff0000
```

**Tank (other player):**
```js
body = BoxGeometry(2, 1, 3), color: 0xff0000
turret = BoxGeometry(1.5, 0.5, 1.5), color: 0xff0000
```

**Apache (other player):**
```js
body = BoxGeometry(1.5, 1, 4), color: 0xff0000
// Rotor geometry
```

---

## Propeller Animation (in updatePlayer)
```js
if (vehiclePropeller) {
    let propellerSpeed;
    if (engineOn) {
        propellerSpeed = 0.5 + throttle * 3;  // Speed based on throttle
    }
    // vehiclePropeller.rotation.z += propellerSpeed;
}
```
