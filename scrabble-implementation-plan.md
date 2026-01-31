# Scrabble Implementation Plan

## Overview

2-4 player online Scrabble for nino.buzz with Firebase Realtime Database for multiplayer sync. Retro 90s aesthetic matching the site.

**Key design decision:** No automatic word validation. Players can play any "word" - challenges happen outside the game (in person, over chat, etc.) and the game provides buttons to resolve challenges. This matches real Scrabble social dynamics.

**Target file structure:**
```
scrabble.html           # UI and game logic
js/scrabble-dict.js     # Dictionary for challenge lookup (optional reference)
```

**Dependencies:**
- Firebase Realtime Database (already configured for site analytics)
- No other external libraries needed

---

## Phase 1: Data Structures

### 1.1 Game Constants
```javascript
const BOARD_SIZE = 15;
const RACK_SIZE = 7;
const TILE_DISTRIBUTION = {
    'A': 9, 'B': 2, 'C': 2, 'D': 4, 'E': 12, 'F': 2, 'G': 3, 'H': 2,
    'I': 9, 'J': 1, 'K': 1, 'L': 4, 'M': 2, 'N': 6, 'O': 8, 'P': 2,
    'Q': 1, 'R': 6, 'S': 4, 'T': 6, 'U': 4, 'V': 2, 'W': 2, 'X': 1,
    'Y': 2, 'Z': 1, '_': 2  // _ = blank tile
};  // 100 tiles total

const TILE_SCORES = {
    'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4,
    'I': 1, 'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3,
    'Q': 10, 'R': 1, 'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8,
    'Y': 4, 'Z': 10, '_': 0
};

const BINGO_BONUS = 50;  // Bonus for using all 7 tiles
```

### 1.2 Board Special Squares
```javascript
// Board layout (15x15) - special square positions
const SPECIAL_SQUARES = {
    // Triple Word (TW) - red
    TW: [[0,0], [0,7], [0,14], [7,0], [7,14], [14,0], [14,7], [14,14]],

    // Double Word (DW) - pink
    DW: [[1,1], [2,2], [3,3], [4,4], [1,13], [2,12], [3,11], [4,10],
         [13,1], [12,2], [11,3], [10,4], [13,13], [12,12], [11,11], [10,10],
         [7,7]],  // Center star is also DW

    // Triple Letter (TL) - dark blue
    TL: [[1,5], [1,9], [5,1], [5,5], [5,9], [5,13],
         [9,1], [9,5], [9,9], [9,13], [13,5], [13,9]],

    // Double Letter (DL) - light blue
    DL: [[0,3], [0,11], [2,6], [2,8], [3,0], [3,7], [3,14],
         [6,2], [6,6], [6,8], [6,12], [7,3], [7,11],
         [8,2], [8,6], [8,8], [8,12], [11,0], [11,7], [11,14],
         [12,6], [12,8], [14,3], [14,11]]
};
```

### 1.3 Game State (Firebase Structure)
```javascript
// Firebase path: /games/{roomCode}
gameState = {
    roomCode: "ABCD",
    status: "waiting" | "playing" | "finished",
    created: timestamp,
    lastMove: timestamp,

    hostId: "player1",           // Host can start game
    playerCount: 2,              // 2-4 players
    playerOrder: ["player1", "player2", "player3", "player4"],

    players: {
        player1: {
            name: "Alice",
            score: 0,
            rack: ["A", "E", "I", "R", "S", "T", "N"],
            connected: true,
            order: 0             // Turn order position
        },
        player2: { ... },
        // player3, player4 if playing with more
    },

    currentTurn: "player1",      // Current player's ID
    turnIndex: 0,                // Index in playerOrder

    board: {
        // Only store occupied squares
        // "7,7": { letter: "H", isBlank: false, turnPlayed: 5 },
        // "7,8": { letter: "E", isBlank: false, turnPlayed: 5 },
    },

    tileBag: ["A", "A", "B", ...],
    tilesRemaining: 86,

    turnNumber: 1,
    consecutivePasses: 0,        // Game ends when all players pass consecutively

    lastPlay: {
        player: "player1",
        words: ["HELLO"],
        score: 16,
        tiles: [{ row: 7, col: 7, letter: "H" }, ...],
        turnNumber: 5,
        challengeable: true      // Can still be challenged
    },

    // Challenge state (when a challenge is in progress)
    pendingChallenge: null,
    // or: {
    //     challengedPlayer: "player1",
    //     challenger: "player2",
    //     turnNumber: 5,
    //     words: ["QOPH"],
    //     tiles: [...]
    // }
}
```

