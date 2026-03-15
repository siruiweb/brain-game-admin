<?php

namespace app\admin\controller\game;

use app\common\controller\Backend;

/**
 * 玩家管理
 */
class Player extends Backend
{
    protected $searchFields = 'nickname,openid,player_id';

    public function index()
    {
        if ($this->request->isAjax()) {
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            
            $total = \think\Db::name('fa_brain_game_player')
                ->where($where)
                ->order($sort, $order)
                ->count();
            
            $list = \think\Db::name('fa_brain_game_player')
                ->where($where)
                ->order($sort, $order)
                ->limit($offset, $limit)
                ->select();

            return json(['total' => $total, 'rows' => $list]);
        }
        return $this->view->fetch();
    }

    /**
     * 查看玩家详情
     */
    public function view($ids = null)
    {
        $row = \think\Db::name('fa_brain_game_player')->find($ids);
        if (!$row) {
            $this->error('玩家不存在');
        }
        
        // 获取玩家日志
        $logs = \think\Db::name('fa_brain_game_player_log')
            ->where('player_id', $ids)
            ->order('id', 'desc')
            ->limit(50)
            ->select();
        
        $this->view->assign('row', $row);
        $this->view->assign('logs', $logs);
        return $this->view->fetch();
    }

    public function add()
    {
        if ($this->request->isPost()) {
            $params = $this->request->post('row/a');
            if ($params) {
                $params['createtime'] = time();
                $params['updatetime'] = time();
                $params['status'] = 1;
                
                $result = \think\Db::name('fa_brain_game_player')->insert($params);
                if ($result) {
                    $this->success('添加成功');
                } else {
                    $this->error('添加失败');
                }
            }
            $this->error('参数错误');
        }
        return $this->view->fetch();
    }

    public function edit($ids = null)
    {
        $row = \think\Db::name('fa_brain_game_player')->find($ids);
        if (!$row) {
            $this->error('记录不存在');
        }
        
        if ($this->request->isPost()) {
            $params = $this->request->post('row/a');
            if ($params) {
                $params['updatetime'] = time();
                $result = \think\Db::name('fa_brain_game_player')->where('id', $ids)->update($params);
                if ($result !== false) {
                    $this->success('更新成功');
                } else {
                    $this->error('更新失败');
                }
            }
            $this->error('参数错误');
        }
        
        $this->view->assign('row', $row);
        return $this->view->fetch();
    }

    public function del($ids = '')
    {
        if ($ids) {
            $result = \think\Db::name('fa_brain_game_player')->delete($ids);
            if ($result) {
                // 同时删除玩家日志
                \think\Db::name('fa_brain_game_player_log')->where('player_id', $ids)->delete();
                $this->success('删除成功');
            } else {
                $this->error('删除失败');
            }
        }
        $this->error('参数错误');
    }
}
