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
const jumpVelocity = 18;    
const gravity = 1;          
const baseMoveSpeed = 8;    
const airControlFactor = 0.5; // 空中慣性係數：移動速度降為一半

let posX = 50;              // 主角水平位置 (left)
let velocityY = 0;          // 主角垂直速度
let isMovingLeft = false;   
let isMovingRight = false;  

// --- 角色尺寸設定 (與 CSS 保持一致) ---
const characterSize = 80;
const containerWidth = 800;

let isObstacleActive = false;


// --- 遊戲開始/重新開始函數 (不變) ---
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

// --- 跳躍函數 (不變) ---
function jump() {
    if (parseInt(player.style.bottom) === groundLevel && !isGameOver) {
        velocityY = jumpVelocity;
    }
}

// --- 物理更新 (重力與跳躍) (不變) ---
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

// --- 水平移動更新 (使用 characterSize 調整邊界) ---
function applyMovement() {
    let currentMoveSpeed = baseMoveSpeed;
    
    // 判斷是否在空中 (空中慣性)
    if (parseInt(player.style.bottom) > groundLevel) {
        currentMoveSpeed *= airControlFactor; 
    }

    if (isMovingLeft) {
        posX -= currentMoveSpeed;
    }
    if (isMovingRight) {
        posX += currentMoveSpeed;
    }

    // 邊界檢查 (使用 characterSize)
    if (posX < 0) {
        posX = 0;
    } else if (posX > containerWidth - characterSize) {
        posX = containerWidth - characterSize;
    }

    player.style.left = `${posX}px`;
}


// --- 障礙物生成和移動 (幽靈只在地面隨機移動) ---
function spawnObstacle() {
    if (isGameOver || isObstacleActive) return;
    
    isObstacleActive = true;
    obstacle.style.display = 'block';

    // 隨機目標 X 座標 (必須在遊戲區域內，且在地板上)
    const targetX = Math.random() * (containerWidth - characterSize);
    
    // 幽靈的起始 X 座標 (畫面上隨機一處)
    let obstaclePosX = Math.random() * (containerWidth - characterSize);

    // 幽靈永遠在地面上 (bottom: 0px)
    obstacle.style.bottom = `${groundLevel}px`;
    
    // 設置初始位置
    obstacle.style.left = `${obstaclePosX}px`;
    
    // 隨機移動速度
    const moveDuration = Math.random() * 3000 + 1000; // 1到4秒移動時間

    // 使用 CSS Transition 來平滑移動 (只有左右移動)
    obstacle.style.transition = `left ${moveDuration/1000}s linear`;
    
    // 延遲執行，設定目標位置
    setTimeout(() => {
        obstacle.style.left = `${targetX}px`;
    }, 50);

    // 在移動結束後，重新生成幽靈
    setTimeout(() => {
        // 清除過渡效果
        obstacle.style.transition = 'none'; 
        isObstacleActive = false;
        obstacle.style.display = 'none';

        // 隨機延遲後再次生成
        setTimeout(spawnObstacle, Math.random() * 1500 + 1000);
    }, moveDuration + 50); // 等待移動完成
}

// --- 碰撞檢測 (不變，它已經是判斷圖片框重疊) ---
function checkCollision() {
    if (obstacle.style.display === 'none') return;
    
    // 使用 getBoundingClientRect 獲取精確的邊界位置
    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    // 檢測水平和垂直方向的重疊
    const horizontalOverlap = 
        playerRect.left < obstacleRect.right &&
        playerRect.right > obstacleRect.left;
        
    const verticalOverlap = 
        playerRect.bottom > obstacleRect.top &&
        playerRect.top < obstacleRect.bottom;

    // 碰撞發生！
    if (horizontalOverlap && verticalOverlap) {
        endGame();
    }
}


// --- 遊戲循環、結束、事件監聽器 (不變) ---
function gameLoop() {
    if (isGameOver) return;
    applyPhysics();     
    applyMovement();    
    checkCollision();
}


function endGame() {
    isGameOver = true;
    
    clearInterval(timerInterval);
    clearInterval(gameLoopInterval);
    isObstacleActive = false; 
    obstacle.style.transition = 'none';

    finalScore.textContent = score;
    gameOverMessage.classList.remove('hidden');
}


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


window.onload = () => {
    endGame();
    gameOverMessage.classList.remove('hidden'); 
    finalScore.textContent = 0; 
};
