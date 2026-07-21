import { _decorator, Component, Label } from 'cc';
import { PlayerController } from '../player/PlayerController';
const { ccclass, property } = _decorator;

@ccclass('HUD')
export class HUD extends Component {
    @property({ type: Label })
    public perspectiveLabel: Label = null;
    
    @property({ type: Label })
    public controlsHintLabel: Label = null;
    
    private _perspectiveNames = ['第一人称', '第二人称', '第三人称'];
    
    start() {
        if (this.controlsHintLabel) {
            this.controlsHintLabel.string = 'W/A/S/D 移动 | Space 跳跃 | F5 视角 | Esc 设置';
        }
    }
    
    update() {
        if (PlayerController.instance && this.perspectiveLabel) {
            const pIdx = PlayerController.instance.currentPerspective;
            this.perspectiveLabel.string = this._perspectiveNames[pIdx] || '未知视角';
        }
    }
}
