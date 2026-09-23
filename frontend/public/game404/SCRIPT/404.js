

'use strict';

console.log('Hint : 13 characters - Left to right and right to left');

const GameAnalytics = {
    trackGameStart() {
        if (typeof gtag === 'function')
            gtag('event', 'game_start', { event_category: '404_game' });
    },
    trackLevelComplete(levelId, moves, secs) {
        if (typeof gtag === 'function') {
            const label = LEVELS[levelId - 1]?.label || `Level ${levelId}`;
            gtag('event', 'level_complete', {
                event_category: '404_game',
                event_label: label,
                value: moves,
                level: levelId,
                moves: moves,
                seconds: secs,
            });
        }
    },
    trackGameQuit() {
        if (typeof gtag === 'function')
            gtag('event', 'game_quit', {
                event_category: '404_game',
                event_label: LEVELS[state.levelIndex]?.label || 'unknown',
                value: state.moves,
            });
    },
};

const LEVELS = [
    {
        par: 4, label: 'Tutorial',
        grid: [
            [1,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,1,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,3,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,2],
        ],
    },
    {
        par: 6, label: 'Level 1',
        grid: [
            [1,0,0,0,0,0,0,0,0,1,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,1,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,1,0,0],
            [1,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,3,0,0,0],
            [0,0,0,0,0,0,0,1,0,0,2,0,0],
            [0,0,0,0,0,0,0,0,0,0,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
        ],
    },
    {
        par: 8, label: 'Level 2',
        grid: [
            [1,0,0,1,0,0,0,0,0,1,0,0,0],
            [0,1,0,0,0,0,0,0,0,0,0,1,0],
            [0,0,3,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,1,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,1,0,0],
            [1,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,1,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,2,0,0,0],
            [0,0,0,0,0,0,0,1,0,1,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,1,0,1],
            [0,0,0,1,0,0,0,0,0,0,0,0,0],
        ],
    },
    {
        par: 13, label: 'Level 3',
        grid: [
            [1,0,0,1,0,0,0,0,1,1,0,0,0],
            [0,1,0,0,0,0,1,0,0,0,0,1,0],
            [0,0,2,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,0,0,0,0,1,0,0,0,0,0],
            [0,0,0,0,1,0,0,0,0,0,0,0,0],
            [0,1,0,0,0,0,0,0,0,0,1,0,0],
            [1,0,0,0,0,0,3,0,0,1,0,0,0],
            [0,0,0,1,0,0,1,0,0,0,0,0,1],
            [0,0,0,0,1,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,1,0,1,0,0,1],
            [0,0,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,0,1,0,1,0,1,0,0,0,0,0],
        ],
    },
    {
        par: 12, label: 'Level 4',
        grid: [
            [1,0,0,1,0,0,0,0,1,1,0,0,0],
            [0,1,0,0,0,0,0,0,0,0,0,1,0],
            [0,0,0,0,0,1,1,0,1,0,0,0,0],
            [0,0,1,0,1,0,0,1,0,0,0,0,0],
            [0,0,0,0,1,0,0,0,0,0,0,0,0],
            [1,1,0,0,1,0,0,0,0,0,1,0,0],
            [0,0,0,1,0,0,2,0,0,1,0,0,0],
            [1,0,0,1,0,0,1,0,0,0,1,0,1],
            [0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,1,0,0,0,0,0,0,0],
            [1,0,0,0,0,0,0,1,0,1,0,0,1],
            [0,0,1,0,0,0,0,0,0,0,1,0,1],
            [1,0,0,1,0,1,3,1,0,0,0,0,1],
        ],
    },

    {
        par: 2, label: 'Not_FouND_404', secret: true,
        keyWalls: [
            { r: 0, c: 6 },
            { r: 1, c: 6 },
            { r: 3, c: 6 },
            { r: 4, c: 6 },
            { r: 5, c: 6 },
            { r: 7, c: 6 },
            { r: 9, c: 6 },
        ],
        grid: [
            [0,1,0,0,1,1,1,0, 0,0,0,0,0],  
            [0,1,1,0,1,1,1,1, 0,0,0,0,0],  
            [0,1,1,1,0,1,3,0, 0,0,0,0,0],  
            [0,0,0,0,0,1,1,1, 1,1,0,1,0],  
            [0,1,0,0,2,1,1,0, 0,0,0,0,0],  
            [0,1,1,0,1,1,1,1, 0,0,0,0,0],  
            [0,1,1,1,0,1,0,1, 0,0,0,0,0],  
            [0,1,0,0,1,1,1,0, 0,0,0,0,0],  
            [0,1,0,0,0,1,0,0, 0,0,0,0,0],  
            [0,0,0,0,0,1,1,1, 1,1,0,1,0],  
            [0,0,0,0,0,0,0,1, 0,1,1,0,0],  
            [0,0,0,0,0,0,0,0, 0,1,1,0,0],  
            [0,0,0,0,0,0,0,1, 0,1,1,0,0],  
        ],
    },
];

const SIZE               = 13;
const SECRET_LEVEL_INDEX = LEVELS.length - 1;
const SECRET_PASSWORD    = 'Not_FouND_404';

const state = {
    levelIndex:      0,
    grid:            [],
    pion:            null,
    hole:            null,
    moves:           0,
    boardAngle:      0,
    busy:            false,
    lastDir:         null,
    startTime:       0,
    secretUnlocked:  false,
    secretHintShown: false,   
};

let boardEl, scoreEl, levelEl, victoryOverlay, victoryMsg;
let _fallGen = 0;   
let secretHintEl = null, secretInputEl = null, secretErrorEl = null;

let veilEl = null;
let introCompleted = false;                
const VEIL_STEP_MS  = 38;                  
const VEIL_FADE_MS  = 180;                 
const VEIL_TOTAL_MS = VEIL_STEP_MS * (2 * (SIZE - 1)) + VEIL_FADE_MS;

const HEADER_REVEAL_DELAY_MS = 0;

const BTN_VEIL_ROWS     = 2;
const BTN_VEIL_COLS     = 5;
const BTN_STEP_MS       = 60;              
const BTN_FADE_MS       = 280;             
const BTN_VEIL_TOTAL_MS =
    BTN_STEP_MS * (BTN_VEIL_ROWS - 1 + BTN_VEIL_COLS - 1) + BTN_FADE_MS;
const BTN_STAGGER_MS    = 200;

const BTN_GHOST_HOLD_MS = 180;

document.addEventListener('DOMContentLoaded', () => {
    boardEl        = document.getElementById('board');
    scoreEl        = document.getElementById('game-score');
    levelEl        = document.getElementById('game-level');
    victoryOverlay = document.getElementById('victory-overlay');
    victoryMsg     = document.getElementById('victory-msg');

    buildSecretHint();
    buildVeil();

    document.getElementById('btn-left') .addEventListener('click', () => rotate('left'));
    document.getElementById('btn-right').addEventListener('click', () => rotate('right'));
    document.getElementById('btn-reset').addEventListener('click', onRestart);
    document.getElementById('btn-next') .addEventListener('click', onNextLevel);
    document.addEventListener('keydown', onKey);

    initCursor();
    initFollowBox();
    initPreviewCards();
    loadLevel(0);
    GameAnalytics.trackGameStart();

    const pageIntro = document.getElementById('page-intro');
    if (!pageIntro || pageIntro.classList.contains('is-gone')) {
        runIntroSequence();
    } else {
        window.addEventListener('site-intro-done', runIntroSequence, { once: true });
    }
});

window.addEventListener('beforeunload', () => GameAnalytics.trackGameQuit());

function buildSecretHint() {
    secretHintEl = document.createElement('div');
    secretHintEl.id = 'secret-hint';
    
    secretHintEl.innerHTML =
        `<div id="secret-hint-row1">` +
            `<input id="secret-input" type="text" autocomplete="off" spellcheck="false" maxlength="30" placeholder="password">` +
            `<button id="secret-submit" class="btn">↵</button>` +
            `<div id="secret-correct-msg"></div>` +
        `</div>` +
        `<div id="secret-hint-row2">` +
            `<button id="secret-hint-btn" class="btn ghost" title="Show hint"><span class="hint-btn-text">?</span></button>` +
            `<span id="secret-clue">Binary</span>` +
        `</div>`;

    const gameHint = document.getElementById('game-hint');
    gameHint.parentNode.insertBefore(secretHintEl, gameHint.nextSibling);

    secretErrorEl = document.createElement('div');
    secretErrorEl.id = 'secret-error';
    document.getElementById('game-hints').appendChild(secretErrorEl);

    secretInputEl = document.getElementById('secret-input');

    secretInputEl.addEventListener('keydown', e => {
        e.stopPropagation();
        if (e.key === 'Enter') checkSecretPassword();
    });

    secretInputEl.addEventListener('input', () => {
        if (secretErrorEl.textContent === 'Incorrect.') {
            secretErrorEl.classList.remove('show');
            secretErrorEl.textContent = '';
        }
    });

    document.getElementById('secret-submit').addEventListener('click', checkSecretPassword);

    const clueEl  = document.getElementById('secret-clue');
    const hintBtn = document.getElementById('secret-hint-btn');
    let   clueShown = false;
    let   swapBusy  = false;     
    hintBtn.addEventListener('click', () => {
        if (swapBusy) return;
        swapBusy = true;
        clueShown = !clueShown;
        clueEl.classList.toggle('show', clueShown);

        const outgoing = hintBtn.querySelector('.hint-btn-text');
        outgoing.classList.add('text-out');

        outgoing.addEventListener('transitionend', () => {
            const incoming = document.createElement('span');
            incoming.className   = 'hint-btn-text text-in';
            incoming.textContent = clueShown ? '×' : '?';
            hintBtn.replaceChild(incoming, outgoing);

            requestAnimationFrame(() => requestAnimationFrame(() => {
                incoming.classList.remove('text-in');
                incoming.addEventListener('transitionend',
                    () => { swapBusy = false; }, { once: true });
            }));
        }, { once: true });
    });
}

function showSecretHint() {
    state.secretHintShown = true;
    const homeRow = document.getElementById('game-home-row');

    secretHintEl.classList.remove('visible', 'exiting');
    secretHintEl.style.display = 'flex';
    secretHintEl.classList.add('entering');
    void secretHintEl.offsetHeight;
    requestAnimationFrame(() => {
        secretHintEl.classList.remove('entering');
        secretHintEl.classList.add('visible');
        if (homeRow) homeRow.classList.add('shifted');
    });
}

function hideSecretHint() {
    const wasVisible = secretHintEl.classList.contains('visible');
    secretHintEl.classList.remove('visible', 'correct', 'dismissed', 'entering');
    if (wasVisible) {
        
        secretHintEl.classList.add('exiting');
        setTimeout(() => {
            secretHintEl.classList.remove('exiting');
            secretHintEl.style.display = '';  
        }, 800);
    } else {
        secretHintEl.classList.remove('exiting');
        secretHintEl.style.display = '';
    }
    secretInputEl.disabled = false;
    secretInputEl.value    = '';
    secretErrorEl.classList.remove('show', 'shimmer');
    secretErrorEl.style.cssText = '';
    secretErrorEl.textContent   = '';
    const correctMsg = document.getElementById('secret-correct-msg');
    if (correctMsg) {
        correctMsg.textContent = '';
        correctMsg.classList.remove('shimmer');
        correctMsg.style.cssText = '';
    }
    const homeRow = document.getElementById('game-home-row');
    if (homeRow) homeRow.classList.remove('shifted');
}

function checkSecretPassword() {
    if (secretInputEl.value === SECRET_PASSWORD) {
        state.secretUnlocked   = true;
        secretInputEl.value    = '';
        secretInputEl.disabled = true;

        const correctMsg = document.getElementById('secret-correct-msg');
        correctMsg.textContent = 'Correct.';
        secretHintEl.classList.add('correct');

        setTimeout(() => {
            secretHintEl.classList.add('dismissed');
            const homeBtn = document.getElementById('btn-home');
            if (homeBtn) paintButtonWhite(homeBtn);
        }, 2000);

        for (let r = 0; r < SIZE; r++)
            for (let c = 0; c < SIZE; c++)
                if (state.grid[r][c] === 4) state.grid[r][c] = 0;
        renderBoard();

    } else {
        secretErrorEl.textContent = 'Incorrect.';
        secretErrorEl.classList.remove('show');
        void secretErrorEl.offsetWidth;                    
        secretErrorEl.classList.add('show');

        secretInputEl.classList.add('shake');
        secretInputEl.addEventListener('animationend',
            () => secretInputEl.classList.remove('shake'), { once: true });
    }
}

function loadLevel(idx) {
    _fallGen++;   
    const isSecret = idx === SECRET_LEVEL_INDEX;

    state.levelIndex = idx;
    state.moves      = 0;
    state.boardAngle = 0;
    state.busy       = false;
    state.lastDir    = null;
    state.startTime  = Date.now();

    if (!isSecret) {
        state.secretHintShown = false;
        hideSecretHint();
    }

    state.grid = LEVELS[idx].grid.map(row => row.slice());

    if (isSecret) {
        
        (LEVELS[SECRET_LEVEL_INDEX].keyWalls || []).forEach(kw => {
            if (state.grid[kw.r][kw.c] === 1) state.grid[kw.r][kw.c] = 4;
        });
        
        if (state.secretUnlocked) {
            for (let r = 0; r < SIZE; r++)
                for (let c = 0; c < SIZE; c++)
                    if (state.grid[r][c] === 4) state.grid[r][c] = 0;
        }
    }

    state.pion = null;
    state.hole = null;
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (state.grid[r][c] === 2) state.pion = { r, c };
            if (state.grid[r][c] === 3) state.hole = { r, c };
        }
    }

    boardEl.style.transition = 'none';
    boardEl.style.transform  = 'rotate(0deg)';
    victoryOverlay.classList.remove('visible');

    if (isSecret && state.secretHintShown) {
        secretHintEl.style.display = 'flex';
        secretHintEl.style.transition = 'none';
        secretHintEl.classList.remove('entering', 'exiting');
        secretHintEl.classList.add('visible');
        document.getElementById('game-home-row')?.classList.add('shifted');

        secretErrorEl.classList.remove('show', 'shimmer');
        secretErrorEl.style.cssText = '';
        secretErrorEl.textContent   = '';
        secretInputEl.value         = '';

        const correctMsg = document.getElementById('secret-correct-msg');
        if (state.secretUnlocked) {
            secretHintEl.classList.add('correct', 'dismissed');
            if (correctMsg) correctMsg.textContent = 'Correct.';
            secretInputEl.disabled = true;
        } else {
            secretHintEl.classList.remove('correct', 'dismissed');
            if (correctMsg) correctMsg.textContent = '';
            secretInputEl.disabled = false;
        }

        requestAnimationFrame(() => {
            secretHintEl.style.transition = '';   
        });
    }

    updateHUD();
    renderBoard();

    if (introCompleted && veilEl && !veilEl.classList.contains('uncovered')) {
        revealVeil();
    }
}

