/**
 * 回合控制模組
 * 負責控制遊戲回合流程和玩家輪換
 */

const TurnController = (() => {
    /**
     * 開始新回合
     */
    const startNewTurn = () => {
        const gameState = GameInit.getGameState();

        // 檢查遊戲是否已經結束
        if (gameState.gameOver) {
            return;
        }

        // 根據回合數決定當前玩家
        const newTurn = gameState.turn + 1;
        const currentPlayer = newTurn % 2 === 1 ? 'A' : 'B';

        // 更新遊戲狀態
        GameInit.updateGameState({
            turn: newTurn,
            currentPlayer: currentPlayer
        });

        // 處理回合開始時的狀態效果
        processStatusEffects();

        // 更新 UI
        updateTurnUI();

        // 重新生成可用卡牌
        CardEffects.generateAvailableCards();

        // 記錄回合開始
        const playerName = currentPlayer === 'A'
            ? GameInit.getPlayerA().name
            : GameInit.getPlayerB().name;
        GameStateTracker.addHistoryEntry(`第 ${newTurn} 回合開始，輪到 ${playerName}`);

        // 檢查勝負條件
        VictoryCondition.checkVictoryCondition();
    };

    /**
     * 結束當前回合
     */
    const endCurrentTurn = () => {
        // 取得當前回合玩家資訊
        const gameState = GameInit.getGameState();
        const currentPlayer = gameState.currentPlayer;
        const playerName = currentPlayer === 'A'
            ? GameInit.getPlayerA().name
            : GameInit.getPlayerB().name;

        // 記錄回合結束
        GameStateTracker.addHistoryEntry(`${playerName} 結束回合`);

        // 開始新回合
        startNewTurn();
    };

    /**
     * 處理狀態效果（回合開始時）
     */
    const processStatusEffects = () => {
        const gameState = GameInit.getGameState();
        const currentPlayer = gameState.currentPlayer;

        // 處理當前玩家的狀態效果
        if (currentPlayer === 'A') {
            processPlayerStatus(GameInit.getPlayerA(), 'A');
        } else {
            processPlayerStatus(GameInit.getPlayerB(), 'B');
        }
    };

    /**
     * 處理玩家狀態效果
     * @param {Object} player - 玩家對象
     * @param {string} playerKey - 玩家標識（'A' 或 'B'）
     */
    const processPlayerStatus = (player, playerKey) => {
        const newStatus = [];
        const playerUpdateMethod = playerKey === 'A' ? GameInit.updatePlayerA : GameInit.updatePlayerB;

        player.status.forEach(status => {
            // 狀態持續回合數減 1
            const updatedStatus = { ...status, duration: status.duration - 1 };

            // 套用狀態效果
            applyStatusEffect(player, playerKey, updatedStatus);

            // 如果狀態還有剩餘持續時間，保留它
            if (updatedStatus.duration > 0) {
                newStatus.push(updatedStatus);
            } else {
                // 記錄狀態結束
                GameStateTracker.addHistoryEntry(`${player.name} 的 ${updatedStatus.name} 狀態結束`);

                // 更新 UI
                updateStatusUI(playerKey);
            }
        });

        // 更新玩家狀態
        playerUpdateMethod({ status: newStatus });

        // 更新 UI
        updateStatusUI(playerKey);
    };

    /**
     * 套用狀態效果
     * @param {Object} player - 玩家對象
     * @param {string} playerKey - 玩家標識
     * @param {Object} status - 狀態對象
     */
    const applyStatusEffect = (player, playerKey, status) => {
        const playerUpdateMethod = playerKey === 'A' ? GameInit.updatePlayerA : GameInit.updatePlayerB;

        // 基於狀態類型應用效果
        switch (status.type) {
            case 'health_regen':
                // 生命值回復
                const newHealth = player.health + status.value;
                playerUpdateMethod({ health: newHealth });
                GameStateTracker.addHistoryEntry(`${player.name} 回復了 ${status.value} 點生命值（${status.name}）`);
                break;

            case 'economy_boost':
                // 經濟值增加
                const newEconomy = player.economy + status.value;
                playerUpdateMethod({ economy: newEconomy });
                GameStateTracker.addHistoryEntry(`${player.name} 獲得了 ${status.value} 點經濟值（${status.name}）`);
                break;

            case 'damage_over_time':
                // 持續傷害
                const reducedHealth = Math.max(0, player.health - status.value);
                playerUpdateMethod({ health: reducedHealth });
                GameStateTracker.addHistoryEntry(`${player.name} 受到 ${status.value} 點傷害（${status.name}）`);
                break;

            case 'economy_drain':
                // 經濟值消耗
                const reducedEconomy = Math.max(0, player.economy - status.value);
                playerUpdateMethod({ economy: reducedEconomy });
                GameStateTracker.addHistoryEntry(`${player.name} 失去了 ${status.value} 點經濟值（${status.name}）`);
                break;

            default:
                break;
        }

        // 更新 UI
        GameStateTracker.updatePlayerStats();
    };

    /**
     * 更新回合 UI
     */
    const updateTurnUI = () => {
        const gameState = GameInit.getGameState();
        const playerA = GameInit.getPlayerA();
        const playerB = GameInit.getPlayerB();

        // 更新回合數顯示
        document.getElementById('turn-counter').textContent = gameState.turn;

        // 更新當前玩家顯示
        document.getElementById('current-player-name').textContent =
            gameState.currentPlayer === 'A' ? playerA.name : playerB.name;

        // 更新活躍玩家高亮
        document.getElementById('player-a-panel').classList.toggle('active-player', gameState.currentPlayer === 'A');
        document.getElementById('player-b-panel').classList.toggle('active-player', gameState.currentPlayer === 'B');
    };

    /**
     * 更新狀態 UI
     * @param {string} playerKey - 玩家標識
     */
    const updateStatusUI = (playerKey) => {
        const player = playerKey === 'A' ? GameInit.getPlayerA() : GameInit.getPlayerB();
        const statusContainer = document.getElementById(`player-${playerKey.toLowerCase()}-status`);

        // 清空狀態容器
        statusContainer.innerHTML = '';

        // 添加所有狀態標籤
        player.status.forEach(status => {
            const statusElement = document.createElement('span');
            statusElement.className = `status-badge ${status.isPositive ? 'buff' : 'debuff'}`;
            statusElement.textContent = `${status.name} (${status.duration})`;
            statusContainer.appendChild(statusElement);
        });
    };

    // 公開方法
    return {
        startNewTurn,
        endCurrentTurn,
        updateTurnUI
    };
})(); 