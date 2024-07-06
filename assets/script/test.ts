import { _decorator, Component, director, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('test')
export class test extends Component {
    start() {
        const tf = director.getScene().getChildByName("Canvas").getComponent(UITransform);
        console.log(tf.contentSize.width + " and " + tf.contentSize.height);
        const { width, height } = tf;
        console.log(`width: ${width} and height: ${height}`);
    }
}


