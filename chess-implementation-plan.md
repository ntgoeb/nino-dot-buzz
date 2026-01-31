# Chess Implementation Plan

## Overview

Browser-based chess game for nino.buzz with adjustable AI difficulty via Stockfish. Features a visual board with click-to-move and algebraic notation text input, plus a move history panel.

**Target file structure:**
```
chess.html              # Complete game (HTML + CSS + JS)
js/stockfish.min.js     # Stockfish engine (Web Worker)
```

**Dependencies (CDN):**
- chess.js v0.13.4 (~30KB) - Move validation, game state, PGN/FEN
- Stockfish.js (~2.5MB) - AI engine, loaded on-demand

---

## Layout Design

```
┌────────────────────────────────────────────────────────────────────┐
│  ♔ CHESS ♚                                                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐  │
│  │                             │  │  MOVES                      │  │
│  │                             │  │  ─────────────────────────  │  │
│  │                             │  │  1. e4      e5              │  │
│  │        CHESSBOARD           │  │  2. Nf3     Nc6             │  │
│  │         (8x8 grid)          │  │  3. Bb5     a6              │  │
│  │                             │  │  4. ...                     │  │
│  │                             │  │                             │  │
│  │                             │  │                             │  │
│  │                             │  │                             │  │
│  │                             │  ├─────────────────────────────┤  │
│  │                             │  │  Your move:                 │  │
│  │                             │  │  [____________] [Submit]    │  │
│  │                             │  │  Examples: e4, Nf3, O-O     │  │
│  └─────────────────────────────┘  └─────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  STATUS: Your turn │ ♙x2 ♞x1  [Captured pieces]            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  [New Game]  [Resign]  [Undo]                                      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Setup Screen

### 1.1 Initial View

Before game starts, show configuration options:

```html
<div id="setup-screen">
    <h2>♔ New Game ♚</h2>

    <div class="setup-section">
        <label>Difficulty:</label>
        <div class="difficulty-buttons">
            <button data-level="0">Beginner</button>
            <button data-level="5">Easy</button>
            <button data-level="10" class="active">Medium</button>
            <button data-level="15">Hard</button>
            <button data-level="20">Expert</button>
        </div>
    </div>

    <div class="setup-section">
        <label>Play as:</label>
        <div class="color-buttons">
            <button data-color="white" class="active">♔ White</button>
            <button data-color="black">♚ Black</button>
            <button data-color="random">🎲 Random</button>
        </div>
    </div>

    <button id="start-game" class="start-btn">Start Game!</button>
</div>
```

### 1.2 Difficulty Mapping

| Level | Stockfish Skill | Description | Approx ELO |
|-------|-----------------|-------------|------------|
| Beginner | 0 | Makes obvious mistakes | ~800 |
| Easy | 5 | Plays casually | ~1200 |
| Medium | 10 | Decent challenge | ~1600 |
| Hard | 15 | Strong play | ~2000 |
| Expert | 20 | Full strength | ~3000+ |

Stockfish UCI commands:
```javascript
stockfish.postMessage('setoption name Skill Level value ' + level);
stockfish.postMessage('setoption name Move Overhead value 500');
```

---

## Phase 2: Chessboard

### 2.1 Board Structure

Using CSS Grid for the 8x8 board:

```html
<div class="board-wrapper">
    <div class="file-labels top">
        <span>a</span><span>b</span><span>c</span>...
    </div>
    <div class="board-row">
        <div class="rank-label">8</div>
        <div class="board" id="board">
            <!-- 64 squares generated by JS -->
        </div>
        <div class="rank-label">8</div>
    </div>
    <div class="file-labels bottom">
        <span>a</span><span>b</span><span>c</span>...
    </div>
</div>
```

### 2.2 Square Generation

```javascript
function createBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    for (let rank = 8; rank >= 1; rank--) {
        for (let file = 0; file < 8; file++) {
            const square = document.createElement('div');
            const squareName = String.fromCharCode(97 + file) + rank; // e.g., 'e4'
            const isLight = (rank + file) % 2 === 1;

            square.className = `square ${isLight ? 'light' : 'dark'}`;
            square.dataset.square = squareName;
            square.onclick = () => handleSquareClick(squareName);

            board.appendChild(square);
        }
    }
}
```

### 2.3 Piece Display

Using Unicode chess symbols (largest cross-browser compatibility):

```javascript
const PIECES = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',  // White
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'   // Black
};

