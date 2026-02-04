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
├── games.html              # Games index (Chess, Scrabble, Star Trek)
├── chess.html              # Chess vs Stockfish AI + mate puzzles
├── scrabble.html           # Scrabble multiplayer (2-4 players, Firebase)
├── startrek.html           # Star Trek (under construction)
├── links.html              # Links page (quirky/interesting sites)
├── style/
│   └── default-style.css   # Retro styling + Comic Neue web font
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
- [x] Birthday banner (Feb 3-4 Eastern Time) with pixel art sprite running man
- [x] Music player (26 retro tracks, random play)

### Desktop Layout
- Horoscope and Moon Phase widgets appear side-by-side (`.widgets-row` flex container)
- Horoscope takes 2/3 width, Moon Phase takes 1/3 width
- On mobile (≤600px), they stack vertically

### Games
- [x] Chess - vs computer using Stockfish.js + mating puzzles
- [x] Scrabble - 2-4 player online multiplayer
- [ ] Super Star Trek - under construction (has styled page with banner)

### Other Pages
- [x] Links page - curated list of quirky/interesting websites
- [x] Games index page

## Feature Wishlist (remaining)
- [ ] **Super Star Trek** - Full implementation (see `startrek-implementation-plan.md`)
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
- Pixel art sprite running man (4-frame SVG sprite sheet embedded as data URI)
- Sprite uses CSS `steps(4)` animation for frame cycling
- Runs back and forth using `scaleX(-1)` to mirror when changing direction
- Has bounce animation (moves up/down while running)
- Text is 32px on desktop, 24px on mobile

### Elder Scrolls VI Updates Widget
- Uses Google News RSS: `news.google.com/rss/search?q=elder+scrolls+vi`
- Auto-scrolling text box with CSS animation (`tes6-scroll-up`)
- Content is duplicated in JS for seamless loop (scrolls to -50%)
- Desktop: 30s scroll duration; Mobile: 15s scroll duration
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
- **Mating Puzzles mode:** Mix of verified historical puzzles and generated puzzles
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
- **Automatic word validation** using TWL06 dictionary with definitions from Free Dictionary API
- Challenge system with proper penalties
- Game persistence via localStorage
- Gallery for finished games (screenshots stored in localStorage)
- **Mobile optimization:** tap-to-place AND drag-and-drop supported

### Scrabble - Known Issues / TODO
- [ ] Test challenge flow edge cases
- [ ] Test reconnection in various scenarios

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
