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
const MAX_CARDASSIANS = 25;
const MIN_CARDASSIANS = 15;
const MAX_STARBASES = 4;
const MIN_STARBASES = 2;
const SAVE_KEY = 'sst-save';

// Starbase commander names
const STARBASE_COMMANDERS = [
    'Commander Chen',
    'Commander T\'Prela',
    'Commander Okafor',
    'Commander Vasquez',
    'Commander zh\'Raal',
    'Commander Dubois',
    'Commander Krishnamurthy',
    'Commander Sato',
    'Commander O\'Brien',
    'Commander Tarkiv',
    'Commander Mbeki',
    'Commander Johansson'
];

// Symbols for display
const SYM = {
    ENTERPRISE: 'E',
    CARDASSIAN: 'C',
    STARBASE: 'B',
    STAR: '*',
    WORMHOLE: '@',
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

// Bridge crew roster (20 characters, 4 per role)
const CREW_ROSTER = [
    // Helm - stats: warpCost (lower=better), impulseCost (lower=better)
    { id: 'helm1', role: 'helm', name: 'Lt. Kowalski',
      description: 'Runs the engines hot — great at warp, rough on short hops',
      stats: { warpCost: 0.75, impulseCost: 1.20 } },
    { id: 'helm2', role: 'helm', name: 'Ensign Ro',
      description: 'Smooth on the stick, takes her time between stars',
      stats: { warpCost: 1.15, impulseCost: 0.75 } },
    { id: 'helm3', role: 'helm', name: 'Lt. Cmdr. Park',
      description: 'By-the-book navigator, steady and efficient',
      stats: { warpCost: 0.90, impulseCost: 0.90 } },
    { id: 'helm4', role: 'helm', name: 'Lt. DeSoto',
      description: 'Gets the job done, nothing fancy',
      stats: { warpCost: 1.0, impulseCost: 1.0 } },

    // Tactical - stats: phaserDamage (higher=better), torpedoAccuracy (higher=better)
    { id: 'tac1', role: 'tactical', name: 'Lt. Worf',
      description: 'Dead-eye with phasers, not such a hot shot on the torpedo controls',
      stats: { phaserDamage: 1.30, torpedoAccuracy: 0.70 } },
    { id: 'tac2', role: 'tactical', name: 'Ensign Tala',
      description: 'Careful aim with torpedoes, conservative on the trigger',
      stats: { phaserDamage: 0.85, torpedoAccuracy: 1.10 } },
    { id: 'tac3', role: 'tactical', name: 'Lt. Ch\'Taran',
      description: 'Aggressive on all fronts, no finesse',
      stats: { phaserDamage: 1.15, torpedoAccuracy: 0.90 } },
    { id: 'tac4', role: 'tactical', name: 'Lt. Cmdr. Ayala',
      description: 'Solid all around, keeps a cool head',
      stats: { phaserDamage: 1.05, torpedoAccuracy: 1.0 } },

    // Engineering - stats: repairSpeed (higher=better), shieldEfficiency (higher=better)
    { id: 'eng1', role: 'engineering', name: 'Chief Rawlings',
      description: 'Keeps shields humming, repairs take a backseat',
      stats: { repairSpeed: 0.80, shieldEfficiency: 1.25 } },
    { id: 'eng2', role: 'engineering', name: 'Lt. Barclay',
      description: 'Brilliant at fixing things, forgets to check the shields',
      stats: { repairSpeed: 1.30, shieldEfficiency: 0.80 } },
    { id: 'eng3', role: 'engineering', name: 'Lt. Cmdr. Singh',
      description: 'Methodical, everything runs a little better',
      stats: { repairSpeed: 1.10, shieldEfficiency: 1.10 } },
    { id: 'eng4', role: 'engineering', name: 'Ensign Vorik',
      description: 'Competent, by Vulcan standards that\'s high praise',
      stats: { repairSpeed: 1.0, shieldEfficiency: 1.0 } },

    // Science - stats: scanDetail (boolean), lrsRange (1 or 2)
    { id: 'sci1', role: 'science', name: 'Lt. Cmdr. Velix',
      description: 'Reads long-range like a book, misses what\'s under her nose',
      stats: { scanDetail: false, lrsRange: 2 } },
    { id: 'sci2', role: 'science', name: 'Lt. Duval',
      description: 'Sharp eye up close, struggles at range',
      stats: { scanDetail: true, lrsRange: 1 } },
    { id: 'sci3', role: 'science', name: 'Ensign T\'Lora',
      description: 'Thorough analyst, takes nothing for granted',
      stats: { scanDetail: true, lrsRange: 2 } },
    { id: 'sci4', role: 'science', name: 'Ensign Brooks',
      description: 'Still calibrating, gives you the basics',
      stats: { scanDetail: false, lrsRange: 1 } },

    // Communications - stats: buffDuration (higher=better), dockEfficiency (higher=better)
    { id: 'comm1', role: 'communications', name: 'Lt. Palmer',
      description: 'Keeps morale sky-high, never heard of energy rationing',
      stats: { buffDuration: 1.5, dockEfficiency: 0.85 } },
    { id: 'comm2', role: 'communications', name: 'Ensign Patel',
      description: 'Efficient communicator, no time for small talk',
      stats: { buffDuration: 0.80, dockEfficiency: 1.20 } },
    { id: 'comm3', role: 'communications', name: 'Lt. Cmdr. Hoshi',
      description: 'The crew hangs on every word, starbases love her',
      stats: { buffDuration: 1.20, dockEfficiency: 1.15 } },
    { id: 'comm4', role: 'communications', name: 'Ensign Zheng',
      description: 'Gets the message across, nothing more',
      stats: { buffDuration: 1.0, dockEfficiency: 1.0 } }
];

const BRIDGE_ROLES = ['helm', 'tactical', 'engineering', 'science', 'communications'];

const ROLE_LABELS = {
    helm: 'Helm',
    tactical: 'Tactical',
    engineering: 'Engineering',
    science: 'Science',
    communications: 'Communications'
};

// ============================================================================
// GAME STATE
// ============================================================================

let game = null;

function createGameState() {
    return {
        // Galaxy: 8x8 quadrants, each with cardassian/starbase/star counts
        galaxy: [],

        // Current quadrant detail: 8x8 sectors
        quadrant: {
            sectors: [],
            cardassians: []  // Array of {x, y, energy}
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
        cardassiansRemaining: 0,
        starbasesRemaining: 0,
        gameOver: false,
        won: false,

        // Input state for multi-step commands
        inputMode: null,
        inputCallback: null,

        // Replicator buffs (turns remaining)
        buffs: {
            coffee: 0,      // Energy efficiency - movement costs less
            tea: 0,         // Focus - faster repairs
            raktajino: 0,   // Klingon coffee - phaser damage boost
            pruneJuice: 0   // Warrior's drink - shield boost
        },

        // Bridge crew
        crew: {
            helm: null,
            tactical: null,
            engineering: null,
            science: null,
            communications: null
        },

        // Wormhole circuit (array of {quadrantX, quadrantY} in order)
        wormholes: [],

        // Captain's log (player notes)
        log: '',

        // Ghost ship flag (set after self-destruct respawn)
        ghostShip: false
    };
}

// ============================================================================
// SAVE / LOAD
// ============================================================================

function saveGame() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(game));
        print('');
        print('=== GAME SAVED ===');
        print('');
        print('Your progress has been saved.');
        print('Your game will be here when you return.');
        print('');
    } catch (e) {
        print('');
        print('*** SAVE FAILED ***');
        print('Unable to save game data.');
        print('');
    }
}

