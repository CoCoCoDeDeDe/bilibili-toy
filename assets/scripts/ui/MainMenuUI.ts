import { _decorator, Component, Node, Button, Label, director, find } from 'cc';
import { GameManager } from '../core/GameManager';
const { ccclass, property } = _decorator;

@ccclass('MainMenuUI')
export class MainMenuUI extends Component {
    @property({ type: Button })
    public startButton: Button = null;
    
    @property({ type: Button })
    public settingsButton: Button = null;
    
    @property({ type: Button })
    public quitButton: Button = null;
    
    @property({ type: Label })
    public titleLabel: Label = null;
    
    @property({ type: Label })
    public versionLabel: Label = null;
    
    start() {
        if (this.startButton) {
            this.startButton.node.on(Button.EventType.CLICK, this.onStartClick, this);
        }
        if (this.settingsButton) {
            this.settingsButton.node.on(Button.EventType.CLICK, this.onSettingsClick, this);
        }
        if (this.quitButton) {
            this.quitButton.node.on(Button.EventType.CLICK, this.onQuitClick, this);
        }
        if (this.versionLabel) {
            this.versionLabel.string = '版本 0.1.0';
        }
    }
    
    onStartClick() {
        if (GameManager.instance) {
            GameManager.instance.goToGameScene();
        } else {
            director.loadScene('GameScene');
        }
    }
    
    onSettingsClick() {
        // Emit event or find SettingsUI panel and show it
        const settingsUI = find('Canvas/SettingsPanel');
        if (settingsUI) {
            settingsUI.active = true;
        }
    }
    
    onQuitClick() {
        // In browser/editor this does nothing, but in native it would quit
        console.log('Quit requested');
    }
}
