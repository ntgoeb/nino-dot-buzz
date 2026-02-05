// Super Star Trek - Game Engine
// Based on the 1978 "Super Star Trek" by Bob Leedom

// ============================================================================
// CONSTANTS
// ============================================================================

const GALAXY_SIZE = 8;          // 8x8 quadrants
const QUADRANT_SIZE = 8;        // 8x8 sectors per quadrant
const INITIAL_ENERGY = 3000;
const INITIAL_TORPEDOES = 10;
const INITIAL_SHIELDS = 1000;
const MAX_KLINGONS = 25;
const MIN_KLINGONS = 15;
const MAX_STARBASES = 4;
const MIN_STARBASES = 2;

// Symbols for display
const SYM = {
    ENTERPRISE: 'E',
    KLINGON: 'K',
    STARBASE: 'B',
    STAR: '*',
    EMPTY: '.'
};

// Ship systems
const SYSTEMS = [
    'warpEngines',
    'shortRangeSensors',
    'longRangeSensors',
    'phasers',
    'photonTorpedoes',
    'shields',
    'computer',
    'subspaceRadio'
];

const SYSTEM_NAMES = {
    warpEngines: 'Warp Engines',
    shortRangeSensors: 'Short Range Sensors',
    longRangeSensors: 'Long Range Sensors',
    phasers: 'Phasers',
    photonTorpedoes: 'Photon Torpedoes',
    shields: 'Shields',
    computer: 'Computer',
    subspaceRadio: 'Subspace Radio'
};

// ============================================================================
// GAME STATE
// ============================================================================

let game = null;

