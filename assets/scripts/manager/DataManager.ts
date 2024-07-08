import { Canvas, director, Node, sys, UITransform, Vec2 } from 'cc';
import { ENUM_GAME_STATUS } from '../Enum';

const STORAGE_KEY = 'BUBBLE_STORAGE_KEY'

export let SCREEN_W: number = 720;
export let SCREEN_H: number = 1334;
export const SCREEN_T: number = 180;
export const SCREEN_B: number = 250;
export const BUBBLE_R: number = 40;
export const BUBBLE_Y: number = 40 * Math.sqrt(3);
export const BUBBLE_NUM_0 = SCREEN_W / (BUBBLE_R * 2)
export const BUBBLE_NUM_1 = SCREEN_W / (BUBBLE_R * 2) - 1

export interface IBubbleData {
    index: number,
    node: Node,
    isVisited: boolean,
    isLinked: boolean
}

export default class DataManager {

    private static _instance: any = null

    static getInstance<T>(): T {
        if (this._instance === null) {
            this._instance = new this()
        }

        return this._instance
    }

    static get instance() {
        return this.getInstance<DataManager>()
    }

    // 游戏状态
    status: ENUM_GAME_STATUS = ENUM_GAME_STATUS.UNRUNING
    // 加载进度
    loadingRate: number = 0
    // 关卡
    _maxLevel: number = 1
    _level: number = 1
    // 声音开启
    _isMusicOn: boolean = true
    _isSoundOn: boolean = true
    // 场景泡泡数据
    bubbles: IBubbleData[][] = []
    // 泡泡弹夹容量
    readyBubbles: IBubbleData[] = []
    // 泡泡移动速度
    bubbleSpeed: number = 3000
    // 泡泡移动action
    bubbleMoveActions: any[] = []
    // 泡泡射出角度限制
    bubbleShootDegree: number = 80
    // 射线切入向量
    bubbleShootVector: any = null
    // 最高分
    _maxScore: number = 0
    // 得分单位
    scoreUnit: number = 5
    // 连击数
    combo: number = 0
    // 冰冻时间
    iceTime: number = 6
    // 开启冻结技能
    isIceTime: boolean = false
    // 技能次数
    skillNums: number[] = [1, 2]
    // 排行调试
    rankDebug: boolean = false

    revival: Boolean = false;
    http: string = 'http://103.23.135.57:7880/v1/api';
    packagebuy: string = '/game_package/buy';
    userInfo: string = '/user/info';
    pointPortal: number;
    msgPortal: string;

    get level() {
        return this._level
    }

    set level(data: number) {
        this._level = data
    }

    get maxLevel() {
        return this._maxLevel
    }

    set maxLevel(data: number) {
        this._maxLevel = data
    }

    get isMusicOn() {
        return this._isMusicOn
    }

    set isMusicOn(data: boolean) {
        this._isMusicOn = data
    }

    get isSoundOn() {
        return this._isSoundOn
    }

    set isSoundOn(data: boolean) {
        this._isSoundOn = data
    }

    get maxScore() {
        return this._maxScore
    }

    set maxScore(data: number) {
        this._maxScore = data
    }

    cutSkillNums(k: number) {
        this.skillNums[k]--
        this.save()
    }

    reset() {
        // this.resetData();
        this.status = ENUM_GAME_STATUS.UNRUNING
        this.bubbles = []
        this.readyBubbles = []
        this.bubbleMoveActions = []
        this.bubbleShootVector = null
        this.combo = 0
        this.isIceTime = false
    }

    save() {
        sys.localStorage.setItem(STORAGE_KEY, JSON.stringify({
            level: this.level,
            maxLevel: this.maxLevel,
            isSoundOn: this.isSoundOn,
            isMusicOn: this.isMusicOn,
            maxScore: this.maxScore,
            skillNums: this.skillNums
        }))
    }
    resetData() {
        sys.localStorage.clear();
    }

