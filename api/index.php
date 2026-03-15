<?php
/**
 * 游戏API - 头脑特工队
 * Brain Agent Game API
 * Version: 1.1.0 - VALHALLA
 */

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// 配置
define('DB_HOST', 'localhost');
define('DB_NAME', 'brain_game');
define('DB_USER', 'brain_game');
define('DB_PWD', 'ZwSYw4N6ZZN4nLjN');
define('DB_PORT', 3306);

// 表名配置
define('TBL_GAME', 'fa_brain_game_game');
define('TBL_TALENT', 'fa_brain_game_talent');
define('TBL_CHAPTER', 'fa_brain_game_chapter');
define('TBL_ACTION', 'fa_brain_game_action');
define('TBL_EVENT', 'fa_brain_game_event');
define('TBL_ACHIEVEMENT', 'fa_brain_game_achievement');
define('TBL_ITEM', 'fa_brain_game_item');
define('TBL_SHOP', 'fa_brain_game_shop');
define('TBL_PLAYER', 'fa_brain_game_player');
define('TBL_PLAYER_LOG', 'fa_brain_game_player_log');

// 连接数据库
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO("mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PWD);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            jsonResponse(['code' => 500, 'msg' => '数据库连接失败: ' . $e->getMessage()]);
        }
    }
    return $pdo;
}

// JSON响应
function jsonResponse($data) {
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// 获取请求数据 (支持GET和POST)
function getInput() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    if ($data) {
        // 合并GET参数
        return array_merge($_GET, $data, $_POST);
    }
    return array_merge($_GET, $_POST);
}

