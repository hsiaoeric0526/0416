/**
 * 卡牌與效果模組
 * 負責管理卡牌資料和效果邏輯
 */

const CardEffects = (() => {
    // 卡牌資料庫
    const cardDatabase = [
        // 進攻卡系列
        {
            id: 1,
            name: '初階進攻卡',
            cost: 200,
            description: '對對手造成 100 點傷害',
            cardType: 'attack',
            targetType: 'opponent',
            effect: (currentPlayer, opponentPlayer) => {
                const newHealth = Math.max(0, opponentPlayer.health - 100);
                return {
                    opponentUpdates: { health: newHealth },
                    message: `${currentPlayer.name} 使用了初階進攻卡，對 ${opponentPlayer.name} 造成 100 點傷害`
                };
            }
        },
        {
            id: 2,
            name: '中階進攻卡',
            cost: 500,
            description: '對對手造成 300 點傷害',
            cardType: 'attack',
            targetType: 'opponent',
            effect: (currentPlayer, opponentPlayer) => {
                const newHealth = Math.max(0, opponentPlayer.health - 300);
                return {
                    opponentUpdates: { health: newHealth },
                    message: `${currentPlayer.name} 使用了中階進攻卡，對 ${opponentPlayer.name} 造成 300 點傷害`
                };
            }
        },
        {
            id: 3,
            name: '高階進攻卡',
            cost: 1000,
            description: '對對手造成 700 點傷害',
            cardType: 'attack',
            targetType: 'opponent',
            effect: (currentPlayer, opponentPlayer) => {
                const newHealth = Math.max(0, opponentPlayer.health - 700);
                return {
                    opponentUpdates: { health: newHealth },
                    message: `${currentPlayer.name} 使用了高階進攻卡，對 ${opponentPlayer.name} 造成 700 點傷害`
                };
            }
        },

        // 防守卡系列
        {
            id: 4,
            name: '初階防守卡',
            cost: 200,
            description: '回復 100 點生命值',
            cardType: 'defense',
            targetType: 'self',
            effect: (currentPlayer, opponentPlayer) => {
                const newHealth = currentPlayer.health + 100;
                return {
                    playerUpdates: { health: newHealth },
                    message: `${currentPlayer.name} 使用了初階防守卡，回復了 100 點生命值`
                };
            }
        },
        {
            id: 5,
            name: '中階防守卡',
            cost: 500,
            description: '回復 300 點生命值',
            cardType: 'defense',
            targetType: 'self',
            effect: (currentPlayer, opponentPlayer) => {
                const newHealth = currentPlayer.health + 300;
                return {
                    playerUpdates: { health: newHealth },
                    message: `${currentPlayer.name} 使用了中階防守卡，回復了 300 點生命值`
                };
            }
        },
        {
            id: 6,
            name: '高階防守卡',
            cost: 1000,
            description: '回復 700 點生命值',
            cardType: 'defense',
            targetType: 'self',
            effect: (currentPlayer, opponentPlayer) => {
                const newHealth = currentPlayer.health + 700;
                return {
                    playerUpdates: { health: newHealth },
                    message: `${currentPlayer.name} 使用了高階防守卡，回復了 700 點生命值`
                };
            }
        },

        // 道具卡系列
        {
            id: 7,
            name: '道具卡-睡滿八小時',
            cost: 0,
            description: '上班前都有睡飽，身體很健康，回復 500 點生命值',
            cardType: 'item',
            targetType: 'self',
            effect: (currentPlayer, opponentPlayer) => {
                const newHealth = currentPlayer.health + 500;
                return {
                    playerUpdates: { health: newHealth },
                    message: `${currentPlayer.name} 使用了道具卡-睡滿八小時，回復了 500 點生命值`
                };
            }
        },
        {
            id: 8,
            name: '道具卡-中大獎',
            cost: 0,
            description: '下班去彩券行買刮刮樂，運氣超好，立即獲得 1000 點經濟值',
            cardType: 'item',
            targetType: 'self',
            effect: (currentPlayer, opponentPlayer) => {
                const newEconomy = currentPlayer.economy + 1000;
                return {
                    playerUpdates: { economy: newEconomy },
                    message: `${currentPlayer.name} 使用了道具卡-中大獎，獲得了 1000 點經濟值`
                };
            }
        },
        {
            id: 9,
            name: '道具卡-重新啟動',
            cost: 0,
            description: '有隻貓不小心踩到電源線，導致遊戲需重新啟動，重置雙方所有狀態效果',
            cardType: 'item',
            targetType: 'both',
            effect: (currentPlayer, opponentPlayer) => {
                return {
                    playerUpdates: { status: [] },
                    opponentUpdates: { status: [] },
                    message: `${currentPlayer.name} 使用了道具卡-重新啟動，重置了雙方所有狀態效果`
                };
            }
        },
        {
            id: 10,
            name: '道具卡-硬體升級',
            cost: 0,
            description: '設備更新，讓遊戲可以提前收尾，遊戲結束條件設為「當生命值低於500時」',
            cardType: 'item',
            targetType: 'both',
            effect: (currentPlayer, opponentPlayer) => {
                GameInit.updateGameState({
                    customVictoryCondition: true,
                    victoryThreshold: 500
                });
                return {
                    message: `${currentPlayer.name} 使用了道具卡-硬體升級，現在當任一方生命值低於500時，遊戲將結束！`
                };
            }
        },
        {
            id: 11,
            name: '道具卡-駭客興起',
            cost: 0,
            description: '駭客技術日漸成熟，新攻擊層出不窮，經濟值抵銷300（持續兩回合）',
            cardType: 'item',
            targetType: 'self',
            effect: (currentPlayer, opponentPlayer) => {
                const hackerRiseEffect = {
                    name: '駭客興起',
                    type: 'economy_shield',
                    value: 300,
                    duration: 2,
                    isPositive: true
                };
                const newStatus = [...currentPlayer.status, hackerRiseEffect];
                setTimeout(() => { TurnController.updateTurnUI(); }, 0);
                return {
                    playerUpdates: { status: newStatus },
                    message: `${currentPlayer.name} 使用了道具卡-駭客興起，兩回合內每次受到攻擊時，先抵銷300經濟值`
                };
            }
        },
        {
            id: 12,
            name: '道具卡-漏洞彌補',
            cost: 0,
            description: '新攻擊一一被擋下，硬軟體設備慢慢的在更新，生命值抵銷200（持續兩回合）',
            cardType: 'item',
            targetType: 'self',
            effect: (currentPlayer, opponentPlayer) => {
                const patchEffect = {
                    name: '漏洞彌補',
                    type: 'health_shield',
                    value: 200,
                    duration: 2,
                    isPositive: true
                };
                const newStatus = [...currentPlayer.status, patchEffect];
                setTimeout(() => { TurnController.updateTurnUI(); }, 0);
                return {
                    playerUpdates: { status: newStatus },
                    message: `${currentPlayer.name} 使用了道具卡-漏洞彌補，兩回合內每次受到攻擊時，先抵銷200生命值`
                };
            }
        },
        {
            id: 13,
            name: '隨機事件',
            cost: 0,
            description: '觸發一個隨機資安主題事件，可能有正面或負面效果',
            cardType: 'special',
            targetType: 'both',
            effect: (currentPlayer, opponentPlayer) => {
                // 隨機選擇一個事件
                const events = [
                    {
                        name: '密碼強度檢測遊戲',
                        effect: () => {
                            const password = prompt('請設置一個密碼（將會檢測密碼安全性）:');
                            let strength = 0;
                            if (!password) {
                                return { message: `${currentPlayer.name} 放棄了設定密碼` };
                            }
                            if (password.length >= 8) strength += 1;
                            if (/\d/.test(password)) strength += 1;
                            if (/[a-z]/.test(password)) strength += 1;
                            if (/[A-Z]/.test(password)) strength += 1;
                            if (/[^A-Za-z0-9]/.test(password)) strength += 1;
                            let result = null;
                            if (strength >= 4) {
                                // 強
                                result = {
                                    playerUpdates: { health: currentPlayer.health + 200 },
                                    message: `${currentPlayer.name} 設置了強密碼，生命值加200！`
                                };
                            } else if (strength === 3) {
                                // 中
                                result = {
                                    message: `${currentPlayer.name} 設置了中等密碼，生命值不變。`
                                };
                            } else {
                                // 弱
                                result = {
                                    playerUpdates: { health: Math.max(1, currentPlayer.health - 200) },
                                    message: `${currentPlayer.name} 設置了弱密碼，生命值扣200！`
                                };
                            }
                            return result;
                        }
                    },
                    {
                        name: '二步驟驗證',
                        effect: () => {
                            const level = prompt('請評估你目前的二步驟驗證強度（強/中/弱）：');
                            if (!level) return { message: `${currentPlayer.name} 未選擇驗證強度` };
                            if (level.includes('強')) {
                                return {
                                    playerUpdates: { economy: currentPlayer.economy + 500 },
                                    message: `${currentPlayer.name} 二步驟驗證強，經濟值加500！`
                                };
                            } else if (level.includes('中')) {
                                return {
                                    playerUpdates: { economy: currentPlayer.economy + 100 },
                                    message: `${currentPlayer.name} 二步驟驗證中，經濟值加100！`
                                };
                            } else {
                                return {
                                    playerUpdates: { economy: Math.max(0, currentPlayer.economy - 500) },
                                    message: `${currentPlayer.name} 二步驟驗證弱，經濟值扣500！`
                                };
                            }
                        }
                    },
                    {
                        name: '備份設置決策',
                        effect: () => {
                            const level = prompt('請評估你的備份設置（強/中/弱）：');
                            if (!level) return { message: `${currentPlayer.name} 未選擇備份強度` };
                            if (level.includes('強')) {
                                return {
                                    playerUpdates: { health: currentPlayer.health + 300 },
                                    message: `${currentPlayer.name} 備份設置強，生命值加300！`
                                };
                            } else if (level.includes('中')) {
                                return {
                                    playerUpdates: { health: currentPlayer.health + 200 },
                                    message: `${currentPlayer.name} 備份設置中，生命值加200！`
                                };
                            } else {
                                return {
                                    playerUpdates: { health: Math.max(1, currentPlayer.health - 100) },
                                    message: `${currentPlayer.name} 備份設置弱，生命值扣100！`
                                };
                            }
                        }
                    },
                    {
                        name: '選擇安全的網路環境',
                        effect: () => {
                            const level = prompt('請評估你選擇的網路環境安全性（強/中/弱）：');
                            if (!level) return { message: `${currentPlayer.name} 未選擇網路安全強度` };
                            if (level.includes('強')) {
                                return {
                                    playerUpdates: { health: currentPlayer.health + 500 },
                                    message: `${currentPlayer.name} 網路環境安全強，生命值加500！`
                                };
                            } else if (level.includes('中')) {
                                return {
                                    playerUpdates: { health: currentPlayer.health + 100 },
                                    message: `${currentPlayer.name} 網路環境安全中，生命值加100！`
                                };
                            } else {
                                return {
                                    playerUpdates: { health: Math.max(1, currentPlayer.health - 500) },
                                    message: `${currentPlayer.name} 網路環境安全弱，生命值扣500！`
                                };
                            }
                        }
                    },
                    {
                        name: '軟體更新決策',
                        effect: () => {
                            const level = prompt('請評估你的軟體更新策略（強/中/弱）：');
                            if (!level) return { message: `${currentPlayer.name} 未選擇更新強度` };
                            if (level.includes('強')) {
                                return {
                                    playerUpdates: { economy: currentPlayer.economy + 200 },
                                    message: `${currentPlayer.name} 軟體更新強，經濟值加200！`
                                };
                            } else if (level.includes('中')) {
                                return {
                                    message: `${currentPlayer.name} 軟體更新中，經濟值不變。`
                                };
                            } else {
                                return {
                                    playerUpdates: { economy: Math.max(0, currentPlayer.economy - 100) },
                                    message: `${currentPlayer.name} 軟體更新弱，經濟值扣100！`
                                };
                            }
                        }
                    }
                ];

                // 隨機選擇一個事件
                const randomEvent = events[Math.floor(Math.random() * events.length)];
                const eventResult = randomEvent.effect();
                const result = { message: `${currentPlayer.name} 使用了隨機事件卡，觸發了「${randomEvent.name}」事件！` };
                if (!eventResult) return result;
                if (eventResult.message) result.message = eventResult.message;
                if (eventResult.playerUpdates) result.playerUpdates = eventResult.playerUpdates;
                if (eventResult.opponentUpdates) result.opponentUpdates = eventResult.opponentUpdates;
                return result;
            }
        }
    ];

    // 當前可用卡牌
    let availableCards = [];
    // 當前已勾選卡牌 id
    let selectedCardIds = [];

    /**
     * 生成可用卡牌（每回合）
     */
    const generateAvailableCards = () => {
        const gameState = GameInit.getGameState();
        const currentPlayerKey = gameState.currentPlayer;
        const currentPlayer = currentPlayerKey === 'A' ? GameInit.getPlayerA() : GameInit.getPlayerB();
        availableCards = [...cardDatabase];
        selectedCardIds = [];
        renderCards(currentPlayer);
    };

    /**
     * 渲染卡牌為勾選清單
     * @param {Object} currentPlayer - 當前玩家
     */
    const renderCards = (currentPlayer) => {
        const cardContainer = document.getElementById('card-container');
        cardContainer.innerHTML = '';
        availableCards.forEach(card => {
            const isAffordable = currentPlayer.economy >= card.cost;
            const isChecked = selectedCardIds.includes(card.id);
            const cardElement = document.createElement('div');
            cardElement.className = 'col';
            cardElement.innerHTML = `
                <div class="card game-card h-100 ${!isAffordable ? 'card-disabled' : ''}">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <span class="card-title">${card.name}</span>
                        <span class="card-cost">${card.cost}</span>
                    </div>
                    <div class="card-body d-flex align-items-center gap-2">
                        <input type="checkbox" class="form-check-input" id="card-check-${card.id}" ${isChecked ? 'checked' : ''} ${!isAffordable ? 'disabled' : ''} />
                        <label for="card-check-${card.id}" class="mb-0 card-text small">${card.description}</label>
                    </div>
                </div>
            `;
            // 勾選事件
            const checkbox = cardElement.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    if (!selectedCardIds.includes(card.id)) {
                        selectedCardIds.push(card.id);
                    }
                } else {
                    selectedCardIds = selectedCardIds.filter(id => id !== card.id);
                }
            });
            cardContainer.appendChild(cardElement);
        });
    };

    /**
     * 取得已勾選卡牌
     */
    const getSelectedCards = () => selectedCardIds.map(id => availableCards.find(card => card.id === id));
    /**
     * 清空已勾選卡牌
     */
    const clearSelectedCards = () => { selectedCardIds = []; };

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

        // 根據卡牌類型處理效果
        let effectResult;

        if (card.cardType === 'attack') {
            // 處理攻擊卡牌
            effectResult = handleAttackCard(card, currentPlayer, opponentPlayer);
        } else {
            // 處理其他類型卡牌
            effectResult = card.effect(currentPlayer, opponentPlayer);
        }

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
     * 處理攻擊卡牌，考慮攻擊加成和減傷效果，以及經濟/生命抵銷盾
     * @param {Object} card - 卡牌對象
     * @param {Object} currentPlayer - 當前玩家
     * @param {Object} opponentPlayer - 對手玩家
     * @returns {Object} 效果結果
     */
    const handleAttackCard = (card, currentPlayer, opponentPlayer) => {
        // 獲取卡牌原始效果
        const originalEffect = card.effect(currentPlayer, opponentPlayer);

        // 取得盾狀態
        const economyShield = opponentPlayer.status.find(status => status.type === 'economy_shield');
        const healthShield = opponentPlayer.status.find(status => status.type === 'health_shield');
        const attackBoost = currentPlayer.status.find(status => status.type === 'attack_boost');
        const damageReduction = opponentPlayer.status.find(status => status.type === 'damage_reduction');

        // 如果沒有盾與修飾效果，直接返回原始效果
        if (!economyShield && !healthShield && !attackBoost && !damageReduction) {
            return originalEffect;
        }

        // 複製原始效果結果
        const modifiedEffect = { ...originalEffect };

        // 如果有對手生命值更新，應用盾與修飾效果
        if (modifiedEffect.opponentUpdates && typeof modifiedEffect.opponentUpdates.health !== 'undefined') {
            // 計算原始傷害
            let damage = opponentPlayer.health - modifiedEffect.opponentUpdates.health;
            let shieldMsg = '';
            let newEconomy = opponentPlayer.economy;
            let newHealth = opponentPlayer.health;

            // 攻擊加成
            if (attackBoost) {
                damage = Math.floor(damage * (1 + attackBoost.value));
            }
            // 減傷效果
            if (damageReduction) {
                damage = Math.floor(damage * (1 - damageReduction.value));
            }

            // 先抵銷經濟值
            if (economyShield && damage > 0) {
                const shieldValue = economyShield.value;
                const usedEconomy = Math.min(shieldValue, damage, newEconomy);
                if (usedEconomy > 0) {
                    newEconomy -= usedEconomy;
                    damage -= usedEconomy;
                    shieldMsg += `（駭客興起：經濟值抵銷${usedEconomy}）`;
                }
            }
            // 再抵銷生命值
            if (healthShield && damage > 0) {
                const shieldValue = healthShield.value;
                const usedHealth = Math.min(shieldValue, damage);
                if (usedHealth > 0) {
                    damage -= usedHealth;
                    shieldMsg += `（漏洞彌補：生命值抵銷${usedHealth}）`;
                }
            }
            // 最終傷害
            if (damage < 0) damage = 0;
            newHealth = Math.max(0, newHealth - damage);
            modifiedEffect.opponentUpdates.health = newHealth;
            if (typeof modifiedEffect.opponentUpdates.economy === 'undefined' && newEconomy !== opponentPlayer.economy) {
                modifiedEffect.opponentUpdates.economy = newEconomy;
            }
            // 更新訊息
            let effectMessage = modifiedEffect.message;
            effectMessage += shieldMsg;
            modifiedEffect.message = effectMessage;
        }
        return modifiedEffect;
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
        getCardById: (id) => cardDatabase.find(card => card.id === id),
        getSelectedCards,
        clearSelectedCards
    };
})(); 