function createGameState() {
    return {
        // Galaxy: 8x8 quadrants, each with klingon/starbase/star counts
        galaxy: [],

        // Current quadrant detail: 8x8 sectors
        quadrant: {
            sectors: [],
            klingons: []  // Array of {x, y, energy}
        },

        // Ship state
        ship: {
            quadrantX: 0,
            quadrantY: 0,
            sectorX: 0,
            sectorY: 0,
            energy: INITIAL_ENERGY,
            shields: INITIAL_SHIELDS,
            torpedoes: INITIAL_TORPEDOES,
            docked: false,
            damage: {}
        },

        // Game progress
        stardate: {
            current: 0,
            start: 0,
            end: 0
        },
        klingonsRemaining: 0,
        starbasesRemaining: 0,
        gameOver: false,
        won: false,

        // Input state for multi-step commands
        inputMode: null,
        inputCallback: null
    };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function initializeGame() {
    game = createGameState();

    // Initialize damage for all systems to 0 (operational)
    for (const system of SYSTEMS) {
        game.ship.damage[system] = 0;
    }

    // Set starting stardate (random between 2000-3000)
    game.stardate.current = Math.floor(Math.random() * 1000) + 2000;
    game.stardate.start = game.stardate.current;

    // Generate the galaxy
    generateGalaxy();

    // Set time limit based on Klingon count
    game.stardate.end = game.stardate.start + Math.max(25, game.klingonsRemaining + 5);

    // Place Enterprise in random quadrant
    game.ship.quadrantX = Math.floor(Math.random() * GALAXY_SIZE);
    game.ship.quadrantY = Math.floor(Math.random() * GALAXY_SIZE);

    // Generate the starting quadrant and place Enterprise
    enterQuadrant();

    return game;
}

function generateGalaxy() {
    // Initialize empty galaxy
    game.galaxy = [];
    for (let y = 0; y < GALAXY_SIZE; y++) {
        game.galaxy[y] = [];
        for (let x = 0; x < GALAXY_SIZE; x++) {
            game.galaxy[y][x] = {
                klingons: 0,
                starbases: 0,
                stars: Math.floor(Math.random() * 8) + 1,  // 1-8 stars
                explored: false
            };
        }
    }

    // Place Klingons (15-25 total)
    const totalKlingons = Math.floor(Math.random() * (MAX_KLINGONS - MIN_KLINGONS + 1)) + MIN_KLINGONS;
    game.klingonsRemaining = totalKlingons;

    let klingonsPlaced = 0;
    while (klingonsPlaced < totalKlingons) {
        const x = Math.floor(Math.random() * GALAXY_SIZE);
        const y = Math.floor(Math.random() * GALAXY_SIZE);
        // Max 3 Klingons per quadrant
        if (game.galaxy[y][x].klingons < 3) {
            game.galaxy[y][x].klingons++;
            klingonsPlaced++;
        }
    }

    // Place Starbases (2-4 total)
    const totalStarbases = Math.floor(Math.random() * (MAX_STARBASES - MIN_STARBASES + 1)) + MIN_STARBASES;
    game.starbasesRemaining = totalStarbases;

    let starbasesPlaced = 0;
    while (starbasesPlaced < totalStarbases) {
        const x = Math.floor(Math.random() * GALAXY_SIZE);
        const y = Math.floor(Math.random() * GALAXY_SIZE);
        // Max 1 starbase per quadrant
        if (game.galaxy[y][x].starbases === 0) {
            game.galaxy[y][x].starbases = 1;
            starbasesPlaced++;
        }
    }
}

function enterQuadrant() {
    const qx = game.ship.quadrantX;
    const qy = game.ship.quadrantY;
    const quadrantData = game.galaxy[qy][qx];

    // Mark as explored
    quadrantData.explored = true;

    // Initialize empty sector grid
    game.quadrant.sectors = [];
    for (let y = 0; y < QUADRANT_SIZE; y++) {
        game.quadrant.sectors[y] = [];
        for (let x = 0; x < QUADRANT_SIZE; x++) {
            game.quadrant.sectors[y][x] = SYM.EMPTY;
        }
    }

    // Clear Klingon list
    game.quadrant.klingons = [];

    // Place stars
    placeRandomly(SYM.STAR, quadrantData.stars);

    // Place Klingons
    for (let i = 0; i < quadrantData.klingons; i++) {
        const pos = findEmptySpot();
        if (pos) {
            game.quadrant.sectors[pos.y][pos.x] = SYM.KLINGON;
            game.quadrant.klingons.push({
                x: pos.x,
                y: pos.y,
                energy: 300 + Math.floor(Math.random() * 200)  // 300-500 energy
            });
        }
    }

    // Place starbase
    if (quadrantData.starbases > 0) {
        placeRandomly(SYM.STARBASE, 1);
    }

    // Place Enterprise
    if (game.ship.sectorX === undefined || needNewSectorPosition()) {
        const pos = findEmptySpot();
        game.ship.sectorX = pos.x;
        game.ship.sectorY = pos.y;
    }
    game.quadrant.sectors[game.ship.sectorY][game.ship.sectorX] = SYM.ENTERPRISE;

    // Check docking status
    checkDockingStatus();
}

function needNewSectorPosition() {
    // Check if current sector position is valid (empty or doesn't exist in new quadrant)
    const sx = game.ship.sectorX;
    const sy = game.ship.sectorY;
    if (sx < 0 || sx >= QUADRANT_SIZE || sy < 0 || sy >= QUADRANT_SIZE) {
        return true;
    }
    return game.quadrant.sectors[sy][sx] !== SYM.EMPTY;
}

function findEmptySpot() {
    let attempts = 0;
    while (attempts < 100) {
        const x = Math.floor(Math.random() * QUADRANT_SIZE);
        const y = Math.floor(Math.random() * QUADRANT_SIZE);
        if (game.quadrant.sectors[y][x] === SYM.EMPTY) {
            return { x, y };
        }
        attempts++;
    }
    // Fallback: find first empty spot
    for (let y = 0; y < QUADRANT_SIZE; y++) {
        for (let x = 0; x < QUADRANT_SIZE; x++) {
            if (game.quadrant.sectors[y][x] === SYM.EMPTY) {
                return { x, y };
            }
        }
    }
    return null;
}

function placeRandomly(symbol, count) {
    for (let i = 0; i < count; i++) {
        const pos = findEmptySpot();
        if (pos) {
            game.quadrant.sectors[pos.y][pos.x] = symbol;
        }
    }
}

function checkDockingStatus() {
    game.ship.docked = false;
    const sx = game.ship.sectorX;
    const sy = game.ship.sectorY;

    // Check adjacent sectors for starbase
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = sx + dx;
            const ny = sy + dy;
            if (nx >= 0 && nx < QUADRANT_SIZE && ny >= 0 && ny < QUADRANT_SIZE) {
                if (game.quadrant.sectors[ny][nx] === SYM.STARBASE) {
                    game.ship.docked = true;
                    return;
                }
            }
        }
    }
}

