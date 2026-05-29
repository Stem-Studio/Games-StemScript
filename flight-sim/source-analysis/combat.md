# Combat System - fly.pieter.com Source Analysis

## Constants

```js
const HIT_DAMAGE = 10;                     // L1187 - damage per missile hit
const PROJECTILE_SPEED = 2.0;              // L~4080 - missile travel speed
const MAX_MISSILES = 50;                   // Max missiles alive at once
const FIRE_RATE = 10;                      // Shots per second
const MAX_MISSILE_DISTANCE = 100;          // Max travel distance before cleanup
let lastFireTime = Date.now();
```

---

## Missile Geometry (L~4090)

```js
const missileGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2.0, 8);  // Body
const missileTipGeometry = new THREE.ConeGeometry(0.2, 0.4, 8);        // Tip

const missileMaterial = new THREE.MeshPhongMaterial({
    color: 0xff6644,
    roughness: 0.8,        // More like foam
    metalness: 0.1         // Slight sheen like nerf foam
});

const missileTipMaterial = new THREE.MeshPhongMaterial({
    color: 0xffaa44,
    roughness: 0.7,
    metalness: 0.2
});
```

---

## shootMissile() Function (L~4100)

```js
function shootMissile() {
    if (window.gameEnded) return;            // Can't shoot while dead

    if (vehicleName == 'a10') {
        isA10Shooting = true;                // A-10 has special gun sound
    }

    let fireDelay = 1000 / FIRE_RATE;       // 100ms between shots
    const currentTime = Date.now();
    if (currentTime - lastFireTime < fireDelay) {
        return;                              // Rate limited
    }

    if (missiles.length >= MAX_MISSILES) {
        return;                              // Max missiles reached
    }

    lastFireTime = currentTime;

    // Create missile mesh (body + tip combined)
    const missile = new THREE.Group();
    const body = new THREE.Mesh(missileGeometry, missileMaterial);
    const tip = new THREE.Mesh(missileTipGeometry, missileTipMaterial);
    tip.position.y = 1.2;                    // Position tip at front
    missile.add(body);
    missile.add(tip);

    // Position at player's location
    missile.position.copy(player.position);
    missile.quaternion.copy(player.quaternion);

    // Set missile velocity (forward direction)
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(player.quaternion);
    missile.userData.velocity = direction.multiplyScalar(PROJECTILE_SPEED);
    missile.userData.startPosition = player.position.clone();

    scene.add(missile);
    missiles.push(missile);
}
```

---

## Missile Collision Detection (checkMissileCollisions, L~8550)

### Distance Optimization
```js
const COLLISION_CHECK_DISTANCE = 50;       // Only check planes within this distance
```

### Other Player Hit Detection
```js
otherPlayers.forEach((otherPlane, otherPlayerPlaneId) => {
    const distanceToPlane = missile.position.distanceTo(otherPlane.position);
    if (distanceToPlane > COLLISION_CHECK_DISTANCE) return;  // Skip far planes
    if (!otherPlane.visible) return;                          // Skip dead planes

    const planeBox = new THREE.Box3().setFromObject(otherPlane);
    const missileBox = new THREE.Box3().setFromObject(missile);

    if (missileBox.intersectsBox(planeBox)) {
        createExplosionEffect(otherPlane.position.clone());
        playExplosionSound();
        scene.remove(missile);
        // Score: +25 for hit
        score += 25;

        // Check if kill (health <= 0)
        if (isKill) {
            score += 100;  // scoreToAddForKill
        }

        broadcastHit(otherPlayerPlaneId, HIT_DAMAGE, isKill);
        updatePlaneColorBasedOnHealth(otherPlane);
    }
});
```

### House Collision
```js
for (let j = houses.length - 1; j >= 0; j--) {
    const house = houses[j];
    const houseBox = new THREE.Box3().setFromObject(house);
    if (missileBox.intersectsBox(houseBox)) {
        createExplosionEffect(house.position.clone(), false);
        playExplosionSound();
        scene.remove(house);
        scene.remove(missile);
        houses.splice(j, 1);
        score += 50;
    }
}
```

### Building Collision
```js
// Similar pattern to house collision
// Buildings also removed on hit, score += 50
```

### Missile Cleanup
```js
// Remove missiles that travel beyond MAX_MISSILE_DISTANCE (100 units)
const distanceTraveled = missile.position.distanceTo(missile.userData.startPosition);
if (distanceTraveled > MAX_MISSILE_DISTANCE) {
    scene.remove(missile);
    missiles.splice(i, 1);
}
```

---

## Health System

```js
let currentHealth = 100;                   // L463
let maxHealth = 100;                       // L464
let currentDeaths = 0;                     // L465
let currentKills = 0;                      // L466
```

### Damage Application
```js
// When hit by another player's missile:
otherPlane.userData.health -= HIT_DAMAGE;  // -10 per hit
const isKill = otherPlane.userData.health <= 0;
```

### Health Color Indication
```js
// updatePlaneColorBasedOnHealth(otherPlane)
// Changes other player model color based on remaining health
// Red tint increases as health decreases
```

---

## Death/Respawn

### Game Over Trigger
```js
// window.gameEnded = true on crash or health <= 0
if (window.gameEnded) return;
window.gameEnded = true;
```

### Crash Messages
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

### Respawn
```js
window.gameEnded = false;
// Reset position to spawn point
// Reset speed, health, orientation
// Landing gear reset
```

---

## Explosion Effect (L4853)

```js
function createExplosionEffect(position, isHouse = false) {
    playExplosionSound();

    const particleCount = isHouse ? 100 : 50;
    const particles = new THREE.Group();

    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(isHouse ? 0.3 : 0.2, 8, 8);
        const material = new THREE.MeshPhongMaterial({
            color: Math.random() > 0.5 ? 0xff4400 : 0xff8800,   // Orange/red
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });

        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);

        const velocityMultiplier = isHouse ? 0.5 : 0.3;
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * velocityMultiplier,
            Math.random() * velocityMultiplier,
            (Math.random() - 0.5) * velocityMultiplier
        );

        particles.add(particle);
    }

    scene.add(particles);
    // Particles animate outward and fade over time
    // Cleaned up after animation completes
}
```

---

## Score System

| Action | Points |
|--------|--------|
| Hit another player | +25 |
| Kill another player | +100 |
| Hit a house | +50 |
| Hit a building | +50 |
| Hit a balloon | varies |

---

## Broadcast Hit (L8944)

```js
function broadcastHit(targetPlaneId, damage, isKill) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    const message = {
        type: 'hit',
        planeId: selfPlaneId,
        targetPlaneId: targetPlaneId,
        damage: damage,
        isKill: isKill,
        username: selfUsername,
        timestamp: Date.now(),
        verifyToken: verifyToken
    };

    socket.send(JSON.stringify(message));
}
```

## Broadcast Crash (L~8980)

```js
function broadcastCrash(verb) {
    const message = {
        type: 'crash',
        planeId: selfPlaneId,
        username: selfUsername,
        verb: verb,
        timestamp: Date.now(),
        verifyToken: verifyToken
    };
    socket.send(JSON.stringify(message));
}
```
