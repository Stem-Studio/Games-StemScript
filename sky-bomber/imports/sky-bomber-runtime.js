const F_WALKABLE = 1 << 0;
const F_HARD = 1 << 1;
const F_SOFT = 1 << 2;
const F_LAND = 1 << 3;
const F_PLAYER = 1 << 4;
const F_ENEMY = 1 << 5;
const F_BOMB = 1 << 6;
const F_BLAST = 1 << 7;
const F_BLOCKS_SIGHT = F_HARD | F_SOFT;

const DIR_X = [1, -1, 0, 0];
const DIR_Z = [0, 0, 1, -1];
const MEGA_X = [1, -1, 0, 0, 1, 1, -1, -1];
const MEGA_Z = [0, 0, 1, -1, 1, -1, 1, -1];
const SPLASHES = [
    "MIND THE BRIDGES!",
    "DROP A BOMB!",
    "CRACK OPEN CHESTS!",
    "BEWARE THE VOID!",
    "VOXEL SKY ISLANDS!",
    "BOMBERMAN + CLOUDS!",
];

function init(owner, game) {
    dispose(owner);
    const state = createState(owner, game, false);
    owner._sb = state;
    findPlayerProxy(state);
    startLevel(owner, "start");
}

function initEditor(owner, editor) {
    dispose(owner);
    const gameLike = {
        camera: editor.camera,
        scene: editor.scene,
        renderer: editor.renderer,
        inputManager: null,
    };
    const state = createState(owner, gameLike, true);
    owner._sb = state;
    startLevel(owner, "start");
}

function update(owner, dt) {
    const state = owner._sb;
    if (!state || state.editorMode) return;
    readInputs(owner, state);
    if (state.enterPressed) advance(owner);
    if (state.phase === "playing") {
        updatePlayer(owner, state, dt);
        if (state.bombPressed) placeBomb(owner, state);
        updateBombs(owner, state, dt);
        updateExplosions(state, dt);
        updateEnemies(owner, state, dt);
        updatePickups(owner, state, dt);
        checkPlayerDeath(owner, state);
        checkWin(owner, state);
    } else {
        state.prevJump = state.jumpHeld;
    }
    updateCamera(state, dt);
    updateClouds(state, dt);
    updateUi(state);
}

function dispose(owner) {
    const state = owner._sb;
    if (!state) return;
    disposeWorld(state);
    owner._sb = null;
}

function buildUi(owner) {
    const state = owner._sb;
    if (!state || !owner._uiRoot || typeof UIKit === "undefined") return;

    const root = new UIKit.Container({
        positionType: "absolute",
        positionTop: 0,
        positionLeft: 0,
        positionRight: 0,
        positionBottom: 0,
        pointerEvents: "none",
        visibility: "visible",
    });
    owner._uiRoot.add(root);
    state.ui.root = root;

    const top = new UIKit.Container({
        positionType: "absolute",
        positionTop: 18,
        positionLeft: 18,
        flexDirection: "column",
        gap: 7,
        padding: 10,
        backgroundColor: "rgba(34,42,52,0.82)",
        borderWidth: 2,
        borderColor: "#9a9a9a",
        pointerEvents: "none",
        visibility: "visible",
    });
    state.ui.level = new UIKit.Text({ text: "LEVEL 1", fontSize: 18, color: "#ffd145", fontWeight: "bold", visibility: "visible" });
    state.ui.bombs = new UIKit.Text({ text: "BOMBS 3", fontSize: 13, color: "#ffffff", visibility: "visible" });
    state.ui.mega = new UIKit.Text({ text: "MEGA 0", fontSize: 13, color: "#d935ff", visibility: "visible" });
    state.ui.enemies = new UIKit.Text({ text: "ENEMIES 0", fontSize: 13, color: "#7fff7c", visibility: "visible" });
    top.add(state.ui.level);
    top.add(state.ui.bombs);
    top.add(state.ui.mega);
    top.add(state.ui.enemies);
    root.add(top);

    const tile = new UIKit.Container({
        positionType: "absolute",
        positionRight: 18,
        positionBottom: 18,
        padding: 8,
        backgroundColor: "rgba(34,42,52,0.75)",
        borderWidth: 2,
        borderColor: "#6b6b6b",
        pointerEvents: "none",
        visibility: "visible",
    });
    state.ui.tile = new UIKit.Text({ text: "TILE -", fontSize: 12, color: "#ffffff", visibility: "visible" });
    tile.add(state.ui.tile);
    root.add(tile);

    const overlay = new UIKit.Container({
        positionType: "absolute",
        positionTop: 0,
        positionLeft: 0,
        positionRight: 0,
        positionBottom: 0,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(8,16,32,0.66)",
        pointerEvents: "auto",
        cursor: "pointer",
        visibility: "visible",
        onClick: function () {
            advance(owner);
        },
    });
    const card = new UIKit.Container({
        width: 560,
        padding: 24,
        gap: 14,
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "rgba(35,43,53,0.9)",
        borderWidth: 3,
        borderColor: "#9a9a9a",
        pointerEvents: "auto",
        visibility: "visible",
    });
    state.ui.title = new UIKit.Text({ text: "SKY\nBOMBER", fontSize: 54, color: "#ffd145", fontWeight: "bold", textAlign: "center", visibility: "visible" });
    state.ui.subtitle = new UIKit.Text({ text: "", fontSize: 16, color: "#ffffff", textAlign: "center", visibility: "visible" });
    state.ui.hint = new UIKit.Text({ text: "", fontSize: 14, color: "#d8e7ff", textAlign: "center", visibility: "visible" });
    card.add(state.ui.title);
    card.add(state.ui.subtitle);
    card.add(state.ui.hint);
    overlay.add(card);
    root.add(overlay);
    state.ui.overlay = overlay;
    updateUi(state);
}

function advance(owner) {
    const state = owner._sb;
    if (!state) return;
    if (state.phase === "start") {
        setPhase(owner, state, "playing");
        return;
    }
    if (state.phase === "cleared") {
        state.level += 1;
        startLevel(owner, "playing");
        return;
    }
    if (state.phase === "dead") {
        state.level = 1;
        state.deaths += 1;
        state.bombBonus = 0;
        state.megaCharges = 0;
        startLevel(owner, "playing");
    }
}

function createState(owner, game, editorMode) {
    return {
        owner: owner,
        game: game,
        editorMode: editorMode,
        config: readConfig(owner),
        host: getHost(owner),
        root: null,
        materials: [],
        geometries: [],
        meshes: [],
        grid: null,
        placements: [],
        bridgeXZ: {},
        hard: [],
        soft: [],
        softByKey: {},
        treasureKeys: {},
        bombs: [],
        explosions: [],
        pickups: [],
        enemies: [],
        enemyAliveCount: 0,
        player: null,
        playerProxy: null,
        phase: "start",
        level: 1,
        deaths: 0,
        bombBonus: 0,
        megaCharges: 0,
        elapsed: 0,
        prevJump: false,
        prevEnter: false,
        jumpHeld: false,
        enterHeld: false,
        bombPressed: false,
        enterPressed: false,
        inputForward: 0,
        inputLateral: 0,
        ui: { last: {} },
        tmpForward: new THREE.Vector3(),
        tmpRight: new THREE.Vector3(),
        cameraAnchor: new THREE.Vector3(),
        cameraLook: new THREE.Vector3(),
        dummy: new THREE.Object3D(),
    };
}