function loadGame() {
    try {
        const data = localStorage.getItem(SAVE_KEY);
        if (data) {
            game = JSON.parse(data);
            return true;
        }
    } catch (e) {
        // Invalid save data
    }
    return false;
}

function hasSavedGame() {
    return localStorage.getItem(SAVE_KEY) !== null;
}

function clearSave() {
    localStorage.removeItem(SAVE_KEY);
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

    // Assign bridge crew and distribute remaining to starbases
    assignInitialCrew();

    // Set time limit based on Cardassian count
    game.stardate.end = game.stardate.start + Math.max(25, game.cardassiansRemaining + 5);

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
                cardassians: 0,
                starbases: 0,
                stars: Math.floor(Math.random() * 8) + 1,  // 1-8 stars
                explored: false,
                wormhole: false
            };
        }
    }

    // Place Cardassians (15-25 total)
    const totalCardassians = Math.floor(Math.random() * (MAX_CARDASSIANS - MIN_CARDASSIANS + 1)) + MIN_CARDASSIANS;
    game.cardassiansRemaining = totalCardassians;

    let cardassiansPlaced = 0;
    while (cardassiansPlaced < totalCardassians) {
        const x = Math.floor(Math.random() * GALAXY_SIZE);
        const y = Math.floor(Math.random() * GALAXY_SIZE);
        // Max 3 Cardassians per quadrant
        if (game.galaxy[y][x].cardassians < 3) {
            game.galaxy[y][x].cardassians++;
            cardassiansPlaced++;
        }
    }

    // Place Starbases (2-4 total) with named commanders
    const totalStarbases = Math.floor(Math.random() * (MAX_STARBASES - MIN_STARBASES + 1)) + MIN_STARBASES;
    game.starbasesRemaining = totalStarbases;

    // Shuffle commander names and pick one per starbase
    const shuffledCommanders = STARBASE_COMMANDERS.slice().sort(() => Math.random() - 0.5);

    let starbasesPlaced = 0;
    while (starbasesPlaced < totalStarbases) {
        const x = Math.floor(Math.random() * GALAXY_SIZE);
        const y = Math.floor(Math.random() * GALAXY_SIZE);
        // Max 1 starbase per quadrant
        if (game.galaxy[y][x].starbases === 0) {
            game.galaxy[y][x].starbases = 1;
            game.galaxy[y][x].commander = shuffledCommanders[starbasesPlaced];
            starbasesPlaced++;
        }
    }

    // Place Wormholes (3-4 in a one-way circuit)
    const totalWormholes = Math.random() < 0.5 ? 3 : 4;
    game.wormholes = [];

    let wormholesPlaced = 0;
    while (wormholesPlaced < totalWormholes) {
        const x = Math.floor(Math.random() * GALAXY_SIZE);
        const y = Math.floor(Math.random() * GALAXY_SIZE);
        // Max 1 wormhole per quadrant
        if (!game.galaxy[y][x].wormhole) {
            game.galaxy[y][x].wormhole = true;
            game.wormholes.push({ quadrantX: x, quadrantY: y });
            wormholesPlaced++;
        }
    }
}