### 1.4 Local State (Not synced)
```javascript
localState = {
    playerId: "player1" | "player2",
    selectedTile: null,  // Index in rack
    placedTiles: [],     // Tiles placed this turn (not yet submitted)
    // { rackIndex, row, col, letter, isBlank, blankLetter }
}
```

---

## Phase 2: Firebase Setup

### 2.1 Room Management
```javascript
// Create new game
async function createGame(playerName) {
    const roomCode = generateRoomCode();  // 4 uppercase letters
    const playerId = generatePlayerId();  // Unique ID for this player
    const gameRef = firebase.database().ref(`games/${roomCode}`);

    await gameRef.set({
        roomCode,
        status: "waiting",
        created: firebase.database.ServerValue.TIMESTAMP,
        hostId: playerId,
        playerCount: 1,
        playerOrder: [playerId],
        players: {
            [playerId]: { name: playerName, score: 0, rack: [], connected: true, order: 0 }
        },
        currentTurn: playerId,
        turnIndex: 0,
        board: {},
        tileBag: shuffleArray(createTileBag()),
        tilesRemaining: 100,
        turnNumber: 0,
        consecutivePasses: 0,
        lastPlay: null,
        pendingChallenge: null
    });

    return { roomCode, playerId };
}

// Join existing game (2-4 players)
async function joinGame(roomCode, playerName) {
    const gameRef = firebase.database().ref(`games/${roomCode}`);
    const snapshot = await gameRef.once('value');

    if (!snapshot.exists()) throw new Error("Game not found");
    const game = snapshot.val();
    if (game.status !== "waiting") throw new Error("Game already started");
    if (game.playerCount >= 4) throw new Error("Game is full");

    const playerId = generatePlayerId();
    const order = game.playerCount;

    await gameRef.update({
        playerCount: game.playerCount + 1,
        playerOrder: [...game.playerOrder, playerId],
        [`players/${playerId}`]: {
            name: playerName,
            score: 0,
            rack: [],
            connected: true,
            order: order
        }
    });

    return { roomCode, playerId };
}

// Host starts the game (when 2+ players have joined)
async function startGame(roomCode) {
    const gameRef = firebase.database().ref(`games/${roomCode}`);
    const snapshot = await gameRef.once('value');
    const game = snapshot.val();

    if (game.playerCount < 2) throw new Error("Need at least 2 players");

    // Draw 7 tiles for each player
    let bag = [...game.tileBag];
    const updates = { status: "playing", turnNumber: 1 };

    for (const playerId of game.playerOrder) {
        const rack = bag.splice(0, 7);
        updates[`players/${playerId}/rack`] = rack;
    }
    updates.tileBag = bag;
    updates.tilesRemaining = bag.length;

    await gameRef.update(updates);
}
```

### 2.2 Real-time Sync
```javascript
// Listen for game state changes
function subscribeToGame(roomCode) {
    const gameRef = firebase.database().ref(`games/${roomCode}`);

    gameRef.on('value', (snapshot) => {
        const state = snapshot.val();
        updateUI(state);
    });

    // Presence system
    const myPresence = gameRef.child(`players/${playerId}/connected`);
    myPresence.onDisconnect().set(false);
    myPresence.set(true);
}
```

### 2.3 Security Considerations
- Racks should ideally be private (only visible to owner)
- For simplicity, we'll trust clients (no server-side validation)
- Could add Firebase Security Rules later for production
- Room codes expire after 24 hours of inactivity

---

## Phase 3: Game Board UI

### 3.1 Board Rendering
```
15x15 CSS Grid board
- Each cell: 32x32px (desktop), 24x24px (mobile)
- Color-coded special squares
- Placed tiles show letter + score subscript
- Center star marker
```