function readConfig(owner) {
    return {
        seed: attr(owner, "seed", 552) | 0,
        islandSize: Math.max(16, Math.round(attr(owner, "islandSize", 24))),
        mainDensity: attr(owner, "mainDensity", 0.15),
        secondaryDensity: attr(owner, "secondaryDensity", 0.1),
        bridgeArc: attr(owner, "bridgeArc", -0.1),
        playerSpeed: attr(owner, "playerSpeed", 6),
        baseEnemyCount: Math.max(0, Math.round(attr(owner, "baseEnemyCount", 3))),
        enemySpeed: attr(owner, "enemySpeed", 1.8),
        maxBombs: Math.max(1, Math.round(attr(owner, "maxBombs", 3))),
        fuseSeconds: attr(owner, "fuseSeconds", 2),
        blastDuration: attr(owner, "blastDuration", 0.45),
        cameraDistance: attr(owner, "cameraDistance", 32),
        cameraPitch: attr(owner, "cameraPitch", 35),
        cameraYaw: attr(owner, "cameraYaw", 135),
        cameraStiffness: attr(owner, "cameraStiffness", 5),
    };
}

function attr(owner, key, fallback) {
    const value = owner.getAttribute ? owner.getAttribute(key) : undefined;
    return value === undefined || value === null ? fallback : value;
}

function getHost(owner) {
    return owner.gameObject && owner.gameObject._internal ? owner.gameObject._internal.three : null;
}

function startLevel(owner, phase) {
    const state = owner._sb;
    if (!state) return;
    disposeWorld(state);
    state.config = readConfig(owner);
    state.root = new THREE.Group();
    state.root.name = "SkyBomber.Runtime";
    markRuntime(state.root);
    state.host = getHost(owner);
    if (state.host) state.host.add(state.root);
    createResources(state);
    buildLevel(owner, state);
    state.phase = phase;
    state.ui.last = {};
    owner._log && owner._log("state", phase, "level", state.level);
}

function disposeWorld(state) {
    if (state.root && state.root.parent) state.root.parent.remove(state.root);
    for (let i = 0; i < state.geometries.length; i++) state.geometries[i].dispose();
    for (let i = 0; i < state.materials.length; i++) state.materials[i].dispose();
    state.root = null;
    state.geometries = [];
    state.materials = [];
    state.meshes = [];
    state.bombs = [];
    state.explosions = [];
    state.pickups = [];
    state.enemies = [];
    state.hard = [];
    state.soft = [];
    state.softByKey = {};
    state.treasureKeys = {};
    state.bridgeXZ = {};
    state.player = null;
    state.grid = null;
    state.enemyAliveCount = 0;
}

function createResources(state) {
    state.geometries.block = keepGeo(state, new THREE.BoxGeometry(1, 1, 1));
    state.geometries.slab = keepGeo(state, new THREE.BoxGeometry(1, 0.38, 1));
    state.geometries.pillar = keepGeo(state, new THREE.BoxGeometry(0.92, 1, 0.92));
    state.geometries.sphere = keepGeo(state, new THREE.SphereGeometry(0.35, 16, 10));
    state.geometries.pickup = keepGeo(state, new THREE.IcosahedronGeometry(0.28, 0));
    state.geometries.body = keepGeo(state, new THREE.BoxGeometry(0.5, 0.75, 0.3));
    state.geometries.head = keepGeo(state, new THREE.BoxGeometry(0.5, 0.5, 0.5));
    state.geometries.limb = keepGeo(state, new THREE.BoxGeometry(0.22, 0.7, 0.26));
    state.geometries.eye = keepGeo(state, new THREE.BoxGeometry(0.08, 0.08, 0.025));
    state.mat = {
        grass: matStandard(state, 0x5fa83f, { roughness: 0.85 }),
        sand: matStandard(state, 0xdcc778, { roughness: 0.9 }),
        snow: matStandard(state, 0xf1f6ff, { roughness: 0.8 }),
        stone: matStandard(state, 0x6e7178, { roughness: 0.9 }),
        dirt: matStandard(state, 0x6f4b2b, { roughness: 0.95 }),
        bridge: matStandard(state, 0x8a6a3d, { roughness: 0.75 }),
        hard: matStandard(state, 0x686c76, { roughness: 0.8 }),
        soft: matStandard(state, 0x9c5f2e, { roughness: 0.7 }),
        chest: matStandard(state, 0x7a4a1a, { roughness: 0.75 }),
        gold: matStandard(state, 0xffd145, { roughness: 0.3, metalness: 0.5 }),
        bomb: matStandard(state, 0x161823, { roughness: 0.45 }),
        megaBomb: matStandard(state, 0x3a0a4a, { emissive: 0xd935ff, emissiveIntensity: 0.45, roughness: 0.45 }),
        blast: matBasic(state, 0xffaa33, { transparent: true, opacity: 0.78, depthWrite: false }),
        playerSkin: matStandard(state, 0xf0c590, { roughness: 0.7 }),
        playerShirt: matStandard(state, 0x3aa9d6, { roughness: 0.6 }),
        playerPants: matStandard(state, 0x3a4ad6, { roughness: 0.6 }),
        eye: matBasic(state, 0x111111, {}),
        enemyRed: matStandard(state, 0xd9433a, { roughness: 0.65 }),
        enemyYellow: matStandard(state, 0xd9b43a, { roughness: 0.65 }),
        enemyGreen: matStandard(state, 0x4fb95a, { roughness: 0.65 }),
        extra: matStandard(state, 0xffaa33, { emissive: 0xffaa33, emissiveIntensity: 0.45, roughness: 0.35 }),
        mega: matStandard(state, 0xd935ff, { emissive: 0xd935ff, emissiveIntensity: 0.55, roughness: 0.35 }),
        cloud: matBasic(state, 0xffffff, { transparent: true, opacity: 0.32, depthWrite: false }),
    };
}

function keepGeo(state, geo) {
    state.geometries.push(geo);
    return geo;
}

function matStandard(state, color, extra) {
    const params = { color: color, roughness: 0.6, metalness: 0.02 };
    merge(params, extra);
    const mat = new THREE.MeshStandardNodeMaterial(params);
    state.materials.push(mat);
    return mat;
}

function matBasic(state, color, extra) {
    const params = { color: color };
    merge(params, extra);
    const mat = new THREE.MeshBasicNodeMaterial(params);
    state.materials.push(mat);
    return mat;
}

function merge(target, source) {
    if (!source) return target;
    for (const key in source) target[key] = source[key];
    return target;
}