function onRestart() { loadLevel(state.levelIndex); }

function onNextLevel() {
    if (LEVELS[state.levelIndex].secret) {
        window.location.href = '/';
        return;
    }
    const next = state.levelIndex + 1;
    loadLevel(next < LEVELS.length ? next : 0);
}

function renderBoard() {
    boardEl.innerHTML = '';
    const frag = document.createDocumentFragment();

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            const v = state.grid[r][c];
            if (v === 1 || v === 4) cell.classList.add('wall');   
            if (v === 2) cell.classList.add('pion');
            if (v === 3) cell.classList.add('hole');
            frag.appendChild(cell);
        }
    }
    boardEl.appendChild(frag);
}

function updateHUD() {
    scoreEl.textContent = `Moves: ${state.moves}`;
    levelEl.textContent = LEVELS[state.levelIndex].label;
}

function rotate(dir) {
    if (state.busy) return;
    state.busy    = true;
    state.lastDir = dir;
    state.moves++;
    updateHUD();

    if (state.levelIndex === SECRET_LEVEL_INDEX &&
        state.moves === 3 &&
        !state.secretHintShown) {
        showSecretHint();
    }

    state.boardAngle += dir === 'right' ? 90 : -90;
    boardEl.style.transition = 'transform 0.38s cubic-bezier(.65,0,.35,1)';
    boardEl.style.transform  = `rotate(${state.boardAngle}deg)`;

    boardEl.addEventListener('transitionend', onRotationDone, { once: true });
}

