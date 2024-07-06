import { _decorator, Animation, color, Component, Node, tween, Vec2 } from 'cc';
import { Levels } from './../Levels';
import { random } from "../Utils";
import { StaticInstance } from '../StaticInstance';
import { IBubbleData, BUBBLE_R, BUBBLE_Y, BUBBLE_NUM_0, BUBBLE_NUM_1, SCREEN_B } from './DataManager';
import { ENUM_AUDIO_CLIP, ENUM_GAME_EVENT, ENUM_GAME_STATUS, ENUM_UI_TYPE } from "../Enum";
import Fall from '../Fall';
import Bubble from "../Bubble";
import DataManager from "./DataManager";
import EventManager from "./EventManager";
import PoolManager from "./PoolManager";
import AudioManager from './AudioManager';
import ToastManager from './ToastManager';
// import HttpManager from './HTTPManager';

const { ccclass, property } = _decorator;

@ccclass
export default class GameManager extends Component {

    @property(Node)
    bubbleBorn: Node = null
    @property(Node)
    bubbleRoot: Node = null
    @property(Node)
    bubbleEffectRoot: Node = null

    currentLevel: any = null
    scoreNum: number = 0
    canWarning: boolean = true
    iceTimeSoundId: number = -1

    onLoad() {
        // 注册事件
        StaticInstance.setGameManager(this);
        // HttpManager.sendHttpGetRequest();
        EventManager.instance.on(ENUM_GAME_EVENT.GAME_START, this.onGameStart, this)
        EventManager.instance.on(ENUM_GAME_EVENT.BALL_SHOOT, this.onBallShoot, this)
        EventManager.instance.on(ENUM_GAME_EVENT.ITEM_BOOM, this.onItemBoom, this)
        EventManager.instance.on(ENUM_GAME_EVENT.ITEM_ICE_START, this.onItemIce, this)
        EventManager.instance.on(ENUM_GAME_EVENT.ITEM_ICE_END, this.onItemIceEnd, this)
        DataManager.instance.revival = false;
    }

    // 开始游戏
    onGameStart() {
        DataManager.instance.reset()
        this.bubbleRoot.removeAllChildren()
        this.initGame()
    }

    onBallShoot() {
        if (DataManager.instance.readyBubbles.length <= 0) {
            // console.log('弹夹已空')
            return
        }
        this.scoreNum = 0
        // 动改状态
        DataManager.instance.status = ENUM_GAME_STATUS.UNRUNING
        // 获取泡泡
        const data = DataManager.instance.readyBubbles.shift()
        // 移动泡泡
        const actions = DataManager.instance.bubbleMoveActions
        // console.log(actions)
        if (actions.length == 1) {
            tween(data.node).then(actions[0]).call(() => {
                // 调整泡泡位置
                this.onBubblePosReset(data)
            }).start()
        } else {
            tween(data.node)
                .then(sequence(actions))
                .call(() => {
                    // 调整泡泡位置
                    this.onBubblePosReset(data)
                }).start()
        }
        // 填充弹夹
        this.resetReadyBubbles()
    }

