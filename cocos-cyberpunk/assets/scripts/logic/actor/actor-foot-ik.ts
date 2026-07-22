import { _decorator, animation, color, Color, Component, game, geometry, math, Node, PhysicsSystem, quat, Quat, System, v3, Vec3 } from 'cc';
import { Const, Gizmo, UtilTmp } from '../../core/util/util';
const { ccclass, property } = _decorator;

@ccclass('ActorFootIK')
export class ActorFootIK extends Component {

    @property({ type: animation.AnimationController })
    anim: animation.AnimationController;

    @property(Node)
    root: Node;

    @property(Node)
    footBone: Node;

    @property(Node)
    midBone: Node;

    @property(Node)
    vbMidBone: Node;

    @property
    valueFootIKName = 'foot_ik_l';

    @property
    quatFootKey = 'quat_foot_l';

    @property(Vec3)
    footIKPos = v3(0, 0, 0);

    @property
    checkDistance = 0.2;

    @property(Node)
    ballBone: Node;

    targetPos = v3(0, 0, 0);

    midIKPos = v3(0, 0, 0);

    @property
    smoothHeight = 5;

    finalHeight = 0;
    footHeight = 0;

    originFootQuat = quat(0, 0, 0, 1);

    targetFootQuat = quat(0, 0, 0, 1);
    footQuat = quat(0, 0, 0, 1);

    start () {

    }

    setValue (height: number) {

    }

    lateUpdate (deltaTime: number) {

        Vec3.copy(this.footIKPos, this.node.position);

        Vec3.copy(this.targetPos, this.node.worldPosition);
        this.targetPos.y -= this.checkDistance;
        let ray = UtilTmp.Ray;
        Vec3.copy(ray.o, this.footBone.worldPosition);
        Vec3.copy(ray.d, Const.V3Down);
        Gizmo.drawLine(this.node.worldPosition, this.targetPos, Color.YELLOW);
        if (PhysicsSystem.instance.raycastClosest(ray, 1 << 1, this.checkDistance, false)) {
            const result = PhysicsSystem.instance.raycastClosestResult;
            this.finalHeight = result.hitPoint.y + this.checkDistance;
            Gizmo.drawBox(result.hitPoint, v3(0.01, 0.01, 0.01), Color.BLUE);
            this.calculateSlope(result.hitNormal);
        } else {
            Quat.copy(this.targetFootQuat, this.node.worldRotation);
            this.finalHeight = this.footIKPos.y;
        }

        this.footHeight = math.lerp(this.footHeight, this.finalHeight, deltaTime * this.smoothHeight);
        this.footIKPos.y = this.footHeight;

        Quat.slerp(this.footQuat, this.footQuat, this.targetFootQuat, game.deltaTime * 20);
        this.anim.setValue_experimental(this.quatFootKey, this.footQuat);

        Gizmo.drawBox(this.footIKPos, v3(0.05, 0.05, 0.05), Color.YELLOW);
        this.anim.setValue_experimental(this.valueFootIKName, this.footIKPos);

        Gizmo.drawBox(this.midBone.worldPosition, v3(0.05, 0.05, 0.05), Color.BLUE);
        Gizmo.drawBox(this.vbMidBone.worldPosition, v3(0.05, 0.05, 0.05), Color.GREEN);

        /*
        if (!Vec3.equals(this.footIKPos, this.node.position)) {
            console.log('not equals', this.footIKPos, this.node.position);
            debugger;
        }
        */
    }

    /*
    checkHitGround() {
        Vec3.copy(this.targetPos, this.node.worldPosition);
        this.targetPos.y -= this.checkDistance;
        let ray = UtilTmp.Ray;
        Vec3.copy(ray.o, this.footBone.worldPosition);
        Vec3.copy(ray.d, Const.V3Down);
        Gizmo.drawLine(this.node.worldPosition, this.targetPos, Color.YELLOW);
        if(PhysicsSystem.instance.raycastClosest(ray, 1<<1, this.checkDistance, false)) {
            const result = PhysicsSystem.instance.raycastClosestResult;
            this.setValue(result.hitPoint.y + this.checkDistance);
            Gizmo.drawBox(result.hitPoint, v3(0.02, 0.02, 0.02), Color.BLUE);
            this.calculateSlope(result.hitNormal);
        }else{
            Quat.copy(this.targetFootQuat, this.node.worldRotation);
            this.setValue(this.node.position.y);
        }

        Quat.slerp(this.footQuat, this.footQuat, this.targetFootQuat, game.deltaTime * 20);
        this.anim.setValue_experimental(this.quatFootKey, this.footQuat);
        //this.footBone.setWorldRotation(this.footQuat);
    }
    */

    calculateSlope (slopeNormal: Vec3) {

        Quat.copy(this.originFootQuat, this.node.worldRotation);

        //const footDirection = UtilTmp.V3_0;
        //Vec3.copy(footDirection, this.ballBone.worldPosition);
        //footDirection.subtract(this.footBone.worldPosition);

        const quatFoot = UtilTmp.Quat_0;
        Quat.rotationTo(quatFoot, Const.V3Up, slopeNormal);
        const quatBone = UtilTmp.Quat_1;
        // offset quat add rotation quat.
        Quat.multiply(quatBone, quatFoot, this.originFootQuat);
        Quat.copy(this.targetFootQuat, quatBone);
    }

    /*
    copyBoneNode() {
        UtilNode.nodeToNodeLocal(this.footIKPos, this.root, this.footBone);

        UtilNode.nodeToNodeLocal(this.midIKPos, this.root, this.midBone);

        this.vbMidBone.setPosition(this.midIKPos);

        this.footIKPos.y = this.height;

        Gizmo.drawBox(this.footIKPos, v3(0.05, 0.05, 0.05), Color.YELLOW);

        Gizmo.drawBox(this.midIKPos, v3(0.05, 0.05, 0.05), Color.GREEN);

        console.log(this.footIKPos);

        this.anim.setValue_experimental(this.valueFootIKName, this.footIKPos); 
    }
    */
}