function onRotationDone() {
    boardEl.style.transition = 'none';
    boardEl.style.transform  = 'rotate(0deg)';
    state.boardAngle = 0;

    rotateMatrix(state.lastDir);
    renderBoard();
    applyGravity();
}

function rotateMatrix(dir) {
    const old  = state.grid;
    const next = Array.from({ length: SIZE }, () => new Array(SIZE).fill(0));

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (dir === 'right') next[c][SIZE - 1 - r] = old[r][c];
            else                 next[SIZE - 1 - c][r] = old[r][c];
        }
    }

    const p = state.pion, h = state.hole;
    if (dir === 'right') {
        state.pion = { r: p.c,            c: SIZE - 1 - p.r };
        state.hole = { r: h.c,            c: SIZE - 1 - h.r };
    } else {
        state.pion = { r: SIZE - 1 - p.c, c: p.r };
        state.hole = { r: SIZE - 1 - h.c, c: h.r };
    }

    state.grid = next;
}

function applyGravity() {
    const { r: fromR, c } = state.pion;
    let destR = fromR;

    for (let row = fromR + 1; row < SIZE; row++) {
        const v = state.grid[row][c];
        if (v === 1 || v === 4) break;   
        destR = row;
        if (v === 3) break;              
    }

    if (destR === fromR) { finishTurn(); return; }

    if (state.grid[fromR][c] !== 3) state.grid[fromR][c] = 0;
    animateFall(fromR, destR, c);
}