function buildLevel(owner, state) {
    state.elapsed = 0;
    state.grid = makeGrid();
    state.placements = buildPlacements(state.config.seed, state.level, state.config.islandSize);
    const terrainByMat = { grass: [], sand: [], snow: [], stone: [] };
    const underside = [];
    for (let i = 0; i < state.placements.length; i++) {
        addIslandCells(state, state.placements[i], terrainByMat, underside);
    }
    addBridges(state);
    addInstances(state, "Terrain.Grass", state.geometries.slab, state.mat.grass, terrainByMat.grass);
    addInstances(state, "Terrain.Sand", state.geometries.slab, state.mat.sand, terrainByMat.sand);
    addInstances(state, "Terrain.Snow", state.geometries.slab, state.mat.snow, terrainByMat.snow);
    addInstances(state, "Terrain.Stone", state.geometries.slab, state.mat.stone, terrainByMat.stone);
    addInstances(state, "Terrain.Underside", state.geometries.slab, state.mat.dirt, underside);
    state.spawn = pickSpawn(state);
    addObstacles(state);
    addTreasures(state);
    createClouds(state);
    createPlayer(state, state.spawn);
    createEnemies(state);
    owner._log && owner._log("levelStart", state.level, "enemies", state.enemyAliveCount);
}

function buildPlacements(baseSeed, level, mainSize) {
    const seed = mix32(baseSeed ^ (level * 0x9e3779b9));
    const placements = [];
    const mainRadius = Math.floor(mainSize * 0.39);
    placements.push({ index: 0, seed: seed, cx: 0, cy: 0, cz: 0, size: mainSize, radius: mainRadius, cells: [] });
    const angles = shuffledCardinals(seed);
    const secondaryBase = Math.max(8, Math.round((mainSize * 0.5) / 4) * 4);
    for (let i = 1; i < 4; i++) {
        const s = mix32(seed ^ (i * 2654435761));
        const sizeMul = 0.7 + hash01(s, 10, i) * 0.6;
        const size = Math.max(8, Math.round((secondaryBase * sizeMul) / 4) * 4);
        const radius = Math.floor(size * (0.32 + hash01(s, 11, i) * 0.12));
        const angle = angles[i - 1];
        const dist = mainRadius + 4 + radius;
        const cy = Math.floor(hash01(s, 12, i) * 5) - 2;
        placements.push({
            index: i,
            seed: s,
            cx: Math.round(Math.cos(angle) * dist),
            cy: cy,
            cz: Math.round(Math.sin(angle) * dist),
            size: size,
            radius: Math.max(4, radius),
            cells: [],
        });
    }
    return placements;
}

function addIslandCells(state, placement, terrainByMat, underside) {
    const half = Math.floor(placement.size / 2);
    for (let lz = -half; lz <= half; lz++) {
        for (let lx = -half; lx <= half; lx++) {
            const dist = Math.sqrt(lx * lx + lz * lz);
            const n = hash01(placement.seed, lx * 31, lz * 47) - 0.5;
            const edge = placement.radius * (1 + n * 0.28);
            if (dist > edge) continue;
            const wx = placement.cx + lx;
            const wy = placement.cy;
            const wz = placement.cz + lz;
            const cell = { x: wx, y: wy, z: wz, lx: lx, lz: lz, distFrac: dist / Math.max(1, placement.radius), island: placement.index };
            placement.cells.push(cell);
            gridAdd(state.grid, wx, wy, wz, F_WALKABLE | F_LAND);
            const matKey = pickSurface(placement.seed, lx, lz, cell.distFrac);
            terrainByMat[matKey].push({ x: wx + 0.5, y: wy - 0.22, z: wz + 0.5, sx: 1, sy: 1, sz: 1 });
            underside.push({ x: wx + 0.5, y: wy - 0.78, z: wz + 0.5, sx: 0.92, sy: 0.75, sz: 0.92 });
            if (hash01(placement.seed, lx * 5, lz * 7) > 0.72 && cell.distFrac < 0.78) {
                underside.push({ x: wx + 0.5, y: wy - 1.32, z: wz + 0.5, sx: 0.66, sy: 0.7, sz: 0.66 });
            }
        }
    }
}

function pickSurface(seed, lx, lz, distFrac) {
    const roll = hash01(seed, lx * 13, lz * 17);
    if (distFrac > 0.82) return "sand";
    if (roll > 0.94) return "stone";
    if ((seed & 7) === 3 && roll > 0.78) return "snow";
    return "grass";
}

function addBridges(state) {
    for (let i = 1; i < state.placements.length; i++) {
        const a = state.placements[0];
        const b = state.placements[i];
        const dx = Math.sign(b.cx - a.cx);
        const dz = Math.sign(b.cz - a.cz);
        const startX = a.cx + dx * a.radius;
        const startZ = a.cz + dz * a.radius;
        const endX = b.cx - dx * b.radius;
        const endZ = b.cz - dz * b.radius;
        buildBridge(state, startX, a.cy, startZ, endX, b.cy, endZ);
    }
}

function buildBridge(state, ax, ay, az, bx, by, bz) {
    const tiles = [];
    let x = ax;
    let z = az;
    tiles.push({ x: x, z: z });
    const sx = Math.sign(bx - ax);
    while (x !== bx) {
        x += sx;
        tiles.push({ x: x, z: z });
    }
    const sz = Math.sign(bz - az);
    while (z !== bz) {
        z += sz;
        tiles.push({ x: x, z: z });
    }
    const len = Math.max(1, tiles.length - 1);
    const rawArc = len * state.config.bridgeArc;
    const arc = Math.sign(rawArc) * Math.min(3, Math.abs(rawArc));
    const positions = [];
    for (let i = 0; i < tiles.length; i++) {
        const u = i / len;
        const visualY = ay + (by - ay) * u + arc * Math.sin(u * Math.PI);
        const walkY = Math.round(visualY);
        const tile = tiles[i];
        gridAdd(state.grid, tile.x, walkY, tile.z, F_WALKABLE | F_LAND);
        state.bridgeXZ[xzKey(tile.x, tile.z)] = true;
        positions.push({ x: tile.x + 0.5, y: visualY - 0.18, z: tile.z + 0.5, sx: 0.86, sy: 0.55, sz: 0.86 });
    }
    addInstances(state, "Bridge", state.geometries.slab, state.mat.bridge, positions);
}

function pickSpawn(state) {
    const main = state.placements[0];
    let best = null;
    let bestD = Infinity;
    for (let i = 0; i < main.cells.length; i++) {
        const c = main.cells[i];
        if (!gridHas(state.grid, c.x, c.y, c.z, F_WALKABLE)) continue;
        const d = Math.abs(c.x - main.cx) + Math.abs(c.z - main.cz);
        if (d < bestD) {
            bestD = d;
            best = c;
        }
    }
    return best ? { x: best.x, y: best.y, z: best.z } : { x: 0, y: 0, z: 0 };
}

function addObstacles(state) {
    const hardKeys = {};
    const mainCandidates = [];
    for (let i = 0; i < state.placements.length; i++) {
        const placement = state.placements[i];
        for (let c = 0; c < placement.cells.length; c++) {
            const cell = placement.cells[c];
            if (cell.distFrac > 0.78) continue;
            if (state.bridgeXZ[xzKey(cell.x, cell.z)]) continue;
            const spawnD = Math.abs(cell.x - state.spawn.x) + Math.abs(cell.z - state.spawn.z);
            if (placement.index === 0 && spawnD <= 2) continue;
            const k = key(cell.x, cell.y, cell.z);
            if (placement.index === 0 && cell.lx % 4 === 0 && cell.lz % 4 === 0) {
                hardKeys[k] = true;
                createObstacle(state, cell, "hard", false);
                continue;
            }
            const density = placement.index === 0 ? state.config.mainDensity : state.config.secondaryDensity;
            if (hash01(placement.seed, cell.lx * 101, cell.lz * 131) < density) {
                if (placement.index === 0) mainCandidates.push(cell);
                else createObstacle(state, cell, "soft", false);
            }
        }
    }
    const spawnKey = key(state.spawn.x, state.spawn.y, state.spawn.z);
    for (let i = 0; i < mainCandidates.length; i++) {
        const cell = mainCandidates[i];
        const k = key(cell.x, cell.y, cell.z);
        gridClear(state.grid, cell.x, cell.y, cell.z, F_WALKABLE);
        if (reachableCount(state.grid, spawnKey) === walkableCount(state.grid)) {
            createObstacle(state, cell, "soft", false);
        } else {
            gridAdd(state.grid, cell.x, cell.y, cell.z, F_WALKABLE);
        }
    }
}

