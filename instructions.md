# nino.buzz - Project Notes

## ✅ SECURITY VULNERABILITIES - FIXED (2026-02-03)

The following security issues were identified in a security audit (2026-02-02) and have been addressed:

### Critical - FIXED
1. **~~Exposed Firebase API Key~~** - Firebase Security Rules configured, API key restricted
   - Rules restrict access to `/scrabble/{roomCode}` only
   - Validates room code format, player names, data structure
   - API key has HTTP referrer restriction: only works from `nino.buzz/*` and `www.nino.buzz/*`

2. **~~XSS via Player Names~~** - Fixed in `scrabble.html`
   - Changed `innerHTML` to `createElement` + `textContent` for all player name rendering

3. **~~XSS via External APIs~~** - Fixed in `scrabble.html` and `index.html`
   - Dictionary definitions and RSS feed content now use safe DOM methods

### High - FIXED
4. **~~IP Tracking Without Consent~~** - Fixed in `js/analytics.js`
   - Removed IP tracking entirely; analytics now only logs anonymized data (page, referrer, language, screen size)

5. **~~No SRI on CDN Scripts~~** - Fixed in `chess.html` and `startrek.html`
   - Added `integrity` and `crossorigin` attributes to external script tags

### Medium - FIXED
6. **~~Insufficient Input Validation~~** - Fixed in `scrabble.html`
   - Added `validatePlayerName()` function: max 20 chars, alphanumeric + spaces/hyphens/underscores only

7. **~~Missing Security Headers~~** - Fixed in all HTML files
   - Added `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff` meta tags

---

## Overview
nino.buzz is a fun personal website with a retro 90s aesthetic (Comic Sans on desktop, Arial on mobile, neon colors, blinking text, custom cursor). Hosted on GitHub Pages.

## Current Status
- **Site is live** at https://nino.buzz
- **Next task:** Implement Super Star Trek game (see `startrek-implementation-plan.md`)

## Repository Structure
```
├── index.html              # Homepage (notes, news feed)
├── games.html              # Games index (Chess, Scrabble, Star Trek)
├── chess.html              # Chess vs Stockfish AI + mate puzzles
├── scrabble.html           # Scrabble multiplayer (2-4 players, Firebase)
├── startrek.html           # Star Trek (skeleton only - needs implementation)
├── links.html              # Links page
├── style/
│   └── default-style.css   # Retro styling
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
- [x] Homepage with notes and news sections
- [x] News feed (BBC, NPR, The Onion via RSS)
- [x] Personal notes (saved to localStorage)
- [x] Music player (26 retro tracks, random play)
- [x] Games: Chess (vs AI + puzzles), Scrabble (multiplayer)
- [x] Links page
- [x] Wider layout (1040px)
- [x] Mobile-friendly fonts

## Feature Wishlist (remaining)
- [ ] **Super Star Trek** - Full implementation (see `startrek-implementation-plan.md`)
- [x] **Scrabble mobile optimization** - Touch interactions, larger tiles, compact layout
- [x] **Chess** - vs computer using Stockfish.js (see `chess-implementation-plan.md`)
- [x] **Scrabble** - 2-4 player online (see `scrabble-implementation-plan.md`)
- [ ] "Login" page (novelty/fake)
- [ ] Style and background color tweaks
- [ ] Horoscope
- [ ] Recipe generator
- [ ] Requests button

## Technical Notes

### Chess (Implemented)
- **chess.js v0.12.0** (CDN) for move validation and game state
- **Stockfish.js v10** (~1.5MB, local) for AI via Web Worker
- 5 difficulty levels (Beginner to Expert) - tuned to be more accessible
- Custom CSS Grid board with traditional tan/brown colors
- Click-to-move and algebraic notation text input
- **Mating Puzzles mode:**
  - 121 verified puzzles (mix of mate-in-2 and mate-in-3)
  - Puzzles selected randomly each time
  - Two puzzle formats supported: with setup move (original) and direct solution (newer)
  - Classic patterns: back rank, smothered, Arabian, Anastasia's, Boden's, etc.

### Scrabble Multiplayer (Implemented)
- **Firebase Realtime Database** for real-time game state sync
- 2-4 players with room code system (4-letter codes)
- Room code displayed on game screen for easy sharing/rejoining
- **Automatic word validation** using TWL06 dictionary with definitions from Free Dictionary API
- Challenge system with proper penalties:
  - Invalid word: tiles returned to player's rack, drawn tiles go back to bag
  - Valid word: challenger loses their next turn
- Full implementation: board, tile bag, turn rotation, scoring, blank tiles
- **Game persistence features:**
  - Sessions saved to localStorage (roomCode → playerId mapping)
  - Recent Games list on menu shows all players and game status
  - Can rejoin games by entering room code (matches by stored session or player name)
  - Supports asynchronous play - leave and come back anytime
- **Gallery** for finished games:
  - Board screenshot captured to canvas when game ends
  - Stored in localStorage (up to 20 games)
  - Shows winner, all scores, and date
- Reconnection support for disconnected players
- **Mobile optimization:**
  - Both tap-to-place AND drag-and-drop supported (10px threshold distinguishes tap from drag)
  - Board cells sized dynamically: `calc((100vw - 40px) / 15)`
  - Rack tiles: 40×40px with 22px font for easy tapping
  - Confirmation dialogs for Pass and Swap actions
  - Play Word button: full-width, larger, separated from other controls
  - Compact layout fits "Your turn" through "Play Word" without scrolling
  - Tile distribution hidden on mobile to save space
- See `scrabble-implementation-plan.md` for original design doc

### Scrabble - Known Issues / TODO
- [ ] Test challenge flow edge cases
- [ ] Test reconnection in various scenarios
- [ ] Gallery screenshots render at fixed size - may need scaling

## Workflow
- Claude can push directly to main branch
- Changes deploy automatically via GitHub Pages
- Large files may need `git config http.postBuffer 524288000` before push

## Code Patterns

### Mobile Font Handling
- Desktop uses Comic Sans MS; mobile (≤600px in default-style.css) uses Arial
- Game pages with inline `<style>` blocks need their own `@media` queries for font overrides
- Pattern: add `font-family: Arial, Helvetica, sans-serif;` to buttons/inputs in mobile media query
- Chess uses 700px breakpoint; Scrabble uses 500px breakpoint

### Touch vs Click on Mobile
- Scrabble uses a tap-vs-drag detection pattern for touch events
- `dragState` tracks `startX`, `startY`, `isDragging`
- Movement beyond `DRAG_THRESHOLD` (10px) triggers drag mode
- If no drag occurred on touchend, call the equivalent click handler
- Don't call `e.preventDefault()` in touchstart; only in touchmove after drag threshold exceeded

### Chess Puzzle Format
Two formats supported in `MATING_PUZZLES` array:
1. **With setup move** (original): `{ fen, moves: [setupMove, ...solution], mateIn }`
   - FEN is position BEFORE opponent's setup move
   - `moves[0]` is opponent's move that creates the puzzle
   - Remaining moves alternate: player, opponent, player...
2. **Direct solution** (newer): `{ fen, solution: [...moves], mateIn }`
   - FEN is the starting position (player to move)
   - `solution` contains only the solving moves
   - Moves in UCI format: "e2e4", "e7e8q" (with promotion)

## Music Credits
All music by Kevin MacLeod (incompetech.com) - Licensed under CC BY 4.0