// ============================================================================
// DISPLAY FUNCTIONS
// ============================================================================

function getCondition() {
    if (game.ship.docked) return 'DOCKED';
    if (game.quadrant.klingons.length > 0) return 'RED';
    if (game.ship.energy < 300) return 'YELLOW';
    return 'GREEN';
}

function shortRangeScan() {
    if (game.ship.damage.shortRangeSensors < 0) {
        print('*** SHORT RANGE SENSORS ARE DAMAGED ***');
        print('');
        return;
    }

    print('');
    print('    1 2 3 4 5 6 7 8');
    print('  +-----------------+');

    for (let y = 0; y < QUADRANT_SIZE; y++) {
        let line = (y + 1) + ' | ';
        for (let x = 0; x < QUADRANT_SIZE; x++) {
            line += game.quadrant.sectors[y][x] + ' ';
        }
        line += '|';
        print(line);
    }

    print('  +-----------------+');
    print('');

    const condition = getCondition();
    const stardatesRemaining = game.stardate.end - game.stardate.current;

    print('Condition:  ' + condition);
    print('Quadrant:   [' + (game.ship.quadrantX + 1) + ', ' + (game.ship.quadrantY + 1) + ']');
    print('Sector:     [' + (game.ship.sectorX + 1) + ', ' + (game.ship.sectorY + 1) + ']');
    print('Energy:     ' + game.ship.energy);
    print('Shields:    ' + game.ship.shields);
    print('Torpedoes:  ' + game.ship.torpedoes);
    print('Klingons:   ' + game.klingonsRemaining + ' total, ' + game.quadrant.klingons.length + ' here');
    print('Stardates:  ' + stardatesRemaining.toFixed(1) + ' remaining');
    print('');
}

function longRangeScan() {
    if (game.ship.damage.longRangeSensors < 0) {
        print('*** LONG RANGE SENSORS ARE DAMAGED ***');
        print('');
        return;
    }

    const qx = game.ship.quadrantX;
    const qy = game.ship.quadrantY;

    print('');
    print('Long Range Scan for Quadrant [' + (qx + 1) + ', ' + (qy + 1) + ']');
    print('');

    // Header row
    let header = '    ';
    for (let x = qx - 1; x <= qx + 1; x++) {
        if (x >= 0 && x < GALAXY_SIZE) {
            header += ' ' + (x + 1) + '  ';
        } else {
            header += '    ';
        }
    }
    print(header);
    print('  +---+---+---+');

    for (let y = qy - 1; y <= qy + 1; y++) {
        let line = '';
        if (y >= 0 && y < GALAXY_SIZE) {
            line = (y + 1) + ' |';
        } else {
            line = '  |';
        }

        for (let x = qx - 1; x <= qx + 1; x++) {
            if (x >= 0 && x < GALAXY_SIZE && y >= 0 && y < GALAXY_SIZE) {
                const q = game.galaxy[y][x];
                q.explored = true;  // Mark as explored
                const code = '' + q.klingons + q.starbases + q.stars;
                line += code + '|';
            } else {
                line += '***|';  // Edge of galaxy
            }
        }
        print(line);
        print('  +---+---+---+');
    }

    print('');
    print('(Format: Klingons/Starbases/Stars)');
    print('');
}

