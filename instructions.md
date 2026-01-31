# nino.buzz - Project Notes

## Overview
nino.buzz is a fun personal website with a retro 90s aesthetic (Comic Sans on desktop, Arial on mobile, neon colors, blinking text, custom cursor). Hosted on GitHub Pages.

## Current Status
- **Site is live** at https://nino.buzz
- **Next project:** Implement Super Star Trek game (see `startrek-implementation-plan.md`)

## Repository Structure
```
├── index.html              # Homepage
├── games.html              # Games index page
├── hangman.html            # Hangman game
├── tictactoe.html          # Tic-Tac-Toe game
├── guess-number.html       # Guess the Number game
├── startrek.html           # Star Trek (skeleton only - needs implementation)
├── chess.html              # Chess vs Stockfish AI
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
└── README.txt              # Original feature wishlist
```

## Features Implemented
- [x] Homepage with sections for featured game, notes, news
- [x] News feed (BBC + NPR via RSS)
- [x] Personal notes (saved to localStorage)
- [x] Music player (26 retro tracks, random play)
- [x] Games: Hangman, Tic-Tac-Toe, Guess the Number, Chess (vs Stockfish AI)
- [x] Links page
- [x] Wider layout (1040px)
- [x] Mobile-friendly fonts

## Feature Wishlist (remaining)
- [ ] **Super Star Trek** - Full implementation (see `startrek-implementation-plan.md`)
- [x] **Chess** - vs computer using Stockfish.js (see `chess-implementation-plan.md`)
- [ ] **Scrabble** - 2-player online using Firebase Realtime DB for multiplayer sync
- [ ] "Login" page (novelty/fake)
- [ ] Style and background color tweaks
- [ ] Horoscope
- [ ] Recipe generator
- [ ] Requests button

## Technical Notes

### Chess Implementation
- Use **chess.js** for game logic/validation (~15KB)
- Use **Stockfish WASM** for AI opponent (~5MB)
- Adjustable difficulty via search depth/time limits
- Chessboard UI: chessboard.js or custom

### Scrabble Multiplayer
- Use **Firebase Realtime Database** for game state sync (free tier: 100 connections, 1GB)
- Room code system for joining games
- Word validation via dictionary file (~2MB word list)
- Need: board state, tile bag, turn management, scoring

## Workflow
- Claude can push directly to main branch
- Changes deploy automatically via GitHub Pages
- Large files may need `git config http.postBuffer 524288000` before push

## Music Credits
All music by Kevin MacLeod (incompetech.com) - Licensed under CC BY 4.0