function animateFall(fromR, toR, c) {
    const dist    = toR - fromR;
    const totalMs = Math.min(80 + dist * 38, 500);
    const gen     = _fallGen;

    renderBoard();

    const cellW = boardEl.clientWidth  / SIZE;
    const cellH = boardEl.clientHeight / SIZE;
    const startY = fromR * cellH;
    const endY   = toR   * cellH;

    const overlay = document.createElement('div');
    overlay.style.cssText =
        'position:absolute;' +
        `left:${c * cellW}px;` +
        `top:${startY}px;` +
        `width:${cellW}px;` +
        `height:${cellH}px;` +
        'pointer-events:none;' +
        'z-index:5;' +
        'box-sizing:border-box;';

    const circle = document.createElement('div');
    circle.style.cssText =
        'position:absolute;inset:15%;background:#000;border-radius:50%;';
    overlay.appendChild(circle);
    boardEl.appendChild(overlay);

    let startTs = null;

    function step(ts) {
        if (_fallGen !== gen) { overlay.remove(); return; }
        if (!startTs) startTs = ts;

        const t     = Math.min((ts - startTs) / totalMs, 1);
        const eased = t * t * t;   
        overlay.style.top = (startY + (endY - startY) * eased) + 'px';

        if (t < 1) {
            requestAnimationFrame(step);
        } else {
            overlay.remove();
            state.pion       = { r: toR, c };
            state.grid[toR][c] = 2;
            renderBoard();
            finishTurn();
        }
    }

    requestAnimationFrame(step);
}

