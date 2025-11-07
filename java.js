// ========== GAME DATA ========== 
const gamesData = {
    crossword: {
        grid: [
            ['C', 'A', 'S', 'A'],
            ['A', null, 'O', 'M'],
            ['T', 'O', 'L', 'A'],
            ['E', 'R', 'A', 'R']
        ],
        across: [
            { number: 1, clue: 'Abitazione', word: 'CASA', row: 0, col: 0 },
            { number: 4, clue: 'Autista', word: 'COMA', row: 1, col: 2 },
            { number: 5, clue: 'Misurazione', word: 'TOLA', row: 2, col: 0 },
            { number: 7, clue: 'Raro', word: 'ERAR', row: 3, col: 0 }
        ],
        down: [
            { number: 1, clue: 'Mammifero', word: 'CATE', row: 0, col: 0 },
            { number: 2, clue: 'Soluzione', word: 'AMOR', row: 0, col: 1 },
            { number: 3, clue: 'Frazione', word: 'SOAR', row: 0, col: 2 },
            { number: 6, clue: 'Colore', word: 'AMOR', row: 2, col: 2 }
        ]
    },
    trueFalse: [
        { question: 'Dire che pensi positivo è come dire che Joey e Chandler controllano le loro energie', answer: true },
        { question: 'Le cimici sono il tuo incubo numero uno (numero due è quando ti chiedo di prendere il kebab)', answer: true },
        { question: 'Puoi raccontare una storia senza fare pause inutili di 5 minuti nel mezzo', answer: false },
        { question: 'Se ti darei il microfono durante una cena, la gente penserebbe che è musica ambient sperimentale', answer: false },
        { question: 'Mi ami più dei tuoi adorabili animaletti Joey e Chandler... ammettilo senza paura', answer: false }
    ],
    memory: [
        { emoji: '🐰', id: 1 }, { emoji: '🐰', id: 1 },
        { emoji: '🐹', id: 2 }, { emoji: '🐹', id: 2 },
        { emoji: '🌻', id: 3 }, { emoji: '🌻', id: 3 },
        { emoji: '🌷', id: 4 }, { emoji: '🌷', id: 4 },
        { emoji: '🐴', id: 5 }, { emoji: '🐴', id: 5 },
        { emoji: '🐕', id: 6 }, { emoji: '🐕', id: 6 },
        { emoji: '🎓', id: 7 }, { emoji: '🎓', id: 7 },
        { emoji: '🌶️', id: 8 }, { emoji: '🌶️', id: 8 }
    ],
    hangman: [
        { word: 'AUGURI', hint: 'Felicitazioni!' }
    ]
};

// ========== STATE MANAGEMENT ==========
let currentGame = 'home';
let gameState = {
    crossword: {
        answers: [],
        score: 0
    },
    trueFalse: {
        currentQuestion: 0,
        score: 0,
        answered: false
    },
    memory: {
        cards: [],
        flipped: [],
        matched: [],
        moves: 0,
        pairs: 0
    },
    hangman: {
        word: '',
        display: '',
        guessed: [],
        wrong: [],
        tries: 6,
        won: false,
        lost: false
    }
};

