import { _decorator, Component, Slider, Label } from 'cc';
import { SettingsManager } from '../core/SettingsManager';
const { ccclass, property } = _decorator;

@ccclass('VideoTab')
export class VideoTab extends Component {
    @property({ type: Slider })
    public gammaSlider: Slider = null;
    
    @property({ type: Label })
    public gammaValueLabel: Label = null;
    
    @property({ type: Slider })
    public fov1Slider: Slider = null;
    
    @property({ type: Label })
    public fov1ValueLabel: Label = null;
    
    @property({ type: Slider })
    public fov2Slider: Slider = null;
    
    @property({ type: Label })
    public fov2ValueLabel: Label = null;
    
    @property({ type: Slider })
    public fov3Slider: Slider = null;
    
    @property({ type: Label })
    public fov3ValueLabel: Label = null;
    
    @property({ type: Component })
    public gammaPreview: any = null; // GammaPreview component
    
    start() {
        const sm = SettingsManager.instance;
        if (sm) {
            const v = sm.settings.video;
            if (this.gammaSlider) {
                this.gammaSlider.progress = (v.gamma - 0.5) / 2.5;
                this.onGammaChange(this.gammaSlider);
            }
            if (this.fov1Slider) { this.fov1Slider.progress = (v.fov[0] - 60) / 60; this.onFov1Change(this.fov1Slider); }
            if (this.fov2Slider) { this.fov2Slider.progress = (v.fov[1] - 60) / 60; this.onFov2Change(this.fov2Slider); }
            if (this.fov3Slider) { this.fov3Slider.progress = (v.fov[2] - 60) / 60; this.onFov3Change(this.fov3Slider); }
        }
        
        if (this.gammaSlider) this.gammaSlider.node.on(Slider.EventType.SLIDER, this.onGammaChange, this);
        if (this.fov1Slider) this.fov1Slider.node.on(Slider.EventType.SLIDER, this.onFov1Change, this);
        if (this.fov2Slider) this.fov2Slider.node.on(Slider.EventType.SLIDER, this.onFov2Change, this);
        if (this.fov3Slider) this.fov3Slider.node.on(Slider.EventType.SLIDER, this.onFov3Change, this);
    }
    
    onGammaChange(slider: Slider) {
        const gamma = 0.5 + slider.progress * 2.5;
        if (this.gammaValueLabel) this.gammaValueLabel.string = gamma.toFixed(1);
        if (this.gammaPreview && this.gammaPreview.setGamma) {
            this.gammaPreview.setGamma(gamma);
        }
        if (SettingsManager.instance) {
            const v = SettingsManager.instance.settings.video;
            SettingsManager.instance.updateVideo(undefined, gamma, undefined);
        }
    }
    
    onFov1Change(slider: Slider) {
        const fov = Math.round(60 + slider.progress * 60);
        if (this.fov1ValueLabel) this.fov1ValueLabel.string = `${fov}°`;
        if (SettingsManager.instance) {
            const v = SettingsManager.instance.settings.video;
            v.fov[0] = fov;
            SettingsManager.instance.updateVideo(undefined, undefined, v.fov);
        }
    }
    
    onFov2Change(slider: Slider) {
        const fov = Math.round(60 + slider.progress * 60);
        if (this.fov2ValueLabel) this.fov2ValueLabel.string = `${fov}°`;
        if (SettingsManager.instance) {
            const v = SettingsManager.instance.settings.video;
            v.fov[1] = fov;
            SettingsManager.instance.updateVideo(undefined, undefined, v.fov);
        }
    }
    
    onFov3Change(slider: Slider) {
        const fov = Math.round(60 + slider.progress * 60);
        if (this.fov3ValueLabel) this.fov3ValueLabel.string = `${fov}°`;
        if (SettingsManager.instance) {
            const v = SettingsManager.instance.settings.video;
            v.fov[2] = fov;
            SettingsManager.instance.updateVideo(undefined, undefined, v.fov);
        }
    }
}