function renderPosition() {
    const position = game.board(); // chess.js method

    for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
            const piece = position[rank][file];
            const squareName = String.fromCharCode(97 + file) + (8 - rank);
            const squareEl = document.querySelector(`[data-square="${squareName}"]`);

            if (piece) {
                const symbol = piece.color === 'w'
                    ? PIECES[piece.type.toUpperCase()]
                    : PIECES[piece.type];
                squareEl.textContent = symbol;
                squareEl.classList.add(piece.color === 'w' ? 'white-piece' : 'black-piece');
            } else {
                squareEl.textContent = '';
                squareEl.classList.remove('white-piece', 'black-piece');
            }
        }
    }
}
```

### 2.4 Styling

Retro neon theme matching the site:

```css
.board {
    display: grid;
    grid-template-columns: repeat(8, 50px);
    grid-template-rows: repeat(8, 50px);
    border: 3px ridge #00ff00;
    box-shadow: 0 0 20px #00ff00;
}

.square {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5em;
    cursor: pointer;
}

.square.light {
    background: #003366;  /* Dark cyan */
}

.square.dark {
    background: #000033;  /* Deep blue */
}

.square.selected {
    background: #ff00ff !important;  /* Magenta - selected piece */
    box-shadow: inset 0 0 10px #ffffff;
}

