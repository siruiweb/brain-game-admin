/**
 * 七情六欲大脑模拟器 - 精品版完整游戏逻辑
 * 产品经理级深度设计
 */

const GameConfig = {
    // ==================== 基础数值 ====================
    MAX_DAY: 365,
    TICK_TIME: 30, // 秒
    
    // 属性上限
    MAX_STAT: 100,
    MIN_STAT: 0,
    CRITICAL_THRESHOLD: 90, // 危险线
    WARNING_THRESHOLD: 20,   // 过低警告线
    
    // ==================== 天赋系统 ====================
    talents: {
        "lucky": { name: "🌟 天选之人", desc: "所有正面效果+10%", positive: 0.1 },
        "rich_family": { name: "🏠 富二代", desc: "初始金钱+5000", startMoney: 5000 },
        "genius": { name: "🧠 天才", desc: "学习效率+20%", knowledge: 0.2 },
        "healthy": { name: "💪 体育健将", desc: "健康上限+20", maxHealth: 120 },
        "charmer": { name: "💕 万人迷", desc: "魅力+20%,更容易约会成功", charm: 0.2 },
        "workaholic": { name: "💼 工作狂", desc: "工作收益+15%,但健康消耗+10%", workGain: 0.15, healthCost: 0.1 },
        "zen": { name: "🧘 禅师", desc: "情绪更稳定,负面效果-20%", emotionStable: 0.2 },
        "gambler": { name: "🎰 赌徒", desc: "投资/赌博收益+30%,但风险+20%", gambleGain: 0.3, gambleRisk: 0.2 }
    },
    
    // ==================== 技能系统 ====================
    skills: {
        // 工作技能
        "programming": { name: "💻 编程", maxLevel: 10, effect: { money: 10, knowledge: 5 }, cost: { energy: 5, money: 50 }, desc: "程序员专用,高薪" },
        "management": { name: "👔 管理", maxLevel: 10, effect: { reputation: 8, money: 5 }, cost: { energy: 8, money: 30 }, desc: "管理层路线" },
        "sales": { name: "💰 销售", maxLevel: 10, effect: { money: 15, charm: 3 }, cost: { energy: 6, money: 20 }, desc: "提成高" },
        "design": { name: "🎨 设计", maxLevel: 10, effect: { fame: 5, money: 8 }, cost: { energy: 5, money: 30 }, desc: "创意工作" },
        
        // 生活技能
        "cooking": { name: "🍳 烹饪", maxLevel: 10, effect: { health: 5, food: -10 }, cost: { money: 20, time: 1 }, desc: "省饭钱+健康" },
        "fitness": { name: "🏋️ 健身", maxLevel: 10, effect: { health: 8, energy: -3 }, cost: { money: 30, energy: 5 }, desc: "强身健体" },
        "meditation": { name: "🧘 冥想", maxLevel: 10, effect: { mentalHealth: 10, anger: -5 }, cost: { time: 1 }, desc: "静心养性" },
        "social": { name: "🤝 社交", maxLevel: 10, effect: { charm: 5, reputation: 3 }, cost: { money: 50, energy: 5 }, desc: "拓展人脉" },
        
        // 投资技能
        "stock": { name: "📈 股票", maxLevel: 10, effect: { money: 0.05 }, cost: { money: 1000, knowledge: 5 }, desc: "金融投资" },
        "real_estate": { name: "🏠 房产", maxLevel: 5, effect: { money: 0.03 }, cost: { money: 10000 }, desc: "房产投资" },
        "crypto": { name: "₿ 加密货币", maxLevel: 10, effect: { money: 0.1 }, cost: { money: 500, knowledge: 10 }, desc: "高风险高回报" }
    },
    
    // ==================== 社交系统 ====================
    socialRels: {
        "friend": { name: "朋友", maxCount: 10, benefit: { joy: 5 } },
        "bestfriend": { name: "闺蜜/死党", maxCount: 3, benefit: { joy: 10, mentalHealth: 5 } },
        "colleague": { name: "同事", maxCount: 5, benefit: { reputation: 3 } },
        "boss": { name: "上司", maxCount: 1, benefit: { reputation: 5, money: 5 } },
        "lover": { name: "恋人", maxCount: 1, benefit: { joy: 15, love: 10, money: -20 } },
        "spouse": { name: "配偶", maxCount: 1, benefit: { joy: 20, love: 15, money: -50, mentalHealth: 10 } },
        "child": { name: "孩子", maxCount: 3, benefit: { joy: 10, money: -100, sleep: -10 } },
        "parent": { name: "父母", maxCount: 2, benefit: { mentalHealth: 10, money: -30 } }
    },
    
    // ==================== 物品系统 ====================
    items: {
        // 消耗品
        "potion_health": { name: "💊 保健品", price: 100, effect: { health: 20 }, type: "consumable" },
        "potion_mental": { name: "💊 心理药", price: 150, effect: { mentalHealth: 20 }, type: "consumable" },
        "coffee": { name: "☕ 咖啡", price: 20, effect: { energy: 15, sleep: -10 }, type: "consumable" },
        "energy_drink": { name: "🥤 功能饮料", price: 30, effect: { energy: 30, health: -5 }, type: "consumable" },
        
        // 装备
        "laptop": { name: "💻 电脑", price: 5000, effect: { workEfficiency: 0.2 }, type: "equipment" },
        "car": { name: "🚗 汽车", price: 20000, effect: { fame: 10, workEfficiency: 0.1 }, type: "equipment" },
        "house": { name: "🏠 房子", price: 100000, effect: { joy: 20, mentalHealth: 10 }, type: "equipment" },
        
        // 特殊
        "insurance": { name: "📋 保险", price: 1000, effect: { riskReduction: 0.3 }, type: "special" }
    },
    
    // ==================== 支线剧情 ====================
    sideQuests: [
        { id: "volunteer", name: "志愿者活动", duration: 7, cost: { money: 0, energy: 15 }, reward: { reputation: 30, joy: 10, knowledge: 5 } },
        { id: "marathon", name: "跑马拉松", duration: 14, cost: { money: 200, energy: 30 }, reward: { health: 20, fame: 15, joy: 15 } },
        { id: "book_club", name: "读书会", duration: 30, cost: { money: 100, knowledge: 10 }, reward: { knowledge: 20, mentalHealth: 10, social: 5 } },
        { id: "startup", name: "创业挑战", duration: 60, cost: { money: 10000, energy: 50 }, reward: { money: 50000, power: 30, fame: 20, risk: 0.5 } },
        { id: "charity", name: "慈善捐款", duration: 1, cost: { money: 1000 }, reward: { reputation: 50, joy: 10 } },
        { id: "tv_show", name: "参加电视节目", duration: 7, cost: { money: 500, fame: 10 }, reward: { fame: 50, reputation: 20, money: 1000 } }
    ],
    
    // ==================== 每日任务 ====================
    dailyTasks: [
        { id: "exercise", name: "晨跑", exp: 10, reward: { health: 5, energy: 5 } },
        { id: "read", name: "阅读", exp: 15, reward: { knowledge: 5 } },
        { id: "work", name: "认真工作", exp: 20, reward: { money: 50, reputation: 2 } },
        { id: "social", name: "社交", exp: 15, reward: { charm: 3 } },
        { id: "healthy_food", name: "健康饮食", exp: 10, reward: { health: 3 } },
        { id: "sleep_early", name: "早睡", exp: 10, reward: { energy: 10, mentalHealth: 5 } }
    ],
    
    // ==================== 章节配置 ====================
    chapters: [
        { 
            id: 1, name: "初入社会", targetDay: 30, 
            intro: "🏠 刚刚毕业,你租了一个小房子,开始了独立生活...",
            missions: [
                { id: "first_job", name: "找到第一份工作", reward: { reputation: 20 } },
                { id: "first_salary", name: "拿到第一份工资", reward: { joy: 20 } },
                { id: "make_friend", name: "认识新朋友", reward: { social: 1 } }
            ],
            events: [
                { day: 1, text: "🏠 你租了一个小房子,开始了独立生活" },
                { day: 3, text: "📝 投递了很多简历,等待面试通知" },
                { day: 7, text: "💼 第一天上班,紧张又兴奋!" },
                { day: 15, text: "👔 慢慢适应了工作节奏" },
                { day: 25, text: "💰 第一个月工资到手!" }
            ]
        },
        { 
            id: 2, name: "职场新人", targetDay: 60, 
            intro: "💼 你在工作中慢慢成长,开始规划职业生涯...",
            missions: [
                { id: "promotion", name: "争取升职", reward: { reputation: 30, money: 500 } },
                { id: "skill_up", name: "提升技能", reward: { knowledge: 20 } },
                { id: "find_lover", name: "找到对象", reward: { joy: 30 } }
            ],
            events: [
                { day: 35, text: "📈 你表现出色,被主管表扬!" },
                { day: 45, text: "🤔 有机会升职,但需要加班...", isChoice: true, options: [
                    { text: "努力加班", effects: { money: 500, energy: -30, reputation: 20 } },
                    { text: "拒绝加班", effects: { energy: 10, reputation: -10 } }
                ]},
                { day: 55, text: "🎉 恭喜!升职加薪!" }
            ]
        },
        { 
            id: 3, name: "创业之路", targetDay: 100, 
            intro: "💡 你发现了一个创业机会,决定搏一搏!",
            missions: [
                { id: "start_company", name: "创立公司", reward: { power: 30 } },
                { id: "first_customer", name: "找到第一个客户", reward: { money: 1000 } },
                { id: "team_build", name: "组建团队", reward: { reputation: 20 } }
            ],
            events: [
                { day: 65, text: "💡 发现创业机会!是辞职还是继续上班?", isChoice: true, options: [
                    { text: "辞职创业", effects: { money: -5000, power: 30, fear: 30, joy: 20 }, next: "entrepreneur" },
                    { text: "继续上班", effects: { money: 500, reputation: 10 }, next: "employee" }
                ]},
                { day: 80, text: "🏢 公司慢慢走上正轨" },
                { day: 95, text: "📊 获得天使投资!" }
            ]
        },
        { 
            id: 4, name: "人生巅峰", targetDay: 200, 
            intro: "🏆 你已经功成名就,开始思考人生的意义...",
            missions: [
                { id: "company_ipo", name: "公司上市", reward: { money: 100000, fame: 50 } },
                { id: "family", name: "组建家庭", reward: { joy: 50 } },
                { id: "legacy", name: "留下传承", reward: { reputation: 50 } }
            ],
            events: [
                { day: 120, text: "🏆 你的公司上市了!" },
                { day: 150, text: "🤔 功成名就,开始思考退休...", isChoice: true, options: [
                    { text: "退休养老", effects: { money: 10000, joy: 30, power: -20 }, next: "retire" },
                    { text: "继续奋斗", effects: { money: 5000, power: 20, energy: -20 } }
                ]},
                { day: 180, text: "👨‍👩‍👧 家庭幸福美满" }
            ]
        },
        { 
            id: 5, name: "传奇人生", targetDay: 365, 
            intro: "👑 你已经成为传奇,书写属于自己的史诗!",
            missions: [
                { id: "legend", name: "成为传奇", reward: { fame: 100 } },
                { id: "perfect_life", name: "完美人生", reward: { joy: 100 } }
            ],
            events: [
                { day: 220, text: "👑 你成为行业传奇!" },
                { day: 280, text: "🏅 获得终身成就奖!" },
                { day: 330, text: "📖 有人为你写传记" },
                { day: 365, text: "🎉 完美的一生!" }
            ]
        }
    ],
    
    // ==================== 随机事件库 ====================
    randomEvents: [
        // 好事件
        { type: "good", text: "🎁 路上捡到钱!", effects: { money: 100, joy: 10 } },
        { type: "good", text: "🎉 中彩票了!", effects: { money: 5000, joy: 50 } },
        { type: "good", text: "💼 工作表现优秀,发奖金!", effects: { money: 500, reputation: 10, joy: 20 } },
        { type: "good", text: "❤️ 向女神/男神表白成功!", effects: { love: 40, joy: 30 } },
        { type: "good", text: "🏆 比赛获奖!", effects: { fame: 20, money: 500 } },
        { type: "good", text: "📚 学会新技能!", effects: { knowledge: 15, joy: 10 } },
        { type: "good", text: "👶 孩子考试第一名!", effects: { joy: 30, money: 100 } },
        { type: "good", text: "💰 投资收益翻倍!", effects: { money: 2000, joy: 20 } },
        
        // 坏事件
        { type: "bad", text: "💸 被骗子骗了!", effects: { money: -500, anger: 20, joy: -10 } },
        { type: "bad", text: "🤒 生了一场大病", effects: { health: -30, money: -500, mentalHealth: -10 } },
        { type: "bad", text: "💔 分手/离婚", effects: { love: -40, joy: -30, mentalHealth: -20 } },
        { type: "bad", text: "📱 手机/电脑坏了", effects: { money: -300, anger: 15 } },
        { type: "bad", text: "🚗 发生车祸", effects: { health: -40, money: -1000, fear: 30 } },
        { type: "bad", text: "👔 被裁员了", effects: { money: -300, reputation: -20, mentalHealth: -15 } },
        { type: "bad", text: "🏠 房子漏水", effects: { money: -500, joy: -10 } },
        { type: "bad", text: "💼 创业失败", effects: { money: -5000, power: -20, mentalHealth: -20 } },
        
        // 中性事件
        { type: "neutral", text: "🌧️ 下雨天,心情有点低落", effects: { joy: -5, sad: 5 } },
        { type: "neutral", text: "☀️ 阳光明媚,心情不错", effects: { joy: 10 } },
        { type: "neutral", text: "👀 看到前任有新对象", effects: { joy: -5, love: -10 } },
        { type: "neutral", text: "📱 收到老同学消息", effects: { joy: 5, social: 1 } },
        { type: "neutral", text: "🐱 养了只宠物", effects: { joy: 15, money: -50, sleep: -5 } },
        { type: "neutral", text: "🎂 有人生日,随份子", effects: { money: -100, reputation: 5 } },
        { type: "neutral", text: "😴 失眠了", effects: { sleep: -20, energy: -10, mentalHealth: -5 } },
        { type: "neutral", text: "🏃 跑步锻炼", effects: { health: 10, energy: -10, joy: 5 } }
    ],
    
    // ==================== 成就系统 ====================
    achievements: {
        // 章节成就
        "chapter1": { name: "📖 初入社会", desc: "完成第一章", reward: 100 },
        "chapter2": { name: "📗 职场新人", desc: "完成第二章", reward: 200 },
        "chapter3": { name: "📘 创业之路", desc: "完成第三章", reward: 300 },
        "chapter4": { name: "📙 人生巅峰", desc: "完成第四章", reward: 500 },
        "chapter5": { name: "📕 传奇人生", desc: "完成第五章", reward: 1000 },
        
        // 生存成就
        "day10": { name: "🌱 生存10天", desc: "活到第10天", reward: 50 },
        "day30": { name: "🌿 生存30天", desc: "活到第30天", reward: 100 },
        "day100": { name: "🌳 生存100天", desc: "活到第100天", reward: 300 },
        "day365": { name: "👑 传奇人生", desc: "活到第365天", reward: 1000 },
        
        // 财富成就
        "money1k": { name: "💵 千元户", desc: "拥有1000元", reward: 50 },
        "money10k": { name: "💰 万元户", desc: "拥有1万元", reward: 100 },
        "money100k": { name: "💎 十万富翁", desc: "拥有10万元", reward: 300 },
        "millionaire": { name: "🏦 百万富翁", desc: "拥有100万元", reward: 500 },
        "rich": { name: "👑 千万富翁", desc: "拥有1000万元", reward: 1000 },
        
        // 健康成就
        "health100": { name: "💪 百岁老人", desc: "健康100", reward: 200 },
        "never_sick": { name: "🏥 从不生病", desc: "365天不生病", reward: 500 },
        
        // 社交成就
        "many_friends": { name: "👥 人脉广", desc: "有10个朋友", reward: 100 },
        "married": { name: "💍 结婚", desc: "结婚", reward: 200 },
        "children": { name: "👨‍👩‍👧 儿女双全", desc: "有孩子", reward: 300 },
        
        // 特殊成就
        "workaholic": { name: "💼 工作狂", desc: "连续工作100天", reward: 300 },
        "gambler": { name: "🎰 赌神", desc: "投资成功10次", reward: 500 },
        "perfectionist": { name: "🏆 全成就", desc: "解锁所有成就", reward: 5000 }
    }
};

