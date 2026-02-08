# nino.buzz - Project Notes

## Overview
nino.buzz is a fun personal website with a retro 90s aesthetic (Comic Sans, neon colors, blinking text). Hosted on GitHub Pages.

## Current Status
- **Site is live** at https://nino.buzz

### Next Tasks
1. **Chess puzzles** - Complete replacement with verified historical puzzles (~168 remaining), add puzzle info display
2. **Super Star Trek** - Implement game (see `startrek-implementation-plan.md`)

## Repository Structure
```
├── index.html              # Homepage (notes, horoscope, moon phase, news feed)
├── games.html              # Games index (Scrabble, Chess, Star Trek)
├── chess.html              # Chess vs Stockfish AI + mate puzzles
├── scrabble.html           # Scrabble multiplayer (2-4 players, Firebase)
├── startrek.html           # Star Trek (under construction)
├── links.html              # Links page (quirky/interesting sites)
├── style/
│   └── default-style.css   # Retro styling + Comic Neue web font
├── sst.js                  # Super Star Trek game engine
├── js/
│   ├── analytics.js        # Firebase analytics
│   └── stockfish.min.js    # Chess AI engine (~1.5MB)
├── music/                  # 26 MP3 tracks (~166MB)
├── CNAME                   # Custom domain config (nino.buzz)
├── startrek-implementation-plan.md  # Detailed plan for Star Trek game
├── chess-implementation-plan.md     # Detailed plan for Chess game
├── scrabble-implementation-plan.md  # Design doc for Scrabble multiplayer
└── README.txt              # Original feature wishlist

# Deprecated (still exist but removed from games list):
├── hangman.html            # Hangman game
├── tictactoe.html          # Tic-Tac-Toe game
├── guess-number.html       # Guess the Number game
```

## Features Implemented

### Homepage Features
- [x] Personal notes (saved to localStorage)
- [x] Daily horoscope (via horoscope-app-api.vercel.app, proxied through allorigins.win for CORS)
- [x] Moon phase widget (calculated locally, displays current lunar phase)
- [x] Random Wikipedia button (links to Special:Random)
- [x] News feed (BBC, NPR, The Onion via RSS) - collapsed by default
- [x] Elder Scrolls VI Updates (Google News RSS) - auto-scrolling text box
- [x] Visitor counter (localStorage-based with 8653 offset)
- [x] Birthday banner (Feb 3-4 Eastern Time)
- [x] Music player (26 retro tracks, random play)

### Desktop Layout
- Horoscope and Moon Phase widgets appear side-by-side (`.widgets-row` flex container)
- Horoscope takes 2/3 width, Moon Phase takes 1/3 width
- On mobile (≤600px), they stack vertically

### Games
- [x] Chess - vs computer using Stockfish.js + mating puzzles
- [x] Scrabble - 2-4 player online multiplayer
- [x] Super Star Trek - core gameplay complete (navigation, combat, replicator buffs, crew, self-destruct)

### Other Pages
- [x] Links page - curated list of quirky/interesting websites
- [x] Games index page

## Feature Wishlist (remaining)
- [~] **Super Star Trek** - Core complete, see future feature ideas in Star Trek section
- [ ] "Login" page (novelty/fake)
- [ ] Recipe generator
- [ ] Requests button

## Technical Notes

### Font Handling
- **Comic Neue** web font imported from Google Fonts (provides Comic Sans on mobile)
- Font stack: `"Comic Sans MS", "Comic Sans", "Comic Neue", cursive, sans-serif`
- Desktop uses native Comic Sans MS; mobile falls back to Comic Neue
- All font declarations should use this full stack to avoid cursive fallback issues

### Horoscope API
- Endpoint: `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign={sign}&day=TODAY`
- Proxied through `https://api.allorigins.win/raw?url=` to avoid CORS issues
- User must select their sign each visit (not persisted)

### Moon Phase Calculation
- Calculated client-side based on days since known new moon (Jan 6, 2000)
- Lunar period: 29.53 days
- Returns one of 8 phases with corresponding emoji

### Birthday Banner
- Shows Feb 3-4 in Eastern Time (uses `toLocaleDateString` with `America/New_York` timezone)
- Text is 32px on desktop, 24px on mobile

