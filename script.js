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
    angleUnit: 120, // 360 / totalCards

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
                }
            }
            this.handleInput(e, true);
        });
        window.addEventListener('keyup', (e) => this.handleInput(e, false));
    },

    // --- 캐러셀 제어 ---
    updateCarousel() {
        const carousel = document.getElementById('carousel');
        const rotation = this.currentIndex * -this.angleUnit;
        carousel.style.transform = `rotateY(${rotation}deg)`;

        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            const angle = index * this.angleUnit;
            // 각 카드를 원형으로 배치 (Z축으로 400px 밀기)
            card.style.transform = `rotateY(${angle}deg) translateZ(400px)`;
            
            if (index === this.currentIndex) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    },

    nextCard() {
        this.currentIndex = (this.currentIndex + 1) % this.totalCards;
        this.updateCarousel();
    },

    prevCard() {
        this.currentIndex = (this.currentIndex - 1 + this.totalCards) % this.totalCards;
        this.updateCarousel();
    },

    rotateTo(index) {
        if (this.currentIndex === index) return;
        this.currentIndex = index;
        this.updateCarousel();
    },

    // --- 화면 전환 ---
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');
        document.getElementById(screenId).style.opacity = 0;
        setTimeout(() => {
            document.getElementById(screenId).style.opacity = 1;
        }, 50);
        this.currentScreen = screenId;
    },

    goHome() {
        this.stopGames();
        this.showScreen('main-menu');
    },

    stopGames() {
        clearInterval(this.timer);
        this.currentGame = null;
        this.isProcessing = false;
        document.querySelectorAll('.game-ui').forEach(ui => ui.classList.add('hidden'));
    },

    // --- 게임 시작 (event 추가로 카드 클릭 시 바로 시작 방지) ---
    startSimulator(e) {
        if (e) e.stopPropagation();
        if (this.currentIndex !== 0) {
            this.rotateTo(0);
            return;
        }
        this.stopGames();
        this.currentGame = 'simulator';
        this.showScreen('game-screen');
        document.getElementById('simulator-ui').classList.remove('hidden');
    },

    startZeroGame(e) {
        if (e) e.stopPropagation();
        if (this.currentIndex !== 1) {
            this.rotateTo(1);
            return;
        }
        this.stopGames();
        this.currentGame = 'zero-game';
        this.score = 0;
        document.getElementById('zero-score').textContent = '0';
        this.showScreen('game-screen');
        document.getElementById('zero-game-ui').classList.remove('hidden');
        this.nextQuestion();
    },

    // --- 제로 게임 로직 ---
    nextQuestion() {
        if (this.currentGame !== 'zero-game') return;
        
        this.isProcessing = false;
        this.timeLeft = 100;
        this.updateTimerBar();
        
        const questions = [
            { q: "1 + 1 = 2?", a: "ArrowLeft" },
            { q: "사과는 채소다?", a: "ArrowRight" },
            { q: "지구는 둥글다?", a: "ArrowLeft" },
            { q: "물은 100도에서 끓는다?", a: "ArrowLeft" },
            { q: "고양이는 날 수 있다?", a: "ArrowRight" },
            { q: "여름은 춥다?", a: "ArrowRight" },
            { q: "대한민국 수도는 서울?", a: "ArrowLeft" },
            { q: "코끼리는 곤충이다?", a: "ArrowRight" },
            { q: "바나나는 노란색?", a: "ArrowLeft" },
            { q: "10 > 5?", a: "ArrowLeft" }
        ];
        
        const randomIdx = Math.floor(Math.random() * questions.length);
        const qData = questions[randomIdx];
        
        document.getElementById('zero-question').textContent = qData.q;
        document.getElementById('zero-feedback').textContent = '';
        this.correctAnswer = qData.a;

        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft -= 1.5; // 약간 더 느리게 조정
            this.updateTimerBar();
            if (this.timeLeft <= 0) {
                this.handleZeroGameResult(false, "TIMEOUT");
            }
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
            this.score += 100; // XP 느낌으로 100점씩
            document.getElementById('zero-score').textContent = this.score;
        }

        setTimeout(() => {
            this.nextQuestion();
        }, 1000);
    },

    // --- 입력 처리 ---
    handleInput(e, isDown) {
        if (this.currentGame === 'simulator') {
            const handId = e.key === 'ArrowLeft' ? 'sim-left' : (e.key === 'ArrowRight' ? 'sim-right' : null);
            if (handId) {
                const el = document.getElementById(handId);
                const statusEl = document.getElementById('sim-status');
                if (isDown) {
                    el.classList.add('active');
                    statusEl.textContent = e.key === 'ArrowLeft' ? 'LEFT HAND ACTIVATED' : 'RIGHT HAND ACTIVATED';
                } else {
                    el.classList.remove('active');
                    statusEl.textContent = 'SYSTEM READY';
                }
            }
        } 
        else if (this.currentGame === 'zero-game' && isDown && !this.isProcessing) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const handId = e.key === 'ArrowLeft' ? 'zero-left' : 'zero-right';
                const el = document.getElementById(handId);
                el.classList.add('active');
                setTimeout(() => el.classList.remove('active'), 150);
                
                if (e.key === this.correctAnswer) {
                    this.handleZeroGameResult(true, "CONFIRMED");
                } else {
                    this.handleZeroGameResult(false, "ERROR");
                }
            }
        }
    }
};

window.onload = () => app.init();