### 3.2 Board CSS
```css
.scrabble-board {
    display: grid;
    grid-template-columns: repeat(15, 32px);
    grid-template-rows: repeat(15, 32px);
    gap: 1px;
    background: #000;
    border: 3px ridge #00ff00;
}

.cell {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    position: relative;
}

.cell.tw { background: #ff4444; }  /* Triple Word */
.cell.dw { background: #ffaaaa; }  /* Double Word */
.cell.tl { background: #4444ff; }  /* Triple Letter */
.cell.dl { background: #aaaaff; }  /* Double Letter */
.cell.normal { background: #d4b896; }  /* Tan */
.cell.center { background: #ffaaaa; }  /* Center star */

.cell.has-tile {
    background: #f5deb3;  /* Wheat color for tiles */
    border: 2px outset #d4a574;
}

.tile-score {
    position: absolute;
    bottom: 1px;
    right: 2px;
    font-size: 8px;
}
```

### 3.3 Rack Display
```
7 tiles in a row below board
- Click to select tile
- Click board cell to place
- Click placed tile to return to rack
- Drag-and-drop as stretch goal
```

### 3.4 Controls
```
[Play Word]  [Pass]  [Swap Tiles]  [Shuffle Rack]

Score: 45          Opponent: 38
Tiles remaining: 62
```

---

## Phase 4: Tile Placement

### 4.1 Placement Rules
1. First word must cross center square (7,7)
2. Subsequent words must connect to existing tiles
3. All tiles in a turn must be in same row OR same column
4. No gaps allowed in the placed word
5. All formed words (including cross-words) must be valid

### 4.2 Placement Validation
```javascript
function validatePlacement(placedTiles, board) {
    if (placedTiles.length === 0) return { valid: false, error: "No tiles placed" };

    // Check same row or same column
    const rows = [...new Set(placedTiles.map(t => t.row))];
    const cols = [...new Set(placedTiles.map(t => t.col))];

    if (rows.length > 1 && cols.length > 1) {
        return { valid: false, error: "Tiles must be in a line" };
    }

    const isHorizontal = rows.length === 1;

    // Check for gaps
    if (!checkNoGaps(placedTiles, board, isHorizontal)) {
        return { valid: false, error: "Gaps not allowed" };
    }

    // Check connection to existing tiles (or center for first move)
    if (!checkConnection(placedTiles, board)) {
        return { valid: false, error: "Must connect to existing tiles" };
    }

    // Find all words formed
    const words = findAllWords(placedTiles, board, isHorizontal);

    // NO dictionary validation here - any "word" is allowed
    // Other players can challenge if they think it's invalid

    return { valid: true, words };
}
```

### 4.3 Word Finding Algorithm
```javascript
function findAllWords(placedTiles, board, isHorizontal) {
    const words = [];
    const tempBoard = mergeTilesWithBoard(placedTiles, board);

    // Find main word (along placement direction)
    const mainWord = findWordAt(placedTiles[0], tempBoard, isHorizontal);
    if (mainWord.length > 1) words.push(mainWord);

    // Find perpendicular words formed by each placed tile
    for (const tile of placedTiles) {
        const crossWord = findWordAt(tile, tempBoard, !isHorizontal);
        if (crossWord.length > 1) words.push(crossWord);
    }

    return words;
}

function findWordAt(startTile, board, horizontal) {
    let { row, col } = startTile;

    // Find start of word
    while (true) {
        const prevRow = horizontal ? row : row - 1;
        const prevCol = horizontal ? col - 1 : col;
        if (prevRow < 0 || prevCol < 0) break;
        if (!board[`${prevRow},${prevCol}`]) break;
        row = prevRow;
        col = prevCol;
    }

    // Read word
    let word = "";
    let tiles = [];
    while (row < 15 && col < 15) {
        const key = `${row},${col}`;
        if (!board[key]) break;
        word += board[key].letter;
        tiles.push({ row, col, ...board[key] });
        if (horizontal) col++; else row++;
    }

    return { text: word, tiles };
}
```

---

## Phase 5: Scoring