### Elder Scrolls VI Updates Widget
- Uses Google News RSS: `news.google.com/rss/search?q=elder+scrolls+vi`
- Auto-scrolling text box with CSS animation (`tes6-scroll-up`)
- Content is duplicated in JS for seamless loop (scrolls to -50%)
- Animation only starts after content loads (JS adds `.scrolling` class)
- Desktop: 20s scroll duration; Mobile: 25s scroll duration
- Pauses on hover

### Chess Pieces on Mobile
- Unicode chess symbols use text presentation selector (`\uFE0E`) to prevent emoji rendering
- Example: `'♔\uFE0E'` instead of `'♔'`

### Mobile Layout
- Main breakpoint: 600px in default-style.css
- Mobile removes body padding and makes container full-width
- Left/right borders removed on mobile for edge-to-edge appearance
- Chess uses 700px breakpoint; Scrabble uses 500px breakpoint

### External APIs Used
- **Horoscope:** horoscope-app-api.vercel.app (free, no key)
- **RSS Proxy:** api.rss2json.com
- **CORS Proxy:** api.allorigins.win
- **Google News RSS:** news.google.com/rss/search (for Elder Scrolls VI news)
- **Firebase:** For Scrabble multiplayer and analytics

---

## Chess (Implemented)
- **chess.js v0.12.0** (CDN) for move validation and game state
- **Stockfish.js v10** (~1.5MB, local) for AI via Web Worker
- 5 difficulty levels using **depth limits** (not time-based):
  - Beginner: depth 1, skill 0
  - Easy: depth 2, skill 0
  - Medium: depth 3, skill 3
  - Hard: depth 5, skill 5
  - Expert: depth 8, skill 10
- Click-to-move and algebraic notation text input
- **Mating Puzzles mode:** Mix of verified historical puzzles and generated puzzles (marked "work in progress" in UI)
- **Mobile:** Full-width board, pieces at 72% of square size, game over shows "Back to Chess" and "Home" buttons

### Chess Puzzle Format
Two formats supported in `MATING_PUZZLES` array:
1. **Historical (new):** `{ players, location, year, fen, solution: [...sanMoves], mateIn }`
2. **Generated (legacy):** `{ id, fen, moves: [setupUciMove, ...uciMoves], mateIn }`

### Chess Puzzle TODO
- [ ] Complete replacement of generated puzzles with verified historical puzzles (partially done - ~32 of 200 replaced)
- [ ] Add display of puzzle info (players, location, year) to the UI

---

## Scrabble Multiplayer (Implemented)
- **Firebase Realtime Database** for real-time game state sync
- 2-4 players with room code system (4-letter codes)
- **Menu layout:** Two-column Create Game / Join Game selection, inputs appear after choice
- **Automatic word validation** using TWL06 dictionary with definitions from Free Dictionary API
- Challenge system with proper penalties
- Game persistence via localStorage (per-device, not shared between desktop/mobile)
- **Recent Games:** Shows only in-progress/lobby games (finished games filtered out, shown in Gallery)
- Gallery for finished games (screenshots stored in localStorage)
- **Mobile optimization:** tap-to-place AND drag-and-drop supported

### Scrabble - Known Issues / TODO
- [ ] Test challenge flow edge cases
- [ ] Test reconnection in various scenarios

---

## Super Star Trek (Core Complete)

Recreation of the classic 1978 text-based game. Terminal-style interface with green text on dark blue. Note: This is an alternate version - "Cardassian Wars" themed (enemies are Cardassians, not Klingons).

### Implemented Features
- **Galaxy generation:** 8x8 quadrants, each with 8x8 sectors
- **Enemies:** 15-25 Cardassians randomly placed (max 3 per quadrant)
- **Starbases:** 2-4 for resupply and repair
- **Navigation:**
  - `WARP x, y` - Move between quadrants (positive X = right, positive Y = up)
  - `IMPULSE x, y` - Move within current quadrant
- **Scanning:**
  - `SRSCAN` - View current quadrant (8x8 sector grid) + Cardassian positions/energy
  - `LRSCAN` - View adjacent quadrants
  - `STARMAP` - View entire galaxy map
- **Combat:**
  - `PHASERS n` - Fire phasers with n energy (distributed among enemies, damage decreases with distance)
  - `TORPEDOES x, y` - Fire torpedo at sector coordinates (instant kill, limited supply)
- **Ship Systems:**
  - Energy (starts at 3000)
  - Shields (automatic, starts at 1000, absorb damage)
  - Torpedoes (10)
  - 8 systems that can be damaged and repaired