    restore() {
        const _data = sys.localStorage.getItem(STORAGE_KEY) as any
        try {
            const data = JSON.parse(_data)
            this.level = data?.level || 1
            this.maxLevel = data?.maxLevel || 1
            this.isMusicOn = data?.isMusicOn === false ? false : true
            this.isSoundOn = data?.isSoundOn === false ? false : true
            this.maxScore = data?.maxScore || 0
            this.skillNums = data?.skillNums || [1, 2]
            this.save()
        } catch {
            this.level = 1
            this.maxLevel = 1
            this.isMusicOn = true
            this.isSoundOn = true
            this.maxScore = 0
            this.skillNums = [1, 2]
            this.reset()
        }
    }

    // 舞台尺寸
    setStageSize() {
        const size = director.getScene().getChildByName("Canvas").getComponent(UITransform).contentSize;
        SCREEN_H = size.height;
        SCREEN_W = size.width;
    }

    /** 传入二维数组行列，返回泡泡对应位置坐标 */
    convertRowColToPos(row: number, col: number): Vec2 {
        let posX: number
        let posY: number = (SCREEN_H - SCREEN_T) - (BUBBLE_R + row * BUBBLE_Y);
        // 当前行情况（大小数）
        let isLargeNum = true
        if (DataManager.instance.bubbles[row]) {
            if (DataManager.instance.bubbles[row].length == BUBBLE_NUM_1) isLargeNum = false
        }
        if (isLargeNum) {
            posX = BUBBLE_R + col * BUBBLE_R * 2
        } else {
            posX = BUBBLE_R * 2 + col * BUBBLE_R * 2
        }
        return new Vec2(posX, posY);
    }

    /** 传入泡泡对应位置坐标，返回二维数组行列 */
    convertPosToRowCol(posX: number, posY: number): Vec2 {
        let col: number = Math.round((posX - BUBBLE_R) / (BUBBLE_R * 2))
        let row: number = Math.round(((SCREEN_H - SCREEN_T) - posY) / BUBBLE_Y);
        // 当前行情况（大小数）
        let isLargeNum = true
        if (DataManager.instance.bubbles[row]) {
            if (DataManager.instance.bubbles[row].length == BUBBLE_NUM_1) isLargeNum = false
        }
        // 小数行差一个半径
        if (!isLargeNum) {
            col = Math.round((posX - BUBBLE_R * 2) / (BUBBLE_R * 2))
            if (col <= 0) col = 0
        }
        // 边界限制
        let maxCol = Math.abs(SCREEN_W / (BUBBLE_R * 2)) - 1
        if (!isLargeNum) {
            if (col >= maxCol) col -= 1
            // console.log('边界限制', row, col)
        }
        // 切边情况
        if (DataManager.instance.bubbles?.[row]?.[col]) {
            if (isLargeNum) {
                if (DataManager.instance.bubbleShootVector.x < 0) {
                    // console.log('左切')
                    col += 1
                } else {
                    // console.log('右切')
                    col -= 1
                }
            } else {
                // console.log('切边')
                if (col == 0 && posX <= BUBBLE_R * 2) {
                    // console.log('左补上')
                    row += 1
                } else if (col == maxCol - 1 && posX >= maxCol * BUBBLE_R * 2) {
                    // console.log('右补上')
                    row += 1
                    col = maxCol
                } else {
                    if (DataManager.instance.bubbleShootVector.x < 0) {
                        // console.log('左切')
                        col += 1
                    } else {
                        // console.log('右切')
                        col -= 1
                    }
                }
            }
            // console.log('切边补上', row, col)
        }
        // 修复重叠
        while (DataManager.instance.bubbles?.[row]?.[col]) {
            row += 1
            if (DataManager.instance.bubbles[row].length == BUBBLE_NUM_1) {
                if (col >= maxCol) col = maxCol - 1
            }
        }
        // console.log(col, row, isLargeNum)
        return new Vec2(row, col);
    }
}
