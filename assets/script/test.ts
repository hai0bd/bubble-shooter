import { _decorator, Component, director, Graphics, Input, input, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('test')
export class test extends Component {
    @property(Graphics)
    draw: Graphics;

    index = 0;

    start() {
        this.draw.moveTo(0, 0);
        this.draw.circle(10, 10, 20);
        this.draw.stroke();

        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    onTouchEnd() {
        console.log(this.index++);
        if (this.index > 10) return;
        this.onTouchEnd();
    }
}