- **Replicator (COMPUTER command):** Crew buffs with Star Trek flavor
  - "Coffee, black" - 30% reduced energy costs
  - "Tea, Earl Grey, hot" - Double repair rate
  - "Raktajino" - 50% phaser damage boost
  - "Prune juice" - Shield regeneration
- **Docking:** `DOCK` at starbases restores energy, shields, torpedoes, repairs systems
- **Save/Load:** `SAVE` persists game state to localStorage; resume prompt on page load
- **Captain's Log:** `LOG` opens modal notepad for personal notes (persisted with save)
- **Enemy attacks:** Automatic after player movement, damage shields then hull
- **Win/lose conditions:** Destroy all enemies, or lose by running out of energy/time
- **Named Starbase Commanders:** Each starbase has a unique named commander (from pool of 12) who greets on dock
- **Self-Destruct (`SELFDESTRUCT`):** Dramatic countdown, destroys all Cardassians in quadrant. Two outcomes:
  - Starbases remain: Escape pod reaches nearest starbase, commander assigns mysterious "ghost ship" (USS Enterprise-A). Ship fully restored, `game.ghostShip` flag set for future subplot.
  - No starbases: Escape pod captured by Cardassians, "To be continued...", game over.
- **Named Bridge Crew:** 20 crew members across 5 roles, randomly assigned at game start. Each has flavor text description and hidden stat modifiers. `CREW` command to view roster; swap crew when docked at starbases.

### Bridge Crew System
5 bridge roles with 4 candidates each (20 total). Players see personality descriptions, not numbers.

| Role | Stats Affected | Example Tradeoff |
|------|---------------|------------------|
| Helm | Warp/impulse energy costs | Great at warp, rough on short hops |
| Tactical | Phaser damage, torpedo accuracy | Dead-eye phasers, shaky torpedoes |
| Engineering | Repair speed, shield efficiency | Fast repairs, weak shields |
| Science | LRS range (±1 or ±2), SRS damage compensation | Extended range, misses close detail |
| Communications | Buff duration, dock resupply efficiency | High morale, poor supply logistics |

- Torpedo accuracy: base 85%, modified by tactical crew (new miss mechanic)
- Shield efficiency: better engineer = shields drain slower per hit
- Dock efficiency: multiplier on energy/shields restored when docking
- Science scan detail: compensates for minor SRS damage (< 2 stardates)
- Starbase crew pools: each starbase has 2-3 crew for swapping (`CREW SWAP [role] [number]`)
- Crew survives self-destruct (transfers to ghost ship)

### Commands
```
WARP x, y      - Warp between quadrants
IMPULSE x, y   - Move within quadrant
SRSCAN         - Short range scan (shows enemy positions)
LRSCAN         - Long range scan
STARMAP        - Full galaxy map
PHASERS n      - Fire phasers with n energy
TORPEDOES x, y - Fire torpedo at sector x, y
COMPUTER       - Replicator menu (crew buffs)
SHIELDS        - View shield status
DAMAGE         - Damage report
STATUS         - Mission status
DOCK           - Dock at starbase
CREW           - View bridge crew (swap at starbase)
SELFDESTRUCT   - Self-destruct (last resort!)
SAVE           - Save game
LOG            - Captain's log (personal notes)
HELP           - Command list
NEW            - New game
```

### Future Feature Ideas

