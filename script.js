// --- 元素選擇器 ---
const player = document.getElementById('peppa'); // 主角現在是 peppa
const obstacle = document.getElementById('ghost'); // 障礙物現在是 ghost
const scoreDisplay = document.getElementById('score');
const gameOverMessage = document.getElementById('game-over-message');
const finalScore = document.getElementById('final-score');
const gameContainer = document.getElementById('game-container');

// --- 遊戲狀態變數 ---
let isGameOver = true;
let score = 0;
let timerInterval;
let gameLoopInterval;

// --- 物理和移動設定 ---
const groundLevel = 0;      // 地面位置 (bottom: 0px)
const jumpVelocity = 15;    // 初始跳躍速度
const gravity = 1;          // 重力加速度
const moveSpeed = 5;        // 左右移動速度

let posX = 50;              // 主角水平位置 (left)
let velocityY = 0;          // 主角垂直速度
let isMovingLeft = false;   // 是否按住左鍵
let isMovingRight = false;  // 是否按住右鍵


// --- 遊戲開始/重新開始函數 ---
function startGame() {
    // 重設遊戲狀態
    isGameOver = false;
    score = 0;
    scoreDisplay.textContent = '時間: 0s';
    gameOverMessage.classList.add('hidden');

    // 重設主角位置
    posX = 50;
    velocityY = 0;
    player.style.left = `${posX}px`;
    player.style.bottom = `${groundLevel}px`;
    
    // 重設障礙物位置 (隱藏)
    obstacle.style.right = '-60px'; 
    obstacle.style.display = 'block';

    // 開始計時器
    timerInterval = setInterval(() => {
        score++;
        scoreDisplay.textContent = `時間: ${score}s`;
    }, 1000);

    // 開始主要的遊戲循環
    gameLoopInterval = setInterval(gameLoop, 20); // 每20毫秒更新一次 (50 FPS)

    // 隨機生成障礙物
    setTimeout(spawnObstacle, Math.random() * 2000 + 1000); 
}

// --- 跳躍函數 ---
function jump() {
    // 只有當主角在地面時才能跳躍 (垂直速度為0)
    if (parseInt(player.style.bottom) === groundLevel && !isGameOver) {
        velocityY = jumpVelocity;
    }
}

// --- 物理更新 (重力與跳躍) ---
function applyPhysics() {
    let currentBottom = parseInt(player.style.bottom);

    // 應用重力
    velocityY -= gravity;
    currentBottom += velocityY;

    // 檢查是否落地
    if (currentBottom <= groundLevel) {
        currentBottom = groundLevel;
        velocityY = 0;
    }

    player.style.bottom = `${currentBottom}px`;
}

// --- 水平移動更新 ---
function applyMovement() {
    let containerWidth = gameContainer.offsetWidth;
    const playerWidth = 60; 

    if (isMovingLeft) {
        posX -= moveSpeed;
    }
    if (isMovingRight) {
        posX += moveSpeed;
    }

    // 邊界檢查
    if (posX < 0) {
        posX = 0;
    } else if (posX > containerWidth - playerWidth) {
        posX = containerWidth - playerWidth;
    }

    player.style.left = `${posX}px`;
}


// --- 障礙物生成和移動 ---
function spawnObstacle() {
    if (isGameOver) return;
    
    let obstacleRight = -60;
    const obstacleSpeed = 5; 

    obstacle.style.right = `${obstacleRight}px`;
    
    const moveObstacle = () => {
        if (isGameOver) return;

        obstacleRight += obstacleSpeed;
        obstacle.style.right = `${obstacleRight}px`;

        if (obstacleRight > 800) {
            obstacle.style.display = 'none'; 
            clearInterval(obstacle.moveInterval); 
            setTimeout(spawnObstacle, Math.random() * 2000 + 1000); 
        }
    };
    
    obstacle.moveInterval = setInterval(moveObstacle, 20); 
}

// --- 碰撞檢測 ---
function checkCollision() {
    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    const horizontalOverlap = 
        playerRect.left < obstacleRect.right &&
        playerRect.right > obstacleRect.left;
        
    const verticalOverlap = 
        playerRect.bottom > obstacleRect.top &&
        playerRect.top < obstacleRect.bottom;

    if (horizontalOverlap && verticalOverlap && obstacle.style.display !== 'none') {
        endGame();
    }
}


// --- 遊戲循環 (主要邏輯) ---
function gameLoop() {
    if (isGameOver) return;
    applyPhysics();     // 處理跳躍和重力
    applyMovement();    // 處理左右移動
    checkCollision();
}


// --- 遊戲結束 ---
function endGame() {
    isGameOver = true;
    
    clearInterval(timerInterval);
    clearInterval(gameLoopInterval);
    if (obstacle.moveInterval) {
        clearInterval(obstacle.moveInterval);
    }

    finalScore.textContent = score;
    gameOverMessage.classList.remove('hidden');
}


// --- 事件監聽器：空白鍵跳躍，左右鍵移動 ---
document.addEventListener('keydown', (event) => {
    if (isGameOver && event.code === 'Space') {
        startGame(); // 遊戲結束時按空白鍵重新開始
        return;
    }
    
    if (isGameOver) return;

    switch (event.code) {
        case 'Space':
            jump();
            break;
        case 'ArrowLeft':
            isMovingLeft = true;
            break;
        case 'ArrowRight':
            isMovingRight = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    if (isGameOver) return;

    switch (event.code) {
        case 'ArrowLeft':
            isMovingLeft = false;
            break;
        case 'ArrowRight':
            isMovingRight = false;
            break;
    }
});


// 頁面載入時先初始化顯示遊戲結束畫面 (等待玩家開始)
window.onload = () => {
    endGame();
    gameOverMessage.classList.remove('hidden'); 
    finalScore.textContent = 0; 
};
