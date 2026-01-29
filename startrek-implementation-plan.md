# Super Star Trek Implementation Plan

## Overview

Faithful recreation of the classic 1978 Super Star Trek text-based game for nino.buzz. Pure JavaScript implementation with terminal-style interface.

**Target file structure:**
```
startrek.html          # UI (exists, needs fixes)
js/startrek-engine.js  # Game logic (new)
```

**Estimated size:** ~100-150KB total (well within GitHub Pages limits)

---

## Phase 1: Foundation

### 1.1 Game Constants
```javascript
const GALAXY_SIZE = 8;        // 8x8 quadrants
const QUADRANT_SIZE = 8;      // 8x8 sectors per quadrant
const INITIAL_ENERGY = 3000;
const INITIAL_TORPEDOES = 10;
const INITIAL_STARDATES = 30; // Time limit
```

### 1.2 Data Structures

**Galaxy State:**
```javascript
galaxy = {
    quadrants: [8][8] = {
        klingons: 0-3,
        starbases: 0-1,
        stars: 1-8,
        explored: false
    }
}
```

**Quadrant State (current quadrant detail):**
```javascript
quadrant = {
    sectors: [8][8] = 'E' | 'K' | '*' | 'B' | '.'
    klingons: [{ sector_x, sector_y, energy }]
}
```

**Ship State:**
```javascript
ship = {
    quadrant: { x, y },
    sector: { x, y },
    energy: 3000,
    shields: 0,
    torpedoes: 10,
    docked: false,
    damage: {
        warpEngines: 0,
        shortRangeSensors: 0,
        longRangeSensors: 0,
        phasers: 0,
        torpedoes: 0,
        shields: 0,
        computer: 0,
        subspaceRadio: 0
    }
}
```

**Game State:**
```javascript
game = {
    stardates: { current, remaining },
    klingons: { total, remaining },
    starbases: { total, remaining },
    condition: 'GREEN' | 'YELLOW' | 'RED' | 'DOCKED',
    gameOver: false,
    won: false
}
```

### 1.3 Initialization
- Generate galaxy with random distribution:
  - Total Klingons: 15-25
  - Total starbases: 2-4
  - Stars: 1-8 per quadrant
- Place Enterprise in random quadrant/sector
- Calculate time limit based on Klingon count
- Generate current quadrant detail

---

## Phase 2: Display Systems

### 2.1 Short Range Scan (SRS)
```
    1 2 3 4 5 6 7 8
  +-----------------+
1 | . . * . . . . . |
2 | . . . . K . . . |
3 | . . . E . . . . |
4 | . * . . . . * . |
5 | . . . . . . . . |
6 | . . B . . . . . |
7 | . . . . . K . . |
8 | . . . * . . . . |
  +-----------------+

Condition: RED
Quadrant: [3, 5]
Sector: [4, 3]
Energy: 2450
Shields: 500
Torpedoes: 8
Klingons: 2
```

**Symbols:**
- `E` = Enterprise
- `K` = Klingon
- `B` = Starbase
- `*` = Star
- `.` = Empty space

### 2.2 Long Range Scan (LRS)
```
Long Range Scan for Quadrant [3, 5]

    4   5   6
  +---+---+---+
2 |005|013|102|
  +---+---+---+
3 |000|024|008|
  +---+---+---+
4 |006|103|017|
  +---+---+---+

(Klingons/Bases/Stars)
```

Format: Three digits = Klingons/Starbases/Stars (e.g., "024" = 0 Klingons, 2 bases, 4 stars)

### 2.3 Status Display
Show after each command:
- Current stardate and time remaining
- Condition (GREEN/YELLOW/RED/DOCKED)
- Position
- Energy/Shields/Torpedoes
- Klingons remaining

---

## Phase 3: Navigation

### 3.1 NAV Command
```
Course (1-8.99): _
Warp Factor (0.1-8): _
```

**Course directions:**
```
    4   3   2
     \  |  /
  5 ---+--- 1
     /  |  \
    6   7   8
```

**Warp mechanics:**
- Warp 1 = 1 quadrant
- Warp 0.1-0.99 = movement within quadrant (impulse)
- Energy cost = warp factor * 8 (approximately)
- Damaged warp engines limit max warp

**Collision detection:**
- Stars block movement (damage if hit)
- Edge of galaxy blocks movement
- Klingons block movement

### 3.2 Movement Algorithm
1. Calculate distance and direction
2. Check for obstacles along path
3. If crossing quadrant boundary, enter new quadrant
4. Generate new quadrant if needed
5. Deduct energy
6. Klingons attack after movement

---

## Phase 4: Combat

### 4.1 Phasers (PHA)
```
Phasers locked on target.
Energy to fire: _
```

**Mechanics:**
- Energy distributed among all Klingons in quadrant
- Damage = (energy / klingon_count) / distance_factor
- Distance reduces effectiveness
- Shields affect damage to Klingons slightly
- Can destroy Klingons when their energy reaches 0

### 4.2 Torpedoes (TOR)
```
Torpedo course (1-8.99): _
```

**Mechanics:**
- Travel in straight line until hitting something
- Destroy Klingon in one hit
- Hitting a star destroys the star (dangerous!)
- Hitting a starbase destroys it (very bad!)
- Can miss if course is off
- Limited supply (10 initially)

