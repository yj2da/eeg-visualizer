document.addEventListener('DOMContentLoaded', () => {
    const leftHand = document.getElementById('left-hand');
    const rightHand = document.getElementById('right-hand');
    const statusBox = document.getElementById('status');

    const updateStatus = (text) => {
        statusBox.textContent = text;
    };

    // 초기 상태
    updateStatus('대기 중...');

    window.addEventListener('keydown', (event) => {
        if (event.repeat) return; // 키를 꾹 누르고 있을 때의 반복 이벤트 방지

        switch (event.key) {
            case 'ArrowLeft':
                leftHand.classList.add('active');
                updateStatus('왼손 (Yes) 들기!');
                break;
            case 'ArrowRight':
                rightHand.classList.add('active');
                updateStatus('오른손 (No) 들기!');
                break;
        }
    });

    window.addEventListener('keyup', (event) => {
        switch (event.key) {
            case 'ArrowLeft':
                leftHand.classList.remove('active');
                if (!rightHand.classList.contains('active')) {
                    updateStatus('대기 중...');
                } else {
                    updateStatus('오른손 (No) 들기!');
                }
                break;
            case 'ArrowRight':
                rightHand.classList.remove('active');
                if (!leftHand.classList.contains('active')) {
                    updateStatus('대기 중...');
                } else {
                    updateStatus('왼손 (Yes) 들기!');
                }
                break;
        }
    });
});
