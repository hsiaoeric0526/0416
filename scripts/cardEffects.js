/**
 * 卡牌與效果模組
 * 負責管理卡牌資料和效果邏輯
 */

const CardEffects = (() => {
    // 卡牌資料庫
    const cardDatabase = [
        {
            id: 1,
            name: '火球術',
            cost: 300,
            description: '對對手造成 200 點傷害',
            cardType: 'attack',
            targetType: 'opponent',
            effect: (currentPlayer, opponentPlayer) => {
                // 對對手造成傷害
                const newHealth = Math.max(0, opponentPlayer.health - 200);
                return {
                    opponentUpdates: { health: newHealth },
                    message: `${currentPlayer.name} 使用了火球術，對 ${opponentPlayer.name} 造成 200 點傷害`
                };
            }
        },
        {
            id: 2,
            name: '治療術',
            cost: 350,
            description: '回復 250 點生命值',
            cardType: 'healing',
            targetType: 'self',
            effect: (currentPlayer, opponentPlayer) => {
                // 為自己回復生命值
                const newHealth = currentPlayer.health + 250;
                return {
                    playerUpdates: { health: newHealth },
                    message: `${currentPlayer.name} 使用了治療術，回復了 250 點生命值`
                };
            }
        },
        {
            id: 3,
            name: '經濟投資',
            cost: 500,
            description: '犧牲一回合，下回合獲得 800 經濟值',
            cardType: 'economy',
            targetType: 'self',
            effect: (currentPlayer, opponentPlayer) => {
                // 添加經濟增益狀態
                const economyBoost = {
                    name: '經濟投資',
                    type: 'economy_boost',
                    value: 800,
                    duration: 2, // 下一回合生效
                    isPositive: true
                };

                const newStatus = [...currentPlayer.status, economyBoost];

                return {
                    playerUpdates: { status: newStatus },
                    message: `${currentPlayer.name} 進行了經濟投資，將在下回合獲得 800 經濟值`
                };
            }
        },
        {
            id: 4,
            name: '毒素攻擊',
            cost: 400,
            description: '對對手施加毒素，連續 3 回合每回合造成 100 點傷害',
            cardType: 'attack',
            targetType: 'opponent',
            effect: (currentPlayer, opponentPlayer) => {
                // 添加中毒狀態
                const poisonEffect = {
                    name: '中毒',
                    type: 'damage_over_time',
                    value: 100,
                    duration: 3,
                    isPositive: false
                };

                const newStatus = [...opponentPlayer.status, poisonEffect];

                return {
                    opponentUpdates: { status: newStatus },
                    message: `${currentPlayer.name} 對 ${opponentPlayer.name} 使用了毒素攻擊，連續 3 回合每回合將造成 100 點傷害`
                };
            }
        },
        {
            id: 5,
            name: '經濟破壞',
            cost: 450,
            description: '摧毀對手 350 點經濟值',
            cardType: 'economy',
            targetType: 'opponent',
            effect: (currentPlayer, opponentPlayer) => {
                // 減少對手經濟值
                const newEconomy = Math.max(0, opponentPlayer.economy - 350);

                return {
                    opponentUpdates: { economy: newEconomy },
                    message: `${currentPlayer.name} 使用了經濟破壞，摧毀了 ${opponentPlayer.name} 的 350 點經濟值`
                };
            }
        },
        {
            id: 6,
            name: '經濟收割',
            cost: 200,
            description: '從對手處獲得 150 點經濟值',
            cardType: 'economy',
            targetType: 'both',
            effect: (currentPlayer, opponentPlayer) => {
                // 從對手獲取經濟值
                const deduction = Math.min(opponentPlayer.economy, 150);
                const newPlayerEconomy = currentPlayer.economy + deduction;
                const newOpponentEconomy = opponentPlayer.economy - deduction;

                return {
                    playerUpdates: { economy: newPlayerEconomy },
                    opponentUpdates: { economy: newOpponentEconomy },
                    message: `${currentPlayer.name} 使用了經濟收割，從 ${opponentPlayer.name} 處獲得了 ${deduction} 點經濟值`
                };
            }
        },
        {
            id: 7,
            name: '生命汲取',
            cost: 600,
            description: '對對手造成 300 點傷害，並回復自身等量生命值',
            cardType: 'attack',
            targetType: 'both',
            effect: (currentPlayer, opponentPlayer) => {
                // 計算實際傷害（不能超過對手當前生命值）
                const damage = Math.min(opponentPlayer.health, 300);
                const newOpponentHealth = opponentPlayer.health - damage;
                const newPlayerHealth = currentPlayer.health + damage;

                return {
                    playerUpdates: { health: newPlayerHealth },
                    opponentUpdates: { health: newOpponentHealth },
                    message: `${currentPlayer.name} 使用了生命汲取，對 ${opponentPlayer.name} 造成 ${damage} 點傷害並回復了等量生命值`
                };
            }
        },
        {
            id: 8,
            name: '護盾術',
            cost: 400,
            description: '獲得護盾，抵消接下來 2 回合共 300 點傷害',
            cardType: 'defense',
            targetType: 'self',
            effect: (currentPlayer, opponentPlayer) => {
                // 添加護盾狀態
                const shieldEffect = {
                    name: '護盾',
                    type: 'shield',
                    value: 300, // 護盾值
                    duration: 2,
                    isPositive: true
                };

                const newStatus = [...currentPlayer.status, shieldEffect];

                return {
                    playerUpdates: { status: newStatus },
                    message: `${currentPlayer.name} 使用了護盾術，獲得了可抵消 300 點傷害的護盾`
                };
            }
        }
    ];

    // 當前可用卡牌
    let availableCards = [];

    /**
     * 生成可用卡牌（每回合）
     */
    const generateAvailableCards = () => {
        const gameState = GameInit.getGameState();
        const currentPlayerKey = gameState.currentPlayer;
        const currentPlayer = currentPlayerKey === 'A' ? GameInit.getPlayerA() : GameInit.getPlayerB();

        // 隨機選擇卡牌（這裡為了簡單，我們使用所有卡牌，實際遊戲可能需要隨機選擇部分卡牌）
        availableCards = [...cardDatabase];

        // 渲染卡牌
        renderCards(currentPlayer);
    };

    /**
     * 渲染卡牌到 UI
     * @param {Object} currentPlayer - 當前玩家
     */
    const renderCards = (currentPlayer) => {
        const cardContainer = document.getElementById('card-container');
        cardContainer.innerHTML = '';

        availableCards.forEach(card => {
            // 檢查卡牌是否可用（經濟是否足夠）
            const isAffordable = currentPlayer.economy >= card.cost;

            // 創建卡牌元素
            const cardElement = document.createElement('div');
            cardElement.className = `col`;
            cardElement.innerHTML = `
                <div class="card game-card h-100 ${!isAffordable ? 'card-disabled' : ''}" data-card-id="${card.id}">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span>${card.name}</span>
                        <span class="card-cost">${card.cost}</span>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${card.description}</p>
                    </div>
                </div>
            `;

            // 為可負擔的卡牌添加點擊事件
            if (isAffordable) {
                cardElement.querySelector('.game-card').addEventListener('click', () => playCard(card));
            }

            cardContainer.appendChild(cardElement);
        });
    };

    /**
     * 使用卡牌
     * @param {Object} card - 卡牌對象
     */
    const playCard = (card) => {
        const gameState = GameInit.getGameState();

        // 如果遊戲已結束，不允許使用卡牌
        if (gameState.gameOver) {
            return;
        }

        const currentPlayerKey = gameState.currentPlayer;
        const opponentPlayerKey = currentPlayerKey === 'A' ? 'B' : 'A';

        const currentPlayer = currentPlayerKey === 'A' ? GameInit.getPlayerA() : GameInit.getPlayerB();
        const opponentPlayer = opponentPlayerKey === 'A' ? GameInit.getPlayerA() : GameInit.getPlayerB();

        // 再次檢查經濟是否足夠
        if (currentPlayer.economy < card.cost) {
            return;
        }

        // 扣除卡牌費用
        const newEconomy = currentPlayer.economy - card.cost;
        const playerUpdateMethod = currentPlayerKey === 'A' ? GameInit.updatePlayerA : GameInit.updatePlayerB;
        playerUpdateMethod({ economy: newEconomy });

        // 應用卡牌效果
        const effectResult = card.effect(currentPlayer, opponentPlayer);

        // 更新玩家狀態
        if (effectResult.playerUpdates) {
            playerUpdateMethod(effectResult.playerUpdates);
        }

        // 更新對手狀態
        if (effectResult.opponentUpdates) {
            const opponentUpdateMethod = opponentPlayerKey === 'A' ? GameInit.updatePlayerA : GameInit.updatePlayerB;
            opponentUpdateMethod(effectResult.opponentUpdates);
        }

        // 記錄操作
        GameStateTracker.addHistoryEntry(effectResult.message);

        // 更新玩家統計數據顯示
        GameStateTracker.updatePlayerStats();

        // 更新狀態 UI 顯示
        if (effectResult.playerUpdates && effectResult.playerUpdates.status) {
            TurnController.updateTurnUI();
        }

        if (effectResult.opponentUpdates && effectResult.opponentUpdates.status) {
            TurnController.updateTurnUI();
        }

        // 重新渲染卡牌（經濟值已經變化）
        renderCards(currentPlayerKey === 'A' ? GameInit.getPlayerA() : GameInit.getPlayerB());

        // 檢查勝負條件
        VictoryCondition.checkVictoryCondition();
    };

    /**
     * 清空卡牌顯示
     */
    const clearCards = () => {
        const cardContainer = document.getElementById('card-container');
        if (cardContainer) {
            cardContainer.innerHTML = '';
        }
    };

    // 公開方法
    return {
        generateAvailableCards,
        clearCards,
        getCardById: (id) => cardDatabase.find(card => card.id === id)
    };
})(); 