### 5.1 Score Calculation
```javascript
function calculateScore(words, placedTiles, board) {
    let totalScore = 0;

    for (const word of words) {
        let wordScore = 0;
        let wordMultiplier = 1;

        for (const tile of word.tiles) {
            const key = `${tile.row},${tile.col}`;
            const isNewTile = placedTiles.some(p => p.row === tile.row && p.col === tile.col);

            let letterScore = tile.isBlank ? 0 : TILE_SCORES[tile.letter];

            if (isNewTile) {
                // Apply letter multipliers (only for newly placed tiles)
                if (isTripleLetter(tile.row, tile.col)) letterScore *= 3;
                else if (isDoubleLetter(tile.row, tile.col)) letterScore *= 2;

                // Track word multipliers
                if (isTripleWord(tile.row, tile.col)) wordMultiplier *= 3;
                else if (isDoubleWord(tile.row, tile.col)) wordMultiplier *= 2;
            }

            wordScore += letterScore;
        }

        totalScore += wordScore * wordMultiplier;
    }

    // Bingo bonus (used all 7 tiles)
    if (placedTiles.length === 7) {
        totalScore += BINGO_BONUS;
    }

    return totalScore;
}
```

### 5.2 Special Square Helpers
```javascript
function getSquareType(row, col) {
    const key = `${row},${col}`;
    if (SPECIAL_SQUARES.TW.some(([r,c]) => r === row && c === col)) return 'TW';
    if (SPECIAL_SQUARES.DW.some(([r,c]) => r === row && c === col)) return 'DW';
    if (SPECIAL_SQUARES.TL.some(([r,c]) => r === row && c === col)) return 'TL';
    if (SPECIAL_SQUARES.DL.some(([r,c]) => r === row && c === col)) return 'DL';
    return 'normal';
}
```

---

## Phase 6: Challenge System

### 6.1 How Challenges Work
1. Player A plays a word
2. Any other player can challenge before the next turn
3. Challenge is resolved **outside the game** (look it up, ask the group, etc.)
4. Someone clicks "Challenge Succeeded" or "Challenge Failed" in the game
5. Game handles the consequences:
   - **Challenge Succeeded**: Word removed, Player A loses their turn, tiles returned
   - **Challenge Failed**: Challenger loses their next turn

### 6.2 Challenge UI
After a word is played, other players see:
```
Alice played "QOPH" for 18 points

[Challenge]  [Accept]

(Challenge within 60 seconds or word stands)
```

When challenged:
```
Bob is challenging "QOPH"

Look it up! Is it a valid Scrabble word?

[Valid Word - Challenger Loses Turn]  [Invalid - Remove Word]
```

### 6.3 Challenge State Management
```javascript
async function initiateChallenge(challengerPlayerId) {
    const updates = {
        pendingChallenge: {
            challengedPlayer: gameState.lastPlay.player,
            challenger: challengerPlayerId,
            turnNumber: gameState.lastPlay.turnNumber,
            words: gameState.lastPlay.words,
            tiles: gameState.lastPlay.tiles,
            score: gameState.lastPlay.score
        },
        [`lastPlay/challengeable`]: false
    };
    await gameRef.update(updates);
}

async function resolveChallengeSuccess() {
    // Word was invalid - remove it
    const challenge = gameState.pendingChallenge;

    const updates = {
        pendingChallenge: null
    };

    // Remove tiles from board
    for (const tile of challenge.tiles) {
        updates[`board/${tile.row},${tile.col}`] = null;
    }

    // Return tiles to challenged player's rack
    const challengedRack = gameState.players[challenge.challengedPlayer].rack;
    const returnedLetters = challenge.tiles.map(t => t.letter);
    updates[`players/${challenge.challengedPlayer}/rack`] = [...challengedRack, ...returnedLetters];

    // Subtract score
    updates[`players/${challenge.challengedPlayer}/score`] =
        gameState.players[challenge.challengedPlayer].score - challenge.score;

    // Turn stays with challenged player (they lost their turn, try again)
    // Actually in standard rules, they just lose the turn entirely
    // Let's advance to next player
    const nextTurn = getNextPlayer(challenge.challengedPlayer);
    updates.currentTurn = nextTurn.playerId;
    updates.turnIndex = nextTurn.index;

    await gameRef.update(updates);
}

async function resolveChallengeFailure() {
    // Word was valid - challenger loses next turn
    const challenge = gameState.pendingChallenge;

    const updates = {
        pendingChallenge: null,
        // Mark challenger to skip their next turn
        [`players/${challenge.challenger}/skipNextTurn`]: true
    };

    await gameRef.update(updates);
}
```