function createObstacle(state, cell, type, treasure) {
    gridClear(state.grid, cell.x, cell.y, cell.z, F_WALKABLE);
    gridAdd(state.grid, cell.x, cell.y, cell.z, type === "hard" ? F_HARD | F_LAND : F_SOFT | F_LAND);
    const mat = type === "hard" ? state.mat.hard : (treasure ? state.mat.chest : state.mat.soft);
    const mesh = new THREE.Mesh(state.geometries.pillar, mat);
    mesh.name = treasure ? "TreasureChest" : (type === "hard" ? "HardPillar" : "SoftCrate");
    mesh.position.set(cell.x + 0.5, cell.y + 0.5, cell.z + 0.5);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    markRuntime(mesh);
    state.root.add(mesh);
    const entry = { x: cell.x, y: cell.y, z: cell.z, key: key(cell.x, cell.y, cell.z), mesh: mesh, treasure: treasure };
    if (type === "soft") {
        state.soft.push(entry);
        state.softByKey[entry.key] = entry;
    } else {
        state.hard.push(entry);
    }
    if (treasure) addChestDetails(state, mesh);
}

function addChestDetails(state, chest) {
    const lock = new THREE.Mesh(state.geometries.eye, state.mat.gold);
    lock.position.set(0, 0.08, 0.48);
    markRuntime(lock);
    chest.add(lock);
}

function addTreasures(state) {
    for (let p = 0; p < state.placements.length; p++) {
        const placement = state.placements[p];
        const candidates = [];
        for (let i = 0; i < placement.cells.length; i++) {
            const cell = placement.cells[i];
            if (!gridHas(state.grid, cell.x, cell.y, cell.z, F_WALKABLE)) continue;
            if (state.bridgeXZ[xzKey(cell.x, cell.z)]) continue;
            const d = Math.abs(cell.x - state.spawn.x) + Math.abs(cell.z - state.spawn.z);
            if (p === 0 && d < 3) continue;
            candidates.push(cell);
        }
        shuffleCells(candidates, placement.seed ^ 0xc0ffee);
        const want = Math.min(3, Math.max(p === 0 ? 1 : 0, Math.floor(candidates.length * 0.015)));
        for (let i = 0; i < want && i < candidates.length; i++) {
            const cell = candidates[i];
            createObstacle(state, cell, "soft", true);
            state.treasureKeys[key(cell.x, cell.y, cell.z)] = true;
        }
    }
}

function createPlayer(state, spawn) {
    const root = new THREE.Group();
    root.name = "Player.Visual";
    markRuntime(root);
    state.root.add(root);
    const body = addPart(state, root, state.geometries.body, state.mat.playerShirt, 0, 1.12, 0);
    const head = addPart(state, root, state.geometries.head, state.mat.playerSkin, 0, 1.75, 0);
    const eyeL = addPart(state, head, state.geometries.eye, state.mat.eye, -0.12, 0.04, 0.255);
    const eyeR = addPart(state, head, state.geometries.eye, state.mat.eye, 0.12, 0.04, 0.255);
    const armL = addPart(state, root, state.geometries.limb, state.mat.playerShirt, -0.38, 1.1, 0);
    const armR = addPart(state, root, state.geometries.limb, state.mat.playerShirt, 0.38, 1.1, 0);
    const legL = addPart(state, root, state.geometries.limb, state.mat.playerPants, -0.13, 0.35, 0);
    const legR = addPart(state, root, state.geometries.limb, state.mat.playerPants, 0.13, 0.35, 0);
    state.player = {
        mesh: root,
        body: body,
        head: head,
        eyeL: eyeL,
        eyeR: eyeR,
        armL: armL,
        armR: armR,
        legL: legL,
        legR: legR,
        x: spawn.x,
        y: spawn.y,
        z: spawn.z,
        sx: spawn.x,
        sy: spawn.y,
        sz: spawn.z,
        tx: spawn.x,
        ty: spawn.y,
        tz: spawn.z,
        progress: 1,
        facing: 0,
        walkPhase: 0,
    };
    stampPlayer(state);
    updatePlayerVisual(state, 0);
    state.cameraAnchor.set(spawn.x + 0.5, spawn.y + 0.9, spawn.z + 0.5);
}

function addPart(state, parent, geo, mat, x, y, z) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    markRuntime(mesh);
    parent.add(mesh);
    return mesh;
}

function createEnemies(state) {
    const count = Math.min(12, state.config.baseEnemyCount + state.level - 1);
    const speed = state.config.enemySpeed + (state.level - 1) * 0.2;
    const detectionRange = 7 + Math.floor((state.level - 1) / 2);
    const spawns = pickEnemySpawns(state, count, detectionRange);
    const mats = [state.mat.enemyRed, state.mat.enemyYellow, state.mat.enemyGreen];
    for (let i = 0; i < spawns.length; i++) {
        const s = spawns[i];
        const mesh = new THREE.Mesh(state.geometries.pillar, mats[i % mats.length]);
        mesh.name = "Enemy";
        mesh.scale.set(0.72, 0.72, 0.72);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        markRuntime(mesh);
        state.root.add(mesh);
        const enemy = {
            mesh: mesh,
            alive: true,
            x: s.x,
            y: s.y,
            z: s.z,
            sx: s.x,
            sy: s.y,
            sz: s.z,
            tx: s.x,
            ty: s.y,
            tz: s.z,
            progress: 1,
            facing: 0,
            lastDx: 0,
            lastDz: 0,
            speed: speed,
            chaseSpeed: speed * 1.25,
            detectionRange: detectionRange,
            seed: mix32(state.config.seed ^ ((i + 1) * 0x9e3779b9)),
            seenAt: -999,
            seenX: s.x,
            seenZ: s.z,
            walkPhase: 0,
        };
        state.enemies.push(enemy);
        state.enemyAliveCount += 1;
        stampEnemy(state, enemy, null);
    }
}

function pickEnemySpawns(state, count, detectionRange) {
    const main = state.placements[0];
    const candidates = [];
    const minDist = detectionRange + 4;
    for (let i = 0; i < main.cells.length; i++) {
        const c = main.cells[i];
        if (!gridHas(state.grid, c.x, c.y, c.z, F_WALKABLE)) continue;
        const d = Math.abs(c.x - state.spawn.x) + Math.abs(c.z - state.spawn.z);
        if (d >= minDist) candidates.push({ x: c.x, y: c.y, z: c.z, d: d });
    }
    if (candidates.length === 0) {
        for (let i = 0; i < main.cells.length; i++) {
            const c = main.cells[i];
            if (!gridHas(state.grid, c.x, c.y, c.z, F_WALKABLE)) continue;
            const d = Math.abs(c.x - state.spawn.x) + Math.abs(c.z - state.spawn.z);
            candidates.push({ x: c.x, y: c.y, z: c.z, d: d });
        }
        candidates.sort(function (a, b) { return b.d - a.d; });
    } else {
        shuffleCells(candidates, state.config.seed ^ state.level);
    }
    return candidates.slice(0, Math.min(count, candidates.length));
}

