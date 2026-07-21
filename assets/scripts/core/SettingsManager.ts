import { _decorator, Component, sys } from 'cc';
const { ccclass, property } = _decorator;

const STORAGE_KEY = 'bilibili-toy-settings';

export interface SettingsData {
    audio: { master: number; sfx: number; bgm: number };
    video: { resolution: string; gamma: number; fov: [number, number, number] };
    controls: { sensitivity: [number, number, number]; keyBindings: Record<string, number[]> };
}

export function getDefaultSettings(): SettingsData {
    return {
        audio: { master: 80, sfx: 100, bgm: 70 },
        video: { resolution: '1920x1080', gamma: 1.0, fov: [80, 70, 75] },
        controls: {
            sensitivity: [3.0, 3.0, 3.0],
            keyBindings: {
                'MOVE_FORWARD': [87, 38],     // W, ArrowUp
                'MOVE_BACKWARD': [83, 40],    // S, ArrowDown
                'MOVE_LEFT': [65, 37],        // A, ArrowLeft
                'MOVE_RIGHT': [68, 39],       // D, ArrowRight
                'JUMP': [32],                 // Space
                'SPRINT': [16, 16],           // Shift
                'SWITCH_PERSPECTIVE': [116],  // F5
                'TOGGLE_SETTINGS': [27],      // Escape
            }
        }
    };
}

@ccclass('SettingsManager')
export class SettingsManager extends Component {
    public static instance: SettingsManager = null;
    private _settings: SettingsData = getDefaultSettings();
    
    onLoad() {
        if (SettingsManager.instance) { this.node.destroy(); return; }
        SettingsManager.instance = this;
        this.load();
    }
    
    get settings(): SettingsData { return this._settings; }
    
    load(): void {
        const raw = sys.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as SettingsData;
                this._settings = { ...getDefaultSettings(), ...parsed };
            } catch { this._settings = getDefaultSettings(); }
        } else {
            this._settings = getDefaultSettings();
        }
    }
    
    save(): void {
        sys.localStorage.setItem(STORAGE_KEY, JSON.stringify(this._settings));
    }
    
    resetToDefaults(): void {
        this._settings = getDefaultSettings();
        this.save();
    }
    
    updateAudio(master?: number, sfx?: number, bgm?: number): void {
        if (master !== undefined) this._settings.audio.master = master;
        if (sfx !== undefined) this._settings.audio.sfx = sfx;
        if (bgm !== undefined) this._settings.audio.bgm = bgm;
        this.save();
    }
    
    updateVideo(resolution?: string, gamma?: number, fov?: [number, number, number]): void {
        if (resolution !== undefined) this._settings.video.resolution = resolution;
        if (gamma !== undefined) this._settings.video.gamma = gamma;
        if (fov !== undefined) this._settings.video.fov = fov;
        this.save();
    }
    
    updateControls(sensitivity?: [number, number, number], bindings?: Record<string, number[]>): void {
        if (sensitivity !== undefined) this._settings.controls.sensitivity = sensitivity;
        if (bindings !== undefined) this._settings.controls.keyBindings = bindings;
        this.save();
    }
}
