import { _decorator, Component, Node, Slider, Label } from 'cc';
import { SettingsManager } from '../core/SettingsManager';
import { AudioManager } from '../core/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('AudioTab')
export class AudioTab extends Component {
    @property({ type: Slider })
    public masterSlider: Slider = null;
    
    @property({ type: Slider })
    public sfxSlider: Slider = null;
    
    @property({ type: Slider })
    public bgmSlider: Slider = null;
    
    @property({ type: Label })
    public masterValueLabel: Label = null;
    
    @property({ type: Label })
    public sfxValueLabel: Label = null;
    
    @property({ type: Label })
    public bgmValueLabel: Label = null;
    
    start() {
        const sm = SettingsManager.instance;
        
        if (sm) {
            const settings = sm.settings;
            if (this.masterSlider) this.masterSlider.progress = settings.audio.master / 100;
            if (this.sfxSlider) this.sfxSlider.progress = settings.audio.sfx / 100;
            if (this.bgmSlider) this.bgmSlider.progress = settings.audio.bgm / 100;
            this.updateLabels(settings.audio.master, settings.audio.sfx, settings.audio.bgm);
        }
        
        if (this.masterSlider) {
            this.masterSlider.node.on(Slider.EventType.SLIDER, this.onMasterChange, this);
        }
        if (this.sfxSlider) {
            this.sfxSlider.node.on(Slider.EventType.SLIDER, this.onSFXChange, this);
        }
        if (this.bgmSlider) {
            this.bgmSlider.node.on(Slider.EventType.SLIDER, this.onBGMChange, this);
        }
    }
    
    private updateLabels(master: number, sfx: number, bgm: number) {
        if (this.masterValueLabel) this.masterValueLabel.string = `${Math.round(master)}`;
        if (this.sfxValueLabel) this.sfxValueLabel.string = `${Math.round(sfx)}`;
        if (this.bgmValueLabel) this.bgmValueLabel.string = `${Math.round(bgm)}`;
    }
    
    onMasterChange(slider: Slider) {
        const val = Math.round(slider.progress * 100);
        if (this.masterValueLabel) this.masterValueLabel.string = `${val}`;
        if (SettingsManager.instance) SettingsManager.instance.updateAudio(val, undefined, undefined);
        if (AudioManager.instance) AudioManager.instance.setMasterVolume(val);
    }
    
    onSFXChange(slider: Slider) {
        const val = Math.round(slider.progress * 100);
        if (this.sfxValueLabel) this.sfxValueLabel.string = `${val}`;
        if (SettingsManager.instance) SettingsManager.instance.updateAudio(undefined, val, undefined);
        if (AudioManager.instance) AudioManager.instance.setSFXVolume(val);
    }

    onBGMChange(slider: Slider) {
        const val = Math.round(slider.progress * 100);
        if (this.bgmValueLabel) this.bgmValueLabel.string = `${val}`;
        if (SettingsManager.instance) SettingsManager.instance.updateAudio(undefined, undefined, val);
        if (AudioManager.instance) AudioManager.instance.setBGMVolume(val);
    }
}
