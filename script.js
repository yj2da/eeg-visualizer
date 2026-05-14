const app = {
    currentScreen: 'main-menu',
    currentGame: null,
    score: 0,
    timer: null,
    timeLeft: 100,
    isProcessing: false,
    correctAnswer: null,

    // 3D 캐러셀 관련
    currentIndex: 0,
    totalCards: 3,
    angleUnit: 120,

    // Dodge Game 관련
    playerX: 50,
    obstacles: [],
    gameActive: false,

    init() {
        this.setupEventListeners();
        this.updateCarousel();
    },

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (this.currentScreen === 'main-menu') {
                if (e.key === 'ArrowLeft') this.prevCard();
                if (e.key === 'ArrowRight') this.nextCard();
                if (e.key === 'Enter') {
                    if (this.currentIndex === 0) this.startSimulator();
                    else if (this.currentIndex === 1) this.startZeroGame();
                    else if (this.currentIndex === 2) this.startDodgeGame();
                }
            }
            this.handleInput(e, true);
        });
        window.addEventListener('keyup', (e) => this.handleInput(e, false));
    },

    updateCarousel() {
        const carousel = document.getElementById('carousel');
        const rotation = this.currentIndex * -this.angleUnit;
        carousel.style.transform = `rotateY(${rotation}deg)`;

        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            const angle = index * this.angleUnit;
            card.style.transform = `rotateY(${angle}deg) translateZ(400px)`;
            if (index === this.currentIndex) card.classList.add('active');
            else card.classList.remove('active');
        });
    },

    nextCard() { this.currentIndex = (this.currentIndex + 1) % this.totalCards; this.updateCarousel(); },
    prevCard() { this.currentIndex = (this.currentIndex - 1 + this.totalCards) % this.totalCards; this.updateCarousel(); },
    rotateTo(index) { if (this.currentIndex === index) return; this.currentIndex = index; this.updateCarousel(); },

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        const el = document.getElementById(screenId);
        el.classList.remove('hidden');
        el.style.opacity = 0;
        setTimeout(() => el.style.opacity = 1, 50);
        this.currentScreen = screenId;
    },

    goHome() { this.stopGames(); this.showScreen('main-menu'); },

    stopGames() {
        clearInterval(this.timer);
        this.gameActive = false;
        this.currentGame = null;
        this.isProcessing = false;
        document.querySelectorAll('.game-ui').forEach(ui => ui.classList.add('hidden'));
        // 보드 청소
        const board = document.getElementById('dodge-board');
        if (board) board.querySelectorAll('.obstacle').forEach(ob => ob.remove());
    },

    // --- 시뮬레이터 ---
    startSimulator(e) {
        if (e) e.stopPropagation();
        if (this.currentIndex !== 0) { this.rotateTo(0); return; }
        this.stopGames();
        this.currentGame = 'simulator';
        this.showScreen('game-screen');
        document.getElementById('simulator-ui').classList.remove('hidden');
    },

    // --- 제로 게임 ---
    startZeroGame(e) {
        if (e) e.stopPropagation();
        if (this.currentIndex !== 1) { this.rotateTo(1); return; }
        this.stopGames();
        this.currentGame = 'zero-game';
        this.score = 0;
        document.getElementById('zero-score').textContent = '0';
        this.showScreen('game-screen');
        document.getElementById('zero-game-ui').classList.remove('hidden');
        this.nextQuestion();
    },

    nextQuestion() {
        if (this.currentGame !== 'zero-game') return;
        this.isProcessing = false;
        this.timeLeft = 100;
        this.updateTimerBar();
        const questions = [
            { q: "1 + 1 = 2?", a: "ArrowLeft" }, { q: "사과는 채소다?", a: "ArrowRight" },
            { q: "지구는 둥글다?", a: "ArrowLeft" }, { q: "물은 100도에서 끓는다?", a: "ArrowLeft" },
            { q: "고양이는 날 수 있다?", a: "ArrowRight" }, { q: "여름은 춥다?", a: "ArrowRight" },
            { q: "대한민국 수도는 서울?", a: "ArrowLeft" }, { q: "코끼리는 곤충이다?", a: "ArrowRight" }
        ];
        const qData = questions[Math.floor(Math.random() * questions.length)];
        document.getElementById('zero-question').textContent = qData.q;
        document.getElementById('zero-feedback').textContent = '';
        this.correctAnswer = qData.a;
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft -= 1.5;
            this.updateTimerBar();
            if (this.timeLeft <= 0) this.handleZeroGameResult(false, "TIMEOUT");
        }, 30);
    },

    updateTimerBar() {
        const bar = document.getElementById('timer-bar');
        if (bar) bar.style.width = this.timeLeft + '%';
    },

    handleZeroGameResult(isCorrect, message) {
        if (this.isProcessing) return;
        this.isProcessing = true;
        clearInterval(this.timer);
        const feedback = document.getElementById('zero-feedback');
        feedback.textContent = message;
        feedback.className = 'feedback-text ' + (isCorrect ? 'correct' : 'wrong');
        if (isCorrect) {
            this.score += 100;
            document.getElementById('zero-score').textContent = this.score;
        }
        setTimeout(() => this.nextQuestion(), 1000);
    },

    // --- 좌우 피하기 (Dodge Game) ---
    startDodgeGame(e) {
        if (e) e.stopPropagation();
        if (this.currentIndex !== 2) { this.rotateTo(2); return; }
        this.stopGames();
        this.currentGame = 'dodge-game';
        this.score = 0;
        this.playerX = 50;
        this.obstacles = [];
        this.gameActive = true;
        document.getElementById('dodge-score').textContent = '0';
        document.getElementById('dodge-message').textContent = 'SYSTEM ACTIVE';
        document.getElementById('dodge-message').style.color = 'var(--primary-cyan)';
        document.getElementById('dodge-player').style.left = '50%';
        this.showScreen('game-screen');
        document.getElementById('dodge-game-ui').classList.remove('hidden');
        this.runDodgeLoop();
    },

    runDodgeLoop() {
        if (this.currentGame !== 'dodge-game' || !this.gameActive) return;
        if (Math.random() < 0.04) this.spawnObstacle();
        this.updateObstacles();
        requestAnimationFrame(() => this.runDodgeLoop());
    },

    spawnObstacle() {
        const board = document.getElementById('dodge-board');
        const ob = document.createElement('div');
        ob.className = 'obstacle';
        const emojis = ['☄️', '🛰️', '👾', '💎'];
        ob.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        ob.style.left = (Math.random() * 85 + 5) + '%';
        ob.dataset.y = -50;
        board.appendChild(ob);
        this.obstacles.push(ob);
    },

    updateObstacles() {
        const boardHeight = 500;
        const playerEl = document.getElementById('dodge-player');
        const playerRect = playerEl.getBoundingClientRect();

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const ob = this.obstacles[i];
            let y = parseFloat(ob.dataset.y) + 4 + (this.score / 500); // 점수에 따라 속도 증가
            ob.dataset.y = y;
            ob.style.top = y + 'px';

            const obRect = ob.getBoundingClientRect();
            if (
                obRect.left < playerRect.right - 10 &&
                obRect.right > playerRect.left + 10 &&
                obRect.top < playerRect.bottom - 10 &&
                obRect.bottom > playerRect.top + 10
            ) {
                this.gameOverDodge();
                return;
            }

            if (y > boardHeight) {
                ob.remove();
                this.obstacles.splice(i, 1);
                this.score += 20;
                document.getElementById('dodge-score').textContent = this.score;
            }
        }
    },

    gameOverDodge() {
        this.gameActive = false;
        document.getElementById('dodge-message').textContent = 'COLLISION - GAME OVER';
        document.getElementById('dodge-message').style.color = '#ff4d4d';
        setTimeout(() => { if (this.currentGame === 'dodge-game') { alert(`GAME OVER! XP: ${this.score}`); this.goHome(); } }, 500);
    },

    // --- 공통 입력 처리 ---
    handleInput(e, isDown) {
        if (!isDown) {
            if (this.currentGame === 'simulator') {
                document.querySelectorAll('.hand').forEach(h => h.classList.remove('active'));
                document.getElementById('sim-status').textContent = 'SYSTEM READY';
            }
            return;
        }

        if (this.currentGame === 'simulator') {
            const handId = e.key === 'ArrowLeft' ? 'sim-left' : (e.key === 'ArrowRight' ? 'sim-right' : null);
            if (handId) {
                document.getElementById(handId).classList.add('active');
                document.getElementById('sim-status').textContent = e.key === 'ArrowLeft' ? 'LEFT HAND ACTIVATED' : 'RIGHT HAND ACTIVATED';
            }
        } 
        else if (this.currentGame === 'zero-game' && !this.isProcessing) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const handId = e.key === 'ArrowLeft' ? 'zero-left' : 'zero-right';
                document.getElementById(handId).classList.add('active');
                setTimeout(() => document.getElementById(handId).classList.remove('active'), 150);
                this.handleZeroGameResult(e.key === this.correctAnswer, e.key === this.correctAnswer ? "CONFIRMED" : "ERROR");
            }
        }
        else if (this.currentGame === 'dodge-game' && this.gameActive) {
            if (e.key === 'ArrowLeft') this.playerX = Math.max(10, this.playerX - 8);
            if (e.key === 'ArrowRight') this.playerX = Math.min(90, this.playerX + 8);
            document.getElementById('dodge-player').style.left = this.playerX + '%';
        }
    }
};

window.onload = () => app.init();
