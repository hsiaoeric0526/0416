/**
 * 主程序模組
 * 負責連接所有功能模組並設置事件監聽器
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('桌遊計分系統已啟動');

    // 開始遊戲按鈕
    const startGameBtn = document.getElementById('start-game');
    startGameBtn.addEventListener('click', () => {
        GameInit.initGame();
        CardEffects.generateAvailableCards();
    });

    // 結束回合按鈕
    const endTurnBtn = document.getElementById('end-turn');
    endTurnBtn.addEventListener('click', () => {
        // 取得所有已勾選卡牌
        const selectedCards = CardEffects.getSelectedCards();
        const gameState = GameInit.getGameState();
        const currentPlayerKey = gameState.currentPlayer;
        const opponentPlayerKey = currentPlayerKey === 'A' ? 'B' : 'A';
        let currentPlayer = currentPlayerKey === 'A' ? GameInit.getPlayerA() : GameInit.getPlayerB();
        let opponentPlayer = opponentPlayerKey === 'A' ? GameInit.getPlayerA() : GameInit.getPlayerB();
        // 依序執行卡牌效果
        selectedCards.forEach(card => {
            // 經濟足夠才執行
            if (currentPlayer.economy >= card.cost) {
                CardEffects.playCard(card);
                // 更新玩家狀態以便下一張卡判斷經濟
                currentPlayer = currentPlayerKey === 'A' ? GameInit.getPlayerA() : GameInit.getPlayerB();
                opponentPlayer = opponentPlayerKey === 'A' ? GameInit.getPlayerA() : GameInit.getPlayerB();
            }
        });
        // 清空勾選
        CardEffects.clearSelectedCards();
        // 結束回合
        TurnController.endCurrentTurn();
    });

    // 重置遊戲按鈕
    const resetGameBtn = document.getElementById('reset-game');
    resetGameBtn.addEventListener('click', () => {
        if (confirm('確定要重置遊戲嗎？當前遊戲進度將會丟失。')) {
            GameInit.resetGame();
            GameStateTracker.resetTracker();
        }
    });

    // 開始新遊戲按鈕（模態框中）
    const newGameBtn = document.getElementById('new-game-btn');
    newGameBtn.addEventListener('click', () => {
        // 隱藏模態框
        const gameOverModal = bootstrap.Modal.getInstance(document.getElementById('game-over-modal'));
        gameOverModal.hide();

        // 重置遊戲
        GameInit.resetGame();
        GameStateTracker.resetTracker();
    });

    // 鍵盤快捷鍵
    document.addEventListener('keydown', (event) => {
        const gameState = GameInit.getGameState();

        // 只有在遊戲進行中才處理鍵盤事件
        if (!gameState.gameStarted || gameState.gameOver) {
            return;
        }

        // 按 Enter 結束回合
        if (event.key === 'Enter') {
            TurnController.endCurrentTurn();
        }
    });

    // 響應式調整
    window.addEventListener('resize', () => {
        // 需要時可以在這裡添加響應式調整邏輯
    });
}); 