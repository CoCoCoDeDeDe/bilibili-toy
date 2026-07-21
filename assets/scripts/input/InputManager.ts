import { _decorator, Component, Input, input, EventKeyboard } from 'cc';
import { SettingsManager } from '../core/SettingsManager';
const { ccclass, property } = _decorator;

const DEFAULT_BINDINGS: Record<string, number[]> = {
    'MOVE_FORWARD': [87, 38],
    'MOVE_BACKWARD': [83, 40],
    'MOVE_LEFT': [65, 37],
    'MOVE_RIGHT': [68, 39],
    'JUMP': [32],
    'SPRINT': [16],
    'SWITCH_PERSPECTIVE': [116],
    'TOGGLE_SETTINGS': [27],
};

@ccclass('InputManager')
export class InputManager extends Component {
    public static instance: InputManager = null;

    private _pressedKeys: Set<number> = new Set();
    private _justPressed: Set<number> = new Set();
    private _bindings: Record<string, number[]> = {};

    onLoad() {
        if (InputManager.instance) { this.node.destroy(); return; }
        InputManager.instance = this;
        this.reloadBindings();
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    reloadBindings() {
        const sm = SettingsManager.instance;
        if (sm && sm.settings) {
            this._bindings = { ...sm.settings.controls.keyBindings };
        } else {
            this._bindings = { ...DEFAULT_BINDINGS };
        }
    }

    private onKeyDown(event: EventKeyboard) {
        const code = event.keyCode;
        this._pressedKeys.add(code);
        this._justPressed.add(code);
    }

    private onKeyUp(event: EventKeyboard) {
        this._pressedKeys.delete(event.keyCode);
    }

    lateUpdate() {
        this._justPressed.clear();
    }

    checkAction(action: string): boolean {
        const keys = this._bindings[action];
        if (!keys || keys.length === 0) return false;
        return keys.some(k => this._pressedKeys.has(k));
    }

    onActionDown(action: string): boolean {
        const keys = this._bindings[action];
        if (!keys || keys.length === 0) return false;
        return keys.some(k => this._justPressed.has(k));
    }

    getActionKeys(action: string): number[] {
        return this._bindings[action] || [];
    }

    rebindAction(action: string, index: number, newKey: number): void {
        if (!this._bindings[action]) this._bindings[action] = [];
        this._bindings[action][index] = newKey;
        this.saveBindings();
    }

    addKeyToAction(action: string, key: number): void {
        if (!this._bindings[action]) this._bindings[action] = [];
        if (!this._bindings[action].includes(key)) {
            this._bindings[action].push(key);
            this.saveBindings();
        }
    }

    removeKeyFromAction(action: string, index: number): void {
        if (!this._bindings[action]) return;
        if (this._bindings[action].length <= 1) return; // keep at least 1
        this._bindings[action].splice(index, 1);
        this.saveBindings();
    }

    private saveBindings() {
        const sm = SettingsManager.instance;
        if (sm) {
            sm.updateControls(undefined, this._bindings);
        }
    }
}
