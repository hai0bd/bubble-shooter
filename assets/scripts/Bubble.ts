import { _decorator, Component, Vec2, Vec3 } from "cc";
import DataManager from "./manager/DataManager";

const { ccclass, property } = _decorator;

@ccclass
export default class Bubble extends Component {

    // 初始化
    init(pos: Vec2) {
        this.node.setPosition(new Vec3(pos.x, pos.y, 0))
    }

    onDelete(pos: Vec2): void {
        DataManager.instance.bubbles[pos.x][pos.y] = undefined
        this.node.removeFromParent()
    }
}