function starMap() {
    print('');
    print('=== GALACTIC STAR MAP ===');
    print('');

    // Header row with column numbers
    let header = '     ';
    for (let x = 0; x < GALAXY_SIZE; x++) {
        header += '  ' + (x + 1) + '  ';
    }
    print(header);
    print('    +' + '----+'.repeat(GALAXY_SIZE));

    for (let y = 0; y < GALAXY_SIZE; y++) {
        let line = ' ' + (y + 1) + '  |';
        for (let x = 0; x < GALAXY_SIZE; x++) {
            const q = game.galaxy[y][x];
            const isHere = (x === game.ship.quadrantX && y === game.ship.quadrantY);

            if (q.explored) {
                // Show KBS format (Klingons/Bases/Stars)
                let code = '' + q.klingons + q.starbases + q.stars;
                if (isHere) {
                    line += '>' + code + '<|';  // Mark current position
                } else if (q.starbases > 0) {
                    line += '*' + code + '*|';  // Mark starbases
                } else {
                    line += ' ' + code + ' |';
                }
            } else {
                if (isHere) {
                    line += '>???<|';
                } else {
                    line += ' ??? |';  // Unexplored
                }
            }
        }
        print(line);
        print('    +' + '----+'.repeat(GALAXY_SIZE));
    }

    print('');
    print('Format: Klingons/Starbases/Stars');
    print('>###< = Enterprise location');
    print('*###* = Starbase present');
    print(' ???  = Unexplored');
    print('');
    print('Enterprise at quadrant [' + (game.ship.quadrantX + 1) + ', ' + (game.ship.quadrantY + 1) + ']');
    print('Klingons remaining: ' + game.klingonsRemaining);
    print('Starbases: ' + game.starbasesRemaining);
    print('');
}

function damageReport() {
    print('');
    print('DAMAGE REPORT:');
    print('');

    for (const system of SYSTEMS) {
        const damage = game.ship.damage[system];
        const name = SYSTEM_NAMES[system].padEnd(20);
        if (damage >= 0) {
            print(name + ' Operational');
        } else {
            print(name + ' DAMAGED - ' + Math.abs(damage).toFixed(1) + ' stardates to repair');
        }
    }
    print('');
}

function statusReport() {
    print('');
    print('STATUS REPORT:');
    print('');
    print('Stardate:           ' + game.stardate.current.toFixed(1));
    print('Time Remaining:     ' + (game.stardate.end - game.stardate.current).toFixed(1) + ' stardates');
    print('Klingons Remaining: ' + game.klingonsRemaining);
    print('Starbases:          ' + game.starbasesRemaining);
    print('');
}

// ============================================================================
// NAVIGATION
// ============================================================================

// Parse coordinate input like "1,2" or "1, 2" or "1 2"
function parseCoordinates(parts) {
    // Join remaining parts and parse
    const coordStr = parts.slice(1).join(' ');
    const match = coordStr.match(/(-?\d+)\s*[,\s]\s*(-?\d+)/);
    if (match) {
        return { dx: parseInt(match[1]), dy: parseInt(match[2]) };
    }
    return null;
}

function startWarpNavigation(parts) {
    // Check for damaged warp engines
    if (game.ship.damage.warpEngines < 0) {
        print('*** WARP ENGINES ARE DAMAGED ***');
        print('Use IMPULSE for emergency movement within this quadrant.');
        print('');
        return;
    }

    // Parse arguments: WARP x, y
    const coords = parseCoordinates(parts);

    if (!coords) {
        print('');
        print('WARP x, y - Move between quadrants');
        print('');
        print('Example: WARP 1, 1   (one quadrant right, one up)');
        print('Example: WARP 0, -1  (one quadrant down)');
        print('');
        print('Positive X = right, Positive Y = up');
        print('');
        return;
    }

    const { dx, dy } = coords;

    // Validate - can't warp to same quadrant
    if (dx === 0 && dy === 0) {
        print('Already here! Use IMPULSE to move within the quadrant.');
        return;
    }

    // Calculate energy cost based on distance
    const distance = Math.abs(dx) + Math.abs(dy);
    const energyCost = distance * 50;

    if (game.ship.energy < energyCost) {
        print('Insufficient energy for warp.');
        print('Required: ' + energyCost + '  Available: ' + game.ship.energy);
        return;
    }

    // Execute warp
    executeWarp(dx, dy, energyCost);
}

