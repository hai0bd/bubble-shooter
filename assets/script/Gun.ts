import { _decorator, Component, director, EventTouch, Input, input, instantiate, Node, Prefab, Vec2, Vec3 } from 'cc';
import { Bullet } from './Bullet';
const { ccclass, property } = _decorator;

@ccclass('Gun')
export class Gun extends Component {
    @property(Prefab)
    bubblePrefab: Prefab;

    start() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this); //shoot
    }

    onTouchStart(event: EventTouch) {
        const touch = event.touch.getUILocation();
    }

    onTouchMove(event: EventTouch) {
        const touch = event.touch.getUILocation();

        this.node.angle = (this.getAngle(touch) * 180 / Math.PI) - 90;
    }

    onTouchEnd(event: EventTouch) {
        const point = event.touch.getUILocation();
        const angle = this.getAngle(point);

        this.node.angle = (angle * 180 / Math.PI) - 90;
        this.createBubble(angle);

    }
    getAngle(touch: Vec2): number {
        const gun = this.node.position;
        return Math.atan2(touch.y, touch.x + (- gun.x - 360)) /* * 180 / Math.PI */;
    }

    createBubble(angle: number) {
        const bubble = instantiate(this.bubblePrefab);
        bubble.position = this.node.getPosition();
        this.node.parent.addChild(bubble);

        const bullet = bubble.getComponent(Bullet);
        bullet.init(200, angle);
    }
}