### 6.4 Optional Dictionary Reference
We can include a dictionary for players to look up words themselves:
```javascript
// Optional: load dictionary for reference
let DICTIONARY = null;

async function loadDictionary() {
    const response = await fetch('js/scrabble-dict.js');
    // ... parse and load
}

function lookupWord(word) {
    if (!DICTIONARY) return null;  // Dictionary not loaded
    return DICTIONARY.has(word.toUpperCase());
}
```

This is purely for convenience - the game doesn't enforce it.
Players can also use external resources (phone, website, etc.).

---

## Phase 7: Turn Actions

### 7.1 Play Word
```javascript
async function playWord() {
    const validation = validatePlacement(localState.placedTiles, gameState.board);

    if (!validation.valid) {
        showError(validation.error);
        return;
    }

    const score = calculateScore(validation.words, localState.placedTiles, gameState.board);
    const nextTurn = getNextPlayer(playerId);

    // Update Firebase
    const updates = {};

    // Add tiles to board
    for (const tile of localState.placedTiles) {
        updates[`board/${tile.row},${tile.col}`] = {
            letter: tile.blankLetter || tile.letter,
            isBlank: tile.isBlank,
            turnPlayed: gameState.turnNumber
        };
    }

    // Update player score
    updates[`players/${playerId}/score`] = gameState.players[playerId].score + score;

    // Remove tiles from rack and draw new ones
    const newRack = removePlayedTiles(gameState.players[playerId].rack, localState.placedTiles);
    const tilesToDraw = Math.min(7 - newRack.length, gameState.tilesRemaining);
    const drawnTiles = gameState.tileBag.slice(0, tilesToDraw);
    updates[`players/${playerId}/rack`] = [...newRack, ...drawnTiles];
    updates[`tileBag`] = gameState.tileBag.slice(tilesToDraw);
    updates[`tilesRemaining`] = gameState.tilesRemaining - tilesToDraw;

    // Advance turn (handles skip if challenger lost)
    updates[`currentTurn`] = nextTurn.playerId;
    updates[`turnIndex`] = nextTurn.index;
    updates[`turnNumber`] = gameState.turnNumber + 1;
    updates[`consecutivePasses`] = 0;
    updates[`lastMove`] = firebase.database.ServerValue.TIMESTAMP;

    // Record last play (challengeable until next player acts)
    updates[`lastPlay`] = {
        player: playerId,
        words: validation.words.map(w => w.text),
        score: score,
        tiles: localState.placedTiles.map(t => ({
            row: t.row, col: t.col,
            letter: t.blankLetter || t.letter,
            originalLetter: t.letter
        })),
        turnNumber: gameState.turnNumber,
        challengeable: true
    };

    await firebase.database().ref(`games/${roomCode}`).update(updates);

    // Clear local state
    localState.placedTiles = [];
    localState.selectedTile = null;
}

// Get next player in turn order (skips players marked to skip)
function getNextPlayer(currentPlayerId) {
    const order = gameState.playerOrder;
    let index = order.indexOf(currentPlayerId);

    do {
        index = (index + 1) % order.length;
        const nextId = order[index];
        const player = gameState.players[nextId];

        if (player.skipNextTurn) {
            // Clear the skip flag and continue to next player
            firebase.database().ref(`games/${roomCode}/players/${nextId}/skipNextTurn`).set(false);
        } else {
            return { playerId: nextId, index };
        }
    } while (true);
}
```

### 7.2 Pass Turn
```javascript
async function passTurn() {
    const nextTurn = getNextPlayer(playerId);
    const playerCount = gameState.playerOrder.length;

    const updates = {
        currentTurn: nextTurn.playerId,
        turnIndex: nextTurn.index,
        consecutivePasses: gameState.consecutivePasses + 1,
        lastMove: firebase.database.ServerValue.TIMESTAMP,
        lastPlay: {
            player: playerId,
            words: [],
            score: 0,
            tiles: [],
            action: "pass",
            challengeable: false
        }
    };

    // Game ends when all players pass consecutively (one full round of passes)
    if (updates.consecutivePasses >= playerCount) {
        updates.status = "finished";
    }

    await firebase.database().ref(`games/${roomCode}`).update(updates);

    // Return any placed tiles to rack
    returnTilesToRack();
}
```