function startImpulseNavigation(parts) {
    // Parse arguments: IMPULSE x, y
    const coords = parseCoordinates(parts);

    if (!coords) {
        print('');
        print('IMPULSE x, y - Move within the current quadrant');
        print('');
        print('Example: IMPULSE 1, 2   (one sector right, two up)');
        print('Example: IMPULSE 0, -1  (one sector down)');
        print('');
        print('Positive X = right, Positive Y = up');
        print('');
        return;
    }

    const { dx, dy } = coords;

    // Validate - must move somewhere
    if (dx === 0 && dy === 0) {
        print('You must specify a direction to move.');
        return;
    }

    // Calculate energy cost (10 per sector moved)
    const distance = Math.abs(dx) + Math.abs(dy);
    const energyCost = distance * 10;

    if (game.ship.energy < energyCost) {
        print('Insufficient energy for impulse.');
        print('Required: ' + energyCost + '  Available: ' + game.ship.energy);
        return;
    }

    // Execute impulse move
    executeImpulse(dx, dy, energyCost);
}

function executeWarp(dx, dy, energyCost) {
    // Calculate new quadrant position
    // Note: negative Y = down (screen coordinates), so we invert dy
    let newQuadX = game.ship.quadrantX + dx;
    let newQuadY = game.ship.quadrantY - dy;  // Invert Y so positive = up

    // Clear Enterprise from current sector
    game.quadrant.sectors[game.ship.sectorY][game.ship.sectorX] = SYM.EMPTY;

    // Check galaxy boundaries
    let blocked = false;
    if (newQuadX < 0) { newQuadX = 0; blocked = true; }
    if (newQuadX >= GALAXY_SIZE) { newQuadX = GALAXY_SIZE - 1; blocked = true; }
    if (newQuadY < 0) { newQuadY = 0; blocked = true; }
    if (newQuadY >= GALAXY_SIZE) { newQuadY = GALAXY_SIZE - 1; blocked = true; }

    if (blocked) {
        print('*** BLOCKED BY EDGE OF GALAXY ***');
        print('Navigation computer adjusted course.');
    }

    // Deduct energy
    game.ship.energy -= energyCost;

    // Advance stardate based on distance
    const distance = Math.abs(dx) + Math.abs(dy);
    game.stardate.current += distance * 0.5;

    // Move to new quadrant
    game.ship.quadrantX = newQuadX;
    game.ship.quadrantY = newQuadY;

    // Enter new quadrant (will place Enterprise randomly)
    print('');
    print('Entering quadrant [' + (game.ship.quadrantX + 1) + ', ' + (game.ship.quadrantY + 1) + ']');
    enterQuadrant();

    // Report what's here
    const kCount = game.quadrant.klingons.length;
    if (kCount > 0) {
        print('');
        print('*** RED ALERT! ' + kCount + ' Klingon' + (kCount > 1 ? 's' : '') + ' detected! ***');
    }

    print('Warp complete. Energy used: ' + energyCost);
    print('');

    // Klingons attack after warp
    if (game.quadrant.klingons.length > 0 && !game.ship.docked) {
        klingonsAttack();
    }

    // Repair tick
    repairSystems(distance * 0.5);

    // Check game over conditions
    checkGameOver();

    // Show scan
    shortRangeScan();
}