function assignInitialCrew() {
    // Group roster by role
    const byRole = {};
    for (const role of BRIDGE_ROLES) {
        byRole[role] = CREW_ROSTER.filter(c => c.role === role)
            .sort(() => Math.random() - 0.5);
    }

    // Assign one random crew member per role to the player
    const assigned = [];
    for (const role of BRIDGE_ROLES) {
        game.crew[role] = byRole[role].shift();
        assigned.push(game.crew[role].id);
    }

    // Remaining crew distributed to starbases (2-3 each)
    const remaining = CREW_ROSTER.filter(c => !assigned.includes(c.id))
        .sort(() => Math.random() - 0.5);

    // Find all starbases
    const starbases = [];
    for (let y = 0; y < GALAXY_SIZE; y++) {
        for (let x = 0; x < GALAXY_SIZE; x++) {
            if (game.galaxy[y][x].starbases > 0) {
                game.galaxy[y][x].availableCrew = [];
                starbases.push(game.galaxy[y][x]);
            }
        }
    }

    // Distribute remaining crew round-robin to starbases
    let sbIndex = 0;
    for (const crew of remaining) {
        starbases[sbIndex % starbases.length].availableCrew.push(crew);
        sbIndex++;
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

    // Clear Cardassian list
    game.quadrant.cardassians = [];

    // Place stars
    placeRandomly(SYM.STAR, quadrantData.stars);

    // Place Cardassians
    for (let i = 0; i < quadrantData.cardassians; i++) {
        const pos = findEmptySpot();
        if (pos) {
            game.quadrant.sectors[pos.y][pos.x] = SYM.CARDASSIAN;
            game.quadrant.cardassians.push({
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

    // Place wormhole
    if (quadrantData.wormhole) {
        placeRandomly(SYM.WORMHOLE, 1);
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
    if (game.quadrant.cardassians.length > 0) return 'RED';
    if (game.ship.energy < 300) return 'YELLOW';
    return 'GREEN';
}

function shortRangeScan() {
    const hasScanDetail = game.crew.science && game.crew.science.stats.scanDetail;
    if (game.ship.damage.shortRangeSensors < 0) {
        if (hasScanDetail && game.ship.damage.shortRangeSensors > -2) {
            // Science officer compensates for minor sensor damage
            print('*** SHORT RANGE SENSORS DAMAGED — science officer compensating ***');
        } else {
            print('*** SHORT RANGE SENSORS ARE DAMAGED ***');
            print('');
            return;
        }
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
    print('Cardassians: ' + game.cardassiansRemaining + ' total, ' + game.quadrant.cardassians.length + ' here');
    print('Stardates:  ' + stardatesRemaining.toFixed(1) + ' remaining');

    // Show Cardassian positions if any present
    if (game.quadrant.cardassians.length > 0) {
        print('');
        print('Cardassian positions:');
        for (const cardassian of game.quadrant.cardassians) {
            print('  [' + (cardassian.x + 1) + ', ' + (cardassian.y + 1) + '] - energy: ' + cardassian.energy);
        }
    }

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

    // Science officer affects scan range (1 or 2 quadrants)
    const scanRange = game.crew.science ? game.crew.science.stats.lrsRange : 1;

    print('');
    print('Long Range Scan for Quadrant [' + (qx + 1) + ', ' + (qy + 1) + ']');
    if (scanRange > 1) {
        print('(Enhanced range from science officer)');
    }
    print('');

    // Header row
    let header = '    ';
    for (let x = qx - scanRange; x <= qx + scanRange; x++) {
        if (x >= 0 && x < GALAXY_SIZE) {
            header += ' ' + (x + 1) + '  ';
        } else {
            header += '    ';
        }
    }
    print(header);
    print('  +' + '---+'.repeat(scanRange * 2 + 1));

    for (let y = qy - scanRange; y <= qy + scanRange; y++) {
        let line = '';
        if (y >= 0 && y < GALAXY_SIZE) {
            line = (y + 1) + ' |';
        } else {
            line = '  |';
        }

        for (let x = qx - scanRange; x <= qx + scanRange; x++) {
            if (x >= 0 && x < GALAXY_SIZE && y >= 0 && y < GALAXY_SIZE) {
                const q = game.galaxy[y][x];
                q.explored = true;  // Mark as explored
                const code = '' + q.cardassians + q.starbases + q.stars;
                line += code + '|';
            } else {
                line += '***|';  // Edge of galaxy
            }
        }
        print(line);
        print('  +' + '---+'.repeat(scanRange * 2 + 1));
    }

    print('');
    print('(Format: Cardassians/Starbases/Stars)');
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
                // Show CBS format (Cardassians/Bases/Stars)
                let code = '' + q.cardassians + q.starbases + q.stars;
                if (isHere) {
                    line += '>' + code + '<|';  // Mark current position
                } else if (q.wormhole) {
                    line += '~' + code + '~|';  // Mark wormhole
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
    print('Format: Cardassians/Starbases/Stars');
    print('>###< = Enterprise location');
    print('~###~ = Wormhole');
    print('*###* = Starbase present');
    print(' ???  = Unexplored');
    print('');
    print('Enterprise at quadrant [' + (game.ship.quadrantX + 1) + ', ' + (game.ship.quadrantY + 1) + ']');
    print('Cardassians remaining: ' + game.cardassiansRemaining);
    print('Starbases: ' + game.starbasesRemaining);

    // Show discovered wormhole circuit
    const discovered = game.wormholes.filter(
        w => game.galaxy[w.quadrantY][w.quadrantX].explored
    );
    if (discovered.length > 0) {
        print('');
        print('Wormhole circuit (one-way):');
        let circuit = '';
        for (let i = 0; i < game.wormholes.length; i++) {
            const w = game.wormholes[i];
            const explored = game.galaxy[w.quadrantY][w.quadrantX].explored;
            if (explored) {
                circuit += '[' + (w.quadrantX + 1) + ',' + (w.quadrantY + 1) + ']';
            } else {
                circuit += '[???]';
            }
            circuit += ' -> ';
        }
        // Complete the circuit back to the first
        const first = game.wormholes[0];
        const firstExplored = game.galaxy[first.quadrantY][first.quadrantX].explored;
        circuit += firstExplored ?
            '[' + (first.quadrantX + 1) + ',' + (first.quadrantY + 1) + ']' : '[???]';
        print('  ' + circuit);
    }

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
    print('Cardassians Remaining: ' + game.cardassiansRemaining);
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
    const helmMod = game.crew.helm ? game.crew.helm.stats.warpCost : 1.0;
    const energyCost = Math.floor(distance * 50 * helmMod);

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
    const helmMod = game.crew.helm ? game.crew.helm.stats.impulseCost : 1.0;
    const energyCost = Math.floor(distance * 10 * helmMod);

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

    // Deduct energy (coffee buff reduces cost by 30%)
    const actualCost = game.buffs.coffee > 0 ? Math.floor(energyCost * 0.7) : energyCost;
    game.ship.energy -= actualCost;

    // Advance stardate based on distance
    const distance = Math.abs(dx) + Math.abs(dy);
    game.stardate.current += distance * 0.5;

    // Tick buffs after movement
    tickBuffs();

    // Move to new quadrant
    game.ship.quadrantX = newQuadX;
    game.ship.quadrantY = newQuadY;

    // Enter new quadrant (will place Enterprise randomly)
    print('');
    print('Entering quadrant [' + (game.ship.quadrantX + 1) + ', ' + (game.ship.quadrantY + 1) + ']');
    enterQuadrant();

    // Report what's here
    const kCount = game.quadrant.cardassians.length;
    if (kCount > 0) {
        print('');
        print('*** RED ALERT! ' + kCount + ' Cardassian' + (kCount > 1 ? 's' : '') + ' detected! ***');
    }

    print('Warp complete. Energy used: ' + energyCost);
    print('');

    // Cardassians attack after warp
    if (game.quadrant.cardassians.length > 0 && !game.ship.docked) {
        cardassiansAttack();
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

    if (destination === SYM.CARDASSIAN) {
        print('*** BLOCKED BY CARDASSIAN WARSHIP ***');
        print('Use phasers or torpedoes to clear the path.');
        return;
    }

    if (destination === SYM.STARBASE) {
        print('*** BLOCKED BY STARBASE ***');
        print('Move adjacent to starbase and use DOCK command.');
        return;
    }

    if (destination === SYM.WORMHOLE) {
        // Deduct impulse energy before entering
        const actualCost = game.buffs.coffee > 0 ? Math.floor(energyCost * 0.7) : energyCost;
        game.ship.energy -= actualCost;
        enterWormhole();
        return;
    }

    // Clear old position
    game.quadrant.sectors[game.ship.sectorY][game.ship.sectorX] = SYM.EMPTY;

    // Move to new position
    game.ship.sectorX = newSectorX;
    game.ship.sectorY = newSectorY;
    game.quadrant.sectors[game.ship.sectorY][game.ship.sectorX] = SYM.ENTERPRISE;

    // Deduct energy (coffee buff reduces cost by 30%)
    const actualCost = game.buffs.coffee > 0 ? Math.floor(energyCost * 0.7) : energyCost;
    game.ship.energy -= actualCost;

    // Small stardate advance for impulse
    const distance = Math.abs(dx) + Math.abs(dy);
    game.stardate.current += distance * 0.1;

    // Tick buffs after movement
    tickBuffs();

    // Check docking status
    checkDockingStatus();

    print('Impulse complete. Energy used: ' + actualCost);
    print('');

    // Cardassians attack after movement
    if (game.quadrant.cardassians.length > 0 && !game.ship.docked) {
        cardassiansAttack();
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

// ============================================================================
// WORMHOLES
// ============================================================================

function enterWormhole() {
    // Find which wormhole we're at
    const qx = game.ship.quadrantX;
    const qy = game.ship.quadrantY;
    const wormholeIndex = game.wormholes.findIndex(
        w => w.quadrantX === qx && w.quadrantY === qy
    );

    if (wormholeIndex === -1) {
        print('The wormhole flickers and destabilizes. Nothing happens.');
        return;
    }

    // Destination is the next wormhole in the circuit
    const destIndex = (wormholeIndex + 1) % game.wormholes.length;
    const dest = game.wormholes[destIndex];

    print('');
    print('=== ENTERING WORMHOLE ===');
    print('');
    print('The ship shudders as it crosses the event horizon...');
    print('Subspace corridor detected - transit in progress...');

    // Clear Enterprise from current sector
    game.quadrant.sectors[game.ship.sectorY][game.ship.sectorX] = SYM.EMPTY;

    // Turbulence: ~20% chance of minor damage
    if (Math.random() < 0.2) {
        print('');
        print('*** SUBSPACE TURBULENCE ***');
        const system = SYSTEMS[Math.floor(Math.random() * SYSTEMS.length)];
        const damageAmount = -(0.5 + Math.random() * 1.5);  // 0.5-2 stardates to repair (minor)
        if (game.ship.damage[system] > damageAmount) {
            game.ship.damage[system] = damageAmount;
            print(SYSTEM_NAMES[system] + ' damaged by subspace distortion!');
        } else {
            print('The ship rattles but holds together.');
        }
    }

    // Advance stardate
    game.stardate.current += 0.5;

    // Tick buffs
    tickBuffs();

    // Move to destination quadrant
    game.ship.quadrantX = dest.quadrantX;
    game.ship.quadrantY = dest.quadrantY;

    print('');
    print('Emerging from wormhole in quadrant [' +
        (dest.quadrantX + 1) + ', ' + (dest.quadrantY + 1) + ']');

    // Enter new quadrant (places Enterprise randomly)
    enterQuadrant();

    // Report what's here
    const cCount = game.quadrant.cardassians.length;
    if (cCount > 0) {
        print('');
        print('*** RED ALERT! ' + cCount + ' Cardassian' + (cCount > 1 ? 's' : '') + ' detected! ***');
    }

    print('');

    // Cardassians attack after arrival
    if (game.quadrant.cardassians.length > 0 && !game.ship.docked) {
        cardassiansAttack();
    }

    // Repair tick
    repairSystems(0.5);

    // Check game over conditions
    checkGameOver();

    // Show scan
    shortRangeScan();
}

// ============================================================================
// COMBAT
// ============================================================================

function firePhasers(parts) {
    // Check if phasers are damaged
    if (game.ship.damage.phasers < 0) {
        print('');
        print('*** PHASERS ARE DAMAGED ***');
        print('');
        return;
    }

    // Check if there are Cardassians to shoot
    if (game.quadrant.cardassians.length === 0) {
        print('');
        print('No Cardassians in this quadrant.');
        print('');
        return;
    }

    // Parse energy amount
    const energy = parseInt(parts[1]);

    if (isNaN(energy) || energy <= 0) {
        print('');
        print('PHASERS [energy] - Fire phasers');
        print('');
        print('Example: PHASERS 500');
        print('');
        print('Energy will be distributed among all ' + game.quadrant.cardassians.length + ' Cardassian(s).');
        print('Damage decreases with distance.');
        print('Available energy: ' + game.ship.energy);
        print('');
        return;
    }

    // Check if we have enough energy
    if (energy > game.ship.energy) {
        print('');
        print('Insufficient energy. Available: ' + game.ship.energy);
        print('');
        return;
    }

    // Fire phasers!
    game.ship.energy -= energy;
    print('');
    print('=== FIRING PHASERS ===');
    print('Energy used: ' + energy);
    print('');

    // Distribute energy among Cardassians
    const energyPerCardassian = energy / game.quadrant.cardassians.length;
    const destroyedCardassians = [];

    for (const cardassian of game.quadrant.cardassians) {
        // Calculate distance
        const dx = cardassian.x - game.ship.sectorX;
        const dy = cardassian.y - game.ship.sectorY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Damage decreases with distance (inverse relationship)
        // At distance 1, full damage. At distance 8, about 1/3 damage.
        const effectiveness = 1 / (1 + distance * 0.3);
        // Raktajino buff increases phaser damage by 50%
        const raktajinoBonus = game.buffs.raktajino > 0 ? 1.5 : 1.0;
        const tacMod = game.crew.tactical ? game.crew.tactical.stats.phaserDamage : 1.0;
        const damage = Math.floor(energyPerCardassian * effectiveness * (0.8 + Math.random() * 0.4) * raktajinoBonus * tacMod);

        cardassian.energy -= damage;
        print('Cardassian at [' + (cardassian.x + 1) + ',' + (cardassian.y + 1) + '] hit for ' + damage + ' damage.');

        if (cardassian.energy <= 0) {
            print('  *** CARDASSIAN DESTROYED! ***');
            destroyedCardassians.push(cardassian);
        } else {
            print('  Cardassian energy remaining: ' + cardassian.energy);
        }
    }

    // Remove destroyed Cardassians
    for (const cardassian of destroyedCardassians) {
        removeCardassian(cardassian);
    }

    print('');

    // Surviving Cardassians counterattack
    if (game.quadrant.cardassians.length > 0 && !game.ship.docked) {
        cardassiansAttack();
    }

    // Tick buffs after combat
    tickBuffs();

    // Check game over conditions
    checkGameOver();

    // Show scan
    shortRangeScan();
}

function fireTorpedoes(parts) {
    // Check if torpedoes are damaged
    if (game.ship.damage.photonTorpedoes < 0) {
        print('');
        print('*** PHOTON TORPEDOES ARE DAMAGED ***');
        print('');
        return;
    }

    // Check if we have torpedoes
    if (game.ship.torpedoes <= 0) {
        print('');
        print('No torpedoes remaining. Dock at a starbase to resupply.');
        print('');
        return;
    }

    // Parse target coordinates
    const coords = parseCoordinates(parts);

    if (!coords) {
        print('');
        print('TORPEDOES x, y - Fire a photon torpedo at sector coordinates');
        print('');
        print('Example: TORPEDOES 3, 5');
        print('');
        print('Torpedoes remaining: ' + game.ship.torpedoes);
        print('Use SRSCAN to locate Cardassians (C).');
        print('');
        return;
    }

    // Convert to 0-indexed (player uses 1-indexed)
    const targetX = coords.dx - 1;
    const targetY = coords.dy - 1;

    // Validate coordinates are in range
    if (targetX < 0 || targetX >= QUADRANT_SIZE || targetY < 0 || targetY >= QUADRANT_SIZE) {
        print('');
        print('Target out of range. Coordinates must be 1-8.');
        print('');
        return;
    }

    // Fire torpedo!
    game.ship.torpedoes--;
    print('');
    print('=== TORPEDO AWAY ===');
    print('Targeting sector [' + (targetX + 1) + ', ' + (targetY + 1) + ']');
    print('Torpedoes remaining: ' + game.ship.torpedoes);
    print('');

    // Check what's at the target
    const target = game.quadrant.sectors[targetY][targetX];

    if (target === SYM.CARDASSIAN) {
        // Torpedo accuracy check (base 85%, modified by tactical crew)
        const tacAccuracy = game.crew.tactical ? game.crew.tactical.stats.torpedoAccuracy : 1.0;
        const hitChance = 0.85 * tacAccuracy;
        if (Math.random() < hitChance) {
            print('*** DIRECT HIT! CARDASSIAN DESTROYED! ***');
            // Find and remove the Cardassian
            const cardassian = game.quadrant.cardassians.find(k => k.x === targetX && k.y === targetY);
            if (cardassian) {
                removeCardassian(cardassian);
            }
        } else {
            print('Torpedo veers off course — near miss!');
        }
    } else if (target === SYM.STAR) {
        print('Torpedo impacts star - no effect.');
    } else if (target === SYM.STARBASE) {
        print('');
        print('*** YOU DESTROYED A FEDERATION STARBASE! ***');
        print('You will be court-martialed for this!');
        print('');
        game.quadrant.sectors[targetY][targetX] = SYM.EMPTY;
        game.galaxy[game.ship.quadrantY][game.ship.quadrantX].starbases = 0;
        game.starbasesRemaining--;
        checkDockingStatus();
    } else if (target === SYM.ENTERPRISE) {
        print('You cannot fire at yourself!');
        game.ship.torpedoes++;  // Give the torpedo back
    } else {
        print('Torpedo explodes in empty space.');
    }

    print('');

    // Cardassians counterattack
    if (game.quadrant.cardassians.length > 0 && !game.ship.docked) {
        cardassiansAttack();
    }

    // Tick buffs after combat
    tickBuffs();

    // Check game over conditions
    checkGameOver();

    // Show scan
    shortRangeScan();
}

function removeCardassian(cardassian) {
    // Remove from sector grid
    game.quadrant.sectors[cardassian.y][cardassian.x] = SYM.EMPTY;

    // Remove from cardassian list
    const index = game.quadrant.cardassians.indexOf(cardassian);
    if (index > -1) {
        game.quadrant.cardassians.splice(index, 1);
    }

    // Update galaxy count
    game.galaxy[game.ship.quadrantY][game.ship.quadrantX].cardassians--;

    // Update total remaining
    game.cardassiansRemaining--;
}

// ============================================================================
// REPLICATOR (COMPUTER)
// ============================================================================

function useReplicator(parts) {
    const order = parts.slice(1).join(' ').toLowerCase();

    // Show menu if no order given
    if (!order) {
        print('');
        print('=== REPLICATOR MENU ===');
        print('');
        print('1. COMPUTER COFFEE       - "Coffee, black"');
        print('   Improves engine efficiency (reduced energy costs)');
        print('');
        print('2. COMPUTER TEA          - "Tea, Earl Grey, hot"');
        print('   Calms the crew (faster system repairs)');
        print('');
        print('3. COMPUTER RAKTAJINO    - "Raktajino"');
        print('   Klingon coffee (boosted phaser damage)');
        print('');
        print('4. COMPUTER PRUNE JUICE  - "Prune juice"');
        print('   A warrior\'s drink (shield regeneration)');
        print('');
        print('Active buffs last for 5 moves.');
        print('');
        showActiveBuffs();
        return;
    }

    // Buff duration (communications crew affects this)
    const commMod = game.crew.communications ? game.crew.communications.stats.buffDuration : 1.0;
    const duration = Math.round(5 * commMod);

    // Process orders
    if (order.includes('coffee') && !order.includes('raktajino')) {
        print('');
        print('"Coffee, black."');
        print('');
        print('The replicator hums and produces a steaming cup of black coffee.');
        print('You feel more alert. Engine efficiency improved for ' + duration + ' moves.');
        print('');
        game.buffs.coffee = duration;
    } else if (order.includes('tea') || order.includes('earl grey')) {
        print('');
        print('"Tea, Earl Grey, hot."');
        print('');
        print('The replicator produces a perfect cup of Earl Grey tea.');
        print('A sense of calm focus settles over the bridge. Repairs will be faster for ' + duration + ' moves.');
        print('');
        game.buffs.tea = duration;
    } else if (order.includes('raktajino')) {
        print('');
        print('"Raktajino."');
        print('');
        print('The replicator produces the strong Klingon coffee.');
        print('The crew feels energized and aggressive. Phaser damage boosted for ' + duration + ' moves.');
        print('');
        game.buffs.raktajino = duration;
    } else if (order.includes('prune') || order.includes('juice')) {
        print('');
        print('"Prune juice. A warrior\'s drink."');
        print('');
        print('The replicator produces a glass of prune juice.');
        print('You feel the vigor of a Klingon warrior. Shields regenerating for ' + duration + ' moves.');
        print('');
        game.buffs.pruneJuice = duration;
    } else {
        print('');
        print('The replicator does not recognize that order.');
        print('Try: COFFEE, TEA, RAKTAJINO, or PRUNE JUICE');
        print('');
    }
}

function showActiveBuffs() {
    const active = [];
    if (game.buffs.coffee > 0) active.push('Coffee (' + game.buffs.coffee + ' moves)');
    if (game.buffs.tea > 0) active.push('Tea (' + game.buffs.tea + ' moves)');
    if (game.buffs.raktajino > 0) active.push('Raktajino (' + game.buffs.raktajino + ' moves)');
    if (game.buffs.pruneJuice > 0) active.push('Prune Juice (' + game.buffs.pruneJuice + ' moves)');

    if (active.length > 0) {
        print('Active buffs: ' + active.join(', '));
        print('');
    }
}

function tickBuffs() {
    // Decrement buff timers
    if (game.buffs.coffee > 0) game.buffs.coffee--;
    if (game.buffs.tea > 0) game.buffs.tea--;
    if (game.buffs.raktajino > 0) game.buffs.raktajino--;
    if (game.buffs.pruneJuice > 0) {
        game.buffs.pruneJuice--;
        // Prune juice regenerates shields
        const regen = Math.floor(INITIAL_SHIELDS * 0.1);  // 10% per move
        game.ship.shields = Math.min(INITIAL_SHIELDS, game.ship.shields + regen);
    }
}

function cardassiansAttack() {
    print('');
    print('*** CARDASSIAN ATTACK ***');

    for (const cardassian of game.quadrant.cardassians) {
        // Calculate distance
        const dx = cardassian.x - game.ship.sectorX;
        const dy = cardassian.y - game.ship.sectorY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate damage based on Cardassian energy and distance
        const hitChance = 0.7 + (Math.random() * 0.3);  // 70-100% hit rate
        let damage = Math.floor((cardassian.energy / (distance + 1)) * hitChance * 0.4);

        if (damage > 0) {
            print('Cardassian at [' + (cardassian.x + 1) + ',' + (cardassian.y + 1) + '] fires - ');

            // Shields absorb damage first (engineering crew affects efficiency)
            // Better engineer = shields drain slower per point of damage absorbed
            if (game.ship.shields > 0) {
                const shieldMod = game.crew.engineering ? game.crew.engineering.stats.shieldEfficiency : 1.0;
                const shieldCost = Math.max(1, Math.floor(damage / shieldMod));
                const canAbsorb = Math.min(game.ship.shields, shieldCost);
                const absorbed = Math.min(damage, Math.floor(canAbsorb * shieldMod));
                game.ship.shields -= canAbsorb;
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
            print('Cardassian at [' + (cardassian.x + 1) + ',' + (cardassian.y + 1) + '] misses!');
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
    // Tea buff doubles repair rate
    const engMod = game.crew.engineering ? game.crew.engineering.stats.repairSpeed : 1.0;
    const repairRate = (game.buffs.tea > 0 ? 1.0 : 0.5) * engMod;

    for (const system of SYSTEMS) {
        if (game.ship.damage[system] < 0) {
            game.ship.damage[system] += time * repairRate;
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

    // Greet with commander name
    const commander = game.galaxy[game.ship.quadrantY][game.ship.quadrantX].commander;
    print('');
    print('=== DOCKING COMPLETE ===');
    print('');
    if (commander) {
        print(commander + ': "Welcome to Starbase, Captain.');
        print('We\'ll have you resupplied shortly."');
        print('');
    }

    // Communications crew affects dock resupply efficiency
    const dockMod = game.crew.communications ? game.crew.communications.stats.dockEfficiency : 1.0;

    // Restore energy
    const energyMax = Math.floor(INITIAL_ENERGY * dockMod);
    const energyRestored = energyMax - game.ship.energy;
    game.ship.energy = energyMax;
    print('Energy restored: +' + energyRestored + ' (now ' + game.ship.energy + ')');

    // Restore shields
    const shieldsMax = Math.floor(INITIAL_SHIELDS * dockMod);
    const shieldsRestored = shieldsMax - game.ship.shields;
    game.ship.shields = shieldsMax;
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
        print('The Federation has fallen to the Cardassian invasion.');
        print('');
        game.gameOver = true;
        game.won = false;
        return;
    }

    // Victory check
    if (game.cardassiansRemaining <= 0) {
        print('');
        print('*** CONGRATULATIONS! ***');
        print('You have destroyed all Cardassian warships!');
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
            firePhasers(parts);
            break;
        case 'TORPEDOES':
            fireTorpedoes(parts);
            break;
        case 'SHIELDS':
            print('');
            print('Shield status: ' + game.ship.shields + ' / ' + INITIAL_SHIELDS);
            print('Shields are automatic - they absorb damage from attacks.');
            print('Dock at a starbase to restore shields.');
            print('');
            break;
        case 'COMPUTER':
            useReplicator(parts);
            break;
        case 'DOCK':
            dockAtStarbase();
            break;
        case 'SAVE':
            saveGame();
            break;
        case 'LOG':
            openLog();
            break;
        case 'CREW':
            manageCrew(parts);
            break;
        case 'SELFDESTRUCT':
            selfDestruct();
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
    print('PHASERS n      - Fire phasers using n energy');
    print('TORPEDOES x, y - Fire torpedo at sector x, y');
    print('SHIELDS        - View shield status (automatic)');
    print('DAMAGE         - Damage Report');
    print('STATUS         - Status Report');
    print('COMPUTER       - Replicator (crew buffs)');
    print('DOCK           - Dock at Starbase (must be adjacent)');
    print('CREW           - View bridge crew (swap at starbase)');
    print('SELFDESTRUCT   - Self-destruct (last resort!)');
    print('SAVE           - Save game');
    print('LOG            - Captain\'s log (personal notes)');
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
    print('=== COMBAT ===');
    print('');
    print('PHASERS 500    - Fire phasers with 500 energy (hits all Cardassians)');
    print('TORPEDOES 3, 5 - Fire torpedo at sector [3, 5] (instant kill)');
    print('');
    print('=== MISSION ===');
    print('');
    print('Destroy all Cardassians before time runs out!');
    print('Dock at starbases to repair and resupply.');
    print('');
    print('=== SYMBOLS ===');
    print('');
    print('E = Enterprise (you)');
    print('C = Cardassian warship');
    print('B = Starbase');
    print('@ = Wormhole (one-way, fly into it with IMPULSE)');
    print('* = Star');
    print('. = Empty space');
    print('');
}

// ============================================================================
// CAPTAIN'S LOG
// ============================================================================

let logEditorCallback = null;

function setLogEditor(callback) {
    logEditorCallback = callback;
}

function openLog() {
    if (!logEditorCallback) {
        print('');
        print('Log editor not available.');
        print('');
        return;
    }

    logEditorCallback(game.log || '', function(newLog) {
        game.log = newLog;
        print('');
        print("Captain's log updated.");
        print("Don't forget to SAVE to preserve your log.");
        print('');
    });
}

// ============================================================================
// CREW MANAGEMENT
// ============================================================================

function showCrewRoster() {
    print('');
    print('=== BRIDGE CREW ===');
    print('');
    for (const role of BRIDGE_ROLES) {
        const member = game.crew[role];
        const label = (ROLE_LABELS[role] + ':').padEnd(16);
        if (member) {
            print(label + member.name);
            print('                ' + member.description);
        } else {
            print(label + '(vacant)');
        }
    }
    print('');
}

function manageCrew(parts) {
    // CREW SWAP [role] [number] - swap crew when docked
    if (parts.length >= 4 && parts[1] === 'SWAP') {
        if (!game.ship.docked) {
            print('');
            print('You must be docked at a starbase to swap crew.');
            print('');
            return;
        }

        const roleName = parts[2].toLowerCase();
        const pickNum = parseInt(parts[3]);

        // Validate role
        if (!BRIDGE_ROLES.includes(roleName)) {
            print('');
            print('Unknown role: ' + parts[2]);
            print('Roles: ' + BRIDGE_ROLES.map(r => ROLE_LABELS[r]).join(', '));
            print('');
            return;
        }

        // Get available crew at this starbase
        const quadrant = game.galaxy[game.ship.quadrantY][game.ship.quadrantX];
        const available = (quadrant.availableCrew || []).filter(c => c.role === roleName);

        if (available.length === 0) {
            print('');
            print('No ' + ROLE_LABELS[roleName] + ' crew available at this starbase.');
            print('');
            return;
        }

        if (isNaN(pickNum) || pickNum < 1 || pickNum > available.length) {
            print('');
            print('Invalid selection. Choose 1-' + available.length + '.');
            print('');
            return;
        }

        const newCrew = available[pickNum - 1];
        const oldCrew = game.crew[roleName];

        // Swap: remove new crew from starbase pool
        const poolIndex = quadrant.availableCrew.indexOf(newCrew);
        quadrant.availableCrew.splice(poolIndex, 1);

        // Add old crew to starbase pool
        if (oldCrew) {
            quadrant.availableCrew.push(oldCrew);
        }

        // Assign new crew
        game.crew[roleName] = newCrew;

        print('');
        print(newCrew.name + ' reports for duty as ' + ROLE_LABELS[roleName] + '.');
        if (oldCrew) {
            print(oldCrew.name + ' transfers to starbase personnel.');
        }
        print('');
        print(newCrew.name + ': "' + newCrew.description + '"');
        print('');
        return;
    }

    // Default: show roster
    showCrewRoster();

    // If docked, show available crew at this starbase
    if (game.ship.docked) {
        const quadrant = game.galaxy[game.ship.quadrantY][game.ship.quadrantX];
        const available = quadrant.availableCrew || [];

        if (available.length > 0) {
            print('=== AVAILABLE CREW AT THIS STARBASE ===');
            print('');

            // Group by role for display
            let num = 1;
            const displayMap = [];
            for (const crew of available) {
                print(num + '. ' + crew.name + ' (' + ROLE_LABELS[crew.role] + ')');
                print('   ' + crew.description);
                displayMap.push(crew);
                num++;
            }
            print('');
            print('CREW SWAP [role] [number] to swap');
            print('Example: CREW SWAP TACTICAL 1');
            print('');

            // Also show by-role numbering hint
            for (const role of BRIDGE_ROLES) {
                const roleAvail = available.filter(c => c.role === role);
                if (roleAvail.length > 0) {
                    const names = roleAvail.map((c, i) => (i + 1) + '. ' + c.name).join(', ');
                    print(ROLE_LABELS[role] + ': ' + names);
                }
            }
            print('');
        } else {
            print('No crew available for transfer at this starbase.');
            print('');
        }
    }
}

// ============================================================================
// SELF-DESTRUCT
// ============================================================================

function findNearestStarbase() {
    let nearest = null;
    let bestDist = Infinity;
    for (let y = 0; y < GALAXY_SIZE; y++) {
        for (let x = 0; x < GALAXY_SIZE; x++) {
            if (game.galaxy[y][x].starbases > 0) {
                const dist = Math.abs(x - game.ship.quadrantX) + Math.abs(y - game.ship.quadrantY);
                if (dist < bestDist) {
                    bestDist = dist;
                    nearest = { x, y };
                }
            }
        }
    }
    return nearest;
}

function selfDestruct() {
    print('');
    print('=== SELF-DESTRUCT SEQUENCE ===');
    print('');
    print('Are you sure, Captain? This will destroy the Enterprise. (Y/N)');
    print('');

    game.inputMode = 'selfdestruct';
    game.inputCallback = function(input) {
        game.inputMode = null;
        game.inputCallback = null;

        if (input !== 'Y' && input !== 'YES') {
            print('Self-destruct aborted.');
            print('');
            return;
        }

        print('Captain\'s authorization confirmed.');
        print('Self-destruct sequence activated.');
        print('');
        print('5...');
        print('4...');
        print('3...');
        print('2...');
        print('1...');
        print('');
        print('*** USS ENTERPRISE - DESTROYED ***');
        print('');

        // Destroy all Cardassians in current quadrant
        const qx = game.ship.quadrantX;
        const qy = game.ship.quadrantY;
        const destroyed = game.quadrant.cardassians.length;

        if (destroyed > 0) {
            print('The explosion engulfs ' + destroyed + ' Cardassian warship' + (destroyed > 1 ? 's' : '') + '.');
            game.cardassiansRemaining -= destroyed;
            game.galaxy[qy][qx].cardassians = 0;
            game.quadrant.cardassians = [];
            // Clear Cardassian symbols from sector grid
            for (let sy = 0; sy < QUADRANT_SIZE; sy++) {
                for (let sx = 0; sx < QUADRANT_SIZE; sx++) {
                    if (game.quadrant.sectors[sy][sx] === SYM.CARDASSIAN) {
                        game.quadrant.sectors[sy][sx] = SYM.EMPTY;
                    }
                }
            }
        } else {
            print('The explosion tears through empty space.');
        }
        print('');

        // Check if that was the last of them
        if (game.cardassiansRemaining <= 0) {
            print('*** CONGRATULATIONS! ***');
            print('That was the last of the Cardassian fleet!');
            print('The Federation is saved — though the Enterprise is lost.');
            print('');
            game.gameOver = true;
            game.won = true;
            clearSave();
            return;
        }

        print('Emergency escape pods launched...');
        print('');

        // Branch based on starbases remaining
        if (game.starbasesRemaining > 0) {
            // Branch A: Ghost ship
            const starbase = findNearestStarbase();
            const commander = game.galaxy[starbase.y][starbase.x].commander || 'The starbase commander';

            print('Escape pod reaches Starbase at quadrant [' + (starbase.x + 1) + ', ' + (starbase.y + 1) + '].');
            print('');
            print(commander + ' meets you in the docking bay.');
            print('');
            print('"Captain, we have a ship for you. She was found drifting');
            print('near the Badlands two weeks ago — no crew, no logs, no');
            print('indication of what happened. Not a soul on board.');
            print('');
            print('Our repair crews have searched her stem to stern and');
            print('declared her good as new. With the war effort, we need');
            print('every ship we can get.');
            print('');
            print('She\'s yours now, Captain. Try not to blow this one up."');
            print('');
            print('=== USS ENTERPRISE-A COMMISSIONED ===');
            print('');

            // Reset ship to full stats
            game.ship.energy = INITIAL_ENERGY;
            game.ship.shields = INITIAL_SHIELDS;
            game.ship.torpedoes = INITIAL_TORPEDOES;
            for (const system of SYSTEMS) {
                game.ship.damage[system] = 0;
            }

            // Move to starbase quadrant
            game.ship.quadrantX = starbase.x;
            game.ship.quadrantY = starbase.y;
            enterQuadrant();

            // Set docked and ghost ship flag
            game.ship.docked = true;
            game.ghostShip = true;

            shortRangeScan();
        } else {
            // Branch B: Captured
            print('Your pod drifts through the debris field.');
            print('');
            print('A shadow falls across the viewport.');
            print('A Cardassian Galor-class warship decloaks above you.');
            print('');
            print('"Federation captain... you are now a prisoner');
            print('of the Cardassian Union."');
            print('');
            print('=== TO BE CONTINUED... ===');
            print('');

            game.gameOver = true;
            game.won = false;
            clearSave();
        }
    };
}

// ============================================================================
// GAME FLOW
// ============================================================================

function startOrResume() {
    if (hasSavedGame()) {
        print('');
        print('                      SUPER STAR TREK');
        print('');
        print('');
        print('Saved game detected.');
        print('');
        print('Resume saved game? (Y/N)');
        print('');

        // Create temporary state for input handling
        game = createGameState();
        game.inputMode = 'resume';
        game.inputCallback = function(input) {
            game.inputMode = null;
            game.inputCallback = null;

            if (input === 'Y' || input === 'YES') {
                if (loadGame()) {
                    print('');
                    print('=== GAME RESUMED ===');
                    print('');

                    // Show log if it has content
                    if (game.log && game.log.trim()) {
                        print("Captain's Log:");
                        print('---');
                        print(game.log);
                        print('---');
                        print('');
                    }

                    shortRangeScan();
                } else {
                    print('Save data corrupted. Starting new game.');
                    print('');
                    clearSave();
                    startNewGame();
                }
            } else {
                print('');
                startNewGame();
            }
        };
    } else {
        startNewGame();
    }
}

function startNewGame() {
    print('');
    print('');
    print('                      SUPER STAR TREK');
    print('');
    print('');

    initializeGame();

    print('Your mission: Destroy ' + game.cardassiansRemaining + ' Cardassian warships in ' +
          (game.stardate.end - game.stardate.start).toFixed(0) + ' stardates.');
    print('');
    print('The galaxy is divided into an 8x8 grid of quadrants.');
    print('Each quadrant contains an 8x8 grid of sectors.');
    print('');
    print('There are ' + game.starbasesRemaining + ' starbases in the galaxy for resupply.');
    print('Subspace anomalies detected - ' + game.wormholes.length + ' wormholes reported.');

    // Show assigned bridge crew
    showCrewRoster();

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
    start: startOrResume,
    print: print,
    clear: clearOutput,
    setLogEditor: setLogEditor
};
