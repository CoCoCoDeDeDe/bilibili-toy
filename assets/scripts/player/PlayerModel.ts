import { _decorator, Component, Node, Material, MeshRenderer, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerModel')
export class PlayerModel extends Component {
    @property({ type: Color })
    public bodyColor: Color = new Color(245, 166, 35, 255); // #F5A623
    
    @property({ type: Color })
    public accentColor: Color = new Color(255, 224, 178, 255); // #FFE0B2
    
    private _bodyRenderer: MeshRenderer | null = null;
    
    onLoad() {
        // Find body mesh renderer
        this._bodyRenderer = this.getComponentInChildren(MeshRenderer);
        if (this._bodyRenderer) {
            this.applyColors();
        }
    }
    
    applyColors() {
        if (this._bodyRenderer) {
            const material = this._bodyRenderer.material;
            if (material) {
                material.setProperty('albedo', this.bodyColor);
            }
        }
    }
    
    setBodyColor(color: Color) {
        this.bodyColor = color;
        this.applyColors();
    }
}