// ========== NAVIGATION ==========
function switchGame(gameName) {
    // Hide current section
    document.getElementById(currentGame).classList.remove('active');
    
    // Show new section
    currentGame = gameName;
    document.getElementById(currentGame).classList.add('active');
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-game="${gameName}"]`).classList.add('active');
    
    // Initialize game if needed
    if (gameName === 'memory') {
        initializeMemory();
    } else if (gameName === 'hangman') {
        initializeHangman();
    } else if (gameName === 'truefalse') {
        loadTrueFalseQuestion();
    }
    // Note: Crossword is now loaded via iframe
    
    window.scrollTo(0, 0);
}

// ========== CROSSWORD GAME ==========
function initializeCrossword() {
    const grid = gamesData.crossword.grid;
    const gridContainer = document.getElementById('crosswordGrid');
    gridContainer.innerHTML = '';
    
    gameState.crossword.answers = [];
    
    // Create grid
    grid.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = '1';
            input.className = 'crossword-cell';
            
            if (cell === null) {
                input.className += ' black';
                input.disabled = true;
            } else {
                input.dataset.row = rowIdx;
                input.dataset.col = colIdx;
                input.dataset.letter = cell;
                gameState.crossword.answers.push({ row: rowIdx, col: colIdx, answer: '' });
            }
            
            gridContainer.appendChild(input);
        });
    });
    
    // Display clues
    const cluesH = document.getElementById('crosswordCluesH');
    const cluesV = document.getElementById('crosswordCluesV');
    cluesH.innerHTML = gamesData.crossword.across
        .map(c => `<div class="clue-item">${c.number}. ${c.clue}</div>`)
        .join('');
    cluesV.innerHTML = gamesData.crossword.down
        .map(c => `<div class="clue-item">${c.number}. ${c.clue}</div>`)
        .join('');
}

function checkCrossword() {
    const inputs = document.querySelectorAll('.crossword-cell:not(.black)');
    let correct = 0;
    let total = 0;
    
    inputs.forEach(input => {
        total++;
        const userAnswer = input.value.toUpperCase();
        const correctAnswer = input.dataset.letter;
        
        if (userAnswer === correctAnswer) {
            correct++;
            input.style.background = '#c8e6c9';
        } else {
            input.style.background = '#ffcdd2';
        }
    });
    
    gameState.crossword.score = correct;
    document.getElementById('crossword-score').textContent = `Risposte corrette: ${correct}/${total}`;
    
    showFeedback('crossword', correct === total);
}

function resetCrossword() {
    initializeCrossword();
    gameState.crossword.score = 0;
    document.getElementById('crossword-score').textContent = 'Risposte corrette: 0';
}

// ========== TRUE/FALSE GAME ==========
function loadTrueFalseQuestion() {
    const q = gameState.trueFalse.currentQuestion;
    const question = gamesData.trueFalse[q];
    
    document.getElementById('truefalse-question').textContent = question.question;
    document.getElementById('truefalse-score').textContent = 'Risposta: -';
    document.getElementById('truefalse-counter').textContent = `Domanda ${q + 1} di ${gamesData.trueFalse.length}`;
    document.getElementById('truefalse-feedback').innerHTML = '';
    
    const buttons = document.querySelectorAll('.true-false-buttons button');
    buttons.forEach(btn => btn.classList.remove('correct', 'incorrect'));
    
    document.getElementById('truefalse-next').style.display = 'none';
    gameState.trueFalse.answered = false;
}

function answerTrueFalse(isTrue) {
    if (gameState.trueFalse.answered) return;
    
    gameState.trueFalse.answered = true;
    const question = gamesData.trueFalse[gameState.trueFalse.currentQuestion];
    const correct = isTrue === question.answer;
    
    const btnTrue = document.querySelector('.btn-true');
    const btnFalse = document.querySelector('.btn-false');
    
    if (isTrue) {
        btnTrue.classList.add(correct ? 'correct' : 'incorrect');
        btnFalse.classList.add(correct ? 'incorrect' : 'correct');
    } else {
        btnFalse.classList.add(correct ? 'correct' : 'incorrect');
        btnTrue.classList.add(correct ? 'incorrect' : 'correct');
    }
    
    if (correct) {
        gameState.trueFalse.score++;
    }
    
    document.getElementById('truefalse-score').textContent = `Risposta: ${correct ? '✓ Corretta' : '✗ Sbagliata'}`;
    document.getElementById('truefalse-feedback').innerHTML = 
        `<div class="feedback ${correct ? 'correct' : 'incorrect'}">
            ${correct ? '✓ Risposta Corretta!' : '✗ Risposta Sbagliata'}
        </div>`;
    
    document.getElementById('truefalse-next').style.display = 'inline-block';
}

function nextTrueFalse() {
    gameState.trueFalse.currentQuestion++;
    
    if (gameState.trueFalse.currentQuestion >= gamesData.trueFalse.length) {
        const finalScore = gameState.trueFalse.score;
        const total = gamesData.trueFalse.length;
        const content = `<p>Punteggio: <strong>${finalScore}/${total}</strong></p>`;
        showModal('truefalse-modal', content);
        setTimeout(() => {
            resetTrueFalse();
        }, 500);
        return;
    }
    
    loadTrueFalseQuestion();
}

function resetTrueFalse() {
    gameState.trueFalse.currentQuestion = 0;
    gameState.trueFalse.score = 0;
    gameState.trueFalse.answered = false;
    loadTrueFalseQuestion();
}

// ========== MEMORY GAME ==========
function initializeMemory() {
    gameState.memory = {
        cards: [],
        flipped: [],
        matched: [],
        moves: 0,
        pairs: 0
    };
    
    // Shuffle cards
    let cards = [...gamesData.memory];
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    gameState.memory.cards = cards;
    
    const gridContainer = document.getElementById('memoryGrid');
    gridContainer.innerHTML = '';
    
    cards.forEach((card, idx) => {
        const btn = document.createElement('button');
        btn.className = 'memory-card';
        btn.dataset.index = idx;
        btn.dataset.id = card.id;
        btn.textContent = card.emoji;
        btn.onclick = () => flipCard(idx);
        gridContainer.appendChild(btn);
    });
    
    updateMemoryScore();
}

function flipCard(idx) {
    const card = document.querySelector(`[data-index="${idx}"]`);
    
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    if (gameState.memory.flipped.length === 2) return;
    
    card.classList.add('flipped');
    gameState.memory.flipped.push(idx);
    
    if (gameState.memory.flipped.length === 2) {
        gameState.memory.moves++;
        checkMemoryMatch();
    }
}

function checkMemoryMatch() {
    const [idx1, idx2] = gameState.memory.flipped;
    const id1 = gameState.memory.cards[idx1].id;
    const id2 = gameState.memory.cards[idx2].id;
    
    if (id1 === id2) {
        gameState.memory.matched.push(idx1, idx2);
        gameState.memory.pairs++;
        
        setTimeout(() => {
            document.querySelector(`[data-index="${idx1}"]`).classList.add('matched');
            document.querySelector(`[data-index="${idx2}"]`).classList.add('matched');
            gameState.memory.flipped = [];
            updateMemoryScore();
            
            if (gameState.memory.pairs === gamesData.memory.length / 2) {
                setTimeout(() => {
                    const content = `<p>Hai vinto in <strong>${gameState.memory.moves} mosse</strong>!</p>`;
                    showModal('memory-modal', content);
                }, 500);
            }
        }, 600);
    } else {
        setTimeout(() => {
            document.querySelector(`[data-index="${idx1}"]`).classList.remove('flipped');
            document.querySelector(`[data-index="${idx2}"]`).classList.remove('flipped');
            gameState.memory.flipped = [];
            updateMemoryScore();
        }, 1000);
    }
}

function updateMemoryScore() {
    document.getElementById('memory-score').textContent = `Mosse: ${gameState.memory.moves}`;
    document.getElementById('memory-pairs').textContent = `Coppie trovate: ${gameState.memory.pairs}/${gamesData.memory.length / 2}`;
}

function resetMemory() {
    initializeMemory();
}

// ========== HANGMAN GAME ==========
// ========== HANGMAN GAME (NUOVO: Indovina la Frase) ==========

const hangmanPhrases = [
    'LA MEDICINA E SCIENTIFICA',
    'LO STUDIO RICHIEDE IMPEGNO',
    'LA LAUREA E UN GRANDE RISULTATO',
    'IL SAPERE NON HA FINE',
    'ESSERE DOTTORE E UN ORGOGLIO'
];

let selectedPhrase = '';
let guessedLetters = [];
let wrongGuesses = 0;
let maxWrongGuesses = 6;

function initializeHangman() {
    selectedPhrase = hangmanPhrases[Math.floor(Math.random() * hangmanPhrases.length)];
    guessedLetters = [];
    wrongGuesses = 0;
    updateHangmanPhraseDisplay();
    createHangmanKeyboard();
}

function updateHangmanPhraseDisplay() {
    const wordContainer = document.getElementById('hangman-word-container');
    const triesDisplay = document.getElementById('hangman-tries');
    const feedback = document.getElementById('hangman-feedback');

    wordContainer.innerHTML = '';

    for (let i = 0; i < selectedPhrase.length; i++) {
        const char = selectedPhrase[i];

        if (char === ' ') {
            const space = document.createElement('div');
            space.className = 'hangman-space';
            wordContainer.appendChild(space);
        } else {
            const letterBox = document.createElement('div');
            letterBox.className = 'hangman-letter-box';

            if (guessedLetters.includes(char)) {
                letterBox.textContent = char;
            } else {
                letterBox.textContent = '';
            }

            wordContainer.appendChild(letterBox);
        }
    }

    triesDisplay.textContent = `Tentativi rimasti: ${maxWrongGuesses - wrongGuesses}`;
    feedback.textContent = '';

    // Verifica vittoria
    const phraseComplete = selectedPhrase.split('').every(char => char === ' ' || guessedLetters.includes(char));
    if (phraseComplete) {
        document.getElementById('hangman-victory-modal-content').innerHTML = `
            <p>Hai indovinato la frase: <strong>${selectedPhrase}</strong></p>
            <p>Complimenti!</p>
        `;
        document.getElementById('hangman-victory-modal').classList.add('show');
    }
}

function createHangmanKeyboard() {
    const lettersContainer = document.getElementById('hangman-letters');
    lettersContainer.innerHTML = '';

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    alphabet.forEach(letter => {
        const letterBtn = document.createElement('div'); // Usa div invece di button
        letterBtn.className = 'hangman-letter';
        letterBtn.textContent = letter;
        letterBtn.dataset.letter = letter;

        letterBtn.addEventListener('click', () => guessLetter(letter));
        lettersContainer.appendChild(letterBtn);
    });
}

function guessLetter(letter) {
    if (guessedLetters.includes(letter)) return;

    guessedLetters.push(letter);
    const letterBtn = document.querySelector(`[data-letter="${letter}"]`);
    letterBtn.classList.add('disabled');

    if (selectedPhrase.includes(letter)) {
        updateHangmanPhraseDisplay();
    } else {
        wrongGuesses++;
        updateHangmanPhraseDisplay();

        if (wrongGuesses >= maxWrongGuesses) {
            document.getElementById('hangman-defeat-modal-content').innerHTML = `
                <p>La frase era: <strong>${selectedPhrase}</strong></p>
                <p>Hai perso!</p>
            `;
            document.getElementById('hangman-defeat-modal').classList.add('show');
        }
    }
}

function resetHangman() {
    initializeHangman();
}
function showModal(modalId, content) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const contentEl = modal.querySelector('[id$="-modal-content"]');
    if (contentEl) {
        contentEl.innerHTML = content;
    }
    
    modal.classList.add('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('show');
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    // Set up nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchGame(btn.dataset.game);
        });
    });
    
    // Set up modal backdrop click to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-backdrop')) {
                closeModal(modal.id);
            }
        });
    });
    
    // Load first game (home)
    switchGame('home');
});
