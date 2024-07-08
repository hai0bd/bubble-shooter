import { _decorator, Component, director, ERaycast2DType, EventTouch, Graphics, Node, PhysicsSystem2D, RigidBody2D, tween, UITransform, Vec2, Vec3 } from 'cc';
import DataManager, { SCREEN_W, SCREEN_H, SCREEN_T } from './DataManager';
import { ENUM_GAME_EVENT, ENUM_GAME_STATUS, ENUM_PHYCOLLIDER_TAG } from './../Enum';
import EventManager from "./EventManager";

const { ccclass, property } = _decorator;

@ccclass
export default class TouchManager extends Component {

    @property(Graphics)
    draw: Graphics = null
    // 划线长度
    curDrawLength: number = 0
    // 有效点击
    isValidTouch: boolean = true

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchsMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchsMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch): void {
        if (DataManager.instance.status != ENUM_GAME_STATUS.RUNING) {
            this.isValidTouch = false;
            return;
        }
        this.isValidTouch = true;
        this.clearLine();
        this.curDrawLength = 0;
        DataManager.instance.bubbleMoveActions = [];

        const startLocation = this.draw.node.getPosition();
        const location = event.getUILocation();  // Changed from getLocation() to getUILocation()
        const degree = this.convertToDegree(event);
        if (degree == DataManager.instance.bubbleShootDegree || degree == -DataManager.instance.bubbleShootDegree) return;

        // Calculate the direction for the raycast
        const direction = new Vec2(location.x - startLocation.x, location.y - startLocation.y).normalize();
        this.drawRayCast(new Vec2(startLocation.x, startLocation.y), direction);
        this.draw.stroke();
    }

    private onTouchsMove(e: EventTouch): void {
        if (DataManager.instance.status != ENUM_GAME_STATUS.RUNING) {
            this.isValidTouch = false;
            return;
        }
        this.isValidTouch = true;
        this.clearLine();
        this.curDrawLength = 0;
        DataManager.instance.bubbleMoveActions = [];

        const startLocation = this.draw.node.getPosition();
        const location = e.getUILocation(); // Changed from getLocation() to getUILocation()
        const degree = this.convertToDegree(e);
        if (degree == DataManager.instance.bubbleShootDegree || degree == -DataManager.instance.bubbleShootDegree) return;

        // Calculate the direction for the raycast
        const direction = new Vec2(location.x - startLocation.x, location.y - startLocation.y).normalize();
        this.drawRayCast(new Vec2(startLocation.x, startLocation.y), direction);
        this.draw.stroke();
    }

    private onTouchEnd(e: EventTouch): void {
        if (DataManager.instance.status != ENUM_GAME_STATUS.RUNING || !this.isValidTouch) return;
        // DataManager.instance.status = ENUM_GAME_STATUS.UNRUNING
        this.clearLine();
        const degree = this.convertToDegree(e);
        // 限制角度范围间
        if (degree == DataManager.instance.bubbleShootDegree || degree == -DataManager.instance.bubbleShootDegree) return
        EventManager.instance.emit(ENUM_GAME_EVENT.BALL_SHOOT)
    }

    // 角度转化
    private convertToDegree(e: EventTouch): number {
        const pos: Vec2 = e.getUILocation(); // Changed from getLocation() to getUILocation()
        const uiTransform = this.draw.node.getComponent(UITransform);
        const nodePos = uiTransform.convertToNodeSpaceAR(new Vec3(pos.x, pos.y, 0)); // Convert world coordinates to node space

        const x = nodePos.x - this.draw.node.position.x;
        const y = nodePos.y - this.draw.node.position.y;
        const radian = Math.atan2(y, x);

        // Convert radians to degrees (0 - 2π -> 0 - 360)
        let degree = radian * 180 / Math.PI;
        // Adjust the angle
        degree -= 90;

        const bubbleShootDegree = DataManager.instance.bubbleShootDegree;

        if (degree < -bubbleShootDegree && degree > -180) {
            degree = -bubbleShootDegree;
        }
        if (degree > bubbleShootDegree || degree <= -180) {
            degree = bubbleShootDegree;
        }

        return degree;
    }

    // 绘画瞄准线(废弃)
    private drawLine(pos: Vec2) {
        this.draw.clear();

        // Screen dimensions (assumed constants)
        const SCREEN_W = 1920; // Replace with actual screen width
        const SCREEN_H = 1080; // Replace with actual screen height
        const SCREEN_T = 0;    // Replace with actual screen top position

        let lineLength = SCREEN_H - SCREEN_T - Math.abs(this.draw.node.position.y);
        let k = pos.y / pos.x;

        // Initialize variables
        let point = new Vec2(0, 0);
        let b = 0;
        let x: number, y: number;
        let d_b = (k > 0 ? SCREEN_W / 2 : -SCREEN_W / 2) * k;
        let isRebound = false;

        while (true) {
            x = k > 0 ? SCREEN_W / 2 : -SCREEN_W / 2;
            y = k * x + b;

            let l = new Vec2(x, y).subtract(point).length(); // Use length() instead of mag()

            if (l < lineLength) {
                isRebound = true;
                lineLength -= l;
                this.draw.lineTo(x, y);
                point.set(x, y);
                b = y + d_b;
                k *= -1;
            } else {
                if (isRebound) {
                    let l_k = lineLength / l;
                    let r_x = SCREEN_W * l_k;
                    x = k > 0 ? -SCREEN_W / 2 + r_x : SCREEN_W / 2 - r_x;
                    y = k * x + b;
                } else {
                    let l_k = lineLength / l;
                    let r_x = SCREEN_W / 2 * l_k;
                    x = k > 0 ? r_x : -r_x;
                    y = k * x;

                    if (Math.abs(x) < 0.05)
                        y = lineLength;
                }
                this.draw.lineTo(x, y);
                break;
            }
        }

        this.draw.stroke();
    }

    /**
     * @description 计算射线
     * @param startLocation 起始位置 世界坐标系
     * @param vector_dir 单位方向向量
     */
    private drawRayCast(startLocation: Vec2, vector_dir: Vec2) {
        // Remaining length
        const left_length = 10000;
        if (left_length <= 0) return;

        // Calculate the endpoint of the line
        const endLocation = startLocation.clone().add(vector_dir.clone().multiplyScalar(left_length));

        // Raycast test
        const results = PhysicsSystem2D.instance.raycast(startLocation, endLocation, ERaycast2DType.Closest);
        if (results.length > 0) {
            const result = results[0];
            let point = result.point.clone(); // Intersection point with the collider

            // Draw the aim line
            this.drawAimLine(startLocation, point);

            // Calculate the length
            const line_length = point.subtract(startLocation).length();
            point = result.point.clone();

            // Calculate the drawn length
            this.curDrawLength += line_length;

            // Normal vector at the intersection point
            const vector_n = result.normal;

            // Incident vector
            const vector_i = vector_dir;

            // Reflective vector
            const vector_r = vector_i.clone().subtract(vector_n.clone().multiplyScalar(2 * vector_i.dot(vector_n)));


            // Bubble movement action
            // const move = new RigidBody2D().linearVelocity = vector_i.multiplyScalar(line_length / DataManager.instance.bubbleSpeed);

            // Tính thời gian cần thiết
            const duration = line_length / DataManager.instance.bubbleSpeed;
            // Tạo tween để di chuyển node đến điểm 'point' trong 'duration' giây
            const move = tween().to(duration, { position: point });

            // Đẩy tween vào mảng bubbleMoveActions
            DataManager.instance.bubbleMoveActions.push(move);

            // Handle left-right cutting situations
            if (result.collider.tag == ENUM_PHYCOLLIDER_TAG.TARGET) {
                DataManager.instance.bubbleShootVector = vector_i;
                // return;
            }
            // Continue calculating the next segment
            if (result.collider.tag == ENUM_PHYCOLLIDER_TAG.TURN) {
                this.drawRayCast(point, vector_r);
            }
        } else {
            // Draw the remaining line segment
            this.drawAimLine(startLocation, endLocation);
        }
    }


    /**
     * @description 画瞄准线(虚线)
     * @param startLocation 起始位置 世界坐标系
     * @param endLocation 结束位置 世界坐标系
     */
    private drawAimLine(startLocation: Vec2, endLocation: Vec2) {
        const graphic_startLocation = new Vec3();
        this.draw.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(startLocation.x, startLocation.y, 0), graphic_startLocation);
        this.draw.moveTo(graphic_startLocation.x, graphic_startLocation.y);

        const delta = 20;

        const vector_dir = endLocation.subtract(startLocation);

        const total_count = Math.round(vector_dir.length() / delta);

        vector_dir.normalize().multiplyScalar(delta);
        for (let index = 0; index < total_count; index++) {
            graphic_startLocation.add(new Vec3(vector_dir.x, vector_dir.y, 0));
            this.draw.circle(graphic_startLocation.x, graphic_startLocation.y, 2);
        }

        // this.draw.stroke();
    }

    // 清除画线
    private clearLine() {
        this.draw.clear()
    }

    /* v2(v3: Vec3) {
        return new Vec2(v3.x, v3.y);
    }
    v3(v2: Vec2) {
        return new Vec3(v2.x, v2.y, 1);
    } */
}