function finishTurn() {
    state.busy = false;

    if (state.pion.r === state.hole.r && state.pion.c === state.hole.c) {
        const secs = Math.round((Date.now() - state.startTime) / 1000);
        GameAnalytics.trackLevelComplete(state.levelIndex + 1, state.moves, secs);

        if (LEVELS[state.levelIndex].secret) {
            runOutroSequence();
        } else {
            showVictory();
        }
    }
}

function showVictory() {
    const isSecret = LEVELS[state.levelIndex].secret;
    const par      = LEVELS[state.levelIndex].par;
    const hasNext  = state.levelIndex + 1 < LEVELS.length;
    const s        = state.moves !== 1 ? 's' : '';
    const perfect  = state.moves <= par;
    const btnNext  = document.getElementById('btn-next');

    if (isSecret) {
        victoryMsg.textContent = 'Exit found. You have successfully navigated back to the intended architecture. The path back is now open.';
        btnNext.textContent    = '← Home';
    } else {
        victoryMsg.textContent =
            `Your score: ${state.moves} move${s} · ` +
            (perfect ? 'Perfect score!' : `A better score is possible (par: ${par}).`);
        btnNext.textContent = hasNext ? 'Next level →' : 'Play again from the start';
    }

    coverVeil(() => victoryOverlay.classList.add('visible'));
}

function onKey(e) {
    if (document.activeElement === secretInputEl) return;

    switch (e.key) {
        case 'ArrowLeft':  e.preventDefault(); rotate('left');  break;
        case 'ArrowRight': e.preventDefault(); rotate('right'); break;
        case 'r': case 'R': onRestart(); break;
        
        case '1': loadLevel(0); break;
        case '2': loadLevel(1); break;
        case '3': loadLevel(2); break;
        case '4': loadLevel(3); break;
        case '5': loadLevel(4); break;
        case '6': loadLevel(5); break;
    }
}

function showCursorDot() {
    const dot = document.getElementById('cursor-dot');
    if (dot) dot.style.opacity = '1';
}

function initCursor() {
    const dot = document.getElementById('cursor-dot');
    if (!dot) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    document.addEventListener('mouseover', e => {
        if (e.target.closest('.btn, a')) document.body.classList.add('cursor-hovered');
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest('.btn, a')) document.body.classList.remove('cursor-hovered');
    });

    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('pointerdown', () => {
            btn.classList.remove('btn-pressed');
            void btn.offsetWidth;                  
            btn.classList.add('btn-pressed');
        });
        btn.addEventListener('animationend', () => btn.classList.remove('btn-pressed'));
    });

    (function loop() {
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
        requestAnimationFrame(loop);
    })();
}

function initFollowBox() {
    const fb = document.getElementById('followBox404');
    if (!fb) return;

    document.addEventListener('mousemove', e => {
        const offset = window.innerHeight * 0.02;  
        const fbW    = fb.offsetWidth || 80;
        const vw     = window.innerWidth;
        
        if (e.clientX + offset + fbW > vw - 4) {
            fb.style.left      = (e.clientX - offset - fbW) + 'px';
            fb.style.transform = 'translateY(-50%)';
        } else {
            fb.style.left      = e.clientX + 'px';
            fb.style.transform = 'translate(2vh, -50%)';
        }
        fb.style.top = e.clientY + 'px';
    });

    document.querySelectorAll('[data-text]').forEach(item => {
        if (!item.classList.contains('hover-item') && !item.classList.contains('btn')) return;
        item.addEventListener('mouseenter', () => {
            const text = item.getAttribute('data-text');
            if (!text || text === 'hide') return;
            fb.textContent = text;
            fb.style.display = 'block';
        });
        item.addEventListener('mouseleave', () => {
            fb.style.display = 'none';
        });
    });
}