### 4.3 Klingon Attacks
After Enterprise action, each Klingon fires:
- Damage = klingon_energy / distance * random_factor
- Shields absorb damage first
- Excess damage depletes energy and causes system damage
- Random system damaged based on severity

### 4.4 Shields (SHE)
```
Shield Control: Energy to shields: _
```

- Transfer energy to/from shields
- Shields absorb Klingon attacks
- Cannot fire through shields? (optional rule)

---

## Phase 5: Ship Systems & Damage

### 5.1 Damage Model
Eight systems can be damaged:

| System | Effect When Damaged |
|--------|---------------------|
| Warp Engines | Max warp reduced |
| Short Range Sensors | SRS unavailable/degraded |
| Long Range Sensors | LRS unavailable |
| Phasers | Cannot fire phasers |
| Photon Torpedoes | Cannot fire torpedoes |
| Shields | Cannot raise shields |
| Computer | Computer functions unavailable |
| Subspace Radio | Cannot call for help (flavor) |

Damage values: 0 = working, negative = damaged (turns to repair)

### 5.2 Damage Report (DAM)
```
DAMAGE REPORT:

Warp Engines:        Operational
Short Range Sensors: DAMAGED - 2.3 stardates to repair
Long Range Sensors:  Operational
Phasers:             DAMAGED - 0.5 stardates to repair
Photon Torpedoes:    Operational
Shields:             Operational
Computer:            Operational
Subspace Radio:      Operational
```

### 5.3 Repair
- Systems repair slowly over time (each move)
- Docking at starbase repairs all systems instantly
- Docking also restores energy and torpedoes

### 5.4 Docking (DOC)
- Must be adjacent to starbase (within 1 sector)
- Fully repairs ship
- Restores energy to max
- Restores torpedoes to 10
- Sets condition to DOCKED

---

## Phase 6: Computer Functions

### 6.1 Computer Menu (COM)
```
Computer Functions:
  0 - Cumulative Galactic Record
  1 - Status Report
  2 - Torpedo Data (direction to Klingons)
  3 - Starbase Navigation Data
  4 - Direction/Distance Calculator

Computer command: _
```

### 6.2 Functions
1. **Galactic Record** - Shows explored quadrants (like LRS but full galaxy)
2. **Status Report** - Klingons remaining, starbases, time left
3. **Torpedo Data** - Calculates exact course to each Klingon
4. **Starbase Nav** - Direction/distance to nearest starbase
5. **Calculator** - Direction/distance between any two points

---

## Phase 7: Game Flow

### 7.1 Win Condition
- All Klingons destroyed
- Display victory message with stats

### 7.2 Lose Conditions
- Enterprise destroyed (energy depleted, fatal damage)
- Time runs out (stardates exhausted)
- All starbases destroyed (no resupply possible with Klingons remaining)

### 7.3 Game Loop
```
1. Display prompt
2. Get command
3. Parse and validate
4. Execute command
5. If movement/combat: Klingons attack
6. Repair tick (if time passed)
7. Check win/lose conditions
8. Update condition (GREEN/YELLOW/RED)
9. Repeat
```

### 7.4 Condition Colors
- **GREEN** - No Klingons in quadrant
- **YELLOW** - Low energy (<300) or Klingons nearby
- **RED** - Klingons in current quadrant
- **DOCKED** - Adjacent to starbase

---

## Phase 8: UI Integration

### 8.1 Fix Existing startrek.html
- Change `retro-style.css` to `style/default-style.css`
- Remove jQuery dependency (use vanilla JS)
- Add nav music player for consistency
- Link to new engine file

### 8.2 Output Formatting
- All output via `print(text)` function
- Support for clearing screen
- Auto-scroll to bottom
- Preserve command history

### 8.3 Input Handling
- Command input at bottom
- Enter to submit
- Support multi-step inputs (course, then warp factor)
- Input validation with helpful errors

---

## Implementation Order

**Session 1: Core Foundation**
1. [ ] Data structures and constants
2. [ ] Galaxy generation
3. [ ] Ship initialization
4. [ ] Basic game state
5. [ ] SRS display

**Session 2: Navigation & Display**
1. [ ] LRS display
2. [ ] NAV command (movement within quadrant)
3. [ ] NAV command (quadrant transitions)
4. [ ] Collision detection
5. [ ] Status display

**Session 3: Combat**
1. [ ] Phasers
2. [ ] Torpedoes
3. [ ] Klingon AI/attacks
4. [ ] Shields
5. [ ] Damage system

**Session 4: Polish**
1. [ ] Starbase docking
2. [ ] Computer functions
3. [ ] Win/lose conditions
4. [ ] Help text
5. [ ] UI fixes and testing

---

## Testing Checklist

- [ ] Galaxy generates with correct totals
- [ ] Movement works within quadrant
- [ ] Movement works between quadrants
- [ ] Phasers damage/destroy Klingons
- [ ] Torpedoes travel correctly
- [ ] Klingons attack after player action
- [ ] Shields absorb damage
- [ ] Systems can be damaged
- [ ] Docking repairs and resupplies
- [ ] Game ends on victory
- [ ] Game ends on defeat
- [ ] All commands parse correctly
- [ ] Invalid input handled gracefully

---

## Reference

Original BASIC source: https://github.com/coding-horror/basic-computer-games/blob/main/84_Super_Star_Trek/superstartrek.bas

This plan based on the 1978 "Super Star Trek" variant by Bob Leedom, which expanded on the original 1971 Star Trek game by Mike Mayfield.