function readInputs(owner, state) {
    const im = state.game && state.game.inputManager;
    let forward = 0;
    let lateral = 0;
    if (im && im.getMotion) {
        forward = im.getMotion("forward") || 0;
        lateral = im.getMotion("lateral") || 0;
        const move = im.getMotion("move");
        if (move && typeof move === "object") {
            if (Math.abs(move.y || 0) > Math.abs(forward)) forward = -(move.y || 0);
            if (Math.abs(move.x || 0) > Math.abs(lateral)) lateral = move.x || 0;
        }
    }
    state.jumpHeld = im && im.getAction ? !!im.getAction("jump") : false;
    state.enterHeld = im && im.getAction ? !!im.getAction("sb_Enter") : false;
    state.bombPressed = state.jumpHeld && !state.prevJump;
    state.enterPressed = state.enterHeld && !state.prevEnter;
    state.prevJump = state.jumpHeld;
    state.prevEnter = state.enterHeld;
    state.inputForward = forward;
    state.inputLateral = lateral;
}

function updatePlayer(owner, state, dt) {
    const p = state.player;
    if (!p) return;
    if (p.progress < 1) {
        p.progress = Math.min(1, p.progress + dt * state.config.playerSpeed);
    }
    if (p.progress >= 1) {
        p.sx = p.tx;
        p.sy = p.ty;
        p.sz = p.tz;
        const step = desiredStep(state);
        if (step.x !== 0 || step.z !== 0) {
            const next = pickNeighbor(state.grid, p.tx, p.ty, p.tz, step.x, step.z);
            if (next) {
                p.tx = next.x;
                p.ty = next.y;
                p.tz = next.z;
                p.progress = 0;
                p.facing = Math.atan2(step.x, step.z);
            }
        }
    }
    updatePlayerVisual(state, dt);
    stampPlayer(state);
    mirrorPlayerProxy(state);
}

function desiredStep(state) {
    const out = { x: 0, z: 0 };
    const f = state.inputForward;
    const r = state.inputLateral;
    if (Math.abs(f) < 0.1 && Math.abs(r) < 0.1) return out;
    const cam = state.game && state.game.camera;
    if (cam && cam.getWorldDirection) {
        cam.getWorldDirection(state.tmpForward);
        state.tmpForward.y = 0;
        if (state.tmpForward.lengthSq() < 0.0001) state.tmpForward.set(0, 0, -1);
        state.tmpForward.normalize();
        state.tmpRight.set(-state.tmpForward.z, 0, state.tmpForward.x);
        const rawX = state.tmpForward.x * f + state.tmpRight.x * r;
        const rawZ = state.tmpForward.z * f + state.tmpRight.z * r;
        if (Math.abs(rawX) >= Math.abs(rawZ)) out.x = Math.sign(rawX);
        else out.z = Math.sign(rawZ);
    } else if (Math.abs(f) >= Math.abs(r)) {
        out.z = Math.sign(f);
    } else {
        out.x = Math.sign(r);
    }
    return out;
}

function updatePlayerVisual(state, dt) {
    const p = state.player;
    if (!p) return;
    const t = p.progress;
    p.x = p.sx + (p.tx - p.sx) * t;
    p.y = p.sy + (p.ty - p.sy) * t;
    p.z = p.sz + (p.tz - p.sz) * t;
    const moving = p.progress < 1;
    if (moving) p.walkPhase += dt * state.config.playerSpeed * Math.PI;
    const bob = moving ? Math.abs(Math.sin(p.walkPhase)) * 0.16 : 0;
    p.mesh.position.set(p.x + 0.5, p.y + bob, p.z + 0.5);
    p.mesh.rotation.y = p.facing;
    const swing = moving ? Math.sin(p.walkPhase) * 0.55 : 0;
    p.armL.rotation.x = -swing;
    p.armR.rotation.x = swing;
    p.legL.rotation.x = swing;
    p.legR.rotation.x = -swing;
}

function placeBomb(owner, state) {
    const p = state.player;
    if (!p) return;
    const max = state.config.maxBombs + state.bombBonus;
    if (state.bombs.length >= max) return;
    const x = Math.floor(p.x);
    const y = Math.round(p.y);
    const z = Math.floor(p.z);
    if (gridHas(state.grid, x, y, z, F_BOMB)) return;
    const type = state.megaCharges > 0 ? "mega" : "classic";
    if (type === "mega") state.megaCharges = Math.max(0, state.megaCharges - 1);
    const mesh = new THREE.Mesh(state.geometries.sphere, type === "mega" ? state.mat.megaBomb : state.mat.bomb);
    mesh.name = type === "mega" ? "MegaBomb" : "Bomb";
    mesh.position.set(x + 0.5, y + 0.4, z + 0.5);
    mesh.castShadow = true;
    markRuntime(mesh);
    state.root.add(mesh);
    state.bombs.push({ x: x, y: y, z: z, age: 0, type: type, mesh: mesh });
    gridAdd(state.grid, x, y, z, F_BOMB);
    owner._log && owner._log("bombPlaced", type, x, y, z);
}

function updateBombs(owner, state, dt) {
    for (let i = state.bombs.length - 1; i >= 0; i--) {
        const b = state.bombs[i];
        b.age += dt;
        const t = b.age / state.config.fuseSeconds;
        const pulse = 0.9 + Math.abs(Math.sin(t * Math.PI * (4 + t * 12))) * 0.22;
        b.mesh.scale.setScalar(pulse);
        if (b.age >= state.config.fuseSeconds) {
            state.bombs.splice(i, 1);
            gridClear(state.grid, b.x, b.y, b.z, F_BOMB);
            removeObject(b.mesh);
            detonate(owner, state, b);
        }
    }
}

function detonate(owner, state, bomb) {
    const dirsX = bomb.type === "mega" ? MEGA_X : DIR_X;
    const dirsZ = bomb.type === "mega" ? MEGA_Z : DIR_Z;
    createBlastCell(state, bomb.x, bomb.y, bomb.z);
    for (let d = 0; d < dirsX.length; d++) {
        for (let r = 1; r <= 128; r++) {
            const cx = bomb.x + dirsX[d] * r;
            const cz = bomb.z + dirsZ[d] * r;
            if (gridHasColumn(state.grid, cx, cz, bomb.y - 1, bomb.y + 1, F_HARD)) break;
            if (!gridHasColumn(state.grid, cx, cz, bomb.y - 1, bomb.y + 1, F_LAND)) break;
            createBlastCell(state, cx, bomb.y, cz);
            const soft = findSoftInColumn(state, cx, bomb.y, cz);
            if (soft) {
                destroySoft(owner, state, soft);
                break;
            }
        }
    }
    owner._log && owner._log("bombDetonated", bomb.type);
}

