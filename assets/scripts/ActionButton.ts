/**
 * 情绪和欲望按钮组件
 */

import { _decorator, Component, Node, Label, Button, Sprite, Color } from 'cc';
import { GameManager } from './GameManager';

const { ccclass, property } = _decorator;

@ccclass('ActionButton')
export class ActionButton extends Component {
    @property(Button)
    private button: Button = null;

    @property(Label)
    private nameLabel: Label = null;

    @property
    private actionKey: string = "";

    @property
    private cost: number = 0;

    private gameManager: GameManager = null;

    start() {
        // 获取GameManager
        this.gameManager = this.node.parent.getComponent(GameManager);
        
        if (this.button) {
            this.button.node.on('click', this.onClick, this);
        }
    }

    onClick() {
        if (this.gameManager) {
            this.gameManager.performAction(this.actionKey);
        }
    }

    update(deltaTime: number) {
        // 可以添加动态效果
    }
}
