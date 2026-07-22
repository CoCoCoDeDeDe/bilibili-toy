import { _decorator, Component, Node, Label, Button, KeyCode, Color, Prefab, input, Input } from 'cc';
import { ActionNames } from '../input/InputActions';
import { InputManager } from '../input/InputManager';
const { ccclass, property } = _decorator;

@ccclass('KeyBindingRow')
export class KeyBindingRow extends Component {
    @property({ type: Label })
    public actionLabel: Label = null;
    
    @property({ type: Node })
    public keyContainer: Node = null;
    
    @property({ type: Prefab })
    public keyChipPrefab: Prefab = null;
    
    @property({ type: Button })
    public addKeyButton: Button = null;
    
    private _action: string = '';
    private _keys: number[] = [];
    
    init(action: string, keys: number[]) {
        this._action = action;
        this._keys = keys;
        
        if (this.actionLabel && ActionNames[action]) {
            this.actionLabel.string = ActionNames[action];
        }
        
        this.renderKeyChips();
        
        if (this.addKeyButton) {
            this.addKeyButton.node.on(Button.EventType.CLICK, this.onAddKey, this);
        }
    }
    
    renderKeyChips() {
        if (!this.keyContainer) return;
        this.keyContainer.removeAllChildren();
        
        this._keys.forEach((keyCode, index) => {
            const chipNode = new Node(`Key_${index}`);
            chipNode.parent = this.keyContainer;
            
            const label = chipNode.addComponent(Label);
            label.string = this.keyCodeToString(keyCode);
            label.fontSize = 16;
            label.color = new Color(245, 166, 35, 255);
            
            // Make it clickable for rebind
            chipNode.on(Node.EventType.TOUCH_END, () => {
                this.startRebind(index);
            });
        });
    }
    
    keyCodeToString(code: number): string {
        const names: Record<number, string> = {
            32: 'Space', 27: 'Esc', 116: 'F5', 16: 'Shift',
            37: '←', 38: '↑', 39: '→', 40: '↓',
        };
        if (names[code]) return names[code];
        if (code >= 65 && code <= 90) return String.fromCharCode(code);
        if (code >= 48 && code <= 57) return String.fromCharCode(code);
        return `Key(${code})`;
    }
    
    startRebind(index: number) {
        // Change the label to show "waiting..."
        // In a full implementation, we'd listen for the next keypress
        // For now, prompt the user
        const label = this.keyContainer.children[index]?.getComponent(Label);
        if (label) {
            label.string = '...';
            label.color = new Color(255, 107, 107, 255); // coral red
        }
        
        // Simple approach: listen for next key down
        const handler = (event: any) => {
            const newKey = event.keyCode;
            input.off(Input.EventType.KEY_DOWN, handler, this);
            
            if (InputManager.instance) {
                InputManager.instance.rebindAction(this._action, index, newKey);
            }
            this._keys[index] = newKey;
            this.renderKeyChips();
        };
        
        input.on(Input.EventType.KEY_DOWN, handler, this);
        
        // Timeout after 5 seconds
        this.scheduleOnce(() => {
            input.off(Input.EventType.KEY_DOWN, handler, this);
            this.renderKeyChips();
        }, 5);
    }
    
    onAddKey() {
        // Listen for next key press to add
        const label = this.addKeyButton.node.getComponent(Label);
        if (label) {
            label.string = '+ ...';
        }
        
        const handler = (event: any) => {
            const newKey = event.keyCode;
            input.off(Input.EventType.KEY_DOWN, handler, this);
            
            if (InputManager.instance) {
                InputManager.instance.addKeyToAction(this._action, newKey);
            }
            this._keys.push(newKey);
            this.renderKeyChips();
            if (label) label.string = '+';
        };
        
        input.on(Input.EventType.KEY_DOWN, handler, this);
        
        this.scheduleOnce(() => {
            input.off(Input.EventType.KEY_DOWN, handler, this);
            if (label) label.string = '+';
        }, 5);
    }
}