let _previewShowFn = null, _previewHideFn = null;

function wirePreviewLink(a) {
    if (!_previewShowFn) return;
    a.addEventListener('mouseenter', () => _previewShowFn(a.dataset.preview, a.dataset.previewLabel || ''));
    a.addEventListener('mouseleave', _previewHideFn);
}

function initPreviewCards() {
    const card = document.createElement('div');
    card.id = 'preview-card';
    card.innerHTML = '<img id="preview-img" alt=""><span id="preview-label"></span>';
    document.body.appendChild(card);

    const img   = document.getElementById('preview-img');
    const label = document.getElementById('preview-label');

    let mx = 0, my = 0, cx = 0, cy = 0;
    let raf = null, visible = false;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    function springStep() {
        const ease = 0.10;
        cx += (mx - cx) * ease;
        cy += (my - cy) * ease;

        const W  = card.offsetWidth, H = card.offsetHeight;
        const ox = window.innerHeight * 0.02;   
        let px = cx + ox;
        
        const vw = window.innerWidth, vh = window.innerHeight;
        let py = (cy + 20 + H > vh - 8) ? cy - H - 20 : cy + 20;

        if (px + W > vw - 8) px = cx - W - ox;
        if (py < 8)           py = 8;
        if (py + H > vh - 8) py = vh - H - 8;

        card.style.left = px + 'px';
        card.style.top  = py + 'px';

        if (visible) raf = requestAnimationFrame(springStep);
    }

    function show(src, title) {
        img.src         = src;
        label.textContent = title;
        card.classList.add('visible');
        visible = true;
        
        cx = mx; cy = my;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(springStep);
    }

    function hide() {
        card.classList.remove('visible');
        visible = false;
        cancelAnimationFrame(raf);
    }

    _previewShowFn = show;
    _previewHideFn = hide;

    document.querySelectorAll('a[data-preview]').forEach(a => {
        a.addEventListener('mouseenter', () => show(a.dataset.preview, a.dataset.previewLabel || ''));
        a.addEventListener('mouseleave', hide);
    });
}

function buildVeil() {
    if (veilEl) return veilEl;
    const container = document.getElementById('board-container');
    if (!container) return null;
    veilEl = document.createElement('div');
    veilEl.id = 'board-veil';

    veilEl.classList.add('uncovered');
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'veil-cell';
            cell.style.setProperty('--k', r + c);
            veilEl.appendChild(cell);
        }
    }
    container.appendChild(veilEl);
    return veilEl;
}

function revealVeil(callback) {
    if (!veilEl) { if (callback) callback(); return; }
    veilEl.classList.add('uncovered');
    setTimeout(() => callback && callback(), VEIL_TOTAL_MS + 60);
}

function coverVeil(callback) {
    if (!veilEl) { if (callback) callback(); return; }
    veilEl.classList.remove('uncovered');
    setTimeout(() => callback && callback(), VEIL_TOTAL_MS + 60);
}

function splitWords(p) {
    const text = p.dataset.text || p.textContent;
    p.textContent = '';
    const words = text.split(' ');
    const items = [];
    words.forEach((w, i) => {
        if (i > 0) p.appendChild(document.createTextNode(' '));
        const span = document.createElement('span');
        span.className   = 'intro-word';
        span.textContent = w;
        p.appendChild(span);
        items.push({
            span,
            endsWithPeriod: /\.$/.test(w),
            isLastInLine:   i === words.length - 1,
        });
    });
    return items;
}

function runIntroSequence() {
    const overlay = document.getElementById('intro-text-overlay');

    const reduce = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !overlay) {
        if (overlay) overlay.remove();
        skipIntro();
        return;
    }

    const lines = overlay.querySelectorAll('.intro-line');
    const allWords = [];
    lines.forEach(line => splitWords(line).forEach(item => allWords.push(item)));

    const STAGGER_IN      = 125;
    const IN_DURATION_MS  = 1400;             
    const HOLD_MID_MS     = 250;              
    const HOLD_END_MS     = 550;              
    const HOLD_MS         = 500;              
    const STAGGER_OUT     = 60;
    const OUT_OPACITY_MS  = 500;

    let cumulativeDelay = 0;
    allWords.forEach((item, i) => {
        const span = item.span;
        setTimeout(() => span.classList.add('in'), cumulativeDelay);
        if (i < allWords.length - 1) {
            cumulativeDelay += STAGGER_IN;
            if (item.endsWithPeriod) {
                cumulativeDelay += item.isLastInLine ? HOLD_END_MS : HOLD_MID_MS;
            }
        }
    });
    const inDone = cumulativeDelay + IN_DURATION_MS;

    setTimeout(() => {
        allWords.forEach((item, i) => {
            setTimeout(() => {
                item.span.classList.remove('in');
                item.span.classList.add('out');
            }, i * STAGGER_OUT);
        });
    }, inDone + HOLD_MS);

    const outDone = inDone + HOLD_MS + (allWords.length - 1) * STAGGER_OUT + OUT_OPACITY_MS;

    setTimeout(() => {
        overlay.remove();
        showCursorDot();
        coverVeil(startReveal);
    }, outDone);
}

