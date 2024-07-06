import { _decorator, Component, director, EventTouch, Graphics, Node, PhysicsSystem2D, Vec2 } from 'cc';
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

    private onTouchStart(e: EventTouch): void {
        // console.log(DataManager.instance.status, 'start')
        if (DataManager.instance.status != ENUM_GAME_STATUS.RUNING) {
            this.isValidTouch = false
            return
        }
        this.isValidTouch = true
        // let pos = this.node.convertToNodeSpaceAR(e.getLocation());
        // pos.x -= this.draw.node.x;
        // pos.y -= this.draw.node.y;
        // this.drawLine(pos);
        this.clearLine()
        this.curDrawLength = 0
        DataManager.instance.bubbleMoveActions = []
        const startLocation = this.draw.node.getPosition()
        const location = e.getLocation()
        const degree = this.convertToDegree(e);
        if (degree == DataManager.instance.bubbleShootDegree
            || degree == -DataManager.instance.bubbleShootDegree) return
        this.drawRayCast(startLocation, location.subSelf(startLocation).normalizeSelf())
        this.draw.stroke();
    }

    private onTouchsMove(e: EventTouch): void {
        if (DataManager.instance.status != ENUM_GAME_STATUS.RUNING) {
            this.isValidTouch = false
            return
        }
        this.isValidTouch = true
        // let pos = this.node.convertToNodeSpaceAR(e.getLocation());
        // pos.x -= this.draw.node.x;
        // pos.y -= this.draw.node.y;
        // this.drawLine(pos);
        this.clearLine()
        this.curDrawLength = 0
        DataManager.instance.bubbleMoveActions = []
        const startLocation = this.draw.node.getPosition()
        const location = e.getLocation()
        const degree = this.convertToDegree(e);
        if (degree == DataManager.instance.bubbleShootDegree
            || degree == -DataManager.instance.bubbleShootDegree) return
        this.drawRayCast(startLocation, location.subSelf(startLocation).normalizeSelf())
        this.draw.stroke()
    }

    private onTouchEnd(e: EventTouch): void {
        // console.log(DataManager.instance.status, 'end', this.isValidTouch)
        if (DataManager.instance.status != ENUM_GAME_STATUS.RUNING || !this.isValidTouch) return
        // console.log(this.isValidTouch)
        // DataManager.instance.status = ENUM_GAME_STATUS.UNRUNING
        this.clearLine();
        const degree = this.convertToDegree(e);
        // 限制角度范围间
        if (degree == DataManager.instance.bubbleShootDegree
            || degree == -DataManager.instance.bubbleShootDegree) return
        EventManager.instance.emit(ENUM_GAME_EVENT.BALL_SHOOT)
    }

    // 角度转化
    private convertToDegree(e: EventTouch): number {
        const pos: Vec2 = e.getLocation();
        const x = pos.x - this.draw.node.x;
        const y = pos.y - this.draw.node.y;
        const radian = Math.atan2(y, x);
        // 弧度转角度 0 - 2π -> 0 - 360
        let degree = misc.radiansToDegrees(radian);
        // angle与rotation差90
        degree -= 90;
        if (degree < -DataManager.instance.bubbleShootDegree
            && degree > -180) degree = -DataManager.instance.bubbleShootDegree;
        if (degree > DataManager.instance.bubbleShootDegree
            || degree <= -180) degree = DataManager.instance.bubbleShootDegree;
        return degree;
    }

    // 绘画瞄准线(废弃)
    drawLine(pos: Vec2) {
        this.draw.clear();
        let lineLength = SCREEN_H - SCREEN_T - Math.abs(this.draw.node.y);
        let k = pos.y / pos.x;
        // 预计到达的边界点
        let point = new Vec2(0, 0);
        // 画笔到起始点
        this.draw.moveTo(0, 0);
        let b = 0;
        let x: number, y: number;
        // 算一下 b 的增长值
        let d_b = (k > 0 ? SCREEN_W / 2 : -SCREEN_W / 2) * k;
        // 起始标志
        let isRebound = false;
        while (true) {
            // 如果到墙，求与墙的交点
            x = k > 0 ? SCREEN_W / 2 : -SCREEN_W / 2;
            // 一元函数 y = k·x + b
            y = k * x + b;
            // 到达墙壁所需长度
            let l = new Vec2(x, y).subtract(point).mag();
            // 判断能否到墙
            if (l < lineLength) {
                isRebound = true;
                // 扣去已经过长度
                lineLength -= l;
                this.draw.lineTo(x, y);
                // 更改下一轮循环起始点
                point.x = x;
                point.y = y;
                b = y + d_b;
                k *= -1;
            } else {
                // 如果不能到墙，分为两种情况，需要一个标志
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
                    // 中心处理
                    if (x > -0.05 && x < 0.05)
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
        // 剩余长度
        const left_length = 10000;
        if (left_length <= 0) return;
        // 计算线的终点位置
        const endLocation = startLocation.add(vector_dir.mul(left_length));
        // 射线测试
        const results = PhysicsSystem2D.instance.raycast(startLocation, endLocation, RayCastType.Closest);
        if (results.length > 0) {
            const result = results[0];
            // 指定射线与穿过的碰撞体在哪一点相交。
            const point = result.point;
            // 画入射线段
            this.drawAimLine(startLocation, point);
            // 计算长度
            const line_length = point.subtract(startLocation).mag();
            // 计算已画长度
            this.curDrawLength += line_length;
            // 指定碰撞体在相交点的表面的法线单位向量。
            const vector_n = result.normal;
            // 入射单位向量
            const vector_i = vector_dir;
            // 反射单位向量
            const vector_r = vector_i.subtract(vector_n.mul(2 * vector_i.dot(vector_n)));
            // 泡泡移动action
            const move = moveTo(line_length / DataManager.instance.bubbleSpeed, point)
            DataManager.instance.bubbleMoveActions.push(move)
            // 左切右切情况
            if (result.collider.tag == ENUM_PHYCOLLIDER_TAG.TARGET) {
                DataManager.instance.bubbleShootVector = vector_i
            }
            // 接着计算下一段
            if (result.collider.tag == ENUM_PHYCOLLIDER_TAG.TURN) {
                this.drawRayCast(point, vector_r);
            }
        } else {
            // 画剩余线段
            this.drawAimLine(startLocation, endLocation);
        }
    }

    /**
     * @description 画瞄准线(虚线)
     * @param startLocation 起始位置 世界坐标系
     * @param endLocation 结束位置 世界坐标系
     */
    private drawAimLine(startLocation: Vec2, endLocation: Vec2) {
        // 转换坐标
        const graphic_startLocation = this.draw.node.convertToNodeSpaceAR(startLocation);
        this.draw.moveTo(graphic_startLocation.x, graphic_startLocation.y);
        // 画小圆圆
        // 间隔
        const delta = 20;
        // 方向
        const vector_dir = endLocation.subtract(startLocation);
        // 数量
        const total_count = Math.round(vector_dir.mag() / delta);
        // 每次间隔向量
        vector_dir.normalizeSelf().mulSelf(delta);
        for (let index = 0; index < total_count; index++) {
            graphic_startLocation.addSelf(vector_dir)
            this.draw.circle(graphic_startLocation.x, graphic_startLocation.y, 2);
        }
    }

    // 清除画线
    private clearLine() {
        this.draw.clear()
    }
}