function executeImpulse(dx, dy, energyCost) {
    // Calculate new sector position
    // Note: negative Y = down (screen coordinates), so we invert dy
    const newSectorX = game.ship.sectorX + dx;
    const newSectorY = game.ship.sectorY - dy;  // Invert Y so positive = up

    // Check boundaries
    if (newSectorX < 0 || newSectorX >= QUADRANT_SIZE ||
        newSectorY < 0 || newSectorY >= QUADRANT_SIZE) {
        print('*** BLOCKED BY QUADRANT BOUNDARY ***');
        print('Use WARP to travel to adjacent quadrants.');
        return;
    }

    // Check what's at destination
    const destination = game.quadrant.sectors[newSectorY][newSectorX];

    if (destination === SYM.STAR) {
        print('*** BLOCKED BY STAR ***');
        print('Navigation aborted - cannot fly through stars.');
        return;
    }

    if (destination === SYM.KLINGON) {
        print('*** BLOCKED BY KLINGON WARSHIP ***');
        print('Use phasers or torpedoes to clear the path.');
        return;
    }

    if (destination === SYM.STARBASE) {
        print('*** BLOCKED BY STARBASE ***');
        print('Move adjacent to starbase and use DOCK command.');
        return;
    }

    // Clear old position
    game.quadrant.sectors[game.ship.sectorY][game.ship.sectorX] = SYM.EMPTY;

    // Move to new position
    game.ship.sectorX = newSectorX;
    game.ship.sectorY = newSectorY;
    game.quadrant.sectors[game.ship.sectorY][game.ship.sectorX] = SYM.ENTERPRISE;

    // Deduct energy
    game.ship.energy -= energyCost;

    // Small stardate advance for impulse
    const distance = Math.abs(dx) + Math.abs(dy);
    game.stardate.current += distance * 0.1;

    // Check docking status
    checkDockingStatus();

    print('Impulse complete. Energy used: ' + energyCost);
    print('');

    // Klingons attack after movement
    if (game.quadrant.klingons.length > 0 && !game.ship.docked) {
        klingonsAttack();
    }

    // Small repair tick
    repairSystems(distance * 0.1);

    // Check game over conditions
    checkGameOver();

    // Show scan
    shortRangeScan();
}

function findNearbyEmpty(x, y) {
    // Try to find empty spot near given coordinates
    for (let r = 1; r <= 3; r++) {
        for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < QUADRANT_SIZE && ny >= 0 && ny < QUADRANT_SIZE) {
                    if (game.quadrant.sectors[ny][nx] === SYM.EMPTY) {
                        return { x: nx, y: ny };
                    }
                }
            }
        }
    }
    return findEmptySpot();  // Fallback to any empty spot
}

function klingonsAttack() {
    print('');
    print('*** KLINGON ATTACK ***');

    for (const klingon of game.quadrant.klingons) {
        // Calculate distance
        const dx = klingon.x - game.ship.sectorX;
        const dy = klingon.y - game.ship.sectorY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate damage based on Klingon energy and distance
        const hitChance = 0.7 + (Math.random() * 0.3);  // 70-100% hit rate
        let damage = Math.floor((klingon.energy / (distance + 1)) * hitChance * 0.4);

        if (damage > 0) {
            print('Klingon at [' + (klingon.x + 1) + ',' + (klingon.y + 1) + '] fires - ');

            // Shields absorb damage first
            if (game.ship.shields > 0) {
                const absorbed = Math.min(game.ship.shields, damage);
                game.ship.shields -= absorbed;
                damage -= absorbed;
                print('  Shields absorb ' + absorbed + ' units');
            }

            if (damage > 0) {
                game.ship.energy -= damage;
                print('  Hull takes ' + damage + ' damage!');

                // Chance to damage a system
                if (Math.random() < 0.3) {
                    damageRandomSystem();
                }
            }
        } else {
            print('Klingon at [' + (klingon.x + 1) + ',' + (klingon.y + 1) + '] misses!');
        }
    }

    print('');
}