function createBlastCell(state, x, y, z) {
    const mesh = new THREE.Mesh(state.geometries.pillar, state.mat.blast);
    mesh.name = "Blast";
    mesh.position.set(x + 0.5, y + 0.48, z + 0.5);
    mesh.scale.set(0.96, 0.96, 0.96);
    markRuntime(mesh);
    state.root.add(mesh);
    state.explosions.push({ x: x, y: y, z: z, age: 0, mesh: mesh });
    gridAdd(state.grid, x, y, z, F_BLAST);
}

function updateExplosions(state, dt) {
    for (let i = state.explosions.length - 1; i >= 0; i--) {
        const e = state.explosions[i];
        e.age += dt;
        const left = Math.max(0, 1 - e.age / state.config.blastDuration);
        e.mesh.scale.setScalar(0.72 + left * 0.3);
        if (e.age >= state.config.blastDuration) {
            gridClear(state.grid, e.x, e.y, e.z, F_BLAST);
            removeObject(e.mesh);
            state.explosions.splice(i, 1);
        }
    }
}

function destroySoft(owner, state, soft) {
    gridClear(state.grid, soft.x, soft.y, soft.z, F_SOFT);
    gridAdd(state.grid, soft.x, soft.y, soft.z, F_WALKABLE | F_LAND);
    removeObject(soft.mesh);
    delete state.softByKey[soft.key];
    if (soft.treasure || state.treasureKeys[soft.key]) {
        const type = hash01(state.config.seed ^ state.level, soft.x * 19, soft.z * 23) < 0.65 ? "extra" : "mega";
        spawnPickup(state, soft.x, soft.y, soft.z, type);
        owner._log && owner._log("treasureDestroyed", type);
    }
}

function findSoftInColumn(state, x, y, z) {
    for (let dy = -1; dy <= 1; dy++) {
        const s = state.softByKey[key(x, y + dy, z)];
        if (s) return s;
    }
    return null;
}

function spawnPickup(state, x, y, z, type) {
    const mesh = new THREE.Mesh(state.geometries.pickup, type === "extra" ? state.mat.extra : state.mat.mega);
    mesh.name = type === "extra" ? "ExtraBombPickup" : "MegaBombPickup";
    mesh.position.set(x + 0.5, y + 0.65, z + 0.5);
    mesh.castShadow = true;
    markRuntime(mesh);
    state.root.add(mesh);
    state.pickups.push({ x: x, y: y, z: z, type: type, mesh: mesh, phase: state.pickups.length * 0.57 });
}

function updatePickups(owner, state, dt) {
    const p = state.player;
    for (let i = state.pickups.length - 1; i >= 0; i--) {
        const item = state.pickups[i];
        item.phase += dt;
        item.mesh.position.y = item.y + 0.62 + Math.sin(item.phase * 3) * 0.08;
        item.mesh.rotation.y += dt * 1.6;
        if (p && Math.floor(p.x) === item.x && Math.floor(p.z) === item.z && Math.abs(Math.round(p.y) - item.y) <= 1) {
            if (item.type === "extra") state.bombBonus += 1;
            else state.megaCharges += 3;
            owner._log && owner._log("pickup", item.type);
            removeObject(item.mesh);
            state.pickups.splice(i, 1);
        }
    }
}

function updateEnemies(owner, state, dt) {
    for (let i = 0; i < state.enemies.length; i++) {
        const e = state.enemies[i];
        if (!e.alive) continue;
        if (gridHasColumn(state.grid, e.tx, e.tz, e.ty - 1, e.ty + 1, F_BLAST) || gridHasColumn(state.grid, e.sx, e.sz, e.sy - 1, e.sy + 1, F_BLAST)) {
            killEnemy(owner, state, e);
            continue;
        }
        moveEnemy(state, e, dt);
        updateEnemyVisual(state, e, dt);
    }
}

function moveEnemy(state, e, dt) {
    let speed = e.speed;
    const chase = enemyChaseState(state, e);
    if (chase.active) speed = e.chaseSpeed;
    if (e.progress < 1) e.progress = Math.min(1, e.progress + dt * speed);
    if (e.progress >= 1) {
        e.sx = e.tx;
        e.sy = e.ty;
        e.sz = e.tz;
        let next = null;
        if (chase.active) next = chaseStep(state, e, chase.x, chase.z);
        if (!next) next = wanderStep(state, e);
        if (next) {
            const prev = { x: e.tx, y: e.ty, z: e.tz };
            e.tx = next.x;
            e.ty = next.y;
            e.tz = next.z;
            e.progress = 0;
            e.lastDx = Math.sign(e.tx - prev.x);
            e.lastDz = Math.sign(e.tz - prev.z);
            if (e.lastDx !== 0 || e.lastDz !== 0) e.facing = Math.atan2(e.lastDx, e.lastDz);
            stampEnemy(state, e, prev);
        }
    }
}

function enemyChaseState(state, e) {
    const p = state.player;
    if (!p) return { active: false, x: 0, z: 0 };
    const px = Math.floor(p.x);
    const pz = Math.floor(p.z);
    const py = Math.round(p.y);
    const manhattan = Math.abs(px - e.tx) + Math.abs(pz - e.tz);
    const inRange = manhattan > 0 && manhattan <= e.detectionRange;
    if (inRange && inFov(e, px, pz) && hasLineOfSight(state, e.tx, e.tz, e.ty, px, pz, py)) {
        e.seenAt = state.elapsed;
        e.seenX = px;
        e.seenZ = pz;
        return { active: true, x: px, z: pz };
    }
    if (state.elapsed - e.seenAt < 2) return { active: true, x: e.seenX, z: e.seenZ };
    return { active: false, x: 0, z: 0 };
}

function chaseStep(state, e, px, pz) {
    const dx = px - e.tx;
    const dz = pz - e.tz;
    const sx = Math.sign(dx);
    const sz = Math.sign(dz);
    let next = null;
    if (Math.abs(dx) >= Math.abs(dz)) {
        if (sx !== 0) next = pickNeighbor(state.grid, e.tx, e.ty, e.tz, sx, 0);
        if (!next && sz !== 0) next = pickNeighbor(state.grid, e.tx, e.ty, e.tz, 0, sz);
    } else {
        if (sz !== 0) next = pickNeighbor(state.grid, e.tx, e.ty, e.tz, 0, sz);
        if (!next && sx !== 0) next = pickNeighbor(state.grid, e.tx, e.ty, e.tz, sx, 0);
    }
    if (next) return next;
    for (let i = 0; i < 4; i++) {
        next = pickNeighbor(state.grid, e.tx, e.ty, e.tz, DIR_X[i], DIR_Z[i]);
        if (next) return next;
    }
    return null;
}

function wanderStep(state, e) {
    if ((e.lastDx !== 0 || e.lastDz !== 0) && rng(e) < 0.7) {
        const keep = pickNeighbor(state.grid, e.tx, e.ty, e.tz, e.lastDx, e.lastDz);
        if (keep) return keep;
    }
    const start = Math.floor(rng(e) * 4);
    for (let j = 0; j < 4; j++) {
        const i = (start + j) % 4;
        if (DIR_X[i] === -e.lastDx && DIR_Z[i] === -e.lastDz) continue;
        const n = pickNeighbor(state.grid, e.tx, e.ty, e.tz, DIR_X[i], DIR_Z[i]);
        if (n) return n;
    }
    if (e.lastDx !== 0 || e.lastDz !== 0) return pickNeighbor(state.grid, e.tx, e.ty, e.tz, -e.lastDx, -e.lastDz);
    return null;
}

