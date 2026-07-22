import { _decorator, Component, Node, Camera, Vec3, CCFloat, input, Input, EventMouse, EventKeyboard, KeyCode, Quat, math } from 'cc';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

export enum Perspective {
    FIRST = 0,
    SECOND = 1,
    THIRD = 2,
}

interface PerspectiveConfig {
    offset: Vec3;
    distance: number;
    minDistance: number;
    maxDistance: number;
    pitchMin: number;
    pitchMax: number;
    fov: number;
}

const PERSPECTIVE_CONFIGS: Record<Perspective, PerspectiveConfig> = {
    [Perspective.FIRST]: {
        offset: new Vec3(0, 0.3, 0),
        distance: 0,
        minDistance: 0,
        maxDistance: 0,
        pitchMin: -80,
        pitchMax: 80,
        fov: 80,
    },
    [Perspective.SECOND]: {
        offset: new Vec3(0.5, 0.3, -0.5),
        distance: 1.2,
        minDistance: 0.8,
        maxDistance: 2.0,
        pitchMin: -30,
        pitchMax: 60,
        fov: 70,
    },
    [Perspective.THIRD]: {
        offset: new Vec3(0, 0.5, 0),
        distance: 4.0,
        minDistance: 2.0,
        maxDistance: 8.0,
        pitchMin: -40,
        pitchMax: 80,
        fov: 75,
    },
};

@ccclass('PlayerCamera')
export class PlayerCamera extends Component {
    @property({ type: Node })
    public target: Node = null;
    
    @property({ type: CCFloat })
    public sensitivity: number = 3.0;
    
    private _camera: Camera = null;
    private _theta: number = 0;      // horizontal angle
    private _phi: number = 30;       // vertical angle (positive = looking down)
    private _distance: number = 4.0;
    private _currentPerspective: Perspective = Perspective.THIRD;
    private _isMouseLocked: boolean = false;
    private _currentPos: Vec3 = new Vec3();
    private _targetPos: Vec3 = new Vec3();
    
    onLoad() {
        this._camera = this.getComponent(Camera);
        this._currentPos.set(this.node.position);
        this.applyPerspective(this._currentPerspective);
        
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
    }
    
    onMouseMove(event: EventMouse) {
        if (!this._isMouseLocked) return;
        
        const sens = this.sensitivity * 0.002;
        this._theta -= event.movementX * sens;
        this._phi -= event.movementY * sens;
        
        const config = PERSPECTIVE_CONFIGS[this._currentPerspective];
        this._phi = math.clamp(this._phi, config.pitchMin, config.pitchMax);
    }
    
    onMouseWheel(event: EventMouse) {
        if (this._currentPerspective !== Perspective.THIRD) return;
        const config = PERSPECTIVE_CONFIGS[Perspective.THIRD];
        this._distance = math.clamp(
            this._distance - event.scrollY * 0.5,
            config.minDistance,
            config.maxDistance
        );
    }
    
    lockMouse() {
        this._isMouseLocked = true;
        // In browser: input.acceleration.  In Cocos, we just track state
    }
    
    unlockMouse() {
        this._isMouseLocked = false;
    }
    
    toggleMouseLock(): boolean {
        this._isMouseLocked = !this._isMouseLocked;
        return this._isMouseLocked;
    }
    
    set currentPerspective(p: Perspective) { this._currentPerspective = p; this.applyPerspective(p); }
    get currentPerspective(): Perspective { return this._currentPerspective; }
    
    applyPerspective(p: Perspective) {
        const config = PERSPECTIVE_CONFIGS[p];
        this._distance = config.distance;
        this._phi = math.clamp(this._phi, config.pitchMin, config.pitchMax);
        if (this._camera) {
            this._camera.fov = config.fov;
        }
    }
    
    setSensitivity(perspective: Perspective, value: number) {
        // This would be called from settings
        this.sensitivity = value;
    }
    
    lateUpdate(dt: number) {
        if (!this.target) return;
        
        const config = PERSPECTIVE_CONFIGS[this._currentPerspective];
        
        // Calculate camera position in spherical coordinates
        const thetaRad = this._theta * Math.PI / 180;
        const phiRad = this._phi * Math.PI / 180;
        
        let camPos = new Vec3(0, 0, this._distance);
        // Apply spherical rotation
        const rot = new Quat();
        Quat.fromEuler(rot, this._phi, this._theta, 0);
        Vec3.transformQuat(camPos, camPos, rot);
        
        // Add target position and offset
        Vec3.add(camPos, camPos, this.target.worldPosition);
        const offset = config.offset.clone();
        // Rotate offset by theta
        const offsetRot = new Quat();
        Quat.fromEuler(offsetRot, 0, this._theta, 0);
        Vec3.transformQuat(offset, offset, offsetRot);
        Vec3.add(camPos, camPos, offset);
        
        // Smooth lerp
        this._currentPos.lerp(camPos, 10 * dt);
        this.node.position = this._currentPos;
        
        // Look at target
        this.node.lookAt(this.target.worldPosition);
        
        // Update theta for PlayerController
        if (PlayerController.instance) {
            PlayerController.instance.setEulerY(this._theta);
        }
    }
}