class GameCore {
    constructor() {
        this.data = this.initData();
        this.currentChapter = 1;
        this.countdown = 30;
        this.tickTimer = null;
        
        // 统计
        this.stats = {
            totalPlayedDays: 0,
            totalEarnedMoney: 0,
            totalSpentMoney: 0,
            sickDays: 0,
            workDays: 0,
            investmentWins: 0,
            investmentLosses: 0
        };
    }
    
    initData() {
        return {
            // 基础属性
            day: 1,
            health: 100,
            mentalHealth: 100,
            energy: 100,
            money: 1000,
            reputation: 50,
            happiness: 50,
            charm: 50,
            
            // 情绪
            emotions: {
                joy: 50, anger: 30, sad: 30, fear: 20, 
                love: 60, hate: 25, surprise: 30
            },
            
            // 欲望
            desires: {
                food: 60, sex: 40, money: 70, fame: 50, 
                sleep: 55, play: 65, power: 45, knowledge: 40
            },
            
            // 天赋
            talent: null,
            
            // 技能
            skills: {},
            
            // 社交
            relationships: {
                friends: [],
                colleagues: [],
                lover: null,
                spouse: null,
                children: [],
                parents: [true, true]
            },
            
            // 物品
            inventory: {},
            
            // 任务
            missions: [],
            completedMissions: [],
            dailyTaskProgress: {},
            
            // 成就
            achievements: [],
            
            // 历史
            history: []
        };
    }
    
