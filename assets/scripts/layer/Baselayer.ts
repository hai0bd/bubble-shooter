import { _decorator, Component, Node, tween, Vec3 } from "cc";

const { ccclass, property } = _decorator;

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
    fadeIn(node: Node) {
        node.setScale(new Vec3(1.5, 1.5, 1.5));
        /* // node.opacity = 0;
        let cbFadeIn = callFunc(()=>{}, this);
        let actionFadeIn = sequence(spawn(fadeTo(this.speed, 255), scaleTo(this.speed, 1.0)), cbFadeIn);
        tween(node).then(actionFadeIn).start();*/
        let fadeIn = tween()
            .to(this.speed, { opacity: 255 })  // fadeTo thay bằng tween().to()
            .to(this.speed, { scale: new Vec3(1.0, 1.0, 1.0) });  // scaleTo thay bằng tween().to()

        // Sử dụng tween để áp dụng hành động lên node và thêm callFunc
        tween(this.node)
            .then(fadeIn)
            .call(() => { })
            .start();
    }
}