function startReveal() {
    introCompleted = true;
    const board = document.getElementById('board');
    if (board) {

        board.style.transition = 'border-color .4s ease-out';
        board.classList.remove('pre-reveal');
    }
    revealVeil();

    setTimeout(() => {
        document.getElementById('game-header')?.classList.remove('pre-intro');
        runButtonsIntro();
    }, HEADER_REVEAL_DELAY_MS);
}

function skipIntro() {
    introCompleted = true;
    showCursorDot();
    veilEl?.classList.add('uncovered');
    document.getElementById('board')?.classList.remove('pre-reveal');
    document.getElementById('game-header')?.classList.remove('pre-intro');
    document.querySelectorAll('#game-controls .btn').forEach(btn => {
        btn.classList.remove('btn-intro-pre');
    });
    document.getElementById('btn-home')?.classList.remove('btn-intro-pre');
}

function buildButtonVeil(btn) {
    const veil = document.createElement('div');
    veil.className = 'btn-veil';
    for (let r = 0; r < BTN_VEIL_ROWS; r++) {
        for (let c = 0; c < BTN_VEIL_COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'btn-veil-cell';
            cell.style.setProperty('--k', r + c);
            veil.appendChild(cell);
        }
    }
    btn.appendChild(veil);
    return veil;
}

function runButtonAnim(btn) {
    const veil    = buildButtonVeil(btn);
    const isGhost = btn.classList.contains('ghost');

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            veil.classList.add('cover');

            setTimeout(() => {
                if (isGhost) {

                    btn.classList.remove('btn-intro-pre');
                    btn.classList.add('btn-intro-mid');

                    setTimeout(() => {
                        veil.classList.remove('cover');
                        setTimeout(() => {
                            btn.classList.remove('btn-intro-mid');
                            veil.remove();
                        }, BTN_VEIL_TOTAL_MS + 60);
                    }, BTN_GHOST_HOLD_MS);
                } else {

                    btn.classList.remove('btn-intro-pre');
                    setTimeout(() => veil.remove(), 220);
                }
            }, BTN_VEIL_TOTAL_MS + 60);
        });
    });
}

function runButtonsIntro() {

    const buttons = [
        ...document.querySelectorAll('#game-controls .btn'),
        document.getElementById('btn-home'),
    ].filter(Boolean);
    buttons.forEach((btn, i) => {
        setTimeout(() => runButtonAnim(btn), i * BTN_STAGGER_MS);
    });
}

let whiteVeilEl = null;

function buildWhiteVeil() {
    if (whiteVeilEl) return whiteVeilEl;
    const container = document.getElementById('board-container');
    if (!container) return null;
    whiteVeilEl = document.createElement('div');
    whiteVeilEl.id = 'board-veil-white';
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'veil-cell-white';
            cell.style.setProperty('--k', r + c);
            whiteVeilEl.appendChild(cell);
        }
    }
    container.appendChild(whiteVeilEl);
    return whiteVeilEl;
}

function paintWhiteVeil(callback) {
    buildWhiteVeil();
    if (!whiteVeilEl) { callback && callback(); return; }

    requestAnimationFrame(() => requestAnimationFrame(() => {
        whiteVeilEl.classList.add('painted');
        setTimeout(() => callback && callback(), VEIL_TOTAL_MS + 60);
    }));
}

function paintButtonWhite(btn) {

    btn.classList.add('btn-erasing');

    const veil = document.createElement('div');
    veil.className = 'btn-veil-white';
    for (let r = 0; r < BTN_VEIL_ROWS; r++) {
        for (let c = 0; c < BTN_VEIL_COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'btn-veil-white-cell';
            cell.style.setProperty('--k', r + c);
            veil.appendChild(cell);
        }
    }
    btn.appendChild(veil);
    requestAnimationFrame(() => requestAnimationFrame(() => {
        veil.classList.add('painted');
    }));
}

