/**
 * 勝負判定模組
 * 負責檢查遊戲勝負條件和處理遊戲結束邏輯
 */

const VictoryCondition = (() => {
    // 勝負條件類型
    const VICTORY_CONDITIONS = {
        HEALTH_DEPLETED: 'health_depleted', // 生命值歸零
        HEALTH_BELOW_THRESHOLD: 'health_below_threshold', // 生命值低於閾值
        SURRENDER: 'surrender'              // 投降
    };

    /**
     * 檢查勝負條件
     * @returns {boolean} 遊戲是否已結束
     */
    const checkVictoryCondition = () => {
        const playerA = GameInit.getPlayerA();
        const playerB = GameInit.getPlayerB();
        const gameState = GameInit.getGameState();

        // 如果遊戲已經結束，則不再檢查
        if (gameState.gameOver) {
            return true;
        }

        // 檢查生命值是否歸零
        if (playerA.health <= 0) {
            endGame(playerB, playerA, VICTORY_CONDITIONS.HEALTH_DEPLETED);
            return true;
        }

        if (playerB.health <= 0) {
            endGame(playerA, playerB, VICTORY_CONDITIONS.HEALTH_DEPLETED);
            return true;
        }

        // 檢查自定義勝利條件（硬體升級卡）
        if (gameState.customVictoryCondition && gameState.victoryThreshold) {
            // 檢查玩家生命值是否低於閾值
            if (playerA.health < gameState.victoryThreshold) {
                endGame(playerB, playerA, VICTORY_CONDITIONS.HEALTH_BELOW_THRESHOLD);
                return true;
            }

            if (playerB.health < gameState.victoryThreshold) {
                endGame(playerA, playerB, VICTORY_CONDITIONS.HEALTH_BELOW_THRESHOLD);
                return true;
            }
        }

        return false;
    };

    /**
     * 玩家投降
     * @param {string} playerKey - 投降的玩家標識 ('A' 或 'B')
     */
    const surrender = (playerKey) => {
        const playerA = GameInit.getPlayerA();
        const playerB = GameInit.getPlayerB();

        if (playerKey === 'A') {
            endGame(playerB, playerA, VICTORY_CONDITIONS.SURRENDER);
        } else {
            endGame(playerA, playerB, VICTORY_CONDITIONS.SURRENDER);
        }
    };

    /**
     * 結束遊戲
     * @param {Object} winner - 獲勝玩家
     * @param {Object} loser - 失敗玩家
     * @param {string} condition - 勝利條件
     */
    const endGame = (winner, loser, condition) => {
        // 更新遊戲狀態
        GameInit.updateGameState({ gameOver: true });

        // 記錄遊戲結束信息
        let victoryMessage;
        switch (condition) {
            case VICTORY_CONDITIONS.HEALTH_DEPLETED:
                victoryMessage = `${loser.name} 生命值歸零，${winner.name} 獲勝！`;
                break;

            case VICTORY_CONDITIONS.HEALTH_BELOW_THRESHOLD:
                const threshold = GameInit.getGameState().victoryThreshold;
                victoryMessage = `${loser.name} 生命值低於 ${threshold}，${winner.name} 獲勝！`;
                break;

            case VICTORY_CONDITIONS.SURRENDER:
                victoryMessage = `${loser.name} 投降，${winner.name} 獲勝！`;
                break;

            default:
                victoryMessage = `${winner.name} 獲勝！`;
                break;
        }

        GameStateTracker.addHistoryEntry(victoryMessage);

        // 顯示遊戲結束模態框
        showGameEndModal(winner, loser, victoryMessage);
    };

    /**
     * 顯示遊戲結束模態框
     * @param {Object} winner - 獲勝玩家
     * @param {Object} loser - 失敗玩家
     * @param {string} victoryMessage - 勝利信息
     */
    const showGameEndModal = (winner, loser, victoryMessage) => {
        const gameOverModal = new bootstrap.Modal(document.getElementById('game-over-modal'));

        // 設置模態框內容
        document.getElementById('winner-name').textContent = `${winner.name} 獲勝！`;

        // 設置詳細結果
        const gameResultDetails = document.getElementById('game-result-details');
        gameResultDetails.innerHTML = `
            ${victoryMessage}<br>
            遊戲回合數：${GameInit.getGameState().turn}<br>
            ${winner.name} 剩餘生命值：${winner.health}<br>
            ${winner.name} 剩餘經濟值：${winner.economy}<br>
            ${loser.name} 剩餘生命值：${loser.health}<br>
            ${loser.name} 剩餘經濟值：${loser.economy}
        `;

        // 顯示模態框
        gameOverModal.show();
    };

    // 公開方法
    return {
        checkVictoryCondition,
        surrender
    };
})(); 