    // 初始化游戏
    initGame() {
        if (!this.bubbleRoot || !this.bubbleBorn) return
        if (DataManager.instance.level > Levels.length) {
            DataManager.instance.level = Levels.length
            DataManager.instance.save()
        }
        DataManager.instance.status = ENUM_GAME_STATUS.UNRUNING
        // 当前关卡
        this.currentLevel = Levels[DataManager.instance.level - 1];
        // 场景泡泡
        this.initBubbles()
        // 待机泡泡组
        this.initReadyBubbles()
        // 初始化参数
        this.scoreNum = 0
        this.canWarning = true
        DataManager.instance.isIceTime = false
        // ui设置
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.ICE, false)
        StaticInstance.uiManager.setMainLevelLabel()
        StaticInstance.uiManager.setMainScoreLabel()
        StaticInstance.uiManager.setMainPropNum()
        // 声音状态
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.BEGIN)
        DataManager.instance.status = ENUM_GAME_STATUS.RUNING
    }

    // 初始化场景泡泡
    initBubbles() {
        // 关卡数据
        const data = this.currentLevel['data']
        if (data.length) {
            // 将所有数据遍历，0代表空

            for (let row = 0; row < data.length; row++) {
                const arr = new Array(data[row].length)

                arr.fill(null)

                DataManager.instance.bubbles[row] = arr;

                for (let col = 0; col < data[row].length; col++) {
                    let index = data[row][col];

                    if (index === 0) {
                        DataManager.instance.bubbles[row][col] = null
                        continue
                    }
                    const bubble: Node = PoolManager.instance.getNode(`Bubble${index}`, this.bubbleRoot)
                    // 行列转坐标
                    const pos = DataManager.instance.convertRowColToPos(row, col);
                    bubble.getComponent(Bubble).init(pos);
                    let obj: IBubbleData = Object.create(null);
                    obj.index = index;
                    obj.node = bubble;
                    obj.isLinked = false;
                    obj.isVisited = false;
                    DataManager.instance.bubbles[row][col] = obj;
                }
            }
        } else {
            const arr = new Array(BUBBLE_NUM_0)
            arr.fill(null)
            DataManager.instance.bubbles[0] = arr
        }
    }

    // 初始化弹夹泡泡
    initReadyBubbles() {
        const ready = this.currentLevel['ready']
        for (let i = 0; i < 5; i++) {
            let index = random(1, 6)
            if (ready && ready.length) {
                index = ready[random(0, ready.length - 1)]
            }
            const bubble = PoolManager.instance.getNode(`Bubble${index}`, this.bubbleRoot)
            const pos = this.bubbleBorn.getPosition()
            pos.y -= i * BUBBLE_R * 2
            bubble.getComponent(Bubble).init(pos)
            const data: IBubbleData = Object.create(null)
            data.index = index
            data.node = bubble
            data.isLinked = false
            data.isVisited = false
            DataManager.instance.readyBubbles.push(data)
        }
    }

    // 填充弹夹
    resetReadyBubbles() {
        const ready = this.currentLevel['ready']
        let index = random(1, 6)
        if (ready && ready.length) {
            index = ready[random(0, ready.length - 1)]
        }
        const bubble = PoolManager.instance.getNode(`Bubble${index}`, this.bubbleRoot)
        const pos = this.bubbleBorn.getPosition()
        pos.y -= 5 * BUBBLE_R * 2
        bubble.getComponent(Bubble).init(pos)
        const data: IBubbleData = Object.create(null)
        data.index = index
        data.node = bubble
        data.isLinked = false
        data.isVisited = false
        DataManager.instance.readyBubbles.push(data)
        DataManager.instance.readyBubbles.forEach(item => {
            const action = spawn(
                scaleTo(0.05, 0.95),
                jumpTo(0.3, new Vec2(item.node.position.x, item.node.position.y + BUBBLE_R * 2), 50, 1),
                scaleTo(0.05, 1),
            );
            tween(item.node).then(action).start()
        })
    }

    // 调整泡泡位置
    private onBubblePosReset(data: IBubbleData): void {
        // 扩展行
        if (DataManager.instance.bubbles[DataManager.instance.bubbles.length - 1]) {
            let hasValidData = false
            const temp = DataManager.instance.bubbles[DataManager.instance.bubbles.length - 1]
            for (let i = 0; i < temp.length; i++) {
                if (temp[i]) {
                    hasValidData = true
                    break
                }
            }
            if (hasValidData) {
                let arr = new Array(BUBBLE_NUM_0)
                if (temp.length == BUBBLE_NUM_0) arr = new Array(BUBBLE_NUM_1)
                arr.fill(null)
                DataManager.instance.bubbles.push(arr)
            }
        }
        const rc: Vec2 = DataManager.instance.convertPosToRowCol(data.node.position.x, data.node.position.y)
        data.node.setPosition(DataManager.instance.convertRowColToPos(rc.x, rc.y))
        let obj: IBubbleData = Object.create(null);
        obj.index = data.index;
        obj.node = data.node;
        obj.isLinked = false;
        obj.isVisited = false;
        DataManager.instance.bubbles[rc.x][rc.y] = obj;
        // 检索相同泡泡
        this.onBubbleSearch(rc);
    }

    // 检索相同泡泡
    private onBubbleSearch(pos: Vec2) {
        // 炸弹
        if (DataManager.instance.bubbles[pos.x][pos.y].index == 99) {
            // console.log('炸弹触发')
            this.onItemBoomPlay(pos.x, pos.y)
            return
        }

        // 检测消除方法
        let check: Function = (row: number, col: number, index: number) => {
            // 非空检测
            if (!DataManager.instance.bubbles[row] || !DataManager.instance.bubbles[row][col]) return;
            // 获取泡泡数据
            let b: IBubbleData = DataManager.instance.bubbles[row][col];
            // 如果被访问过
            if (b.isVisited) return;
            // 如果种类不同
            if (b.index !== index) return;
            // 符合条件
            b.isVisited = true;
            let leftTop = col;
            // 根据不同的行做偏移(大小数)
            if (DataManager.instance.bubbles[row].length == BUBBLE_NUM_0) {
                leftTop = col - 1;
            }
            // 每个泡泡周围有6个,依次检测
            // 左上
            check(row - 1, leftTop, index);
            //右上
            check(row - 1, leftTop + 1, index);
            //左
            check(row, col - 1, index);
            //右
            check(row, col + 1, index);
            //左下
            check(row + 1, leftTop, index);
            //右下
            check(row + 1, leftTop + 1, index);
        }
        // 执行
        check(pos.x, pos.y, DataManager.instance.bubbles[pos.x][pos.y].index);
        // 看有几个相同的
        let count: number = 0;
        // 记录消除行列值
        let record: Vec2[] = [];
        for (let row = 0; row < DataManager.instance.bubbles.length; row++) {
            for (let col = 0; col < DataManager.instance.bubbles[row].length; col++) {
                if (!DataManager.instance.bubbles[row][col]) continue;
                if (DataManager.instance.bubbles[row][col].isVisited) {
                    DataManager.instance.bubbles[row][col].isVisited = false;
                    count++;
                    // 记录要进行消除的泡泡行列值
                    record.push(new Vec2(row, col));
                }
            }
        }
        if (count >= 3) {
            DataManager.instance.combo += 1
            this.scoreNum = count
            // 连击生效
            let combo = DataManager.instance.combo
            if (DataManager.instance.combo <= 1) combo = 1
            if (DataManager.instance.combo >= 8) combo = 8
            AudioManager.instance.playSound(`eliminate${combo}`)
            if (DataManager.instance.combo > 1) {
                StaticInstance.uiManager.setComboLabel()
                StaticInstance.uiManager.toggle(ENUM_UI_TYPE.COMBO)
            }
            // 执行消除
            for (let i in record) {
                // 获取到该位置泡泡，执行消除
                let b = DataManager.instance.bubbles[record[i].x][record[i].y].node;
                b.getComponent(Bubble).onDelete(record[i]);
                this.onEffectPlay(b.getPosition())
                this.onEffectPlay(b.getPosition(), 'EffScore')
            }
            // 悬空删除
            this.onBubbleUnLinked()
        } else {
            DataManager.instance.combo = 0
            AudioManager.instance.playSound(ENUM_AUDIO_CLIP.TOUCH)
            // 递增
            this.onBubbleIncrease()
        }
    }

    // 泡泡悬空检测
    private onBubbleUnLinked(): void {
        // 检测方法
        let check: Function = (row: number, col: number) => {
            //从刚刚加入的泡泡为起点,递归寻找相连的
            if (!DataManager.instance.bubbles[row] || !DataManager.instance.bubbles[row][col]) return;
            let b = DataManager.instance.bubbles[row][col];
            if (b.isVisited) return;
            // 符合条件
            b.isVisited = true;
            b.isLinked = true;
            let leftTop = col;
            if (DataManager.instance.bubbles[row].length == BUBBLE_NUM_0) {
                leftTop = col - 1;
            }
            // 每个泡泡周围有6个,依次检测
            // 左上
            check(row - 1, leftTop);
            //右上
            check(row - 1, leftTop + 1);
            //左
            check(row, col - 1);
            //右
            check(row, col + 1);
            //左下
            check(row + 1, leftTop);
            //右下
            check(row + 1, leftTop + 1);
        }
        // 执行
        for (let i = 0; i < DataManager.instance.bubbles[0].length; i++) {
            // 执行最上的一排泡泡
            if (!DataManager.instance.bubbles[0][i]) continue;
            check(0, i);
        }

        // 局部标志，是否执行过下落
        let flag: boolean = true;
        for (let row = 0; row < DataManager.instance.bubbles.length; row++) {
            for (let col = 0; col < DataManager.instance.bubbles[row].length; col++) {
                if (!DataManager.instance.bubbles[row][col]) continue;
                if (!DataManager.instance.bubbles[row][col].isLinked) {
                    this.scoreNum += 1
                    flag = false;
                    const { node, index } = DataManager.instance.bubbles[row][col]
                    node.getComponent(Bubble).onDelete(new Vec2(row, col));
                    this.onEffectPlay(node.getPosition())
                    this.onEffectPlay(node.getPosition(), 'EffScore')
                    this.onFallPlay(node.getPosition(), index)
                } else {
                    DataManager.instance.bubbles[row][col].isVisited = false;
                    DataManager.instance.bubbles[row][col].isLinked = false;
                }
            }
        }

        this.onGameCheck()
    }

    // 场景泡泡递增
    onBubbleIncrease() {
        if (!this.currentLevel.isIncrease) {
            this.onGameCheck()
            return
        }

        // 冰冻时间不递增泡泡
        if (DataManager.instance.isIceTime) {
            this.onGameCheck()
            return
        }

        // 初始化大小
        let arr = new Array(BUBBLE_NUM_1)
        if (DataManager.instance.bubbles[0]) {
            if (DataManager.instance.bubbles[0].length == BUBBLE_NUM_1) {
                arr = new Array(BUBBLE_NUM_0)
            }
        }
        arr.fill(null)
        DataManager.instance.bubbles.unshift(arr)
        // 填充数据
        for (let i = 0; i < DataManager.instance.bubbles[0].length; i++) {
            const rand = random(1, 6)
            if (rand == 1) {
                DataManager.instance.bubbles[0][i] = null;
                continue
            }
            const index = random(1, 6)
            const bubble: Node = PoolManager.instance.getNode(`Bubble${index}`, this.bubbleRoot)
            const pos = DataManager.instance.convertRowColToPos(0, i);
            pos.y += BUBBLE_Y
            bubble.getComponent(Bubble).init(pos);
            let obj: IBubbleData = Object.create(null);
            obj.index = index;
            obj.node = bubble;
            obj.isLinked = false;
            obj.isVisited = false;
            DataManager.instance.bubbles[0][i] = obj;
        }
        // 泡泡数量
        let bubbleCount: number = 0
        DataManager.instance.bubbles.forEach(arr => {
            arr.forEach(item => {
                if (item) bubbleCount += 1
            })
        })
        // 场景已有泡泡向上移动
        let actionCount: number = 0
        for (let row = 0; row < DataManager.instance.bubbles.length; row++) {
            for (let col = 0; col < DataManager.instance.bubbles[row].length; col++) {
                if (DataManager.instance.bubbles?.[row]?.[col]) {
                    const bubble = DataManager.instance.bubbles[row][col]
                    let pos;
                    if (DataManager.instance.revival == true) {
                        pos = new Vec2(bubble.node.position.x, bubble.node.position.y + BUBBLE_Y * 5);

                    } else {
                        pos = new Vec2(bubble.node.position.x, bubble.node.position.y - BUBBLE_Y);

                    }
                    const action = spawn(
                        scaleTo(0.05, 0.95),
                        jumpTo(0.3, pos, 50, 1),
                        scaleTo(0.05, 1)
                    );
                    tween(bubble.node).then(action).call(() => {
                        actionCount += 1
                        if (actionCount == bubbleCount) {
                            this.onGameCheck()
                        }
                    }).start()
                    // console.log("col", DataManager.instance.bubbles);
                    // console.log("DataManager.instance.bubbles[row]", DataManager.instance.bubbles[row]);
                }
            }
        }
        if (DataManager.instance.revival == true) {
            DataManager.instance.bubbles.splice(0, 6);
        }
    }

    // 游戏情况检查
    private onGameCheck() {
        // 得分
        if (this.scoreNum) {
            if (this.scoreNum == 4) AudioManager.instance.playSound(ENUM_AUDIO_CLIP.GOOD)
            if (this.scoreNum == 5) AudioManager.instance.playSound(ENUM_AUDIO_CLIP.GREAT)
            if (this.scoreNum == 6) AudioManager.instance.playSound(ENUM_AUDIO_CLIP.EXCELLENT)
            if (this.scoreNum == 7) AudioManager.instance.playSound(ENUM_AUDIO_CLIP.AMAZING)
            if (this.scoreNum >= 8) AudioManager.instance.playSound(ENUM_AUDIO_CLIP.UNBELIEVABLE)
            StaticInstance.uiManager.setMainScoreLabel(this.scoreNum * DataManager.instance.scoreUnit)
        }
        // 过关检查
        let count: number = 0
        let lastBubble: IBubbleData = null
        for (let row = 0; row < DataManager.instance.bubbles.length; row++) {
            for (let col = 0; col < DataManager.instance.bubbles[row].length; col++) {
                if (DataManager.instance.bubbles?.[row]?.[col]) {
                    count += 1
                    lastBubble = DataManager.instance.bubbles[row][col]
                }
            }
        }
        if (count == 0) {
            DataManager.instance.status = ENUM_GAME_STATUS.UNRUNING
            DataManager.instance.level += 1
            DataManager.instance.level = Math.min(DataManager.instance.level, Levels.length)
            DataManager.instance.save()
            // 游戏胜利
            AudioManager.instance.playSound(ENUM_AUDIO_CLIP.WIN)
            // 结束冰冻
            this.onItemIceEnd()
            this.scheduleOnce(() => {
                StaticInstance.uiManager.toggle(ENUM_UI_TYPE.WIN)
            }, 0.2)
            return
        }
        // 失败检查
        if (lastBubble) {
            if (lastBubble.node.position.y <= SCREEN_B) {
                DataManager.instance.status = ENUM_GAME_STATUS.UNRUNING
                // 游戏失败
                AudioManager.instance.playSound(ENUM_AUDIO_CLIP.LOSE)
                // 结束冰冻
                this.onItemIceEnd()
                this.scheduleOnce(() => {
                    StaticInstance.uiManager.toggle(ENUM_UI_TYPE.LOSE)
                }, 0.2)
                return
            }
            // 警告检测
            if (lastBubble.node.position.y <= SCREEN_B + 4 * BUBBLE_Y) {
                if (this.canWarning) {
                    this.canWarning = false
                    AudioManager.instance.playSound(ENUM_AUDIO_CLIP.WARNING)
                }
            }
            // 警告转态恢复
            if (lastBubble.node.position.y > SCREEN_B + 4 * BUBBLE_Y) {
                if (!this.canWarning) this.canWarning = true
            }
        }

        // 状态恢复
        DataManager.instance.status = ENUM_GAME_STATUS.RUNING
    }

    // 播放删除特效
    private onEffectPlay(pos: Vec2, name: string = 'EffCrush') {
        const effect = PoolManager.instance.getNode(name, this.bubbleEffectRoot)
        const anim = effect.getComponent(Animation)
        effect.setPosition(pos)
        anim.play(name)
        anim.on(Animation.EventType.FINISHED, () => {
            effect.destroy()
        }, this)
    }

    // 泡泡掉落
    private onFallPlay(pos: Vec2, index: number) {
        const item = PoolManager.instance.getNode(`Fall${index}`, this.bubbleEffectRoot)
        if (item) item.getComponent(Fall).init(pos)
    }

    // 炸弹装填
    onItemBoom() {
        const bubble = DataManager.instance.readyBubbles[0]
        if (bubble.index == 99) {
            ToastManager.instance.show('Bomb loading is complete, To be launched', { bg_color: color(226, 69, 109, 255) })
            return
        }
        if (DataManager.instance.skillNums[1] <= 0) return
        // 扣技能点
        DataManager.instance.cutSkillNums(1)
        StaticInstance.uiManager.setMainPropNum()
        // 转状态
        DataManager.instance.status = ENUM_GAME_STATUS.UNRUNING
        // 生成炸弹
        const boom = PoolManager.instance.getNode(`BubbleBoom`, this.bubbleRoot)
        boom.getComponent(Bubble).init(new Vec2(bubble.node.position.x + 200, bubble.node.position.y))
        const action = spawn(
            scaleTo(0.05, 0.95),
            jumpTo(0.3, new Vec2(bubble.node.position.x, bubble.node.position.y), 50, 1),
            scaleTo(0.05, 1)
        );
        tween(boom).then(action).call(() => {
            bubble.node.removeFromParent()
            bubble.node = boom
            bubble.index = 99
            DataManager.instance.status = ENUM_GAME_STATUS.RUNING
        }).start()
    }

    // 炸弹触发
    onItemBoomPlay(row: number, col: number) {
        this.scoreNum = 0
        const boom = DataManager.instance.bubbles[row][col]
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.BOMB)
        this.onEffectPlay(boom.node.getPosition(), 'EffBoom')
        const minRow = row - 2
        const maxRow = row + 2
        const minCol = col - 2
        const maxCol = col + 2
        for (let r = 0; r < DataManager.instance.bubbles.length; r++) {
            for (let c = 0; c < DataManager.instance.bubbles[r].length; c++) {
                if (r > minRow && r < maxRow && c > minCol && c < maxCol) {
                    if (DataManager.instance.bubbles?.[r]?.[c]) {
                        let { node, index } = DataManager.instance.bubbles[r][c];
                        node.getComponent(Bubble).onDelete(new Vec2(r, c));
                        this.onEffectPlay(node.getPosition())
                        if (index != 99) {
                            this.scoreNum += 1
                            this.onEffectPlay(node.getPosition(), 'EffScore')
                        }
                    }
                }
            }
        }
        // 悬空删除
        this.onBubbleUnLinked()
    }

    // 冰冻时间开启
    async onItemIce() {
        if (DataManager.instance.isIceTime) {
            ToastManager.instance.show('Frozen props have been opened', { bg_color: color(226, 69, 109, 255) })
            return
        }
        if (DataManager.instance.skillNums[0] <= 0) return
        // 扣技能点
        DataManager.instance.cutSkillNums(0)
        StaticInstance.uiManager.setMainPropNum()
        this.iceTimeSoundId = await AudioManager.instance.playSound(ENUM_AUDIO_CLIP.TIMER, true)
        DataManager.instance.isIceTime = true
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.ICE)
    }

    // 冻结时间结束
    onItemIceEnd() {
        DataManager.instance.isIceTime = false
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.ICE, false)
        if (this.iceTimeSoundId >= 0) {
            AudioManager.instance.stopSound(this.iceTimeSoundId)
        }
    }

    protected onDestroy(): void {
        EventManager.instance.off(ENUM_GAME_EVENT.GAME_START, this.onGameStart)
        EventManager.instance.off(ENUM_GAME_EVENT.BALL_SHOOT, this.onBallShoot)
        EventManager.instance.off(ENUM_GAME_EVENT.ITEM_BOOM, this.onItemBoom)
        EventManager.instance.off(ENUM_GAME_EVENT.ITEM_ICE_START, this.onItemIce)
        EventManager.instance.off(ENUM_GAME_EVENT.ITEM_ICE_END, this.onItemIceEnd)
    }
}
