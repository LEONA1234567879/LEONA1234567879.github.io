// --- 元素選擇器 ---
const player = document.getElementById('peppa'); 
const obstacle = document.getElementById('ghost'); 
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
const groundLevel = 0;      
const jumpVelocity = 18;    // 初始跳躍速度略微提高
const gravity = 1;          
const baseMoveSpeed = 8;    // 基礎左右移動速度
const airControlFactor = 0.5; // 空中慣性係數：移動速度降為一半

let posX = 50;              
let velocityY = 0;          
let isMovingLeft = false;   
let isMovingRight = false;  

// --- 幽靈障礙物設定 ---
const obstacleSize = 80;
const containerWidth = 800;
const containerHeight = 300;
let isObstacleActive = false;
let obstaclePosX = 0; // 幽靈的X座標 (left)
let obstaclePosY = 0; // 幽靈的Y座標 (bottom)


// --- 遊戲開始/重新開始函數 ---
function startGame() {
    isGameOver = false;
    score = 0;
    scoreDisplay.textContent = '時間: 0s';
    gameOverMessage.classList.add('hidden');

    // 重設主角位置
    posX = 50;
    velocityY = 0;
    player.style.left = `${posX}px`;
    player.style.bottom = `${groundLevel}px`;
    
    // 隱藏障礙物
    obstacle.style.display = 'none'; 
    isObstacleActive = false;

    timerInterval = setInterval(() => {
        score++;
        scoreDisplay.textContent = `時間: ${score}s`;
    }, 1000);

    gameLoopInterval = setInterval(gameLoop, 20); 

    // 隨機生成第一個障礙物
    setTimeout(spawnObstacle, Math.random() * 1500 + 1000); 
}

// --- 跳躍函數 ---
function jump() {
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
    let currentMoveSpeed = baseMoveSpeed;
    
    // 判斷是否在空中 (空中慣性)
    if (parseInt(player.style.bottom) > groundLevel) {
        currentMoveSpeed *= airControlFactor; // 空中速度減慢
    }

    if (isMovingLeft) {
        posX -= currentMoveSpeed;
    }
    if (isMovingRight) {
        posX += currentMoveSpeed;
    }

    // 邊界檢查
    if (posX < 0) {
        posX = 0;
    } else if (posX > containerWidth - obstacleSize) { // 使用 obstacleSize 作為角色尺寸
        posX = containerWidth - obstacleSize;
    }

    player.style.left = `${posX}px`;
}


// --- 障礙物生成和移動 (幽靈隨機移動) ---
function spawnObstacle() {
    if (isGameOver || isObstacleActive) return;
    
    isObstacleActive = true;
    obstacle.style.display = 'block';

    // 幽靈的目標位置 (完全隨機)
    const targetX = Math.random() * (containerWidth - obstacleSize);
    const targetY = Math.random() * (containerHeight - obstacleSize);
    
    // 幽靈的起始位置 (畫面上隨機一處)
    obstaclePosX = Math.random() * (containerWidth - obstacleSize);
    obstaclePosY = Math.random() * (containerHeight - obstacleSize);
    
    // 確保幽靈至少在地面以上
    if (obstaclePosY < groundLevel) obstaclePosY = groundLevel;


    obstacle.style.left = `${obstaclePosX}px`;
    obstacle.style.bottom = `${obstaclePosY}px`;

    // 隨機移動速度 (讓幽靈以不同速度移動)
    const moveDuration = Math.random() * 3000 + 1000; // 1到4秒移動時間

    // 使用CSS Transition來平滑移動
    obstacle.style.transition = `left ${moveDuration/1000}s linear, bottom ${moveDuration/1000}s linear`;
    
    // 強制更新位置到目標點
    // 延遲執行，確保 transition 生效
    setTimeout(() => {
        obstacle.style.left = `${targetX}px`;
        obstacle.style.bottom = `${targetY}px`;
    }, 50);

    // 在移動結束後，重新生成幽靈
    setTimeout(() => {
        // 清除過渡效果，以便下次設定新的
        obstacle.style.transition = 'none'; 
        isObstacleActive = false;
        obstacle.style.display = 'none';

        // 隨機延遲後再次生成
        setTimeout(spawnObstacle, Math.random() * 1500 + 1000);
    }, moveDuration + 50); // 等待移動完成
}

// --- 碰撞檢測 ---
function checkCollision() {
    if (obstacle.style.display === 'none') return;
    
    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    // 檢測重疊
    const horizontalOverlap = 
        playerRect.left < obstacleRect.right &&
        playerRect.right > obstacleRect.left;
        
    const verticalOverlap = 
        playerRect.bottom > obstacleRect.top &&
        playerRect.top < obstacleRect.bottom;

    if (horizontalOverlap && verticalOverlap) {
        endGame();
    }
}


// --- 遊戲循環 (主要邏輯) ---
function gameLoop() {
    if (isGameOver) return;
    applyPhysics();     
    applyMovement();    
    checkCollision();
}


// --- 遊戲結束 ---
function endGame() {
    isGameOver = true;
    
    clearInterval(timerInterval);
    clearInterval(gameLoopInterval);
    // 停止幽靈的移動邏輯
    isObstacleActive = false; 
    obstacle.style.transition = 'none';

    finalScore.textContent = score;
    gameOverMessage.classList.remove('hidden');
}


// --- 事件監聽器：空白鍵跳躍，左右鍵移動 ---
document.addEventListener('keydown', (event) => {
    if (isGameOver && event.code === 'Space') {
        startGame(); 
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
