import { _decorator, Component, Graphics, CCFloat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GammaPreview')
export class GammaPreview extends Component {
    @property({ type: CCFloat, range: [0.5, 3.0, 0.1] })
    public gamma: number = 1.0;
    
    @property({ type: CCFloat })
    public previewWidth: number = 256;
    
    @property({ type: CCFloat })
    public previewHeight: number = 32;
    
    private _graphics: Graphics = null;
    private _refGraphics: Graphics = null;
    
    onLoad() {
        this._graphics = this.getComponent(Graphics);
        this.drawGammaPreview();
    }
    
    setGamma(value: number) {
        this.gamma = value;
        this.drawGammaPreview();
    }
    
    drawGammaPreview() {
        if (!this._graphics) return;
        
        const g = this._graphics;
        g.clear();
        const w = this.previewWidth;
        const h = this.previewHeight;
        const segments = 64;
        
        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const brightness = Math.pow(t, 1 / this.gamma);
            const gray = Math.round(brightness * 255);
            const color = (255 << 24) | (gray << 16) | (gray << 8) | gray;
            
            const x = (i / segments) * w;
            const segW = w / segments;
            
            g.fillColor = { _val: color } as any;
            g.rect(x, 0, segW + 1, h);
            g.fill();
        }
    }
}
