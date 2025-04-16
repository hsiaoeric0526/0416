/**
 * 遊戲初始化模組
 * 負責設定玩家初始狀態並準備遊戲環境
 */

const GameInit = (() => {
    // 默認遊戲設定
    const DEFAULT_SETTINGS = {
        initialHealth: 1500,
        initialEconomy: 1500,
        firstPlayer: 'A'
    };

    // 玩家狀態
    let playerA = {
        name: '玩家 A',
        health: DEFAULT_SETTINGS.initialHealth,
        economy: DEFAULT_SETTINGS.initialEconomy,
        status: [] // 存放 buff/debuff
    };

    let playerB = {
        name: '玩家 B',
        health: DEFAULT_SETTINGS.initialHealth,
        economy: DEFAULT_SETTINGS.initialEconomy,
        status: [] // 存放 buff/debuff
    };

    // 遊戲當前狀態
    let gameState = {
        turn: 1,
        currentPlayer: 'A',
        gameStarted: false,
        gameOver: false
    };

    /**
     * 初始化遊戲
     * @param {Object} settings - 自定義遊戲設定（可選）
     */
    const initGame = (settings = {}) => {
        // 合併默認設定與自定義設定
        const gameSettings = { ...DEFAULT_SETTINGS, ...settings };

        // 獲取玩家名稱和初始值
        const playerAName = document.getElementById('player-a-name').value || '玩家 A';
        const playerBName = document.getElementById('player-b-name').value || '玩家 B';
        const initialHealth = parseInt(document.getElementById('initial-health').value) || DEFAULT_SETTINGS.initialHealth;
        const initialEconomy = parseInt(document.getElementById('initial-economy').value) || DEFAULT_SETTINGS.initialEconomy;

        // 設定玩家初始狀態
        playerA = {
            name: playerAName,
            health: initialHealth,
            economy: initialEconomy,
            status: []
        };

        playerB = {
            name: playerBName,
            health: initialHealth,
            economy: initialEconomy,
            status: []
        };

        // 設定遊戲初始狀態
        gameState = {
            turn: 1,
            currentPlayer: gameSettings.firstPlayer,
            gameStarted: true,
            gameOver: false
        };

        // 更新 UI 顯示
        updateUIForGameStart();

        return {
            playerA,
            playerB,
            gameState
        };
    };

    /**
     * 更新 UI 顯示以開始遊戲
     */
    const updateUIForGameStart = () => {
        // 隱藏初始化界面
        document.getElementById('game-init').classList.add('d-none');

        // 顯示遊戲界面
        document.getElementById('game-board').classList.remove('d-none');

        // 更新玩家資訊
        document.getElementById('player-a-display-name').textContent = playerA.name;
        document.getElementById('player-b-display-name').textContent = playerB.name;
        document.getElementById('player-a-health').textContent = playerA.health;
        document.getElementById('player-b-health').textContent = playerB.health;
        document.getElementById('player-a-economy').textContent = playerA.economy;
        document.getElementById('player-b-economy').textContent = playerB.economy;

        // 更新回合顯示
        document.getElementById('turn-counter').textContent = gameState.turn;
        document.getElementById('current-player-name').textContent =
            gameState.currentPlayer === 'A' ? playerA.name : playerB.name;

        // 設定活躍玩家
        document.getElementById('player-a-panel').classList.toggle('active-player', gameState.currentPlayer === 'A');
        document.getElementById('player-b-panel').classList.toggle('active-player', gameState.currentPlayer === 'B');
    };

    /**
     * 重置遊戲
     */
    const resetGame = () => {
        // 隱藏遊戲界面
        document.getElementById('game-board').classList.add('d-none');

        // 顯示初始化界面
        document.getElementById('game-init').classList.remove('d-none');

        // 清除遊戲歷史
        document.getElementById('game-history').innerHTML = '<div class="history-entry">遊戲開始！</div>';

        // 重置狀態區域
        document.getElementById('player-a-status').innerHTML = '';
        document.getElementById('player-b-status').innerHTML = '';

        gameState.gameStarted = false;
        gameState.gameOver = false;

        // 更新 UI
        CardEffects.clearCards();
    };

    // 公開方法和屬性
    return {
        initGame,
        resetGame,
        getPlayerA: () => playerA,
        getPlayerB: () => playerB,
        getGameState: () => gameState,
        updateGameState: (newState) => {
            gameState = { ...gameState, ...newState };
            return gameState;
        },
        updatePlayerA: (updates) => {
            playerA = { ...playerA, ...updates };
            return playerA;
        },
        updatePlayerB: (updates) => {
            playerB = { ...playerB, ...updates };
            return playerB;
        }
    };
})(); 