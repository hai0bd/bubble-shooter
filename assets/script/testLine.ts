import { _decorator, Component, EventTouch, Graphics, Node, UITransform, Vec2, Vec3, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('testLine')
export class testLine extends Component {
    private startPoint: Vec2 = new Vec2(0, 0); // Điểm bắt đầu của đường thẳng
    private endPoint: Vec2 = new Vec2(0, 0);   // Điểm kết thúc của đường thẳng
    private velocity: Vec2 = new Vec2(100, 100); // Vận tốc di chuyển của đường thẳng

    start() {
        // Lắng nghe sự kiện chạm màn hình
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onTouchStart(event: EventTouch) {
        // Thiết lập điểm bắt đầu của đường thẳng
        const pos = this.node.getPosition();
        this.startPoint = new Vec2(pos.x, pos.y);
    }

    onTouchMove(event: EventTouch) {
        // Thiết lập điểm kết thúc của đường thẳng
        this.endPoint = event.getUILocation();
        // Vẽ lại đường thẳng khi di chuyển
        this.drawLine();
    }

    drawLine() {
        // Tính toán hướng của đường thẳng
        let direction = this.endPoint.subtract(this.startPoint).normalize();
        // Di chuyển đường thẳng
        this.node.setPosition(this.node.position.add(direction.multiplyScalar(this.velocity)));
        // Xử lý va chạm với cạnh màn hình
        this.handleScreenEdgesCollision();
    }

    handleScreenEdgesCollision() {
        const {width, height} = this.node.getComponent(UITransform);
        let screenSize = view.getVisibleSize();
        let halfWidth = width / 2;
        let halfHeight = height / 2;
        let position = this.node.position;

        // Xử lý va chạm với cạnh trên và dưới màn hình
        if (position.y + halfHeight > screenSize.height / 2 || position.y - halfHeight < -screenSize.height / 2) {
            this.velocity.y *= -1; // Phản xạ khi chạm cạnh trên hoặc dưới
        }

        // Xử lý va chạm với cạnh trái và phải màn hình
        if (position.x + halfWidth > screenSize.width / 2 || position.x - halfWidth < -screenSize.width / 2) {
            this.velocity.x *= -1; // Phản xạ khi chạm cạnh trái hoặc phải
        }
    }
}