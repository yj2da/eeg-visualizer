const app = {
    currentScreen: 'main-menu',
    currentGame: null,
    score: 0,
    timer: null,
    timeLeft: 100,
    isProcessing: false,
    correctAnswer: null,

    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        window.addEventListener('keydown', (e) => this.handleInput(e, true));
        window.addEventListener('keyup', (e) => this.handleInput(e, false));
    },

    // 화면 전환
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');
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

    // --- 시뮬레이터 로직 ---
    startSimulator() {
        this.stopGames();
        this.currentGame = 'simulator';
        this.showScreen('game-screen');
        document.getElementById('simulator-ui').classList.remove('hidden');
        this.updateSimStatus('대기 중...');
    },

    updateSimStatus(text) {
        const el = document.getElementById('sim-status');
        if (el) el.textContent = text;
    },

    // --- 제로 게임 로직 ---
    startZeroGame() {
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
            { q: "1 + 1 = 2?", a: "ArrowLeft" },
            { q: "사과는 채소다?", a: "ArrowRight" },
            { q: "지구는 둥글다?", a: "ArrowLeft" },
            { q: "물은 100도에서 끓는다?", a: "ArrowLeft" },
            { q: "고양이는 날 수 있다?", a: "ArrowRight" },
            { q: "여름은 춥다?", a: "ArrowRight" },
            { q: "대한민국 수도는 서울?", a: "ArrowLeft" }
        ];
        
        const randomIdx = Math.floor(Math.random() * questions.length);
        const qData = questions[randomIdx];
        
        document.getElementById('zero-question').textContent = qData.q;
        document.getElementById('zero-feedback').textContent = '';
        this.correctAnswer = qData.a;

        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft -= 2;
            this.updateTimerBar();
            if (this.timeLeft <= 0) {
                this.handleZeroGameResult(false, "시간 초과!");
            }
        }, 50);
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
            this.score += 10;
            document.getElementById('zero-score').textContent = this.score;
        }

        setTimeout(() => {
            this.nextQuestion();
        }, 1000);
    },

    // --- 공통 입력 처리 ---
    handleInput(e, isDown) {
        if (this.currentGame === 'simulator') {
            const handId = e.key === 'ArrowLeft' ? 'sim-left' : (e.key === 'ArrowRight' ? 'sim-right' : null);
            if (handId) {
                const el = document.getElementById(handId);
                if (isDown) {
                    el.classList.add('active');
                    this.updateSimStatus(e.key === 'ArrowLeft' ? '왼손 (Yes) 들기!' : '오른손 (No) 들기!');
                } else {
                    el.classList.remove('active');
                    this.updateSimStatus('대기 중...');
                }
            }
        } 
        else if (this.currentGame === 'zero-game' && isDown && !this.isProcessing) {
            const leftHand = document.getElementById('zero-left');
            const rightHand = document.getElementById('zero-right');

            if (e.key === 'ArrowLeft') {
                leftHand.classList.add('active');
                setTimeout(() => leftHand.classList.remove('active'), 200);
                this.handleZeroGameResult(this.correctAnswer === 'ArrowLeft', "딩동댕!");
            } else if (e.key === 'ArrowRight') {
                rightHand.classList.add('active');
                setTimeout(() => rightHand.classList.remove('active'), 200);
                this.handleZeroGameResult(this.correctAnswer === 'ArrowRight', "딩동댕!");
            }
        }
    }
};

window.onload = () => app.init();
