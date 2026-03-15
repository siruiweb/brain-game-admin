/**
 * 头脑特工队 - Brain Agent VALHALLA-II v1.1.0
 * Cocos Creator 3.x
 */

// 引入API模块
var Api = require("Api");

cc.Class({
    extends: cc.Component,

    properties: {
        // UI References
        dayLabel: cc.Label,
        healthLabel: cc.Label,
        mentalLabel: cc.Label,
        energyLabel: cc.Label,
        moneyLabel: cc.Label,
        timerFill: cc.Node,
        
        // Containers
        emotionContainer: cc.Node,
        desireContainer: cc.Node,
        actionContainer: cc.Node,
        logContainer: cc.Node,
        
        // Game State
        gameData: null,
    },

    onLoad: function() {
        this.initGameData();
        this.loadSave();
        this.updateUI();
    },

    initGameData: function() {
        this.gameData = {
            day: 1,
            chapter: 1,
            health: 100,
            mental: 100,
            energy: 100,
            money: 1000,
            talent: null,
            countdown: 30,
            achievements: [],
            emotions: { joy: 50, anger: 30, sad: 30, fear: 20, love: 60 },
            desires: { food: 60, money: 70, fame: 50, sleep: 55, play: 65 },
            history: []
        };
        
        this.talents = {
            lucky: { name: "天选之人", icon: "🌟", desc: "正面效果+10%", positive: 0.1 },
            rich: { name: "富二代", icon: "🏠", desc: "初始金钱+5000", startMoney: 5000 },
            genius: { name: "天才", icon: "🧠", desc: "学习效率+20%", knowledge: 0.2 },
            healthy: { name: "体育健将", icon: "💪", desc: "健康上限+20", maxHealth: 120 },
            charmer: { name: "万人迷", icon: "💕", desc: "魅力+20%", charm: 0.2 },
            zen: { name: "禅师", icon: "🧘", desc: "负面效果-20%", emotionStable: 0.2 },
            gambler: { name: "赌徒", icon: "🎰", desc: "投资回报+30%", gambleGain: 0.3 }
        };
        
        this.emotions = [
            { key: "joy", icon: "😄" },
            { key: "anger", icon: "😤" },
            { key: "sad", icon: "😢" },
            { key: "fear", icon: "😰" },
            { key: "love", icon: "❤️" }
        ];
        
        this.desires = [
            { key: "food", icon: "🍔" },
            { key: "money", icon: "💰" },
            { key: "fame", icon: "🏆" },
            { key: "sleep", icon: "😴" },
            { key: "play", icon: "🎮" }
        ];
        
        this.actions = {
            emotions: [
                { name: "💰 赚钱", cost: 0, effects: { joy: 15, money: 30, sleep: -5 } },
                { name: "🎮 玩游戏", cost: 10, effects: { joy: 20, play: 15, money: -10, sleep: -5 } },
                { name: "🏋️ 健身", cost: 20, effects: { anger: -20, health: 10, energy: -10 } },
                { name: "🧘 冥想", cost: 0, effects: { anger: -25, mental: 15, sleep: 5 } },
                { name: "😢 哭一场", cost: 0, effects: { sad: -15, mental: 5 } },
                { name: "🍔 美食", cost: 30, effects: { sad: -10, food: 25, money: -30, joy: 10 } },
                { name: "❤️ 告白", cost: 0, effects: { love: 25, joy: 20, fear: 15 } },
                { name: "💕 约会", cost: 100, effects: { love: 30, money: -100, joy: 25 } }
            ],
            desires: [
                { name: "🍔 吃饭", cost: 20, effects: { food: 35, joy: 10, money: -20, health: 5 } },
                { name: "💵 省钱", cost: 0, effects: { money: 20, joy: 5 } },
                { name: "💼 工作", cost: 0, effects: { money: 100, energy: -30 } },
                { name: "🏆 比赛", cost: 30, effects: { fame: 30, joy: 25, money: -30 } },
                { name: "😴 睡觉", cost: 0, effects: { sleep: 50, energy: 40, health: 10 } },
                { name: "🎮 玩", cost: 20, effects: { play: 35, joy: 25, money: -20, sleep: -10 } },
                { name: "✈️ 旅游", cost: 500, effects: { play: 50, joy: 40, money: -500, energy: -20 } }
            ],
            social: [
                { name: "👥 交友", cost: 0, effects: { joy: 15 } },
                { name: "🎂 聚会", cost: 50, effects: { joy: 30, money: -50 } },
                { name: "🎁 送礼", cost: 50, effects: { money: -50 } }
            ],
            health: [
                { name: "🏃 跑步", cost: 0, effects: { health: 15, energy: -15, joy: 10 } },
                { name: "🧘 瑜伽", cost: 20, effects: { health: 10, mental: 15 } },
                { name: "🏥 看病", cost: 50, effects: { health: 30, money: -50 } }
            ]
        };
        
        this.events = [
            { text: "🌧️ 下雨天", effects: { sad: 10, joy: -5 } },
            { text: "☀️ 阳光好", effects: { joy: 10, sad: -5 } },
            { text: "💼 工作累", effects: { anger: 10, sleep: -10 } },
            { text: "🎂 生日", effects: { joy: 15, money: -10 } },
            { text: "🐔 被骗", effects: { money: -20, anger: 15 } },
            { text: "💪 健身", effects: { joy: 10, health: 10 } },
            { text: "📱 手机坏", effects: { anger: 20, money: -10 } },
            { text: "💔 分手", effects: { love: -30, sad: 25, mental: -15 } },
            { text: "🎉 中奖", effects: { joy: 35, money: 500 } },
            { text: "📚 读书", effects: { joy: 10 } },
            { text: "😴 失眠", effects: { sleep: -25, energy: -15 } },
            { text: "🤒 生病", effects: { health: -20, money: -50 } }
        ];
    },

    // ==================== Game Loop ====================
    startGameLoop: function() {
        this.schedule(this.tick, 1);
    },

    tick: function() {
        if (this.gameData.countdown > 0) {
            this.gameData.countdown--;
            this.updateTimerUI();
        } else {
            this.triggerRandomEvent();
            this.nextDay();
            this.gameData.countdown = 30;
        }
    },

    nextDay: function() {
        this.gameData.day++;
        
        // Natural changes
        this.gameData.emotions.joy = this.clamp(this.gameData.emotions.joy - 2, 0, 100);
        this.gameData.desires.food = this.clamp(this.gameData.desires.food - 5, 0, 100);
        this.gameData.desires.sleep = this.clamp(this.gameData.desires.sleep - 8, 0, 100);
        this.gameData.energy = this.clamp(this.gameData.energy + 10, 0, 100);
        
        // Chapter progression
        if (this.gameData.day >= 30 && this.gameData.chapter < 2) {
            this.gameData.chapter = 2;
            this.addLog("📖 进入第2章 职场新人");
        }
        if (this.gameData.day >= 60 && this.gameData.chapter < 3) {
            this.gameData.chapter = 3;
            this.addLog("📖 进入第3章 创业之路");
        }
        if (this.gameData.day >= 100 && this.gameData.chapter < 4) {
            this.gameData.chapter = 4;
            this.addLog("📖 进入第4章 人生巅峰");
        }
        if (this.gameData.day >= 200 && this.gameData.chapter < 5) {
            this.gameData.chapter = 5;
            this.addLog("📖 进入第5章 传奇人生");
        }
        
        this.checkAchievements();
        this.checkGameOver();
        this.saveGame();
        this.updateUI();
    },

    // ==================== Actions ====================
    performAction: function(action, tab) {
        if (this.gameData.money < action.cost) {
            this.addLog("💸 金钱不足!");
            return;
        }
        
        this.gameData.money -= action.cost;
        this.applyEffects(action.effects);
        
        this.addLog("📅 第" + this.gameData.day + "天 - " + action.name);
        this.checkAchievements();
        this.checkGameOver();
        this.updateUI();
    },

    applyEffects: function(effects) {
        for (let key in effects) {
            let val = effects[key];
            
            if (key in this.gameData.emotions) {
                this.gameData.emotions[key] = this.clamp(this.gameData.emotions[key] + val, 0, 100);
            } else if (key in this.gameData.desires) {
                this.gameData.desires[key] = this.clamp(this.gameData.desires[key] + val, 0, 100);
            } else if (key === "money") {
                this.gameData.money = Math.max(0, this.gameData.money + val);
            } else if (key === "health") {
                this.gameData.health = this.clamp(this.gameData.health + val, 0, 120);
            } else if (key === "mental") {
                this.gameData.mental = this.clamp(this.gameData.mental + val, 0, 100);
            } else if (key === "energy") {
                this.gameData.energy = this.clamp(this.gameData.energy + val, 0, 100);
            }
        }
    },

    triggerRandomEvent: function() {
        if (Math.random() > 0.4) return;
        
        let evt = this.events[Math.floor(Math.random() * this.events.length)];
        this.applyEffects(evt.effects);
        this.addLog("📅 第" + this.gameData.day + "天 - " + evt.text);
    },

    // ==================== Talents ====================
    selectTalent: function(talentKey) {
        let talent = this.talents[talentKey];
        this.gameData.talent = talentKey;
        
        if (talentKey === "rich") {
            this.gameData.money += talent.startMoney;
        }
        if (talentKey === "healthy") {
            this.gameData.health = talent.maxHealth;
        }
        
        this.startGame();
    },

    startGame: function() {
        this.gameData.day = 1;
        this.gameData.chapter = 1;
        this.gameData.countdown = 30;
        this.gameData.achievements = [];
        this.gameData.history = [];
        
        this.updateUI();
        this.startGameLoop();
        this.addLog("🎮 游戏开始!");
    },

    // ==================== Achievements ====================
    checkAchievements: function() {
        let checks = [
            ["day10", this.gameData.day >= 10],
            ["day30", this.gameData.day >= 30],
            ["day100", this.gameData.day >= 100],
            ["day365", this.gameData.day >= 365],
            ["money1k", this.gameData.money >= 1000],
            ["money10k", this.gameData.money >= 10000]
        ];
        
        checks.forEach(([key, cond]) => {
            if (cond && !this.gameData.achievements.includes(key)) {
                this.gameData.achievements.push(key);
                this.addLog("🏆 成就解锁!");
            }
        });
    },

    // ==================== Game Over ====================
    checkGameOver: function() {
        let reason = "";
        let isWin = false;
        
        if (this.gameData.health <= 0) {
            reason = "身体垮掉了!";
        } else if (this.gameData.mental <= 0) {
            reason = "心理崩溃了!";
        } else if (this.gameData.energy <= 0) {
            reason = "累死了!";
        } else if (this.gameData.emotions.anger > 95) {
            reason = "气死了!";
        } else if (this.gameData.emotions.sad > 95) {
            reason = "抑郁死了!";
        } else if (this.gameData.money <= 0 && this.gameData.day > 10) {
            reason = "穷死了!";
        } else if (this.gameData.day >= 365) {
            isWin = true;
            reason = "通关成功!";
        }
        
        if (reason) {
            this.unschedule(this.tick);
            this.showGameOver(reason, isWin);
        }
    },

    showGameOver: function(reason, isWin) {
        cc.log("Game Over: " + reason + " (Win: " + isWin + ")");
    },

    // ==================== UI ====================
    updateUI: function() {
        if (this.dayLabel) this.dayLabel.string = "第" + this.gameData.day + "天";
        if (this.healthLabel) this.healthLabel.string = Math.round(this.gameData.health);
        if (this.mentalLabel) this.mentalLabel.string = Math.round(this.gameData.mental);
        if (this.energyLabel) this.energyLabel.string = Math.round(this.gameData.energy);
        if (this.moneyLabel) this.moneyLabel.string = this.gameData.money;
        
        this.updateTimerUI();
    },

    updateTimerUI: function() {
        if (this.timerFill) {
            let percent = (this.gameData.countdown / 30) * 100;
            this.timerFill.width = percent * 3; // Adjust based on your UI
        }
    },

    addLog: function(text) {
        this.gameData.history.unshift(text);
        if (this.gameData.history.length > 20) {
            this.gameData.history.pop();
        }
        cc.log(text);
    },

    // ==================== Save/Load ====================
    saveGame: function() {
        // 本地存档
        let saveData = JSON.stringify(this.gameData);
        cc.sys.localStorage.setItem("brainGameSave", saveData);
        
        // 云端存档 (如果已绑定玩家ID)
        if (this.gameData.playerId) {
            Api.saveGame(this.gameData.playerId, this.gameData, function(err, res) {
                if (err) {
                    cc.warn("云端存档失败: " + err);
                } else {
                    cc.log("云端存档成功!");
                }
            });
        }
    },

    loadSave: function() {
        // 优先加载云端存档
        let playerId = cc.sys.localStorage.getItem("brainGamePlayerId");
        if (playerId) {
            Api.loadGame(playerId, function(err, res) {
                if (!err && res && res.code === 0) {
                    try {
                        let cloudData = JSON.parse(res.data.game_data);
                        Object.assign(this.gameData, cloudData);
                        cc.log("云端存档加载成功!");
                    } catch(e) {
                        cc.warn("云端存档解析失败，尝试本地存档");
                        this.loadLocalSave();
                    }
                } else {
                    this.loadLocalSave();
                }
            }.bind(this));
        } else {
            this.loadLocalSave();
        }
    },

    loadLocalSave: function() {
        let saveData = cc.sys.localStorage.getItem("brainGameSave");
        if (saveData) {
            try {
                let data = JSON.parse(saveData);
                Object.assign(this.gameData, data);
            } catch (e) {
                cc.warn("Failed to load save data");
            }
        }
    },

    // ==================== Utils ====================
    clamp: function(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
});
