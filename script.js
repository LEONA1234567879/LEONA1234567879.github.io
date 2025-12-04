// --- 元素選擇器 ---
const ghost = document.getElementById('ghost');
const peppa = document.getElementById('peppa');
const scoreDisplay = document.getElementById('score');
const gameOverMessage = document.getElementById('game-over-message');
const finalScore = document.getElementById('final-score');

// --- 遊戲狀態變數 ---
let isJumping = false;
let isGameOver = true;
let score = 0;
let timerInterval;
let gameLoopInterval;

// --- 遊戲設定 ---
const jumpHeight = 120; // 幽靈跳躍的最大高度 (px)
const gravity = 0.5;    // 重力加速度
let velocityY = 0;      // 垂直速度
const groundLevel = 0;  // 地面位置 (bottom: 0px)

// --- 遊戲開始/重新開始函數 ---
function startGame() {
    // 重設遊戲狀態
    isGameOver = false;
    score = 0;
    scoreDisplay.textContent = '時間: 0s';
    gameOverMessage.classList.add('hidden');

    // 重設幽靈位置
    ghost.style.bottom = `${groundLevel}px`;
    
    // 重設佩佩豬位置 (隱藏)
    peppa.style.right = '-60px'; 
    peppa.style.display = 'block';

    // 開始計時器
    timerInterval = setInterval(() => {
        score++;
        scoreDisplay.textContent = `時間: ${score}s`;
    }, 1000);

    // 開始主要的遊戲循環
    gameLoopInterval = setInterval(gameLoop, 20); // 每20毫秒更新一次 (50 FPS)

    // 隨機生成障礙物
    setTimeout(spawnPeppa, Math.random() * 2000 + 1000); // 1到3秒後出現第一個
}

// --- 跳躍函數 ---
function jump() {
    if (isJumping || isGameOver) return;

    isJumping = true;
    ghost.style.bottom = `${jumpHeight}px`; // 立即跳到最高點

    // 這裡使用CSS動畫來視覺化跳躍
    ghost.classList.add('jump'); 

    // 0.5秒後動畫結束，回到地面
    setTimeout(() => {
        ghost.classList.remove('jump');
        ghost.style.bottom = `${groundLevel}px`;
        isJumping = false;
    }, 500);
}

// --- 障礙物生成和移動 ---
function spawnPeppa() {
    if (isGameOver) return;
    
    // 初始位置：右邊界外
    let peppaRight = -60;
    const peppaSpeed = 5; // 障礙物移動速度 (px/frame)

    peppa.style.right = `${peppaRight}px`;
    
    const movePeppa = () => {
        if (isGameOver) return;

        peppaRight += peppaSpeed;
        peppa.style.right = `${peppaRight}px`;

        // 障礙物超出左邊界，停止並準備下一個生成
        if (peppaRight > 800) {
            peppa.style.display = 'none'; // 隱藏佩佩豬
            
            // 清除本次移動循環
            clearInterval(peppa.moveInterval); 

            // 隨機生成下一個障礙物 (間隔1秒到3秒)
            setTimeout(spawnPeppa, Math.random() * 2000 + 1000); 
        }
    };
    
    // 開始移動障礙物
    peppa.moveInterval = setInterval(movePeppa, 20); 
}

// --- 碰撞檢測 ---
function checkCollision() {
    // 獲取元素的位置和大小 (使用getBoundingClientRect更準確)
    const ghostRect = ghost.getBoundingClientRect();
    const peppaRect = peppa.getBoundingClientRect();

    // 檢測水平和垂直方向的重疊
    const horizontalOverlap = 
        ghostRect.left < peppaRect.right &&
        ghostRect.right > peppaRect.left;
        
    const verticalOverlap = 
        ghostRect.bottom > peppaRect.top &&
        ghostRect.top < peppaRect.bottom;

    // 碰撞發生！
    if (horizontalOverlap && verticalOverlap && peppa.style.display !== 'none') {
        endGame();
    }
}


// --- 遊戲循環 (主要邏輯) ---
function gameLoop() {
    if (isGameOver) return;
    checkCollision();
}


// --- 遊戲結束 ---
function endGame() {
    isGameOver = true;
    
    // 停止所有計時器和循環
    clearInterval(timerInterval);
    clearInterval(gameLoopInterval);
    if (peppa.moveInterval) {
        clearInterval(peppa.moveInterval);
    }

    // 顯示遊戲結束訊息
    finalScore.textContent = score;
    gameOverMessage.classList.remove('hidden');

    // 移除幽靈跳躍的class，防止動畫殘留
    ghost.classList.remove('jump');
}


// --- 事件監聽器：空白鍵跳躍 ---
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (isGameOver) {
            startGame(); // 如果遊戲結束，按空白鍵重新開始
        } else {
            jump();
        }
    }
});

// 頁面載入時先初始化顯示遊戲結束畫面 (等待玩家開始)
window.onload = () => {
    endGame();
    // 預先移除隱藏 class，確保玩家能看到開始按鈕
    gameOverMessage.classList.remove('hidden'); 
    finalScore.textContent = 0; // 初始分數為 0
};