function paintAllButtonsWhite() {
    const buttons = [
        ...document.querySelectorAll('#game-controls .btn'),
        document.getElementById('btn-home'),
    ].filter(Boolean);
    buttons.forEach((btn, i) => {
        setTimeout(() => paintButtonWhite(btn), i * BTN_STAGGER_MS);
    });
}

function splitWordsOutro(p) {
    const text       = p.dataset.text || p.textContent;
    const linkCount  = parseInt(p.dataset.linkWords, 10) || 0;
    const linkHref   = p.dataset.linkHref || null;
    p.textContent    = '';
    const words      = text.split(' ');
    const linkStart  = linkCount > 0 && linkHref ? words.length - linkCount : -1;
    const items      = [];
    let linkEl       = null;

    words.forEach((w, i) => {
        const inLink = linkStart >= 0 && i >= linkStart;

        if (i > 0) {
            const target = (inLink && i > linkStart && linkEl) ? linkEl : p;
            target.appendChild(document.createTextNode(' '));
        }

        const span = document.createElement('span');
        span.className   = 'intro-word';
        span.textContent = w;

        if (inLink) {
            if (!linkEl) {
                linkEl = document.createElement('a');
                linkEl.className = 'intro-link';
                linkEl.href      = linkHref;
                if (p.dataset.preview)      linkEl.dataset.preview      = p.dataset.preview;
                if (p.dataset.previewLabel) linkEl.dataset.previewLabel = p.dataset.previewLabel;
                p.appendChild(linkEl);
            }
            linkEl.appendChild(span);
        } else {
            p.appendChild(span);
        }

        items.push({
            span,
            endsWithPeriod: /\.$/.test(w),
            isLastInLine:   i === words.length - 1,
        });
    });
    return items;
}

function showOutroText() {
    const overlay = document.getElementById('outro-text-overlay');
    if (!overlay) return;
    overlay.classList.add('is-open');

    const lines    = overlay.querySelectorAll('.intro-line');
    const allWords = [];
    lines.forEach(line => splitWordsOutro(line).forEach(item => allWords.push(item)));

    overlay.querySelectorAll('.intro-link[data-preview]').forEach(wirePreviewLink);

    const reduce = window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
        allWords.forEach(item => item.span.classList.add('in'));
        return;
    }

    const STAGGER_IN     = 125;
    const HOLD_MID_MS    = 250;
    const HOLD_END_MS    = 720;             
    const INITIAL_DELAY  = 220;             
    const IN_DURATION_MS = 1400;

    void overlay.offsetHeight;

    requestAnimationFrame(() => requestAnimationFrame(() => {
        let cumulativeDelay = INITIAL_DELAY;
        let linkStartDelay  = null;
        allWords.forEach((item, i) => {
            const span = item.span;
            
            if (linkStartDelay === null && span.parentElement?.classList.contains('intro-link')) {
                linkStartDelay = cumulativeDelay;
            }
            setTimeout(() => span.classList.add('in'), cumulativeDelay);
            if (i < allWords.length - 1) {
                cumulativeDelay += STAGGER_IN;
                if (item.endsWithPeriod) {
                    cumulativeDelay += item.isLastInLine ? HOLD_END_MS : HOLD_MID_MS;
                }
            }
        });

        const underlineDelay = linkStartDelay ?? (cumulativeDelay + IN_DURATION_MS + 80);
        setTimeout(() => {
            overlay.querySelectorAll('.intro-link').forEach(a => a.classList.add('drawn'));
        }, underlineDelay);
    }));
}

function runOutroSequence() {

    state.busy = true;

    coverVeil(() => {
        const board = document.getElementById('board');
        
        if (board) {
            board.style.transition = 'border-color .5s ease';
            board.style.borderColor = 'transparent';
        }

        setTimeout(() => paintWhiteVeil(), 150);

        setTimeout(paintAllButtonsWhite, 150);

        setTimeout(() => {
            document.getElementById('game-header')?.classList.add('pre-intro');
        }, 150);

        setTimeout(() => {
            if (secretHintEl) {
                secretHintEl.style.transition =
                    'opacity .6s ease, transform .6s ease';
                secretHintEl.style.opacity   = '0';
                secretHintEl.style.transform = 'translateY(-10px)';
                secretHintEl.style.pointerEvents = 'none';
            }
            const gameHint = document.getElementById('game-hint');
            if (gameHint) {
                gameHint.style.transition = 'opacity .6s ease';
                gameHint.style.opacity    = '0';
            }
        }, 150);

        const buttonsTotal = BTN_STAGGER_MS * 3 + BTN_VEIL_TOTAL_MS;
        const wipeWaitMs   = Math.max(VEIL_TOTAL_MS, buttonsTotal, 1300) + 250;
        setTimeout(showOutroText, 150 + wipeWaitMs);
    });
}

