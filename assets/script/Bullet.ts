import { _decorator, Component, Node, sp, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    velocity: Vec2 = new Vec2();

    init(speed: number, angle: number) {
        this.velocity.x = speed * Math.cos(angle);
        this.velocity.y = speed * Math.sin(angle);
    }

    update(deltaTime: number) {
        let deltaX = this.velocity.x * deltaTime;
        let deltaY = this.velocity.y * deltaTime;

        let pos = this.node.getPosition();
        pos.x += deltaX;
        pos.y += deltaY;
        // if(pos.x >= Math.abs(335)) angle = 
        this.node.setPosition(pos);
    }
}


