import { _decorator, Component, Node, tween } from "cc";

const {ccclass, property} = _decorator;

@ccclass
export default class BaseLayer extends Component {

    private speed: number = 0.3

    show() {
        this.node.active = true;
    }

    hide() {
        this.node.active = false
    }

    // 弹进动画
    fadeIn(node: Node){
        node.setScale(1.5);
        node.opacity = 0;
        let cbFadeIn = callFunc(()=>{}, this);
        let actionFadeIn = sequence(spawn(fadeTo(this.speed, 255), scaleTo(this.speed, 1.0)), cbFadeIn);
        tween(node).then(actionFadeIn).start()
    }
}