    // ==================== 游戏流程 ====================
    startNewGame(talent = null) {
        this.data = this.initData();
        this.data.talent = talent;
        if (talent && GameConfig.talents[talent]) {
            const t = GameConfig.talents[talent];
            if (t.startMoney) this.data.money += t.startMoney;
            if (t.maxHealth) this.data.health = t.maxHealth;
        }
        
        this.currentChapter = 1;
        this.countdown = GameConfig.TICK_TIME;
        
        this.triggerChapterEvent(1, 1);
        this.startGameLoop();
        
        return this.data;
    }
    
    startGameLoop() {
        this.tickTimer = setInterval(() => this.tick(), 1000);
    }
    
    stopGameLoop() {
        if (this.tickTimer) {
            clearInterval(this.tickTimer);
            this.tickTimer = null;
        }
    }
    
    tick() {
        this.countdown--;
        
        // 实时效果
        this.applyRealTimeEffects();
        
        if (this.countdown <= 0) {
            this.triggerRandomEvent();
            this.nextDay();
            this.countdown = GameConfig.TICK_TIME;
        }
        
        // 检查状态
        this.checkGameOver();
        this.checkChapterComplete();
    }
    
    applyRealTimeEffects() {
        // 精力自动缓慢恢复
        if (this.data.energy < 100) {
            this.data.energy = Math.min(100, this.data.energy + 0.1);
        }
        
        // 社交关系影响
        if (this.data.relationships.lover) {
            this.data.emotions.joy += 0.01;
            this.data.emotions.love += 0.01;
        }
        
        if (this.data.relationships.spouse) {
            this.data.emotions.joy += 0.02;
            this.data.mentalHealth += 0.01;
        }
    }
    
