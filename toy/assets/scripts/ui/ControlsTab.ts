import { _decorator, Component, Slider, Label, Node, ScrollView, instantiate, Prefab } from 'cc';
import { SettingsManager } from '../core/SettingsManager';
import { ActionNames } from '../input/InputActions';
const { ccclass, property } = _decorator;

@ccclass('ControlsTab')
export class ControlsTab extends Component {
    @property({ type: Slider })
    public sens1Slider: Slider = null;  // First person
    
    @property({ type: Label })
    public sens1Label: Label = null;
    
    @property({ type: Slider })
    public sens2Slider: Slider = null;  // Second person
    
    @property({ type: Label })
    public sens2Label: Label = null;
    
    @property({ type: Slider })
    public sens3Slider: Slider = null;  // Third person
    
    @property({ type: Label })
    public sens3Label: Label = null;
    
    @property({ type: ScrollView })
    public keyBindingScrollView: ScrollView = null;
    
    @property({ type: Node })
    public keyBindingContainer: Node = null;
    
    @property({ type: Prefab })
    public keyBindingRowPrefab: Prefab = null;
    
    start() {
        const sm = SettingsManager.instance;
        if (sm) {
            const c = sm.settings.controls;
            if (this.sens1Slider) this.sens1Slider.progress = c.sensitivity[0] / 10;
            if (this.sens2Slider) this.sens2Slider.progress = c.sensitivity[1] / 10;
            if (this.sens3Slider) this.sens3Slider.progress = c.sensitivity[2] / 10;
            this.updateSensLabels(c.sensitivity);
        }
        
        if (this.sens1Slider) this.sens1Slider.node.on(Slider.EventType.SLIDER, () => this.onSensChange(0, this.sens1Slider));
        if (this.sens2Slider) this.sens2Slider.node.on(Slider.EventType.SLIDER, () => this.onSensChange(1, this.sens2Slider));
        if (this.sens3Slider) this.sens3Slider.node.on(Slider.EventType.SLIDER, () => this.onSensChange(2, this.sens3Slider));
        
        this.populateKeyBindings();
    }
    
    private updateSensLabels(sensitivity: number[]) {
        if (this.sens1Label) this.sens1Label.string = sensitivity[0].toFixed(1);
        if (this.sens2Label) this.sens2Label.string = sensitivity[1].toFixed(1);
        if (this.sens3Label) this.sens3Label.string = sensitivity[2].toFixed(1);
    }
    
    onSensChange(index: number, slider: Slider) {
        const val = Math.round(slider.progress * 10 * 10) / 10;
        if (SettingsManager.instance) {
            const c = SettingsManager.instance.settings.controls;
            c.sensitivity[index] = val;
            SettingsManager.instance.updateControls(c.sensitivity, undefined);
            this.updateSensLabels(c.sensitivity);
        }
    }
    
    populateKeyBindings() {
        if (!this.keyBindingContainer) return;
        
        // Remove old entries
        this.keyBindingContainer.removeAllChildren();
        
        const sm = SettingsManager.instance;
        if (!sm) return;
        
        const bindings = sm.settings.controls.keyBindings;
        
        for (const [action, keys] of Object.entries(bindings)) {
            if (!ActionNames[action]) continue;
            
            if (this.keyBindingRowPrefab) {
                const row = instantiate(this.keyBindingRowPrefab);
                row.parent = this.keyBindingContainer;
                const rowScript = row.getComponent('KeyBindingRow');
                if (rowScript) {
                    rowScript.init(action, keys as number[]);
                }
            }
        }
    }
}
