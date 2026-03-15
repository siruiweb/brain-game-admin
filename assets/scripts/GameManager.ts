/**
 * 七情六欲大脑模拟器 - 主游戏逻辑
 * Cocos Creator 3.x 版本
 */

import { _decorator, Component, Node, Label, ProgressBar, Sprite, Color, tween, Vec3, AnimationClip, Animation, ParticleSystem2D, director, sys } from 'cc';
import { Emitter } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    // 情绪属性
    private emotions = {
        joy: 50,        // 喜
        anger: 30,      // 怒
        sad: 30,        // 哀
        fear: 20,       // 惧
        love: 60,       // 爱
        hate: 25,       // 恶
        surprise: 30    // 惊
    };

    // 欲望属性
    private desires = {
        food: 60,       // 食欲
        sex: 40,        // 色欲
        money: 70,      // 财欲
        fame: 50,       // 名欲
        sleep: 55,      // 睡欲
        play: 65,      // 玩欲
        power: 45,     // 权欲
        knowledge: 40   // 求知欲
    };

    // 游戏状态
    private day: number = 1;
    private health: number = 100;
    private mentalHealth: number = 100;
    private money: number = 1000;
    private reputation: number = 50;
    private energy: number = 100;

    // 成就系统
    private achievements: string[] = [];
    private achievementDescriptions: { [key: string]: string } = {
        "survivor_100": "生存100天",
        "emotion_master": "情绪大师 - 平衡所有情绪",
        "money_king": "金钱帝王 - 拥有10000金币",
        "love_expert": "情圣 - 体验100次爱情",
        "zen_master": "禅大师 - 达到心如止水",
        "workaholic": "工作狂 - 连续工作30天"
    };

    // 事件系统
    private eventLog: string[] = [];
    private randomEvents = [
        { text: "🌧️ 下雨天，心情低落...", effects: { sad: 10, joy: -5 } },
        { text: "☀️ 阳光明媚！", effects: { joy: 10, sad: -5 } },
        { text: "💼 工作压力大！", effects: { anger: 10, sleep: -10 } },
        { text: "🎂 有人生日！", effects: { joy: 15, money: -10 } },
        { text: "🐔 遇到骗子！", effects: { money: -15, anger: 10 } },
        { text: "💪 健身成功！", effects: { joy: 10, sleep: -5, health: 5 } },
        { text: "📱 手机坏了！", effects: { anger: 15, money: -10 } },
        { text: "💔 分手！", effects: { love: -20, sad: 20, mentalHealth: -10 } },
        { text: "🎉 中彩票！", effects: { joy: 30, money: 500 } },
        { text: "📚 读完一本书！", effects: { knowledge: 15, joy: 5 } },
        { text: "🏃 跑步锻炼！", effects: { health: 10, energy: -15 } },
        { text: "😴 失眠了...", effects: { sleep: -20, energy: -10 } }
    ];

    // 行动定义
    private actions = {
        // 情绪行动
        "joy_1": { name: "💰 赚钱", effects: { joy: 15, money: 50, sleep: -5 }, cost: 0 },
        "joy_2": { name: "🎮 玩游戏", effects: { joy: 20, play: 15, money: -10, sleep: -5 }, cost: 10 },
        "joy_3": { name: "🎉 聚会", effects: { joy: 25, love: 10, money: -50, sleep: -10 }, cost: 50 },
        
        "anger_1": { name: "😤 骂人", effects: { anger: 15, hate: -10, joy: 5, reputation: -5 }, cost: 0 },
        "anger_2": { name: "💪 健身", effects: { anger: -15, health: 10, energy: -10 }, cost: 20 },
        "anger_3": { name: "🧘 冥想", effects: { anger: -20, mentalHealth: 10, sleep: 5 }, cost: 0 },
        
        "sad_1": { name: "😢 哭一场", effects: { sad: -15, mentalHealth: 5 }, cost: 0 },
        "sad_2": { name: "🍔 吃美食", effects: { sad: -10, food: 20, money: -30, joy: 10 }, cost: 30 },
        "sad_3": { name: "📞 打电话给朋友", effects: { sad: -15, love: 10, mentalHealth: 10 }, cost: 0 },
        
        "fear_1": { name: "😰 冒险", effects: { fear: 20, joy: 10, sleep: -10, reputation: 5 }, cost: 0 },
        "fear_2": { name: "🎢 游乐场", effects: { fear: 15, joy: 20, money: -30 }, cost: 30 },
        
        "love_1": { name: "❤️ 告白", effects: { love: 20, joy: 15, fear: 10, reputation: 5 }, cost: 0 },
        "love_2": { name: "💕 约会", effects: { love: 25, sex: 15, money: -100, joy: 20 }, cost: 100 },
        "love_3": { name: "💍 结婚", effects: { love: 30, money: -1000, reputation: 20, joy: 30 }, cost: 1000 },
        
        "hate_1": { name: "🤢 吐槽", effects: { hate: 15, joy: 5, anger: 5, reputation: -5 }, cost: 0 },
        "hate_2": { name: "😠 冷战", effects: { hate: 20, mentalHealth: -5 }, cost: 0 },
        
        // 欲望行动
        "food_1": { name: "🍔 吃饭", effects: { food: 30, joy: 10, money: -20, health: 5 }, cost: 20 },
        "food_2": { name: "🍺 聚餐", effects: { food: 40, joy: 15, money: -80, health: -5 }, cost: 80 },
        
        "sex_1": { name: "💕 约会", effects: { sex: 25, love: 10, money: -80, energy: -10 }, cost: 80 },
        "sex_2": { name: "💑 结婚", effects: { sex: 30, love: 30, money: -2000, reputation: 15 }, cost: 2000 },
        
        "money_1": { name: "💵 省钱", effects: { money: 30, joy: 10 }, cost: 0 },
        "money_2": { name: "💼 工作", effects: { money: 100, energy: -30, sleep: -15, joy: 5, reputation: 5 }, cost: 0 },
        "money_3": { name: "📈 投资", effects: { money: 200, money: -100, joy: 20, fear: 10 }, cost: 100 },
        
        "fame_1": { name: "🏆 比赛", effects: { fame: 25, joy: 20, reputation: 15, money: -30 }, cost: 30 },
        "fame_2": { name: "📢 社交", effects: { fame: 15, reputation: 10, money: -20 }, cost: 20 },
        
        "sleep_1": { name: "😴 睡觉", effects: { sleep: 40, energy: 30, health: 5 }, cost: 0 },
        "sleep_2": { name: "🛏️ 赖床", effects: { sleep: 20, energy: 15, joy: 5, reputation: -5 }, cost: 0 },
        
        "play_1": { name: "🎮 玩游戏", effects: { play: 30, joy: 20, money: -20, sleep: -10 }, cost: 20 },
        "play_2": { name: "🎬 看电影", effects: { play: 20, joy: 15, money: -30 }, cost: 30 },
        "play_3": { name: "✈️ 旅游", effects: { play: 40, joy: 30, money: -500, energy: -20 }, cost: 500 },
        
        "power_1": { name: "👔 升职", effects: { power: 30, money: 200, reputation: 20, joy: 25 }, cost: 0 },
        "power_2": { name: "💪 领导项目", effects: { power: 20, reputation: 15, money: 100, energy: -20 }, cost: 0 },
        
        "knowledge_1": { name: "📚 学习", effects: { knowledge: 20, joy: 10, mentalHealth: 10 }, cost: 0 },
        "knowledge_2": { name: "🎓 培训", effects: { knowledge: 30, money: -200, reputation: 10 }, cost: 200 }
    };

    // UI 组件引用
    @property(ProgressBar)
    private emotionBars: { [key: string]: ProgressBar } = {};

    @property(ProgressBar)
    private desireBars: { [key: string]: ProgressBar } = {};

    @property(Label)
    private dayLabel: Label = null;

    @property(Label)
    private healthLabel: Label = null;

    @property(Label)
    private moneyLabel: Label = null;

    @property(Label)
    private energyLabel: Label = null;

    @property(Node)
    private brainNode: Node = null;

    @property(Node)
    private eventLogNode: Node = null;

    start() {
        this.loadGame();
        this.updateUI();
        this.startDayCycle();
    }

    // 执行行动
    performAction(actionKey: string): boolean {
        const action = this.actions[actionKey];
        if (!action) return false;

        if (this.money < action.cost) {
            this.addEventLog("💰 金钱不足！");
            return false;
        }

        // 扣除费用
        this.money -= action.cost;

        // 应用效果
        for (const [key, value] of Object.entries(action.effects)) {
            if (key in this.emotions) {
                this.emotions[key] = this.clamp(this.emotions[key] + value, 0, 100);
            } else if (key in this.desires) {
                this.desires[key] = this.clamp(this.desires[key] + value, 0, 100);
            } else if (key === 'money') {
                this.money = Math.max(0, this.money + value);
            } else if (key === 'health') {
                this.health = this.clamp(this.health + value, 0, 100);
            } else if (key === 'mentalHealth') {
                this.mentalHealth = this.clamp(this.mentalHealth + value, 0, 100);
            } else if (key === 'energy') {
                this.energy = this.clamp(this.energy + value, 0, 100);
            } else if (key === 'reputation') {
                this.reputation = this.clamp(this.reputation + value, 0, 100);
            }
        }

        this.addEventLog(`📅 第${this.day}天 - ${action.name}`);
        this.checkAchievements();
        this.checkGameOver();
        this.updateUI();
        this.saveGame();

        return true;
    }

    // 随机事件
    triggerRandomEvent() {
        if (Math.random() < 0.4) { // 40%概率触发
            const event = this.randomEvents[Math.floor(Math.random() * this.randomEvents.length)];
            
            for (const [key, value] of Object.entries(event.effects)) {
                if (key in this.emotions) {
                    this.emotions[key] = this.clamp(this.emotions[key] + value, 0, 100);
                } else if (key in this.desires) {
                    this.desires[key] = this.clamp(this.desires[key] + value, 0, 100);
                } else if (key === 'money') {
                    this.money = Math.max(0, this.money + value);
                } else if (key === 'health') {
                    this.health = this.clamp(this.health + value, 0, 100);
                } else if (key === 'mentalHealth') {
                    this.mentalHealth = this.clamp(this.mentalHealth + value, 0, 100);
                } else if (key === 'energy') {
                    this.energy = this.clamp(this.energy + value, 0, 100);
                }
            }

            this.addEventLog(`📅 第${this.day}天 - ${event.text}`);
        }
    }

    // 新的一天
    nextDay() {
        this.day++;
        
        // 自然变化
        this.emotions.joy = this.clamp(this.emotions.joy - 2, 0, 100);
        this.emotions.sad = this.clamp(this.emotions.sad + 2, 0, 100);
        this.desires.food = this.clamp(this.desires.food - 5, 0, 100);
        this.desires.sleep = this.clamp(this.desires.sleep - 10, 0, 100);
        
        // 能量恢复
        this.energy = this.clamp(this.energy + 20, 0, 100);
        
        // 随机事件
        this.triggerRandomEvent();
        
        // 检查游戏结束
        this.checkGameOver();
        
        this.updateUI();
        this.saveGame();
    }

    // 周期循环
    startDayCycle() {
        // 每30秒为一天
        this.schedule(() => {
            this.nextDay();
        }, 30);
    }

    // 更新UI
    updateUI() {
        // 更新情绪条
        for (const [key, bar] of Object.entries(this.emotionBars)) {
            if (bar) {
                bar.progress = this.emotions[key] / 100;
                bar.node.getComponent(Sprite).color = this.getEmotionColor(key, this.emotions[key]);
            }
        }

        // 更新欲望条
        for (const [key, bar] of Object.entries(this.desireBars)) {
            if (bar) {
                bar.progress = this.desires[key] / 100;
            }
        }

        // 更新状态
        if (this.dayLabel) this.dayLabel.string = `第 ${this.day} 天`;
        if (this.healthLabel) this.healthLabel.string = `生命: ${Math.round(this.health)}%`;
        if (this.moneyLabel) this.moneyLabel.string = `💰 ${this.money}`;
        if (this.energyLabel) this.energyLabel.string = `⚡ ${Math.round(this.energy)}%`;

        // 更新大脑视觉
        this.updateBrainVisuals();
    }

    // 更新大脑视觉效果
    updateBrainVisuals() {
        if (!this.brainNode) return;

        // 根据情绪改变大脑颜色
        const avgEmotion = Object.values(this.emotions).reduce((a, b) => a + b, 0) / 7;
        
        // 脉动效果
        tween(this.brainNode)
            .to(0.5, { scale: new Vec3(1.1, 1.1, 1) })
            .to(0.5, { scale: new Vec3(1, 1, 1) })
            .union()
            .repeatForever()
            .start();
    }

    // 获取情绪颜色
    getEmotionColor(key: string, value: number): Color {
        if (value > 80) return new Color(255, 0, 0); // 危险红色
        if (value < 20) return new Color(128, 128, 128); // 低落灰色
        return new Color(0, 255, 0); // 正常绿色
    }

    // 检查成就
    checkAchievements() {
        if (this.day >= 100 && !this.achievements.includes("survivor_100")) {
            this.achievements.push("survivor_100");
            this.addEventLog("🏆 成就解锁: 生存100天!");
        }
        
        if (this.money >= 10000 && !this.achievements.includes("money_king")) {
            this.achievements.push("money_king");
            this.addEventLog("🏆 成就解锁: 金钱帝王!");
        }
    }

    // 检查游戏结束
    checkGameOver() {
        let gameOver = false;
        let reason = "";

        if (this.health <= 0) {
            gameOver = true;
            reason = "💀 身体垮掉了！";
        } else if (this.mentalHealth <= 0) {
            gameOver = true;
            reason = "💀 心理崩溃了！";
        } else if (this.energy <= 0) {
            gameOver = true;
            reason = "💀 累死了！";
        } else if (this.emotions.anger > 95) {
            gameOver = true;
            reason = "💀 气死了！";
        } else if (this.emotions.sad > 95) {
            gameOver = true;
            reason = "💀 抑郁死了！";
        } else if (this.money <= 0 && this.day > 10) {
            gameOver = true;
            reason = "💀 穷死了！";
        }

        if (gameOver) {
            this.addEventLog(`游戏结束! ${reason} 存活了 ${this.day} 天`);
            this.showGameOverScreen(reason);
        }
    }

    // 显示游戏结束
    showGameOverScreen(reason: string) {
        // 这里可以显示游戏结束界面
        director.loadScene('game-over');
    }

    // 添加事件日志
    addEventLog(text: string) {
        this.eventLog.unshift(text);
        if (this.eventLog.length > 50) {
            this.eventLog.pop();
        }
        
        // 更新UI
        if (this.eventLogNode) {
            const label = this.eventLogNode.getComponent(Label);
            if (label) {
                label.string = this.eventLog.slice(0, 10).join('\n');
            }
        }
    }

    // 保存游戏
    saveGame() {
        const saveData = {
            day: this.day,
            emotions: this.emotions,
            desires: this.desires,
            health: this.health,
            mentalHealth: this.mentalHealth,
            money: this.money,
            reputation: this.reputation,
            energy: this.energy,
            achievements: this.achievements
        };
        
        sys.localStorage.setItem('brainSimulatorSave', JSON.stringify(saveData));
    }

    // 加载游戏
    loadGame() {
        const saveData = sys.localStorage.getItem('brainSimulatorSave');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.day = data.day || 1;
            this.emotions = data.emotions || this.emotions;
            this.desires = data.desires || this.desires;
            this.health = data.health || 100;
            this.mentalHealth = data.mentalHealth || 100;
            this.money = data.money || 1000;
            this.reputation = data.reputation || 50;
            this.energy = data.energy || 100;
            this.achievements = data.achievements || [];
            
            this.addEventLog("📂 游戏已加载");
        }
    }

    // 工具函数
    clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }
}