function damageRandomSystem() {
    const system = SYSTEMS[Math.floor(Math.random() * SYSTEMS.length)];
    const damageAmount = -(1 + Math.random() * 3);  // 1-4 stardates to repair

    // Only damage if not already damaged worse
    if (game.ship.damage[system] > damageAmount) {
        game.ship.damage[system] = damageAmount;
        print('  *** ' + SYSTEM_NAMES[system] + ' DAMAGED! ***');
    }
}

function repairSystems(time) {
    for (const system of SYSTEMS) {
        if (game.ship.damage[system] < 0) {
            game.ship.damage[system] += time * 0.5;  // Repair rate
            if (game.ship.damage[system] >= 0) {
                game.ship.damage[system] = 0;
                print(SYSTEM_NAMES[system] + ' repair complete.');
            }
        }
    }
}

function dockAtStarbase() {
    // Check if already docked (adjacent to starbase)
    checkDockingStatus();

    if (!game.ship.docked) {
        print('');
        print('*** CANNOT DOCK ***');
        print('You must be adjacent to a starbase to dock.');
        print('Use SRSCAN to locate the nearest starbase (B).');
        print('');
        return;
    }

    print('');
    print('=== DOCKING COMPLETE ===');
    print('');

    // Restore energy
    const energyRestored = INITIAL_ENERGY - game.ship.energy;
    game.ship.energy = INITIAL_ENERGY;
    print('Energy restored: +' + energyRestored + ' (now ' + game.ship.energy + ')');

    // Restore shields
    const shieldsRestored = INITIAL_SHIELDS - game.ship.shields;
    game.ship.shields = INITIAL_SHIELDS;
    print('Shields restored: +' + shieldsRestored + ' (now ' + game.ship.shields + ')');

    // Restore torpedoes
    const torpedoesRestored = INITIAL_TORPEDOES - game.ship.torpedoes;
    game.ship.torpedoes = INITIAL_TORPEDOES;
    print('Torpedoes restored: +' + torpedoesRestored + ' (now ' + game.ship.torpedoes + ')');

    // Repair all systems
    let systemsRepaired = 0;
    for (const system of SYSTEMS) {
        if (game.ship.damage[system] < 0) {
            game.ship.damage[system] = 0;
            systemsRepaired++;
        }
    }
    if (systemsRepaired > 0) {
        print('Systems repaired: ' + systemsRepaired);
    }

    print('');
    print('Enterprise fully resupplied and repaired.');
    print('');
}

function checkGameOver() {
    // Out of energy
    if (game.ship.energy <= 0) {
        print('');
        print('*** ENTERPRISE DESTROYED ***');
        print('Your ship has run out of energy and life support has failed.');
        print('');
        game.gameOver = true;
        game.won = false;
        return;
    }

    // Out of time
    if (game.stardate.current >= game.stardate.end) {
        print('');
        print('*** TIME HAS RUN OUT ***');
        print('The Federation has fallen to the Klingon invasion.');
        print('');
        game.gameOver = true;
        game.won = false;
        return;
    }

    // Victory check
    if (game.klingonsRemaining <= 0) {
        print('');
        print('*** CONGRATULATIONS! ***');
        print('You have destroyed all Klingon warships!');
        print('The Federation is saved!');
        print('');
        game.gameOver = true;
        game.won = true;
        return;
    }
}

// ============================================================================
// COMMAND PROCESSING
// ============================================================================