### 7.3 Swap Tiles
```javascript
async function swapTiles(tilesToSwap) {
    if (gameState.tilesRemaining < tilesToSwap.length) {
        showError("Not enough tiles in bag");
        return;
    }

    // Return tiles to bag, draw new ones
    const currentRack = gameState.players[playerId].rack;
    const remainingRack = currentRack.filter((_, i) => !tilesToSwap.includes(i));
    const swappedTiles = tilesToSwap.map(i => currentRack[i]);

    const newBag = shuffleArray([...gameState.tileBag, ...swappedTiles]);
    const drawnTiles = newBag.slice(0, swappedTiles.length);
    const finalBag = newBag.slice(swappedTiles.length);

    const updates = {
        [`players/${playerId}/rack`]: [...remainingRack, ...drawnTiles],
        tileBag: finalBag,
        currentTurn: playerId === "player1" ? "player2" : "player1",
        consecutivePasses: gameState.consecutivePasses + 1,
        lastMove: firebase.database.ServerValue.TIMESTAMP,
        lastPlay: { player: playerId, words: [], score: 0, tiles: [], action: "swap" }
    };

    await firebase.database().ref(`games/${roomCode}`).update(updates);
}
```

---

## Phase 8: Game End

### 8.1 End Conditions
1. One player uses all tiles AND bag is empty
2. All players pass consecutively (one full round)
3. All players agree to end (optional - host can end)

### 8.2 Final Scoring
```javascript
function calculateFinalScores() {
    const finalScores = {};
    let outPlayer = null;  // Player who used all tiles
    let totalRackValue = 0;

    // Find who went out (if anyone) and sum remaining tiles
    for (const playerId of gameState.playerOrder) {
        const player = gameState.players[playerId];
        const rackValue = sumTileValues(player.rack);

        if (player.rack.length === 0) {
            outPlayer = playerId;
        }

        totalRackValue += rackValue;
        finalScores[playerId] = player.score - rackValue;  // Subtract own rack
    }

    // If someone went out, they get everyone else's tile values
    if (outPlayer) {
        const ownRackValue = sumTileValues(gameState.players[outPlayer].rack);  // 0
        finalScores[outPlayer] += totalRackValue;  // Add all others' racks
    }

    return finalScores;
}
```

### 8.3 Victory Display
```
Game Over!

1st: Alice - 287 points
2nd: Bob - 254 points
3rd: Carol - 198 points
4th: Dave - 167 points

Alice wins!

[Play Again]  [Back to Menu]
```

---

## Phase 9: UI Flow

### 9.1 Screens
1. **Menu Screen**
   - "Create Game" button
   - "Join Game" with room code input
   - Player name input

2. **Lobby Screen** (waiting for players)
   - Display room code prominently: "Share this code: ABCD"
   - Player list with names (updates in real-time)
   - "Waiting for players... (2/4)"
   - [Start Game] button (host only, enabled when 2+ players)
   - Note: "2-4 players can join"

3. **Game Screen**
   - Board
   - Rack
   - Scoreboard (all players, sorted by score)
   - Turn indicator (whose turn + turn order)
   - Action buttons: [Play] [Pass] [Swap] [Shuffle]
   - Last play info with [Challenge] button (if applicable)
   - Challenge resolution UI (when challenge pending)

4. **Game Over Screen**
   - Final scores (ranked)
   - Winner announcement
   - Play again option

### 9.2 Turn Indicator
```
YOUR TURN - Play a word!
-- or --
Waiting for Bob...  (You're next)
-- or --
Waiting for Carol...  (Bob plays after)
```

### 9.3 Challenge UI States
**After someone plays:**
```
Bob played "QOPH" for 18 points
[Challenge]  [Looks good]
```

**During challenge (all players see):**
```
🔍 Alice is challenging "QOPH"!
Is it a valid Scrabble word?
[It's Valid - Alice loses turn]  [It's Invalid - Remove word]
```

### 9.4 Scoreboard
```
  Player      Score
  ──────────────────
► Alice        142    ← current turn
  Bob          128
  Carol        115
  Dave          98
```

---

## Phase 10: Blank Tiles

### 10.1 Blank Tile Handling
```javascript
// When placing a blank tile, prompt for letter choice
function handleBlankTilePlacement(rackIndex, row, col) {
    showLetterPicker((chosenLetter) => {
        localState.placedTiles.push({
            rackIndex,
            row,
            col,
            letter: '_',
            isBlank: true,
            blankLetter: chosenLetter
        });
        renderBoard();
    });
}

// Letter picker UI
function showLetterPicker(callback) {
    // Modal with A-Z buttons
    // On click, call callback with chosen letter
}
```