    nextDay() {
        this.data.day++;
        this.stats.totalPlayedDays++;
        
        // 日常消耗
        this.data.desires.food = Math.max(0, this.data.desires.food - 5);
        this.data.desires.sleep = Math.max(0, this.data.desires.sleep - 8);
        
        // 精力恢复
        this.data.energy = Math.min(100, this.data.energy + 15);
        
        // 自然情绪变化
        this.data.emotions.joy = this.clamp(this.data.emotions.joy - 2, 0, 100);
        
        // 触发章节剧情
        this.triggerChapterEvent(this.currentChapter, this.data.day);
        
        // 检查成就
        this.checkAchievements();
        
        // 保存
        this.save();
    }
    
    // ==================== 章节系统 ====================
    triggerChapterEvent(chapter, day) {
        const chapterData = GameConfig.chapters.find(c => c.id === chapter);
        if (!chapterData) return;
        
        const event = chapterData.events.find(e => e.day === day);
        if (event) {
            if (event.isChoice) {
                return { type: 'choice', data: event };
            } else {
                this.addHistory(event.text);
                return { type: 'story', text: event.text };
            }
        }
        
        return null;
    }
    
    checkChapterComplete() {
        const chapterData = GameConfig.chapters.find(c => c.id === this.currentChapter);
        if (!chapterData) return;
        
        if (this.data.day >= chapterData.targetDay) {
            if (this.currentChapter < 5) {
                this.currentChapter++;
                this.unlockAchievement(`chapter${this.currentChapter}`);
                this.addHistory(`📖 进入第${this.currentChapter}章: ${GameConfig.chapters[this.currentChapter-1].name}`);
            } else {
                // 通关
                return { type: 'win' };
            }
        }
        
        return null;
    }
    
