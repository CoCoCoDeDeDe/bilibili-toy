import { _decorator, Component, Node, CapsuleCharacterController, Vec3, CCFloat } from 'cc';
import { InputManager } from '../input/InputManager';
const { ccclass, property } = _decorator;

export enum Perspective {
    FIRST = 0,
    SECOND = 1,
    THIRD = 2,
}

@ccclass('PlayerController')
export class PlayerController extends Component {
    public static instance: PlayerController = null;
    
    @property({ type: CCFloat })
    public walkSpeed: number = 4.0;
    
    @property({ type: CCFloat })
    public sprintSpeed: number = 7.0;
    
    @property({ type: CCFloat })
    public jumpSpeed: number = 6.0;
    
    @property({ type: CCFloat })
    public rotateSpeed: number = 10.0;
    
    private _character: CapsuleCharacterController = null;
    private _currentPerspective: Perspective = Perspective.THIRD;
    private _targetRotation: number = 0;
    private _eulerY: number = 0;
    
    onLoad() {
        if (PlayerController.instance) { this.node.destroy(); return; }
        PlayerController.instance = this;
    }
    
    start() {
        this._character = this.getComponent(CapsuleCharacterController);
        if (!this._character) {
            console.warn('PlayerController: CapsuleCharacterController not found on this node!');
        }
    }
    
    get currentPerspective(): Perspective { return this._currentPerspective; }
    
    cyclePerspective(): Perspective {
        this._currentPerspective = (this._currentPerspective + 1) % 3;
        return this._currentPerspective;
    }
    
    setPerspective(p: Perspective) {
        this._currentPerspective = p;
    }
    
    setEulerY(y: number) {
        this._eulerY = y;
    }
    
    get eulerY(): number { return this._eulerY; }
    
    update(dt: number) {
        if (!this._character) return;
        
        const im = InputManager.instance;
        if (!im) return;
        
        // Calculate move direction relative to camera
        let moveX = 0;
        let moveZ = 0;
        
        if (im.checkAction('MOVE_FORWARD')) moveZ -= 1;
        if (im.checkAction('MOVE_BACKWARD')) moveZ += 1;
        if (im.checkAction('MOVE_LEFT')) moveX -= 1;
        if (im.checkAction('MOVE_RIGHT')) moveX += 1;
        
        const isSprinting = im.checkAction('SPRINT');
        const speed = isSprinting ? this.sprintSpeed : this.walkSpeed;
        
        // Rotate input direction by camera euler Y
        const sin = Math.sin(this._eulerY * Math.PI / 180);
        const cos = Math.cos(this._eulerY * Math.PI / 180);
        const worldX = moveX * cos - moveZ * sin;
        const worldZ = moveX * sin + moveZ * cos;
        
        // Build velocity
        const velocity = new Vec3(worldX * speed, 0, worldZ * speed);
        velocity.y = this._character.velocity.y; // preserve gravity
        
        // Apply rotation
        if (moveX !== 0 || moveZ !== 0) {
            const targetAngle = Math.atan2(worldX, worldZ) * 180 / Math.PI;
            this.node.eulerAngles = new Vec3(0, targetAngle, 0);
        }
        
        // Jump
        if (im.onActionDown('JUMP') && this._character.isGrounded) {
            velocity.y = this.jumpSpeed;
        }
        
        this._character.move(velocity.multiplyScalar(dt));
    }
}
