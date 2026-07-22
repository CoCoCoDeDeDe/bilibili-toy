import { _decorator, Component, director } from 'cc';
const { ccclass, property } = _decorator;

export enum GameState {
    MENU,
    PLAYING,
    PAUSED
}

@ccclass('GameManager')
export class GameManager extends Component {
    public static instance: GameManager = null;
    
    @property
    public gameState: GameState = GameState.MENU;
    
    onLoad() {
        if (GameManager.instance) {
            this.node.destroy();
            return;
        }
        GameManager.instance = this;
    }
    
    goToStartScene() {
        this.gameState = GameState.MENU;
        director.loadScene('StartScene');
    }
    
    goToGameScene() {
        this.gameState = GameState.PLAYING;
        director.loadScene('GameScene');
    }
    
    pause() {
        this.gameState = GameState.PAUSED;
        director.pause();
    }
    
    resume() {
        if (this.gameState === GameState.PAUSED) {
            this.gameState = GameState.PLAYING;
            director.resume();
        }
    }
}
