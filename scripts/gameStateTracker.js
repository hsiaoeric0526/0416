/**
 * 遊戲狀態與分數模組
 * 負責記錄與更新遊戲進行中的各種狀態
 */

const GameStateTracker = (() => {
    // 遊戲歷史記錄
    let gameHistory = [];

    /**
     * 更新玩家統計數據顯示
     */
    const updatePlayerStats = () => {
        const playerA = GameInit.getPlayerA();
        const playerB = GameInit.getPlayerB();

        // 更新生命值顯示
        document.getElementById('player-a-health').textContent = playerA.health;
        document.getElementById('player-b-health').textContent = playerB.health;

        // 更新經濟值顯示
        document.getElementById('player-a-economy').textContent = playerA.economy;
        document.getElementById('player-b-economy').textContent = playerB.economy;
    };

    /**
     * 添加遊戲歷史記錄
     * @param {string} message - 歷史記錄信息
     */
    const addHistoryEntry = (message) => {
        const timestamp = new Date().toLocaleTimeString();
        const entry = `${timestamp} - ${message}`;

        // 添加到內部歷史記錄
        gameHistory.push(entry);

        // 更新 UI
        const historyContainer = document.getElementById('game-history');
        const entryElement = document.createElement('div');
        entryElement.className = 'history-entry';
        entryElement.textContent = message;

        historyContainer.appendChild(entryElement);

        // 滾動到底部
        historyContainer.scrollTop = historyContainer.scrollHeight;
    };

    /**
     * 獲取遊戲當前狀態摘要
     * @returns {Object} 遊戲狀態摘要
     */
    const getGameSummary = () => {
        const playerA = GameInit.getPlayerA();
        const playerB = GameInit.getPlayerB();
        const gameState = GameInit.getGameState();

        return {
            turn: gameState.turn,
            playerA: {
                name: playerA.name,
                health: playerA.health,
                economy: playerA.economy,
                statusCount: playerA.status.length
            },
            playerB: {
                name: playerB.name,
                health: playerB.health,
                economy: playerB.economy,
                statusCount: playerB.status.length
            },
            currentPlayer: gameState.currentPlayer,
            gameOver: gameState.gameOver
        };
    };

    /**
     * 獲取完整遊戲歷史
     * @returns {Array} 遊戲歷史記錄
     */
    const getGameHistory = () => {
        return [...gameHistory];
    };

    /**
     * 重置遊戲狀態追蹤器
     */
    const resetTracker = () => {
        gameHistory = [];
    };

    // 公開方法
    return {
        updatePlayerStats,
        addHistoryEntry,
        getGameSummary,
        getGameHistory,
        resetTracker
    };
})(); 