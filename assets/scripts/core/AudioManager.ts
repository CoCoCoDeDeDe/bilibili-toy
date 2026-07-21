import { _decorator, Component, AudioSource, AudioClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    public static instance: AudioManager = null;
    
    @property(AudioSource)
    private sfxSource: AudioSource = null;
    @property(AudioSource)
    private bgmSource: AudioSource = null;
    
    private _masterVolume: number = 0.8;
    private _sfxVolume: number = 1.0;
    private _bgmVolume: number = 0.7;
    
    onLoad() {
        if (AudioManager.instance) { this.node.destroy(); return; }
        AudioManager.instance = this;
    }
    
    start() {
        this.sfxSource = this.getComponent(AudioSource);
        // sfxSource and bgmSource would be set up in editor or dynamically
        this.applyVolumes();
    }
    
    setMasterVolume(v: number) { this._masterVolume = v / 100; this.applyVolumes(); }
    setSFXVolume(v: number) { this._sfxVolume = v / 100; this.applyVolumes(); }
    setBGMVolume(v: number) { this._bgmVolume = v / 100; this.applyVolumes(); }
    
    get masterVolume() { return this._masterVolume * 100; }
    get sfxVolume() { return this._sfxVolume * 100; }
    get bgmVolume() { return this._bgmVolume * 100; }
    
    private applyVolumes() {
        if (this.sfxSource) this.sfxSource.volume = this._masterVolume * this._sfxVolume;
        if (this.bgmSource) this.bgmSource.volume = this._masterVolume * this._bgmVolume;
    }
    
    playSFX(clip: AudioClip, loop = false) {
        if (!this.sfxSource || !clip) return;
        this.sfxSource.clip = clip;
        this.sfxSource.loop = loop;
        this.sfxSource.play();
    }
    
    playBGM(clip: AudioClip, loop = true) {
        if (!this.bgmSource || !clip) return;
        if (this.bgmSource.playing) this.bgmSource.stop();
        this.bgmSource.clip = clip;
        this.bgmSource.loop = loop;
        this.bgmSource.play();
    }
    
    stopBGM() {
        if (this.bgmSource) this.bgmSource.stop();
    }
}