function updateEnemyVisual(state, e, dt) {
    e.x = e.sx + (e.tx - e.sx) * e.progress;
    e.y = e.sy + (e.ty - e.sy) * e.progress;
    e.z = e.sz + (e.tz - e.sz) * e.progress;
    if (e.progress < 1) e.walkPhase += dt * e.speed * Math.PI;
    const bob = Math.abs(Math.sin(e.walkPhase)) * 0.12;
    e.mesh.position.set(e.x + 0.5, e.y + 0.35 + bob, e.z + 0.5);
    e.mesh.rotation.y = e.facing;
    e.mesh.rotation.x = Math.sin(e.walkPhase * 2) * 0.05;
}

function killEnemy(owner, state, e) {
    if (!e.alive) return;
    e.alive = false;
    state.enemyAliveCount = Math.max(0, state.enemyAliveCount - 1);
    gridClear(state.grid, e.tx, e.ty, e.tz, F_ENEMY);
    removeObject(e.mesh);
    owner._log && owner._log("enemyKilled", state.enemyAliveCount, "remaining");
}

function checkPlayerDeath(owner, state) {
    const p = state.player;
    if (!p || state.phase !== "playing") return;
    const x = Math.floor(p.x);
    const y = Math.round(p.y);
    const z = Math.floor(p.z);
    if (gridHasColumn(state.grid, x, z, y - 1, y + 1, F_BLAST | F_ENEMY)) {
        setPhase(owner, state, "dead");
    }
}

function checkWin(owner, state) {
    if (state.phase === "playing" && state.enemyAliveCount === 0 && state.enemies.length > 0) {
        setPhase(owner, state, "cleared");
    }
}

function setPhase(owner, state, phase) {
    if (state.phase === phase) return;
    state.phase = phase;
    state.ui.last = {};
    owner._log && owner._log("state", phase);
}

function updateCamera(state, dt) {
    const cam = state.game && state.game.camera;
    const p = state.player;
    if (!cam || !p) return;
    const targetX = p.x + 0.5;
    const targetY = p.y + 0.9;
    const targetZ = p.z + 0.5;
    const t = Math.min(1, dt * state.config.cameraStiffness);
    state.cameraAnchor.x += (targetX - state.cameraAnchor.x) * t;
    state.cameraAnchor.y += (targetY - state.cameraAnchor.y) * t;
    state.cameraAnchor.z += (targetZ - state.cameraAnchor.z) * t;
    const pitch = state.config.cameraPitch * Math.PI / 180;
    const yaw = state.config.cameraYaw * Math.PI / 180;
    const horiz = state.config.cameraDistance * Math.cos(pitch);
    cam.position.set(
        state.cameraAnchor.x + horiz * Math.sin(yaw),
        state.cameraAnchor.y + state.config.cameraDistance * Math.sin(pitch),
        state.cameraAnchor.z + horiz * Math.cos(yaw),
    );
    state.cameraLook.set(state.cameraAnchor.x, state.cameraAnchor.y, state.cameraAnchor.z);
    cam.lookAt(state.cameraLook);
}

function updateClouds(state, dt) {
    if (!state.clouds || !state.player) return;
    for (let i = 0; i < state.clouds.length; i++) {
        const c = state.clouds[i];
        c.rotation.y += dt * c.userData.speed;
    }
}

function updateUi(state) {
    const ui = state.ui;
    if (!ui || !ui.root) return;
    const enemyText = "ENEMIES " + state.enemyAliveCount;
    const levelText = "LEVEL " + state.level;
    const bombText = "BOMBS " + (state.config.maxBombs + state.bombBonus);
    const megaText = "MEGA " + state.megaCharges;
    const tileText = state.player ? "TILE " + tileLabel(state, Math.floor(state.player.x), Math.round(state.player.y), Math.floor(state.player.z)) : "TILE -";
    setText(ui.level, ui.last.level, levelText, ui.last, "level");
    setText(ui.bombs, ui.last.bombs, bombText, ui.last, "bombs");
    setText(ui.mega, ui.last.mega, megaText, ui.last, "mega");
    setText(ui.enemies, ui.last.enemies, enemyText, ui.last, "enemies");
    setText(ui.tile, ui.last.tile, tileText, ui.last, "tile");
    if (ui.last.phase !== state.phase) {
        ui.last.phase = state.phase;
        if (state.phase === "playing") {
            ui.overlay.setProperties({ visibility: "hidden" });
        } else {
            ui.overlay.setProperties({ visibility: "visible" });
            if (state.phase === "start") {
                ui.title.setProperties({ text: "SKY\nBOMBER", color: "#ffd145" });
                ui.subtitle.setProperties({ text: SPLASHES[(state.config.seed + state.level) % SPLASHES.length] });
                ui.hint.setProperties({ text: "Press Enter or tap to start" });
            } else if (state.phase === "cleared") {
                ui.title.setProperties({ text: "LEVEL " + state.level + "\nCLEARED", color: "#7fff7c" });
                ui.subtitle.setProperties({ text: "All enemies destroyed" });
                ui.hint.setProperties({ text: "Press Enter or tap for next level" });
            } else {
                ui.title.setProperties({ text: "YOU\nDIED", color: "#ff5c5c" });
                ui.subtitle.setProperties({ text: "Bomb blasts and enemies are lethal" });
                ui.hint.setProperties({ text: "Press Enter or tap to restart" });
            }
        }
    }
}

function setText(node, oldValue, nextValue, cache, keyName) {
    if (!node || oldValue === nextValue) return;
    node.setProperties({ text: nextValue });
    cache[keyName] = nextValue;
}

function tileLabel(state, x, y, z) {
    if (gridHas(state.grid, x, y, z, F_BLAST)) return "blast";
    if (gridHas(state.grid, x, y, z, F_BOMB)) return "bomb";
    if (gridHas(state.grid, x, y, z, F_HARD)) return "stone";
    if (gridHas(state.grid, x, y, z, F_SOFT)) return state.treasureKeys[key(x, y, z)] ? "treasure" : "crate";
    if (gridHas(state.grid, x, y, z, F_WALKABLE)) return state.bridgeXZ[xzKey(x, z)] ? "bridge" : "land";
    return "air";
}