.square.legal-move {
    background: radial-gradient(circle, #00ff00 20%, transparent 20%),
                /* original color underneath */;
}

.square.legal-capture {
    background: radial-gradient(circle, transparent 40%, #ff0000 40%, #ff0000 50%, transparent 50%);
}

.square.last-move {
    background: #333300 !important;  /* Highlight last move */
}

.white-piece {
    color: #ffffff;
    text-shadow: 2px 2px 4px #000000;
}

.black-piece {
    color: #ffff00;  /* Yellow for visibility */
    text-shadow: 2px 2px 4px #000000;
}
```

---

## Phase 3: Move Input

### 3.1 Click-to-Move

Two-click system:
1. Click piece to select (highlight legal moves)
2. Click destination to move

```javascript
let selectedSquare = null;

function handleSquareClick(square) {
    // If it's not player's turn, ignore
    if (!isPlayerTurn()) return;

    const piece = game.get(square);

    if (selectedSquare) {
        // Second click - try to move
        const move = tryMove(selectedSquare, square);
        if (move) {
            clearHighlights();
            renderPosition();
            updateMoveList(move);
            selectedSquare = null;

            // Trigger AI response
            if (!game.game_over()) {
                setTimeout(makeAIMove, 300);
            }
        } else if (piece && piece.color === playerColor) {
            // Clicked own piece - select it instead
            selectSquare(square);
        } else {
            // Invalid move
            clearHighlights();
            selectedSquare = null;
        }
    } else {
        // First click - select piece
        if (piece && piece.color === playerColor) {
            selectSquare(square);
        }
    }
}

function selectSquare(square) {
    clearHighlights();
    selectedSquare = square;

    document.querySelector(`[data-square="${square}"]`).classList.add('selected');

    // Highlight legal moves
    const moves = game.moves({ square: square, verbose: true });
    moves.forEach(move => {
        const targetEl = document.querySelector(`[data-square="${move.to}"]`);
        if (move.captured) {
            targetEl.classList.add('legal-capture');
        } else {
            targetEl.classList.add('legal-move');
        }
    });
}

function tryMove(from, to) {
    // Handle promotion
    const piece = game.get(from);
    const isPromotion = piece.type === 'p' &&
        ((piece.color === 'w' && to[1] === '8') ||
         (piece.color === 'b' && to[1] === '1'));

    const moveObj = {
        from: from,
        to: to,
        promotion: isPromotion ? 'q' : undefined  // Auto-queen for simplicity
    };

    const move = game.move(moveObj);
    return move;
}
```

### 3.2 Text Input

Algebraic notation input with validation:

```html
<div class="move-input">
    <label>Your move:</label>
    <input type="text" id="move-text" placeholder="e.g., e4, Nf3, O-O"
           autocomplete="off" spellcheck="false">
    <button id="submit-move">Go</button>
</div>
<div id="move-error" class="error-msg"></div>
```

```javascript
document.getElementById('submit-move').onclick = submitTextMove;
document.getElementById('move-text').onkeyup = (e) => {
    if (e.key === 'Enter') submitTextMove();
};

function submitTextMove() {
    if (!isPlayerTurn()) return;

    const input = document.getElementById('move-text');
    const moveText = input.value.trim();
    const errorEl = document.getElementById('move-error');

    if (!moveText) return;

    // chess.js accepts standard algebraic notation
    const move = game.move(moveText);

    if (move) {
        errorEl.textContent = '';
        input.value = '';
        clearHighlights();
        renderPosition();
        highlightLastMove(move);
        updateMoveList(move);

        if (!game.game_over()) {
            setTimeout(makeAIMove, 300);
        } else {
            handleGameOver();
        }
    } else {
        errorEl.textContent = `Invalid move: "${moveText}"`;
        // Show valid moves as hint
        const validMoves = game.moves();
        if (validMoves.length <= 10) {
            errorEl.textContent += ` Try: ${validMoves.slice(0, 5).join(', ')}...`;
        }
    }
}
```

### 3.3 Notation Help

Show brief help below input:

```html
<div class="notation-help">
    <strong>Notation:</strong>
    Piece + square (Nf3, Bb5) | Pawn: just square (e4) |
    Castle: O-O or O-O-O | Capture: Nxe5 or exd5
</div>
```

---

## Phase 4: Move List Panel

### 4.1 Structure

```html
<div class="move-panel">
    <h3>Moves</h3>
    <div class="move-list" id="move-list">
        <!-- Moves appear here -->
    </div>

    <div class="move-input-section">
        <label>Your move:</label>
        <input type="text" id="move-text" placeholder="e4, Nf3, O-O">
        <button id="submit-move">Go</button>
        <div id="move-error"></div>
    </div>
</div>
```

### 4.2 Move List Display

Standard format: move number, white move, black move

```javascript
function updateMoveList(move) {
    const moveList = document.getElementById('move-list');
    const history = game.history();
    const moveNum = Math.ceil(history.length / 2);
    const isWhiteMove = history.length % 2 === 1;

    if (isWhiteMove) {
        // New row for white's move
        const row = document.createElement('div');
        row.className = 'move-row';
        row.innerHTML = `
            <span class="move-num">${moveNum}.</span>
            <span class="white-move">${move.san}</span>
            <span class="black-move"></span>
        `;
        moveList.appendChild(row);
    } else {
        // Add to existing row for black's move
        const lastRow = moveList.lastElementChild;
        lastRow.querySelector('.black-move').textContent = move.san;
    }

    // Auto-scroll to bottom
    moveList.scrollTop = moveList.scrollHeight;
}
```

### 4.3 Styling

```css
.move-panel {
    width: 200px;
    background: #000033;
    border: 3px ridge #00ffff;
    display: flex;
    flex-direction: column;
}

.move-panel h3 {
    color: #00ffff;
    text-align: center;
    margin: 10px 0;
    border-bottom: 1px dashed #00ffff;
    padding-bottom: 10px;
}

.move-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    font-family: monospace;
    font-size: 14px;
}

.move-row {
    display: grid;
    grid-template-columns: 30px 1fr 1fr;
    gap: 5px;
    padding: 3px 0;
}

.move-num {
    color: #888888;
}

.white-move {
    color: #ffffff;
}

.black-move {
    color: #ffff00;
}

.move-row:hover {
    background: #001a33;
}
```

---

## Phase 5: Stockfish Integration

### 5.1 Web Worker Setup

Stockfish runs in a Web Worker to prevent UI blocking:

```javascript
let stockfish = null;
let stockfishReady = false;
let currentSkillLevel = 10;

function initStockfish() {
    return new Promise((resolve, reject) => {
        // Show loading indicator
        showStatus('Loading chess engine...');

        stockfish = new Worker('js/stockfish.min.js');

        stockfish.onmessage = (event) => {
            const line = event.data;

            if (line === 'uciok') {
                // Engine is ready
                stockfish.postMessage('isready');
            } else if (line === 'readyok') {
                stockfishReady = true;
                setSkillLevel(currentSkillLevel);
                resolve();
            } else if (line.startsWith('bestmove')) {
                handleStockfishMove(line);
            }
        };

        stockfish.onerror = (err) => {
            console.error('Stockfish error:', err);
            reject(err);
        };

        // Initialize UCI mode
        stockfish.postMessage('uci');
    });
}

function setSkillLevel(level) {
    currentSkillLevel = level;
    if (stockfish && stockfishReady) {
        stockfish.postMessage('setoption name Skill Level value ' + level);

        // For lower levels, add randomness
        if (level < 10) {
            stockfish.postMessage('setoption name UCI_LimitStrength value true');
            stockfish.postMessage('setoption name UCI_Elo value ' + (800 + level * 100));
        } else {
            stockfish.postMessage('setoption name UCI_LimitStrength value false');
        }
    }
}
```

### 5.2 Getting AI Moves

```javascript
function makeAIMove() {
    if (game.game_over()) return;

    showStatus('Stockfish is thinking...');

    // Send current position to Stockfish
    const fen = game.fen();
    stockfish.postMessage('position fen ' + fen);

    // Request best move with time limit based on difficulty
    const thinkTime = getThinkTime(currentSkillLevel);
    stockfish.postMessage(`go movetime ${thinkTime}`);
}

function getThinkTime(level) {
    // Lower levels think faster (worse moves)
    // Higher levels get more time
    if (level <= 3) return 200;
    if (level <= 8) return 500;
    if (level <= 13) return 1000;
    if (level <= 18) return 2000;
    return 3000;
}

function handleStockfishMove(line) {
    // Parse "bestmove e2e4 ponder e7e5"
    const parts = line.split(' ');
    const moveStr = parts[1];

    if (moveStr === '(none)') {
        // No legal moves - game should be over
        handleGameOver();
        return;
    }

    // Convert Stockfish format (e2e4) to chess.js format
    const from = moveStr.substring(0, 2);
    const to = moveStr.substring(2, 4);
    const promotion = moveStr[4]; // Optional promotion piece

    const move = game.move({
        from: from,
        to: to,
        promotion: promotion || undefined
    });

    if (move) {
        renderPosition();
        highlightLastMove(move);
        updateMoveList(move);

        if (game.game_over()) {
            handleGameOver();
        } else {
            showStatus("Your turn");
        }
    }
}
```

### 5.3 Stockfish File

We'll use a CDN-hosted version or download stockfish.js:

```javascript
// Option 1: Self-hosted (recommended for reliability)
stockfish = new Worker('js/stockfish.min.js');

// Option 2: CDN fallback
// https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js
```

For self-hosting, download from:
- https://github.com/nicfab/stockfish.wasm (WASM version, faster)
- https://github.com/nicfab/stockfish.js (older JS version, more compatible)

---

## Phase 6: Game State & Status

### 6.1 Status Bar

```html
<div class="status-bar">
    <span id="game-status">Your turn</span>
    <span class="captured" id="captured-white">♙♙♘</span>
    <span class="captured" id="captured-black">♟♞</span>
</div>
```

### 6.2 Game State Tracking

```javascript
let playerColor = 'w';  // 'w' or 'b'
let capturedPieces = { w: [], b: [] };

function isPlayerTurn() {
    return game.turn() === playerColor;
}

function showStatus(message) {
    document.getElementById('game-status').textContent = message;
}

function updateCaptured(move) {
    if (move.captured) {
        const capturedBy = move.color;  // Who captured
        const piece = move.captured;    // What was captured

        // Add to captured list
        const capturedColor = capturedBy === 'w' ? 'b' : 'w';
        capturedPieces[capturedColor].push(piece);

        renderCaptured();
    }
}

function renderCaptured() {
    const whiteEl = document.getElementById('captured-white');
    const blackEl = document.getElementById('captured-black');

    // Show pieces captured FROM white (captured by black)
    whiteEl.textContent = capturedPieces.w.map(p => PIECES[p.toUpperCase()]).join('');
    // Show pieces captured FROM black (captured by white)
    blackEl.textContent = capturedPieces.b.map(p => PIECES[p]).join('');
}
```

### 6.3 Game Over Detection

```javascript
function handleGameOver() {
    let message = '';

    if (game.in_checkmate()) {
        const winner = game.turn() === 'w' ? 'Black' : 'White';
        const isPlayerWin = (winner === 'White' && playerColor === 'w') ||
                           (winner === 'Black' && playerColor === 'b');
        message = isPlayerWin ? '🎉 CHECKMATE! You win!' : '💀 CHECKMATE! You lose!';
    } else if (game.in_draw()) {
        if (game.in_stalemate()) {
            message = '🤝 STALEMATE! Draw.';
        } else if (game.in_threefold_repetition()) {
            message = '🔄 THREEFOLD REPETITION! Draw.';
        } else if (game.insufficient_material()) {
            message = '⚖️ INSUFFICIENT MATERIAL! Draw.';
        } else {
            message = '🤝 DRAW!';
        }
    }

    showStatus(message);
    showGameOverModal(message);
}

function showGameOverModal(message) {
    const modal = document.getElementById('game-over-modal');
    document.getElementById('game-over-message').textContent = message;
    modal.style.display = 'flex';
}
```

---

## Phase 7: Controls & Actions

### 7.1 Button Actions

```html
<div class="game-controls">
    <button id="new-game-btn" class="control-btn">New Game</button>
    <button id="resign-btn" class="control-btn">Resign</button>
    <button id="undo-btn" class="control-btn">Undo</button>
</div>
```

```javascript
document.getElementById('new-game-btn').onclick = () => {
    showSetupScreen();
};

document.getElementById('resign-btn').onclick = () => {
    if (confirm('Are you sure you want to resign?')) {
        showStatus('You resigned. Better luck next time!');
        showGameOverModal('You resigned');
    }
};

document.getElementById('undo-btn').onclick = () => {
    // Undo player's move and AI's response
    if (game.history().length >= 2) {
        game.undo(); // Undo AI move
        game.undo(); // Undo player move
        renderPosition();
        rebuildMoveList();
        showStatus("Move undone - your turn");
    }
};

function rebuildMoveList() {
    const moveList = document.getElementById('move-list');
    moveList.innerHTML = '';

    const history = game.history();
    for (let i = 0; i < history.length; i += 2) {
        const moveNum = Math.floor(i / 2) + 1;
        const row = document.createElement('div');
        row.className = 'move-row';
        row.innerHTML = `
            <span class="move-num">${moveNum}.</span>
            <span class="white-move">${history[i]}</span>
            <span class="black-move">${history[i + 1] || ''}</span>
        `;
        moveList.appendChild(row);
    }
}
```

---

## Phase 8: Mobile Responsiveness

### 8.1 Responsive Layout

```css
.game-layout {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
}

@media (max-width: 700px) {
    .board {
        grid-template-columns: repeat(8, 40px);
        grid-template-rows: repeat(8, 40px);
    }

    .square {
        font-size: 1.8em;
    }

    .move-panel {
        width: 100%;
        order: 2;  /* Move below board on mobile */
    }

    .move-list {
        max-height: 150px;
    }
}

@media (max-width: 400px) {
    .board {
        grid-template-columns: repeat(8, 35px);
        grid-template-rows: repeat(8, 35px);
    }

    .square {
        font-size: 1.5em;
    }
}
```

### 8.2 Touch Support

Click events work on mobile, but add touch feedback:

```css
.square:active {
    transform: scale(0.95);
}

@media (hover: none) {
    /* Touch device - remove hover states that don't work well */
    .square:hover {
        background: inherit;
    }
}
```

---

## Implementation Order

### Session 1: Foundation
1. [ ] Create chess.html with basic structure
2. [ ] Add setup screen (difficulty + color selection)
3. [ ] Integrate chess.js via CDN
4. [ ] Generate chessboard grid
5. [ ] Render initial position

### Session 2: Player Moves
1. [ ] Implement click-to-select
2. [ ] Highlight legal moves
3. [ ] Implement click-to-move
4. [ ] Add text input for moves
5. [ ] Move validation and error messages
6. [ ] Move list panel

### Session 3: Stockfish AI
1. [ ] Download/setup Stockfish.js
2. [ ] Initialize Web Worker
3. [ ] Implement difficulty levels
4. [ ] Get and execute AI moves
5. [ ] Handle AI vs player turn flow

### Session 4: Polish
1. [ ] Game over detection
2. [ ] Win/lose/draw modals
3. [ ] Captured pieces display
4. [ ] Undo functionality
5. [ ] New game / resign
6. [ ] Mobile responsiveness
7. [ ] Sound effects (optional)

---

## Testing Checklist

- [ ] Setup screen shows and works
- [ ] Board renders correctly (8x8, correct colors)
- [ ] Pieces display in starting position
- [ ] Click-to-move works for all piece types
- [ ] Legal moves highlight correctly
- [ ] Illegal moves are rejected
- [ ] Text input accepts valid algebraic notation
- [ ] Text input rejects invalid moves with helpful errors
- [ ] Move list updates correctly (numbering, both colors)
- [ ] Stockfish loads without blocking UI
- [ ] AI makes moves at all difficulty levels
- [ ] Check is announced
- [ ] Checkmate ends game with correct winner
- [ ] Stalemate/draw detected
- [ ] Undo removes both AI and player moves
- [ ] New game resets everything
- [ ] Resign works
- [ ] Captured pieces track correctly
- [ ] Mobile layout works on small screens
- [ ] Plays as black correctly (board not flipped, AI moves first)

---

## File Size Estimate

| File | Size |
|------|------|
| chess.html | ~25KB |
| chess.js (CDN) | ~30KB |
| stockfish.min.js | ~2.5MB |
| **Total** | **~2.6MB** |

Note: Stockfish is large but loads on-demand after user clicks "Start Game", so initial page load stays fast.

---

## References

- chess.js: https://github.com/jhlywa/chess.js
- Stockfish.js: https://github.com/nicfab/stockfish.js
- UCI Protocol: https://www.chessprogramming.org/UCI
