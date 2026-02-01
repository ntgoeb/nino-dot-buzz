# nino.buzz - Project Notes

## Overview
nino.buzz is a fun personal website with a retro 90s aesthetic (Comic Sans on desktop, Arial on mobile, neon colors, blinking text, custom cursor). Hosted on GitHub Pages.

## Current Status
- **Site is live** at https://nino.buzz
- **Next task:** Make Scrabble mobile-friendly and test for bugs
- **Future project:** Implement Super Star Trek game (see `startrek-implementation-plan.md`)

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
- [x] News feed (BBC + NPR via RSS)
- [x] Personal notes (saved to localStorage)
- [x] Music player (26 retro tracks, random play)
- [x] Games: Chess (vs AI + puzzles), Scrabble (multiplayer)
- [x] Links page
- [x] Wider layout (1040px)
- [x] Mobile-friendly fonts

## Feature Wishlist (remaining)
- [ ] **Super Star Trek** - Full implementation (see `startrek-implementation-plan.md`)
- [ ] **Scrabble mobile optimization** - Test and fix mobile layout/touch interactions
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
- Mating Puzzles mode with verified puzzles from Lichess database (mate-in-2 and mate-in-3 mixed)

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
- See `scrabble-implementation-plan.md` for original design doc

### Scrabble - Known Issues / TODO
- [ ] Mobile layout needs testing and optimization
- [ ] Touch interactions may need improvement (drag-and-drop?)
- [ ] Test challenge flow edge cases
- [ ] Test reconnection in various scenarios
- [ ] Gallery screenshots render at fixed size - may need scaling

## Workflow
- Claude can push directly to main branch
- Changes deploy automatically via GitHub Pages
- Large files may need `git config http.postBuffer 524288000` before push

## Music Credits
All music by Kevin MacLeod (incompetech.com) - Licensed under CC BY 4.0