    // ==================== 行动系统 ====================
    performAction(action) {
        // 检查金钱
        if (action.cost && this.data.money < action.cost.money) {
            return { success: false, message: "💸 金钱不足!" };
        }
        
        // 扣钱
        if (action.cost && action.cost.money) {
            this.data.money -= action.cost.money;
            this.stats.totalSpentMoney += action.cost.money;
        }
        
        // 天赋加成
        let effects = { ...action.effects };
        if (this.data.talent) {
            const talent = GameConfig.talents[this.data.talent];
            if (talent.positive) {
                for (let key in effects) {
                    if (typeof effects[key] === 'number' && effects[key] > 0) {
                        effects[key] = Math.floor(effects[key] * (1 + talent.positive));
                    }
                }
            }
        }
        
        // 应用效果
        this.applyEffects(effects);
        
        // 记录
        this.addHistory(`📅 第${this.data.day}天 - ${action.name}`);
        
        // 检查成就
        this.checkAchievements();
        
        return { success: true, effects: effects };
    }
    
    applyEffects(effects) {
        for (let key in effects) {
            const value = effects[key];
            
            if (key in this.data.emotions) {
                this.data.emotions[key] = this.clamp(this.data.emotions[key] + value, 0, 100);
            } else if (key in this.data.desires) {
                this.data.desires[key] = this.clamp(this.data.desires[key] + value, 0, 100);
            } else if (key === 'money') {
                this.data.money = Math.max(0, this.data.money + value);
                if (value > 0) this.stats.totalEarnedMoney += value;
            } else if (key === 'health') {
                this.data.health = this.clamp(this.data.health + value, 0, 120);
            } else if (key === 'mentalHealth') {
                this.data.mentalHealth = this.clamp(this.data.mentalHealth + value, 0, 100);
            } else if (key === 'energy') {
                this.data.energy = this.clamp(this.data.energy + value, 0, 100);
            } else if (key === 'reputation') {
                this.data.reputation = this.clamp(this.data.reputation + value, 0, 100);
            } else if (key === 'happiness') {
                this.data.happiness = this.clamp(this.data.happiness + value, 0, 100);
            } else if (key === 'charm') {
                this.data.charm = this.clamp(this.data.charm + value, 0, 100);
            } else if (key === 'knowledge') {
                this.data.desires.knowledge = this.clamp(this.data.desires.knowledge + value, 0, 100);
            } else if (key === 'fame') {
                this.data.desires.fame = this.clamp(this.data.desires.fame + value, 0, 100);
            }
        }
    }
    