function addInstances(state, name, geo, mat, list) {
    if (!list || list.length === 0) return null;
    const mesh = new THREE.InstancedMesh(geo, mat, list.length);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    markRuntime(mesh);
    for (let i = 0; i < list.length; i++) {
        const p = list[i];
        state.dummy.position.set(p.x, p.y, p.z);
        state.dummy.rotation.set(0, 0, 0);
        state.dummy.scale.set(p.sx || 1, p.sy || 1, p.sz || 1);
        state.dummy.updateMatrix();
        mesh.setMatrixAt(i, state.dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    state.root.add(mesh);
    state.meshes.push(mesh);
    return mesh;
}

function createClouds(state) {
    state.clouds = [];
    for (let i = 0; i < 18; i++) {
        const group = new THREE.Group();
        group.name = "CloudPuff";
        group.userData.speed = 0.03 + hash01(state.config.seed, i, 88) * 0.04;
        const a = hash01(state.config.seed, i, 11) * Math.PI * 2;
        const r = 36 + hash01(state.config.seed, i, 13) * 32;
        group.position.set(Math.cos(a) * r, -8 - hash01(state.config.seed, i, 17) * 12, Math.sin(a) * r);
        for (let j = 0; j < 4; j++) {
            const puff = new THREE.Mesh(state.geometries.sphere, state.mat.cloud);
            puff.scale.set(4 + j * 0.7, 1.1 + hash01(i, j, 4), 2.5 + j * 0.4);
            puff.position.set((j - 1.5) * 2.1, hash01(i, j, 9) * 0.8, (hash01(i, j, 2) - 0.5) * 2);
            markRuntime(puff);
            group.add(puff);
        }
        markRuntime(group);
        state.root.add(group);
        state.clouds.push(group);
    }
}

function findPlayerProxy(state) {
    const scene = state.game && state.game.scene;
    if (!scene || !scene.traverse) return;
    scene.traverse(function (obj) {
        if (!state.playerProxy && obj.name === "Player") state.playerProxy = obj;
    });
}

function mirrorPlayerProxy(state) {
    if (!state.playerProxy || !state.player) return;
    state.playerProxy.position.set(state.player.x + 0.5, state.player.y + 0.9, state.player.z + 0.5);
}

function stampPlayer(state) {
    const p = state.player;
    if (!p) return;
    if (p.prevKey) {
        const prev = parseKey(p.prevKey);
        gridClear(state.grid, prev.x, prev.y, prev.z, F_PLAYER);
    }
    const x = Math.floor(p.x);
    const y = Math.round(p.y);
    const z = Math.floor(p.z);
    p.prevKey = key(x, y, z);
    gridAdd(state.grid, x, y, z, F_PLAYER);
}

function stampEnemy(state, e, prev) {
    if (prev) gridClear(state.grid, prev.x, prev.y, prev.z, F_ENEMY);
    gridAdd(state.grid, e.tx, e.ty, e.tz, F_ENEMY);
}

function pickNeighbor(grid, x, y, z, dx, dz) {
    const nx = x + dx;
    const nz = z + dz;
    if (gridHas(grid, nx, y, nz, F_WALKABLE)) return { x: nx, y: y, z: nz };
    if (gridHas(grid, nx, y + 1, nz, F_WALKABLE)) return { x: nx, y: y + 1, z: nz };
    if (gridHas(grid, nx, y - 1, nz, F_WALKABLE)) return { x: nx, y: y - 1, z: nz };
    return null;
}

function inFov(e, px, pz) {
    const dx = px - e.tx;
    const dz = pz - e.tz;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.001) return true;
    const fdx = Math.sin(e.facing);
    const fdz = Math.cos(e.facing);
    return (fdx * dx + fdz * dz) / len >= Math.cos(Math.PI / 6);
}

function hasLineOfSight(state, ex, ez, ey, px, pz, py) {
    const sx = ex + 0.5;
    const sz = ez + 0.5;
    const fx = px + 0.5;
    const fz = pz + 0.5;
    const dx = fx - sx;
    const dz = fz - sz;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const samples = Math.max(2, Math.ceil(dist * 4));
    const yLo = Math.min(ey, py) - 1;
    const yHi = Math.max(ey, py) + 1;
    for (let i = 1; i < samples; i++) {
        const t = i / samples;
        const x = Math.floor(sx + dx * t);
        const z = Math.floor(sz + dz * t);
        if ((x === ex && z === ez) || (x === px && z === pz)) continue;
        if (gridHasColumn(state.grid, x, z, yLo, yHi, F_BLOCKS_SIGHT)) return false;
    }
    return true;
}

function makeGrid() {
    return { flags: {}, walkKeys: {}, version: 0 };
}

function key(x, y, z) {
    return x + "|" + y + "|" + z;
}

function xzKey(x, z) {
    return x + "|" + z;
}

function parseKey(k) {
    const p = k.split("|");
    return { x: +p[0], y: +p[1], z: +p[2] };
}

function gridAdd(grid, x, y, z, flag) {
    const k = key(x, y, z);
    const before = grid.flags[k] || 0;
    const after = before | flag;
    if (after !== before) {
        grid.flags[k] = after;
        if (after & F_WALKABLE) grid.walkKeys[k] = true;
        grid.version += 1;
    }
}

function gridClear(grid, x, y, z, flag) {
    const k = key(x, y, z);
    const before = grid.flags[k] || 0;
    const after = before & ~flag;
    if (after !== before) {
        grid.flags[k] = after;
        if (!(after & F_WALKABLE)) delete grid.walkKeys[k];
        grid.version += 1;
    }
}

function gridHas(grid, x, y, z, mask) {
    return !!((grid.flags[key(x, y, z)] || 0) & mask);
}

function gridHasColumn(grid, x, z, yLo, yHi, mask) {
    for (let y = yLo; y <= yHi; y++) {
        if (gridHas(grid, x, y, z, mask)) return true;
    }
    return false;
}

function walkableCount(grid) {
    let count = 0;
    for (const k in grid.walkKeys) count += 1;
    return count;
}

function reachableCount(grid, spawnKey) {
    if (!grid.walkKeys[spawnKey]) return 0;
    const seen = {};
    const queue = [spawnKey];
    seen[spawnKey] = true;
    let count = 0;
    while (queue.length) {
        const item = queue.shift();
        count += 1;
        const p = parseKey(item);
        for (let d = 0; d < 4; d++) {
            for (let dy = -1; dy <= 1; dy++) {
                const nk = key(p.x + DIR_X[d], p.y + dy, p.z + DIR_Z[d]);
                if (grid.walkKeys[nk] && !seen[nk]) {
                    seen[nk] = true;
                    queue.push(nk);
                }
            }
        }
    }
    return count;
}

function removeObject(obj) {
    if (obj && obj.parent) obj.parent.remove(obj);
}

function markRuntime(obj) {
    obj.userData.isRuntimeOnly = true;
    if (obj.traverse) {
        obj.traverse(function (child) {
            child.userData.isRuntimeOnly = true;
        });
    }
}

function mix32(n) {
    let h = n | 0;
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    h = h ^ (h >>> 16);
    return h >>> 0;
}

function hash01(a, b, c) {
    return mix32((a | 0) ^ Math.imul(b | 0, 374761393) ^ Math.imul(c | 0, 668265263)) / 4294967296;
}

function shuffledCardinals(seed) {
    const out = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    let s = seed || 1;
    for (let i = out.length - 1; i > 0; i--) {
        s = mix32(s + 0x6d2b79f5);
        const j = s % (i + 1);
        const t = out[i];
        out[i] = out[j];
        out[j] = t;
    }
    return out;
}

function shuffleCells(cells, seed) {
    let s = seed || 1;
    for (let i = cells.length - 1; i > 0; i--) {
        s = mix32(s + 0x6d2b79f5);
        const j = s % (i + 1);
        const t = cells[i];
        cells[i] = cells[j];
        cells[j] = t;
    }
}

function rng(enemy) {
    enemy.seed = mix32(enemy.seed + 0x6d2b79f5);
    return enemy.seed / 4294967296;
}