#### 1. Cardassian Reskin (DONE)
Klingons replaced with Cardassians throughout. Symbol changed from K to C. Raktajino flavor text kept as "Klingon coffee" (it's a cultural reference, not an enemy reference).

#### 2. Random Encounters / Away Missions (Medium)
Trigger random events when entering certain quadrants or after certain actions. Examples:
- Distress beacon from disabled ship (investigate for rewards/crew)
- Anomaly scan (science mini-game, risk/reward)
- Diplomatic encounter with neutral species
- Derelict ship exploration (away team risk)
- **Feasibility:** Medium - need event system, outcome tables, possibly mini-game UI.

#### 3. Cardassian Commander Skill Levels (Medium)
Give enemy ships different AI behaviors based on commander rank:
- **Glinn (ensign):** Basic, predictable attacks
- **Gil:** More aggressive, occasional tactical moves
- **Gul:** Smart targeting (damaged systems), evasive maneuvers
- **Legate:** Elite tactics, calls for reinforcements
- **Feasibility:** Medium - enhance enemy AI, add commander data to ship objects.

#### 4. Cardassian Mothership / Final Boss (Medium-Hard)
A powerful Cardassian flagship commanded by a Gul or Legate that roams the galaxy:
- Much higher shields/weapons than regular ships
- Appears on STARMAP as special icon
- May need to be weakened through multiple encounters
- Defeating it could be alternate win condition or bonus objective
- **Feasibility:** Medium - special ship type, boss mechanics, possibly multi-phase fight.

#### 5. Distress Signals / Timed Events (Medium)
Starbases or allied ships send distress calls that must be answered within X stardates:
- "Starbase 4 under attack - 3 stardates to respond"
- Failure = starbase destroyed (lose resupply point)
- Success = bonus rewards, reputation
- Creates urgency and strategic decisions
- **Feasibility:** Medium - event queue, countdown system, notification UI.

#### 6. Allied Federation Ships (Medium-Hard)
Other Federation vessels fighting in the war:
- Appear on scans, can be hailed
- May assist in combat if in same quadrant
- Can be escorted/protected for bonus objectives
- Could request supplies from your ship
- Named ships with captains (Easter eggs: USS Defiant, USS Voyager, etc.)
- **Feasibility:** Medium-Hard - NPC ship AI, ally combat system, dialogue.

#### 7. Self-Destruct (DONE)
`SELFDESTRUCT` command with dramatic countdown. Destroys all Cardassians in quadrant. If starbases remain, player respawns at nearest starbase with mysterious ghost ship (Enterprise-A) and named commander dialogue. If no starbases, captured by Cardassians ("To be continued..."). Ghost ship flag (`game.ghostShip`) planted for future subplot (mysterious damage events, strange readings, etc.). Abandon Ship and Eject Warp Core could still be added as separate commands.

#### Additional Ideas (Claude's suggestions)

#### 8. Nebulae and Terrain (Medium)
Quadrants could contain nebulae that affect gameplay:
- Sensor interference (can't see enemy positions clearly)
- Weapons dampening (reduced phaser effectiveness)
- Shield disruption (shields drain faster)
- Hiding spots (enemies can't target you either)
- **Feasibility:** Medium - quadrant properties, modifier system.

#### 9. Cloaking Device (Easy-Medium) — save for Random Encounters
Limited-use stealth ability, planned as a reward for completing a random encounter:
- Avoid combat when entering dangerous quadrants
- Can't fire weapons while cloaked
- Uses significant energy
- Acquired as reward from away mission / random encounter
- **Feasibility:** Easy-Medium - state flag, energy drain, combat skip logic.

#### 10. Ship Upgrades at Starbases (Medium)
Spend resources/time to improve the Enterprise:
- Enhanced phasers (more damage)
- Torpedo bay expansion (carry more torpedoes)
- Improved shields (higher max)
- Better sensors (see further on LRSCAN)
- **Feasibility:** Medium - upgrade system, resource tracking, UI for purchase.

#### 11. Named Crew Members (DONE — injuries TBD)
20 crew across 5 bridge roles (Helm, Tactical, Engineering, Science, Communications). Each has hidden stat modifiers and flavor-text descriptions. Randomly assigned at game start, swappable at starbases. Crew survives self-destruct.

**Future: Crew Injuries** — When ship takes damage, crew member's console sends a shower of sparks (like the show). Injured crew go to sick bay for a duration depending on severity. Reduces/removes their buff until healed. Not yet implemented.

#### 12. Captain's Log (DONE)
Manual notepad via LOG command - opens modal textarea for personal notes. Notes persist with SAVE and display on game resume. Future: holodeck-themed save/load language.

#### 13. Wormholes (DONE)
3-4 wormholes placed randomly, connected in a one-way circuit (A→B→C→A). Sector symbol `@`, fly into with IMPULSE. ~20% chance of minor turbulence damage. Discovered wormholes shown on STARMAP with `~` markers and circuit info in legend.

---

## Security Notes (Fixed 2026-02-03)
All security issues from audit have been addressed:
- Firebase Security Rules configured, API key restricted to nino.buzz domains
- XSS vulnerabilities fixed (using createElement + textContent instead of innerHTML)
- IP tracking removed from analytics
- SRI added to CDN scripts
- Input validation added for player names
- Security headers added to all HTML files

---

## Workflow
- Claude can push directly to main branch
- Changes deploy automatically via GitHub Pages
- Large files may need `git config http.postBuffer 524288000` before push

## Music Credits
All music by Kevin MacLeod (incompetech.com) - Licensed under CC BY 4.0
