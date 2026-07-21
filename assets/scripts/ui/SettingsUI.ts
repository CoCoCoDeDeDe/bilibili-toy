import { _decorator, Component, Node, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SettingsUI')
export class SettingsUI extends Component {
    @property({ type: Button })
    public tabAudio: Button = null;
    
    @property({ type: Button })
    public tabVideo: Button = null;
    
    @property({ type: Button })
    public tabControls: Button = null;
    
    @property({ type: Node })
    public tabAudioContent: Node = null;
    
    @property({ type: Node })
    public tabVideoContent: Node = null;
    
    @property({ type: Node })
    public tabControlsContent: Node = null;
    
    @property({ type: Button })
    public backButton: Button = null;
    
    private _tabs: Button[] = [];
    private _contents: Node[] = [];
    private _currentTab: number = 0;
    
    start() {
        this._tabs = [this.tabAudio, this.tabVideo, this.tabControls];
        this._contents = [this.tabAudioContent, this.tabVideoContent, this.tabControlsContent];
        
        if (this.tabAudio) this.tabAudio.node.on(Button.EventType.CLICK, () => this.switchTab(0));
        if (this.tabVideo) this.tabVideo.node.on(Button.EventType.CLICK, () => this.switchTab(1));
        if (this.tabControls) this.tabControls.node.on(Button.EventType.CLICK, () => this.switchTab(2));
        if (this.backButton) this.backButton.node.on(Button.EventType.CLICK, this.onBack, this);
        
        this.switchTab(0);
    }
    
    switchTab(index: number) {
        this._currentTab = index;
        this._contents.forEach((c, i) => {
            if (c) c.active = (i === index);
        });
        // Update tab button visual states would be handled by button interactable
        this._tabs.forEach((btn, i) => {
            if (btn) btn.interactable = (i !== index);
        });
    }
    
    onBack() {
        this.node.active = false;
    }
}
