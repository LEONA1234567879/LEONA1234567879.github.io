// 監督員的所有回覆句子
const responses = [
    "所以呢 ? 這就是你不讀書的理由喔",
    "笑死 誰在乎?你今天是有達成進度了喔",
    "喔 所以段考可以全科滿分了嗎?"
    "看起來醫學系穩了呢 還有時間聊天"
    "不拿書來讀是因為手殘嗎"
    "你以為你學測可以猜對幾題 笑死"
    "書不是毒藥欸 碰一下不會死喔"
    "我拜託你讀書是看得起你欸 連你這樣的學生我都不放棄 我人好好喔"
    "提醒一下 以後沒有滑reels專家這個工作喲"
    "你腦袋甚麼時候可以動一下呢"
    "腦袋不是展示品 尤其是你的 沒人要展 所以多動吧"
    "笑死你沒頭腦到要跟路易十六借了"
    "看起來你段考都穩了喔 還有空聊天"

];

// 獲取 DOM 元素
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');

/**
 * 隨機選取一個監督員的回覆
 * @returns {string} 隨機回覆內容
 */
function getSupervisorResponse() {
    // 1. 生成一個隨機索引
    const randomIndex = Math.floor(Math.random() * responses.length);
    // 2. 返回對應的句子
    return responses[randomIndex];
}

/**
 * 將訊息顯示在聊天框中
 * @param {string} message - 訊息內容
 * @param {string} sender - 'user' 或 'supervisor'
 */
function displayMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(`${sender}-message`);
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    messageDiv.appendChild(messageSpan);
    chatBox.appendChild(messageDiv);
    
    // 讓聊天框自動捲動到最新訊息
    chatBox.scrollTop = chatBox.scrollHeight;
}

/**
 * 處理使用者送出訊息的函數
 */
function sendMessage() {
    const userText = userInput.value.trim();
    
    // 如果輸入框是空的，則不處理
    if (userText === '') {
        return;
    }
    
    // 1. 顯示使用者的訊息
    displayMessage(userText, 'user');
    
    // 2. 獲取監督員的隨機回覆
    const supervisorReply = getSupervisorResponse();
    
    // 3. 延遲一下顯示監督員的回覆，模擬思考時間 (非必須)
    setTimeout(() => {
        displayMessage(supervisorReply, 'supervisor');
    }, 500);
    
    // 4. 清空輸入框
    userInput.value = '';
}