    // ==================== 随机事件 ====================
    triggerRandomEvent() {
        // 40%概率触发
        if (Math.random() > 0.4) return null;
        
        const event = GameConfig.randomEvents[Math.floor(Math.random() * GameConfig.randomEvents.length)];
        
        // 检查是否触发的了条件
        if (event.condition && !event.condition(this.data)) return null;
        
        this.applyEffects(event.effects);
        this.addHistory(`📅 第${this.data.day}天 - ${event.text}`);
        
        return event;
    }
    
    // ==================== 技能系统 ====================
    learnSkill(skillId) {
        const skill = GameConfig.skills[skillId];
        if (!skill) return { success: false, message: "技能不存在" };
        
        const currentLevel = this.data.skills[skillId] || 0;
        if (currentLevel >= skill.maxLevel) return { success: false, message: "技能已满级" };
        
        if (this.data.money < skill.cost.money) return { success: false, message: "钱不够" };
        if (this.data.energy < skill.cost.energy) return { success: false, message: "精力不够" };
        
        this.data.money -= skill.cost.money;
        this.data.energy -= skill.cost.energy;
        this.data.skills[skillId] = currentLevel + 1;
        
        return { success: true, level: currentLevel + 1 };
    }
    
    // ==================== 社交系统 ====================
    addRelationship(type, name) {
        const rel = GameConfig.socialRels[type];
        const current = this.data.relationships[type === 'friend' ? 'friends' : 
                        type === 'bestfriend' ? 'bestfriend' :
                        type === 'colleague' ? 'colleagues' : type];
        
        if (current.length >= rel.maxCount) {
            return { success: false, message: `已达上限` };
        }
        
        current.push({ name: name, intimacy: 10 });
        
        return { success: true };
    }
    
