import { _decorator, Component, Label, Color } from 'cc';
import { PlayerController } from '../player/PlayerController';
const { ccclass, property } = _decorator;

@ccclass('PerspectiveIndicator')
export class PerspectiveIndicator extends Component {
    @property({ type: Label })
    public label: Label = null;
    
    private _names = ['第一人称', '第二人称', '第三人称'];
    
    update() {
        if (PlayerController.instance && this.label) {
            this.label.string = `[${this._names[PlayerController.instance.currentPerspective] || '?'}]`;
            this.label.color = new Color(245, 166, 35, 255); // warm orange
        }
    }
}