function processCommand(input) {
    if (game.gameOver) {
        print('Game over. Type NEW to start a new game.');
        return;
    }

    const cmd = input.trim().toUpperCase();

    // Handle multi-step input
    if (game.inputMode) {
        game.inputCallback(cmd);
        return;
    }

    // Parse command
    const parts = cmd.split(/\s+/);
    const command = parts[0];

    switch (command) {
        case 'SRSCAN':
            shortRangeScan();
            break;
        case 'LRSCAN':
            longRangeScan();
            break;
        case 'STARMAP':
            starMap();
            break;
        case 'DAMAGE':
            damageReport();
            break;
        case 'STATUS':
            statusReport();
            break;
        case 'WARP':
            startWarpNavigation(parts);
            break;
        case 'IMPULSE':
            startImpulseNavigation(parts);
            break;
        case 'PHASERS':
            print('Phasers not yet implemented.');
            break;
        case 'TORPEDOES':
            print('Torpedoes not yet implemented.');
            break;
        case 'SHIELDS':
            print('');
            print('Shield status: ' + game.ship.shields + ' / ' + INITIAL_SHIELDS);
            print('Shields are automatic - they absorb damage from attacks.');
            print('Dock at a starbase to restore shields.');
            print('');
            break;
        case 'COMPUTER':
            print('Computer not yet implemented.');
            break;
        case 'DOCK':
            dockAtStarbase();
            break;
        case 'NEW':
            startNewGame();
            break;
        case 'HELP':
            showHelp();
            break;
        case '':
            // Empty command, do nothing
            break;
        default:
            print('Unknown command: ' + command);
            print('Type HELP for a list of commands.');
            break;
    }
}

function showHelp() {
    print('');
    print('=== SUPER STAR TREK COMMANDS ===');
    print('');
    print('WARP x, y      - Warp to another quadrant');
    print('IMPULSE x, y   - Move within current quadrant');
    print('SRSCAN         - Short Range Scan (view quadrant)');
    print('LRSCAN         - Long Range Scan (view nearby quadrants)');
    print('STARMAP        - View entire galaxy map');
    print('PHASERS        - Fire Phasers');
    print('TORPEDOES      - Fire Photon Torpedoes');
    print('SHIELDS        - View shield status (automatic)');
    print('DAMAGE         - Damage Report');
    print('STATUS         - Status Report');
    print('COMPUTER       - Computer Functions');
    print('DOCK           - Dock at Starbase (must be adjacent)');
    print('NEW            - Start New Game');
    print('HELP           - Show this help');
    print('');
    print('=== NAVIGATION ===');
    print('');
    print('Coordinates: x, y where positive X = right, positive Y = up');
    print('');
    print('WARP 1, 0    - Warp one quadrant right');
    print('WARP 0, -1   - Warp one quadrant down');
    print('IMPULSE 2, 1 - Move 2 sectors right, 1 up');
    print('');
    print('=== MISSION ===');
    print('');
    print('Destroy all Klingons before time runs out!');
    print('Dock at starbases to repair and resupply.');
    print('');
    print('=== SYMBOLS ===');
    print('');
    print('E = Enterprise (you)');
    print('K = Klingon warship');
    print('B = Starbase');
    print('* = Star');
    print('. = Empty space');
    print('');
}

// ============================================================================
// GAME FLOW
// ============================================================================

function startNewGame() {
    print('');
    print('');
    print('                      SUPER STAR TREK');
    print('');
    print('');

    initializeGame();

    print('Your mission: Destroy ' + game.klingonsRemaining + ' Klingon warships in ' +
          (game.stardate.end - game.stardate.start).toFixed(0) + ' stardates.');
    print('');
    print('The galaxy is divided into an 8x8 grid of quadrants.');
    print('Each quadrant contains an 8x8 grid of sectors.');
    print('');
    print('There are ' + game.starbasesRemaining + ' starbases in the galaxy for resupply.');
    print('');
    print('Type HELP for commands, or SRSCAN for a Short Range Scan.');
    print('');

    // Show initial short range scan
    shortRangeScan();
}

// ============================================================================
// OUTPUT INTERFACE
// ============================================================================

let outputElement = null;

function setOutputElement(element) {
    outputElement = element;
}

function print(text) {
    if (outputElement) {
        outputElement.textContent += text + '\n';
        outputElement.scrollTop = outputElement.scrollHeight;
    } else {
        console.log(text);
    }
}

function clearOutput() {
    if (outputElement) {
        outputElement.textContent = '';
    }
}

// ============================================================================
// EXPORTS (for use by HTML interface)
// ============================================================================

window.SST = {
    init: setOutputElement,
    process: processCommand,
    newGame: startNewGame,
    print: print,
    clear: clearOutput
};