    // ==================== 物品系统 ====================
    buyItem(itemId) {
        const item = GameConfig.items[itemId];
        if (!item) return { success: false, message: "物品不存在" };
        
        if (this.data.money < item.price) return { success: false, message: "钱不够" };
        
        this.data.money -= item.price;
        
        if (item.type === 'consumable') {
            this.applyEffects(item.effect);
        } else {
            this.data.inventory[itemId] = (this.data.inventory[itemId] || 0) + 1;
        }
        
        return { success: true };
    }
    
    // ==================== 成就系统 ====================
    checkAchievements() {
        const checks = [
            // 章节
            ['chapter1', this.currentChapter >= 1],
            ['chapter2', this.currentChapter >= 2],
            ['chapter3', this.currentChapter >= 3],
            ['chapter4', this.currentChapter >= 4],
            ['chapter5', this.currentChapter >= 5],
            
            // 生存
            ['day10', this.data.day >= 10],
            ['day30', this.data.day >= 30],
            ['day100', this.data.day >= 100],
            ['day365', this.data.day >= 365],
            
            // 财富
            ['money1k', this.data.money >= 1000],
            ['money10k', this.data.money >= 10000],
            ['money100k', this.data.money >= 100000],
            ['millionaire', this.data.money >= 1000000],
            ['rich', this.data.money >= 10000000],
            
            // 健康
            ['health100', this.data.health >= 100],
            
            // 社交
            ['married', this.data.relationships.spouse !== null]
        ];
        
        checks.forEach(([id, condition]) => {
            if (condition && !this.data.achievements.includes(id)) {
                this.unlockAchievement(id);
            }
        });
    }
    
    unlockAchievement(id) {
        if (this.data.achievements.includes(id)) return;
        
        const achievement = GameConfig.achievements[id];
        if (!achievement) return;
        
        this.data.achievements.push(id);
        this.addHistory(`🏆 成就解锁: ${achievement.name}!`);
    }
    
    // ==================== 游戏结束 ====================
    checkGameOver() {
        let reason = '';
        
        if (this.data.health <= 0) {
            reason = "💀 身体垮掉了!";
        } else if (this.data.mentalHealth <= 0) {
            reason = "💀 心理崩溃了!";
        } else if (this.data.energy <= 0) {
            reason = "💀 累死了!";
        } else if (this.data.emotions.anger > 95) {
            reason = "💀 气死了!";
        } else if (this.data.emotions.sad > 95) {
            reason = "💀 抑郁死了!";
        } else if (this.data.money <= 0 && this.data.day > 10) {
            reason = "💀 穷死了!";
        }
        
        if (reason) {
            this.stopGameLoop();
            return { type: 'gameover', reason: reason, day: this.data.day };
        }
        
        return null;
    }
    
    // ==================== 历史记录 ====================
    addHistory(text) {
        this.data.history.unshift({
            day: this.data.day,
            text: text,
            time: Date.now()
        });
        
        // 限制长度
        if (this.data.history.length > 100) {
            this.data.history.pop();
        }
    }
    
    // ==================== 存档 ====================
    save() {
        const saveData = {
            data: this.data,
            currentChapter: this.currentChapter,
            stats: this.stats,
            saveTime: Date.now()
        };
        localStorage.setItem('brainSimulatorSave', JSON.stringify(saveData));
    }
    
    load() {
        const saved = localStorage.getItem('brainSimulatorSave');
        if (saved) {
            const saveData = JSON.parse(saved);
            this.data = saveData.data;
            this.currentChapter = saveData.currentChapter;
            this.stats = saveData.stats;
            return true;
        }
        return false;
    }
    
    // ==================== 工具 ====================
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    // 获取游戏状态摘要
    getStatus() {
        return {
            day: this.data.day,
            chapter: this.currentChapter,
            chapterName: GameConfig.chapters[this.currentChapter - 1].name,
            health: this.data.health,
            mentalHealth: this.data.mentalHealth,
            energy: this.data.energy,
            money: this.data.money,
            reputation: this.data.reputation,
            happiness: this.data.happiness,
            achievements: this.data.achievements.length,
            totalAchievements: Object.keys(GameConfig.achievements).length
        };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameCore, GameConfig };
}
