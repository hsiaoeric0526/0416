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
                // 定義事件資料
                const events = [
                    {
                        name: '系統安全升級',
                        desc: `公司的資訊系統即將進行安全性升級，
系統要求你更新個人帳號的密碼。
近期有許多公司遭受密碼破解攻擊，
請謹慎設置你的新密碼。

提示：
- 此密碼將用於存取所有公司系統
- 密碼不建議包含個人資訊（如生日、名字）
- 請避免使用曾經用過的密碼
- 建議使用密碼管理工具協助記憶`,
                        type: 'password',
                        handler: (input) => {
                            let strength = 0;
                            if (!input) return { message: `${currentPlayer.name} 放棄了設置密碼` };
                            if (input.length >= 8) strength += 1;
                            if (/\d/.test(input)) strength += 1;
                            if (/[a-z]/.test(input)) strength += 1;
                            if (/[A-Z]/.test(input)) strength += 1;
                            if (/[^A-Za-z0-9]/.test(input)) strength += 1;
                            if (strength >= 4) {
                                return {
                                    playerUpdates: { health: currentPlayer.health + 200 },
                                    message: `${currentPlayer.name} 設置了高強度密碼！具備多重防護，有效防範各類密碼破解攻擊。`
                                };
                            } else if (strength === 3) {
                                return {
                                    message: `${currentPlayer.name} 設置的密碼安全性尚可接受，但建議可再增加複雜度。`
                                };
                            } else {
                                return {
                                    playerUpdates: { health: Math.max(1, currentPlayer.health - 200) },
                                    message: `警告！${currentPlayer.name} 設置的密碼容易遭到破解，建議立即重新設置更強的密碼。`
                                };
                            }
                        }
                    },
                    {
                        name: '異常登入警報',
                        desc: `你收到公司系統的異常登入警報通知，
顯示有人在非常規時間、從未知位置
嘗試登入你的帳號。
請選擇處理方式：

A. 啟用 Google Authenticator 驗證，並立即變更密碼
B. 開啟 SMS 簡訊驗證，保持密碼不變
C. 暫時封鎖帳號，等上班時再處理`,
                        type: 'level',
                        handler: (level) => {
                            if (level === '強') {
                                return {
                                    playerUpdates: { economy: currentPlayer.economy + 500 },
                                    message: `${currentPlayer.name} 成功阻止未授權登入！多重驗證提供了最佳防護。`
                                };
                            } else if (level === '中') {
                                return {
                                    playerUpdates: { economy: currentPlayer.economy + 100 },
                                    message: `${currentPlayer.name} 啟用了基本的驗證機制，但建議使用更安全的驗證方式。`
                                };
                            } else {
                                return {
                                    playerUpdates: { economy: Math.max(0, currentPlayer.economy - 500) },
                                    message: `${currentPlayer.name} 的帳號暫時安全，但可能影響工作，且未解決根本問題。`
                                };
                            }
                        }
                    },
                    {
                        name: '檔案勒索警報',
                        desc: `公司收到資安警報，某合作企業遭受勒索軟體攻擊，
所有檔案被加密，要求支付贖金。
你負責的專案檔案該如何確保安全？

A. 建立異地加密備份 + 即時同步 + 定期備份測試
B. 雲端備份 + 每週本地備份
C. 僅在本地端進行備份`,
                        type: 'level',
                        handler: (level) => {
                            if (level === '強') {
                                return {
                                    playerUpdates: { health: currentPlayer.health + 300 },
                                    message: `${currentPlayer.name} 的完整備份策略確保資料安全，即使遭受攻擊也能快速復原。`
                                };
                            } else if (level === '中') {
                                return {
                                    playerUpdates: { health: currentPlayer.health + 200 },
                                    message: `${currentPlayer.name} 建立了基本的備份機制，但復原時間可能較長。`
                                };
                            } else {
                                return {
                                    playerUpdates: { health: Math.max(1, currentPlayer.health - 100) },
                                    message: `${currentPlayer.name} 的本地備份有風險，若遭受攻擊可能導致資料完全遺失。`
                                };
                            }
                        }
                    },
                    {
                        name: '遠端工作緊急會議',
                        desc: `在咖啡廳工作時，主管緊急召開線上會議，
需要存取公司機密文件進行簡報。
你會選擇什麼方式連線？

A. 使用行動網路 + VPN + 加密連線
B. 使用咖啡廳 WiFi + VPN
C. 直接使用咖啡廳 WiFi`,
                        type: 'level',
                        handler: (level) => {
                            if (level === '強') {
                                return {
                                    playerUpdates: { health: currentPlayer.health + 500 },
                                    message: `${currentPlayer.name} 採用最高安全標準，確保機密資料傳輸安全。`
                                };
                            } else if (level === '中') {
                                return {
                                    playerUpdates: { health: currentPlayer.health + 100 },
                                    message: `${currentPlayer.name} 啟用了基本安全防護，但公用 WiFi 仍有潛在風險。`
                                };
                            } else {
                                return {
                                    playerUpdates: { health: Math.max(1, currentPlayer.health - 500) },
                                    message: `警告！${currentPlayer.name} 在未加密的網路環境可能導致資料外洩！`
                                };
                            }
                        }
                    },
                    {
                        name: '零時差漏洞預警',
                        desc: `深夜收到系統緊急通知：
發現嚴重的零時差安全漏洞，
需要立即進行系統更新。
但你正在處理一個重要的客戶報表。

A. 立即儲存工作並更新，主動通知團隊成員
B. 設定在一小時後自動更新，先完成手上工作
C. 關閉更新提醒，等報表完成再處理`,
                        type: 'level',
                        handler: (level) => {
                            if (level === '強') {
                                return {
                                    playerUpdates: { economy: currentPlayer.economy + 200 },
                                    message: `${currentPlayer.name} 即時更新成功防禦了可能的攻擊，保護了公司系統。`
                                };
                            } else if (level === '中') {
                                return {
                                    message: `${currentPlayer.name} 的系統最終得到更新，但存在短暫的風險期。`
                                };
                            } else {
                                return {
                                    playerUpdates: { economy: Math.max(0, currentPlayer.economy - 100) },
                                    message: `警告！${currentPlayer.name} 延遲更新導致系統暴露在高風險狀態！`
                                };
                            }
                        }
                    }
                ];
                // 隨機選擇一個事件
                const randomEvent = events[Math.floor(Math.random() * events.length)];
                // 顯示 modal
                return new Promise((resolve) => {
                    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
                    document.getElementById('eventModalLabel').textContent = randomEvent.name;
                    document.getElementById('event-desc').textContent = randomEvent.desc;
                    document.getElementById('event-result').textContent = '';
                    const interactDiv = document.getElementById('event-interact');
                    interactDiv.innerHTML = '';
                    modal.show();
                    // 密碼事件：文字輸入框
                    if (randomEvent.type === 'password') {
                        interactDiv.innerHTML = `
                            <div class="mb-3">
                                <input type="text" class="form-control mb-2" id="event-password-input" placeholder="請輸入密碼">
                                <button class="btn btn-primary w-100" id="event-password-btn">確認</button>
                            </div>`;
                        document.getElementById('event-password-btn').onclick = () => {
                            const val = document.getElementById('event-password-input').value;
                            const result = randomEvent.handler(val);
                            document.getElementById('event-result').textContent = result.message;
                            setTimeout(() => {
                                modal.hide();
                                GameStateTracker.updatePlayerStats();
                                resolve(result);
                            }, 1200);
                        };
                    } else {
                        // 其他事件：選項按鈕
                        interactDiv.innerHTML = '<div class="d-grid gap-2">';
                        const options = {
                            '異常登入警報': [
                                '啟用 Google Authenticator 驗證，並立即變更密碼',
                                '開啟 SMS 簡訊驗證，保持密碼不變',
                                '暫時封鎖帳號，等上班時再處理'
                            ],
                            '檔案勒索警報': [
                                '建立異地加密備份 + 即時同步 + 定期備份測試',
                                '雲端備份 + 每週本地備份',
                                '僅在本地端進行備份'
                            ],
                            '遠端工作緊急會議': [
                                '使用行動網路 + VPN + 加密連線',
                                '使用咖啡廳 WiFi + VPN',
                                '直接使用咖啡廳 WiFi'
                            ],
                            '零時差漏洞預警': [
                                '立即儲存工作並更新，主動通知團隊成員',
                                '設定在一小時後自動更新，先完成手上工作',
                                '關閉更新提醒，等報表完成再處理'
                            ]
                        };

                        const eventOptions = options[randomEvent.name] || ['強', '中', '弱'];
                        const levels = ['強', '中', '弱'];

                        eventOptions.forEach((option, index) => {
                            const buttonClass = index === 0 ? 'btn-success' :
                                index === 1 ? 'btn-warning' :
                                    'btn-danger';
                            interactDiv.innerHTML += `
                                <button class="btn ${buttonClass} mb-2" onclick="(function(){
                                    const result = ${randomEvent.name.replace(/[^a-zA-Z]/g, '_')}_handler('${levels[index]}');
                                    document.getElementById('event-result').textContent = result.message;
                                    setTimeout(() => { 
                                        bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
                                        resolve(result);
                                    }, 1200);
                                })()">
                                    ${option}
                                </button>`;
                        });
                        interactDiv.innerHTML += '</div>';
                    }
                });
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
    const playCard = async (card) => {
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
            // 處理其他類型卡牌，支援 Promise
            effectResult = await card.effect(currentPlayer, opponentPlayer);
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

        return effectResult;
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
        clearSelectedCards,
        playCard
    };
})(); 