import { _decorator, Canvas, color, Component, director, Graphics, Label, Node, tween, UITransform, Vec2, Vec3 } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export default class ToastManager extends Component {

    private static _instance: any = null

    static getInstance<T>(): T {
        if (this._instance === null) {
            this._instance = new this()
        }

        return this._instance
    }

    static get instance() {
        return this.getInstance<ToastManager>()
    }

    show(text: string = '', { gravity = 'CENTER', duration = 1, bg_color = color(102, 102, 102, 200) } = {}) {
        // canvas
        let canvas = director.getScene().getChildByName("Canvas").getComponent(Canvas);
        let { width, height } = canvas.getComponent(UITransform);

        // 节点
        let bgNode = new Node();
        // bgNode.group = 'ui'
        bgNode.layer = 1;

        // Lable文本格式设置
        let textNode = new Node();
        let textNodeTf = textNode.getComponent(UITransform);
        let textLabel = textNodeTf.addComponent(Label);
        textLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        textLabel.verticalAlign = Label.VerticalAlign.CENTER;
        textLabel.fontSize = 30;
        textLabel.string = text;

        // 当文本宽度过长时，设置为自动换行格式
        if (text.length * textLabel.fontSize > (width * 3) / 5) {
            textNodeTf.width = (width * 3) / 5;
            textLabel.overflow = Label.Overflow.RESIZE_HEIGHT;
        } else {
            textNodeTf.width = text.length * textLabel.fontSize;
        }
        let lineCount =
            ~~((text.length * textLabel.fontSize) / ((width * 3) / 5)) + 1;
        textNodeTf.height = textLabel.fontSize * lineCount;

        // 背景设置
        let ctx = bgNode.addComponent(Graphics);
        ctx.arc(
            -textNodeTf.width / 2,
            0,
            textNodeTf.height / 2 + 20,
            0.5 * Math.PI,
            1.5 * Math.PI,
            true
        );
        ctx.lineTo(textNodeTf.width / 2, -(textNodeTf.height / 2 + 20));
        ctx.arc(
            textNodeTf.width / 2,
            0,
            textNodeTf.height / 2 + 20,
            1.5 * Math.PI,
            0.5 * Math.PI,
            true
        );
        ctx.lineTo(-textNodeTf.width / 2, textNodeTf.height / 2 + 20);
        ctx.fillColor = bg_color;
        ctx.fill();

        bgNode.addChild(textNode);

        // gravity 设置Toast显示的位置
        if (gravity === "CENTER") {
            bgNode.setPosition(new Vec3(0, 0, 0));
        } else if (gravity === "TOP") {
            const pos = bgNode.getPosition();
            pos.y = pos.y + (height / 5) * 2;
            bgNode.setPosition(pos);
            // bgNode.position.y = bgNode.position.y + (height / 5) * 2;
        } else if (gravity === "BOTTOM") {
            const pos = bgNode.getPosition();
            pos.y = pos.y - (height / 5) * 2;
            bgNode.setPosition(pos);
        }

        canvas.node.addChild(bgNode);
        // 执行动画
        /* let finished = callFunc(function () {
            bgNode.destroy();
        }); */
        /* let action = sequence(
            moveBy(duration, v2(0, 0)),
            fadeOut(0.3),
            finished
        ); */


        // const pos = this.node.position;
        let action = tween(this.node)
            .sequence(
                tween(this.node).to(duration, { position: new Vec3(0, 0, 0) }), // moveBy(duration, v2(0, 0))
                // tween(this.node).to(0.3, { opacity: 0 }, { easing: 'sineOut' })  // fadeOut(0.3)
            )
            .call(() => {
                bgNode.destroy;
            })
            .start();
        // bgNode.runAction(action); 
        tween(bgNode).then(action).start()
    }
}
