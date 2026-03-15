/**
 * 头脑特工队 - API 模块
 * 用于 Cocos Creator 与后端通信
 */

const API_BASE_URL = "https://brain-game.shengame.net/api/";

const Api = {
    /**
     * 通用请求方法
     */
    request: function(action, data = {}, callback) {
        const url = API_BASE_URL + "index.php?action=" + action;
        
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (callback) callback(null, response);
                    } catch (e) {
                        if (callback) callback(e, null);
                    }
                } else {
                    if (callback) callback(new Error("HTTP " + xhr.status), null);
                }
            }
        };
        
        // 构建请求数据
        let postData = "";
        for (let key in data) {
            if (postData) postData += "&";
            postData += encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
        }
        
        xhr.send(postData);
    },

    /**
     * 获取游戏配置
     */
    getConfig: function(callback) {
        this.request("get_config", {}, callback);
    },

    /**
     * 获取天赋列表
     */
    getTalentList: function(callback) {
        this.request("get_talent_list", {}, callback);
    },

    /**
     * 获取章节列表
     */
    getChapterList: function(callback) {
        this.request("get_chapter_list", {}, callback);
    },

    /**
     * 获取行动列表
     */
    getActionList: function(callback) {
        this.request("get_action_list", {}, callback);
    },

    /**
     * 创建玩家
     */
    createPlayer: function(playerData, callback) {
        this.request("create_player", playerData, callback);
    },

    /**
     * 更新玩家数据
     */
    updatePlayer: function(playerId, playerData, callback) {
        this.request("update_player", { player_id: playerId, ...playerData }, callback);
    },

    /**
     * 获取玩家数据
     */
    getPlayer: function(playerId, callback) {
        this.request("get_player", { player_id: playerId }, callback);
    },

    /**
     * 获取玩家列表 (后台)
     */
    getPlayerList: function(callback) {
        this.request("get_player_list", {}, callback);
    },

    /**
     * 保存游戏存档
     */
    saveGame: function(playerId, gameData, callback) {
        this.request("save_game", { 
            player_id: playerId, 
            data: JSON.stringify(gameData) 
        }, callback);
    },

    /**
     * 加载游戏存档
     */
    loadGame: function(playerId, callback) {
        this.request("load_game", { player_id: playerId }, callback);
    },

    /**
     * 记录玩家行动
     */
    logAction: function(playerId, action, result, callback) {
        this.request("log_action", {
            player_id: playerId,
            action: action,
            result: JSON.stringify(result)
        }, callback);
    },

    /**
     * 获取成就列表
     */
    getAchievementList: function(callback) {
        this.request("get_achievement_list", {}, callback);
    },

    /**
     * 解锁成就
     */
    unlockAchievement: function(playerId, achievementId, callback) {
        this.request("unlock_achievement", {
            player_id: playerId,
            achievement_id: achievementId
        }, callback);
    }
};

// 导出模块
module.exports = Api;