### 10.2 Display
- Blank tiles show the chosen letter
- Slightly different styling (no score subscript, italic, or different background)

---

## Implementation Order

**Session 1: Foundation**
1. [ ] HTML structure and CSS for board/rack
2. [ ] Board rendering with special squares
3. [ ] Tile placement (local only)
4. [ ] Rack display and tile selection

**Session 2: Game Logic**
1. [ ] Placement validation (line, gaps, connection)
2. [ ] Word finding algorithm
3. [ ] Score calculation
4. [ ] Blank tile handling

**Session 3: Firebase Integration**
1. [ ] Firebase setup (reuse existing config)
2. [ ] Create game / lobby system
3. [ ] Join game (2-4 players)
4. [ ] Start game (host)
5. [ ] Real-time sync
6. [ ] Turn management (multiplayer rotation)
7. [ ] Draw tiles from bag

**Session 4: Challenge System**
1. [ ] Challenge button (after word played)
2. [ ] Challenge pending state
3. [ ] Challenge resolution UI
4. [ ] Challenge success (remove word)
5. [ ] Challenge failure (skip turn)

**Session 5: Polish**
1. [ ] Pass and swap functionality
2. [ ] Game end detection
3. [ ] Final scoring
4. [ ] Mobile responsiveness
5. [ ] Disconnection handling
6. [ ] Optional dictionary reference

---

## Technical Decisions

### Why Firebase Realtime Database?
- Already configured for site analytics
- Free tier: 100 simultaneous connections, 1GB storage
- Real-time sync is perfect for multiplayer turn-based games
- Simple API, no backend needed

### Why No Automatic Word Validation?
- Matches real Scrabble social dynamics
- Players can bluff or play obscure words
- Challenge system adds strategy and tension
- Simpler to implement (no dictionary required)
- Optional dictionary still available for reference

### Why 2-4 Players?
- Standard Scrabble supports 2-4
- More social and fun with friends/family
- Firebase handles multiple connections easily

### Security Trade-offs
- Trusting clients for simplicity
- Racks are visible in Firebase (could be cheated, but friends trust each other)
- Challenge resolution is honor-based
- For a fun personal project with friends, this is acceptable
- Could add Firebase Security Rules for production

---

## Testing Checklist

**Board & Tiles**
- [ ] Board renders correctly with all special squares
- [ ] Tiles can be placed and removed from board
- [ ] Validation catches invalid placements (gaps, not in line, not connected)
- [ ] All words formed are found correctly
- [ ] Scoring includes all multipliers and bingo bonus
- [ ] Blank tiles work (letter picker, zero points)

**Multiplayer**
- [ ] Create game works, shows room code
- [ ] Join game works (2nd, 3rd, 4th player)
- [ ] Lobby shows all players in real-time
- [ ] Host can start game with 2+ players
- [ ] Cannot join full game (4 players) or started game
- [ ] Real-time sync shows all players' moves
- [ ] Turn rotation works correctly (2, 3, and 4 players)
- [ ] Tile drawing works

**Challenges**
- [ ] Challenge button appears after word played
- [ ] Any non-current player can challenge
- [ ] Challenge success removes word, returns tiles, adjusts score
- [ ] Challenge failure skips challenger's next turn
- [ ] Skip turn flag clears properly

**Game Flow**
- [ ] Pass works and advances turn
- [ ] Swap works
- [ ] Game ends when player goes out
- [ ] Game ends after all players pass consecutively
- [ ] Final scoring deducts rack values correctly
- [ ] Player who goes out gets bonus points

**General**
- [ ] Mobile layout works
- [ ] Disconnection/reconnection handled

---

## Dictionary Source

TWL06 (Tournament Word List) or SOWPODS available from:
- https://www.wordgamedictionary.com/twl06/download/twl06.txt
- Need to filter to valid Scrabble words (2-15 letters, A-Z only)
- Convert to JavaScript Set for fast lookup

---

## References

- Official Scrabble rules: https://scrabble.hasbro.com/en-us/rules
- Tile distribution: Standard English Scrabble set
- Board layout: Standard 15x15 with traditional special square positions