// 获取玩家ID (支持游客)
function getPlayerId() {
    global $input;
    
    // 方式1: 传入player_id
    if (!empty($input['player_id'])) {
        return $input['player_id'];
    }
    
    // 方式2: 传入token
    if (!empty($input['token'])) {
        $db = getDB();
        $stmt = $db->prepare("SELECT id FROM " . TBL_PLAYER . " WHERE token = ?");
        $stmt->execute([$input['token']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) return $row['id'];
    }
    
    // 方式3: 游客ID
    if (!empty($input['guest_id'])) {
        return $input['guest_id'];
    }
    
    return null;
}

// API路由
$input = getInput();
$action = $_GET['action'] ?? ($input['action'] ?? '');

switch ($action) {
    
    // ========== 游戏配置 ==========
    
    // 获取游戏配置
    case 'get_config':
        $db = getDB();
        $type = $input['type'] ?? 'all'; // all, talent, chapter, action, event, achievement, item, shop
        
        $result = [];
        
        // 游戏信息
        $stmt = $db->query("SELECT * FROM " . TBL_GAME . " WHERE status=1 LIMIT 1");
        $game = $stmt->fetch(PDO::FETCH_ASSOC);
        $result['game'] = $game;
        
        if ($type == 'all' || $type == 'talent') {
            $stmt = $db->query("SELECT * FROM " . TBL_TALENT . " WHERE status=1 ORDER BY sort ASC, id ASC");
            $result['talent'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        if ($type == 'all' || $type == 'chapter') {
            $stmt = $db->query("SELECT * FROM " . TBL_CHAPTER . " WHERE status=1 ORDER BY target_day ASC");
            $result['chapter'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        if ($type == 'all' || $type == 'action') {
            $stmt = $db->query("SELECT * FROM " . TBL_ACTION . " WHERE status=1 ORDER BY sort ASC");
            $result['action'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        if ($type == 'all' || $type == 'event') {
            $stmt = $db->query("SELECT * FROM " . TBL_EVENT . " WHERE status=1");
            $result['event'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        if ($type == 'all' || $type == 'achievement') {
            $stmt = $db->query("SELECT * FROM " . TBL_ACHIEVEMENT . " WHERE status=1 ORDER BY condition_value ASC");
            $result['achievement'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        if ($type == 'all' || $type == 'item') {
            $stmt = $db->query("SELECT * FROM " . TBL_ITEM . " WHERE status=1 ORDER BY sort ASC");
            $result['item'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        if ($type == 'all' || $type == 'shop') {
            $stmt = $db->query("SELECT * FROM " . TBL_SHOP . " WHERE status=1 ORDER BY sort ASC");
            $result['shop'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        jsonResponse(['code' => 0, 'msg' => 'success', 'data' => $result]);
        break;
    
    // ========== 游客模式 ==========
    
    // 创建游客账号
    case 'create_guest':
        $db = getDB();
        $guest_id = 'guest_' . time() . '_' . rand(1000, 9999);
        $nickname = '游客' . rand(1000, 9999);
        
        $stmt = $db->prepare("INSERT INTO " . TBL_PLAYER . " (game_id, openid, nickname, guest_id, money, health, mental, energy, current_day, max_day, status, createtime, updatetime) 
            VALUES (1, ?, ?, ?, 1000, 100, 100, 100, 1, 1, 1, ?, ?)");
        $time = time();
        $stmt->execute([$guest_id, $nickname, $guest_id, $time, $time]);
        
        $player_id = $db->lastInsertId();
        
        jsonResponse([
            'code' => 0,
            'msg' => 'success',
            'data' => [
                'player_id' => $player_id,
                'guest_id' => $guest_id,
                'nickname' => $nickname,
                'token' => md5($player_id . $guest_id)
            ]
        ]);
        break;
    
    // ========== 用户系统 ==========
    
    // 注册
    case 'register':
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
        $nickname = $input['nickname'] ?? $username;
        
        if (empty($username) || empty($password)) {
            jsonResponse(['code' => 400, 'msg' => '用户名和密码不能为空']);
        }
        
        $db = getDB();
        
        // 检查用户名是否存在
        $stmt = $db->prepare("SELECT id FROM " . TBL_PLAYER . " WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            jsonResponse(['code' => 400, 'msg' => '用户名已存在']);
        }
        
        // 创建用户
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $openid = 'user_' . time() . '_' . rand(1000, 9999);
        $token = md5($openid . time());
        
        $stmt = $db->prepare("INSERT INTO " . TBL_PLAYER . " (game_id, openid, username, nickname, password, token, money, health, mental, energy, current_day, max_day, status, createtime, updatetime) 
            VALUES (1, ?, ?, ?, ?, ?, 1000, 100, 100, 100, 1, 1, 1, ?, ?)");
        $time = time();
        $stmt->execute([$openid, $username, $nickname, $password_hash, $token, $time, $time]);
        
        jsonResponse([
            'code' => 0,
            'msg' => '注册成功',
            'data' => [
                'player_id' => $db->lastInsertId(),
                'token' => $token,
                'nickname' => $nickname
            ]
        ]);
        break;
    
    // 登录
    case 'login':
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
        
        if (empty($username) || empty($password)) {
            jsonResponse(['code' => 400, 'msg' => '用户名和密码不能为空']);
        }
        
        $db = getDB();
        $stmt = $db->prepare("SELECT * FROM " . TBL_PLAYER . " WHERE username = ?");
        $stmt->execute([$username]);
        $player = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$player || !password_verify($password, $player['password'])) {
            jsonResponse(['code' => 401, 'msg' => '用户名或密码错误']);
        }
        
        // 更新token
        $token = md5($player['openid'] . time());
        $stmt = $db->prepare("UPDATE " . TBL_PLAYER . " SET token = ?, last_play_time = ? WHERE id = ?");
        $stmt->execute([$token, time(), $player['id']]);
        
        jsonResponse([
            'code' => 0,
            'msg' => '登录成功',
            'data' => [
                'player_id' => $player['id'],
                'token' => $token,
                'nickname' => $player['nickname']
            ]
        ]);
        break;
    
    // ========== 玩家数据 ==========
    
    // 获取玩家数据
    case 'get_player':
        $player_id = getPlayerId();
        
        if (!$player_id) {
            jsonResponse(['code' => 401, 'msg' => '未登录']);
        }
        
        $db = getDB();
        
        // 如果是数字ID，直接查询
        if (is_numeric($player_id)) {
            $stmt = $db->prepare("SELECT * FROM " . TBL_PLAYER . " WHERE id = ?");
            $stmt->execute([$player_id]);
        } else {
            // 否则按guest_id查询
            $stmt = $db->prepare("SELECT * FROM " . TBL_PLAYER . " WHERE guest_id = ?");
            $stmt->execute([$player_id]);
        }
        
        $player = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$player) {
            jsonResponse(['code' => 404, 'msg' => '玩家不存在']);
        }
        
        // 隐藏敏感信息
        unset($player['password']);
        
        jsonResponse(['code' => 0, 'msg' => 'success', 'data' => $player]);
        break;
    
    // 保存玩家数据
    case 'save_game':
        $player_id = getPlayerId();
        
        if (!$player_id) {
            jsonResponse(['code' => 401, 'msg' => '未登录']);
        }
        
        $db = getDB();
        
        // 要更新的字段
        $fields = ['nickname', 'avatar', 'talent', 'gender', 'money', 'health', 'mental', 'energy',
            'emotion_joy', 'emotion_anger', 'emotion_sad', 'emotion_fear', 'emotion_love', 'emotion_disgust',
            'desire_food', 'desire_money', 'desire_fame', 'desire_sleep', 'desire_play',
            'current_day', 'max_day', 'chapter', 'status', 'end_reason', 'inventory', 'achievements'];
        
        $update_fields = [];
        $values = [];
        
        foreach ($fields as $field) {
            if (isset($input[$field])) {
                $update_fields[] = "$field = ?";
                $values[] = $input[$field];
            }
        }
        
        if (empty($update_fields)) {
            jsonResponse(['code' => 400, 'msg' => '没有要保存的数据']);
        }
        
        $update_fields[] = 'updatetime = ?';
        $values[] = time();
        
        // 确定玩家ID
        if (is_numeric($player_id)) {
            $where = "id = ?";
            $values[] = $player_id;
        } else {
            $where = "guest_id = ?";
            $values[] = $player_id;
        }
        
        $sql = "UPDATE " . TBL_PLAYER . " SET " . implode(', ', $update_fields) . " WHERE $where";
        $stmt = $db->prepare($sql);
        $stmt->execute($values);
        
        jsonResponse(['code' => 0, 'msg' => '保存成功']);
        break;
    
    // ========== 游戏操作 ==========
    
    // 执行行动
    case 'do_action':
        $player_id = getPlayerId();
        
        if (!$player_id) {
            jsonResponse(['code' => 401, 'msg' => '未登录']);
        }
        
        $action_id = $input['action_id'] ?? 0;
        
        if (!$action_id) {
            jsonResponse(['code' => 400, 'msg' => '缺少行动ID']);
        }
        
        $db = getDB();
        
        // 获取行动配置
        $stmt = $db->prepare("SELECT * FROM " . TBL_ACTION . " WHERE id = ?");
        $stmt->execute([$action_id]);
        $action_cfg = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$action_cfg) {
            jsonResponse(['code' => 404, 'msg' => '行动不存在']);
        }
        
        // 获取玩家数据
        if (is_numeric($player_id)) {
            $stmt = $db->prepare("SELECT * FROM " . TBL_PLAYER . " WHERE id = ?");
            $stmt->execute([$player_id]);
        } else {
            $stmt = $db->prepare("SELECT * FROM " . TBL_PLAYER . " WHERE guest_id = ?");
            $stmt->execute([$player_id]);
        }
        $player = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$player) {
            jsonResponse(['code' => 404, 'msg' => '玩家不存在']);
        }
        
        // 应用效果
        $effects = json_decode($action_cfg['effects'], true);
        $changes = [];
        
        if ($effects) {
            foreach ($effects as $effect) {
                $type = $effect['type'];
                $value = $effect['value'];
                $changes[$type] = $value;
                
                // 更新玩家属性
                if (in_array($type, ['money', 'health', 'mental', 'energy'])) {
                    $field = $type;
                    $player[$field] = max(0, min(100, $player[$field] + $value));
                } elseif (in_array($type, ['emotion_joy', 'emotion_anger', 'emotion_sad', 'emotion_fear', 'emotion_love', 'emotion_disgust'])) {
                    $player[$type] = max(0, min(100, $player[$type] + $value));
                } elseif (in_array($type, ['desire_food', 'desire_money', 'desire_fame', 'desire_sleep', 'desire_play'])) {
                    $player[$type] = max(0, min(100, $player[$type] + $value));
                }
            }
        }
        
        // 检查游戏结束条件
        $game_over = false;
        $end_reason = '';
        
        if ($player['health'] <= 0) {
            $game_over = true;
            $end_reason = '健康耗尽';
        } elseif ($player['mental'] <= 0) {
            $game_over = true;
            $end_reason = '精神崩溃';
        }
        
        // 保存玩家数据
        $fields = ['money', 'health', 'mental', 'energy', 'emotion_joy', 'emotion_anger', 'emotion_sad', 
            'emotion_fear', 'emotion_love', 'emotion_disgust', 'desire_food', 'desire_money', 
            'desire_fame', 'desire_sleep', 'desire_play', 'updatetime'];
        
        $update_sql = [];
        foreach ($fields as $field) {
            if (isset($player[$field])) {
                $update_sql[] = "$field = ?";
            }
        }
        
        if ($game_over) {
            $update_sql[] = "status = 0";
            $update_sql[] = "end_reason = ?";
            $player['end_reason'] = $end_reason;
        }
        
        $update_sql[] = "last_play_time = ?";
        
        if (is_numeric($player_id)) {
            $sql = "UPDATE " . TBL_PLAYER . " SET " . implode(', ', $update_sql) . " WHERE id = ?";
            $values = array_values(array_filter($player, function($k) use ($fields, $game_over) {
                return in_array($k, $fields) || ($game_over && $k == 'end_reason') || $k == 'last_play_time';
            }, ARRAY_FILTER_USE_KEY));
            $values[] = $player_id;
        } else {
            $sql = "UPDATE " . TBL_PLAYER . " SET " . implode(', ', $update_sql) . " WHERE guest_id = ?";
            $values = array_values(array_filter($player, function($k) use ($fields, $game_over) {
                return in_array($k, $fields) || ($game_over && $k == 'end_reason') || $k == 'last_play_time';
            }, ARRAY_FILTER_USE_KEY));
            $values[] = $player_id;
        }
        
        $stmt = $db->prepare($sql);
        $stmt->execute($values);
        
        jsonResponse([
            'code' => 0,
            'msg' => $game_over ? '游戏结束' : 'success',
            'data' => [
                'changes' => $changes,
                'game_over' => $game_over,
                'end_reason' => $end_reason,
                'player' => $player
            ]
        ]);
        break;
    
    // 下一天
    case 'next_day':
        $player_id = getPlayerId();
        
        if (!$player_id) {
            jsonResponse(['code' => 401, 'msg' => '未登录']);
        }
        
        $db = getDB();
        
        // 获取玩家数据
        if (is_numeric($player_id)) {
            $stmt = $db->prepare("SELECT * FROM " . TBL_PLAYER . " WHERE id = ?");
            $stmt->execute([$player_id]);
        } else {
            $stmt = $db->prepare("SELECT * FROM " . TBL_PLAYER . " WHERE guest_id = ?");
            $stmt->execute([$player_id]);
        }
        $player = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$player) {
            jsonResponse(['code' => 404, 'msg' => '玩家不存在']);
        }
        
        // 进入下一天
        $player['current_day']++;
        $player['max_day'] = max($player['max_day'], $player['current_day']);
        
        // 随机事件
        $stmt = $db->query("SELECT * FROM " . TBL_EVENT . " WHERE status=1 AND min_day <= " . $player['current_day'] . " AND max_day >= " . $player['current_day'] . " ORDER BY RAND() LIMIT 1");
        $event = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $event_result = null;
        if ($event) {
            $effects = json_decode($event['effects'], true);
            if ($effects) {
                foreach ($effects as $effect) {
                    $type = $effect['type'];
                    $value = $effect['value'];
                    if (in_array($type, ['money', 'health', 'mental', 'energy'])) {
                        $player[$type] = max(0, min(100, $player[$type] + $value));
                    }
                }
            }
            $event_result = [
                'title' => $event['title'],
                'content' => $event['content'],
                'type' => $event['type'],
                'effects' => $effects
            ];
        }
        
        // 检查章节
        $stmt = $db->query("SELECT * FROM " . TBL_CHAPTER . " WHERE status=1 AND target_day <= " . $player['current_day'] . " ORDER BY target_day DESC LIMIT 1");
        $chapter = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($chapter) {
            $player['chapter'] = $chapter['id'];
        }
        
        // 检查游戏结束
        $game_over = false;
        $end_reason = '';
        
        if ($player['health'] <= 0) {
            $game_over = true;
            $end_reason = '健康耗尽';
        } elseif ($player['mental'] <= 0) {
            $game_over = true;
            $end_reason = '精神崩溃';
        }
        
        // 保存
        $fields = ['current_day', 'max_day', 'chapter', 'money', 'health', 'mental', 'energy', 'updatetime'];
        if ($game_over) {
            $fields[] = 'status';
            $fields[] = 'end_reason';
        }
        
        if (is_numeric($player_id)) {
            $sql = "UPDATE " . TBL_PLAYER . " SET current_day=?, max_day=?, chapter=?, money=?, health=?, mental=?, energy=?, updatetime=?" . ($game_over ? ", status=0, end_reason=?" : "") . " WHERE id = ?";
            $values = array_merge([$player['current_day'], $player['max_day'], $player['chapter'], $player['money'], $player['health'], $player['mental'], $player['energy'], time()], $game_over ? [$end_reason] : [], [$player_id]);
        } else {
            $sql = "UPDATE " . TBL_PLAYER . " SET current_day=?, max_day=?, chapter=?, money=?, health=?, mental=?, energy=?, updatetime=?" . ($game_over ? ", status=0, end_reason=?" : "") . " WHERE guest_id = ?";
            $values = array_merge([$player['current_day'], $player['max_day'], $player['chapter'], $player['money'], $player['health'], $player['mental'], $player['energy'], time()], $game_over ? [$end_reason] : [], [$player_id]);
        }
        
        $stmt = $db->prepare($sql);
        $stmt->execute($values);
        
        jsonResponse([
            'code' => 0,
            'msg' => 'success',
            'data' => [
                'current_day' => $player['current_day'],
                'chapter' => $player['chapter'],
                'event' => $event_result,
                'game_over' => $game_over,
                'end_reason' => $end_reason,
                'player' => $player
            ]
        ]);
        break;
    
    // ========== 排行榜 ==========
    
    case 'leaderboard':
        $db = getDB();
        $limit = intval($input['limit'] ?? 20);
        
        $stmt = $db->prepare("SELECT id, nickname, avatar, talent, max_day, chapter, total_games, win_games, status FROM " . TBL_PLAYER . " ORDER BY max_day DESC, current_day DESC LIMIT ?");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->execute();
        $list = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        jsonResponse(['code' => 0, 'msg' => 'success', 'data' => $list]);
        break;
    
    // ========== 默认响应 ==========
    
    default:
        jsonResponse(['code' => 404, 'msg' => '未知的操作: ' . $action]);
        break;
}
